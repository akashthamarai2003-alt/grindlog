import { NextResponse } from 'next/server';
import { createServerSupabase } from "@/lib/services/supabase/server";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { canUseFitnessFeature } from "@/lib/fitness/subscription/access";
import { invalidateProgressServerCache } from "@/lib/services/analytics/progress-service";

// Optional Cloudflare R2 Client (only active if configured in env)
const isR2Configured = Boolean(
  process.env.R2_ACCOUNT_ID &&
  process.env.R2_ACCESS_KEY_ID &&
  process.env.R2_SECRET_ACCESS_KEY &&
  process.env.R2_BUCKET_NAME
);

const r2Client = isR2Configured
  ? new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
      },
    })
  : null;

// Helper to delete an object from Cloudflare R2 to enforce storage cap
const deleteR2File = async (url: string | null | undefined, expectedUserId?: string) => {
  if (!url || !isR2Configured || !r2Client || !process.env.R2_BUCKET_NAME) return;
  try {
    let key: string | null = null;
    if (url.includes('grindlog/')) {
      key = url.substring(url.indexOf('grindlog/'));
    } else if (process.env.R2_PUBLIC_URL && url.startsWith(process.env.R2_PUBLIC_URL)) {
      key = url.replace(`${process.env.R2_PUBLIC_URL}/`, '');
    }

    if (!key) return;

    // R2 Tenant Isolation: User may only delete their own objects
    if (expectedUserId) {
      const allowedPrefix = `grindlog/${expectedUserId}/`;
      if (!key.startsWith(allowedPrefix)) {
        console.warn(`[Security][R2] Unauthorized deletion blocked for user ${expectedUserId} on key: ${key}`);
        return;
      }
    }

    await r2Client.send(new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key
    }));
    console.log(`[R2] Deleted old photo from storage: ${key}`);
  } catch (err) {
    console.warn(`[R2] Failed to delete old photo (${url}):`, err);
  }
};

const deleteScanPhotosFromR2 = async (scan: any, userId: string) => {
  if (!scan) return;
  const urls: (string | null | undefined)[] = [
    scan.front_image_url,
    scan.side_image_url,
    scan.back_image_url,
  ];

  const analysis = scan.ai_analysis_ref as any;
  if (analysis) {
    if (analysis.left_image_url) urls.push(analysis.left_image_url);
    if (analysis.right_image_url) urls.push(analysis.right_image_url);
  }

  const uniqueUrls = Array.from(new Set(urls.filter(Boolean))) as string[];
  await Promise.all(uniqueUrls.map(u => deleteR2File(u, userId)));
};

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    if (!(await canUseFitnessFeature(user.id, "advanced_progress_analysis"))) {
      return NextResponse.json({ success: false, error: "Progress scans are available on the Pro plan.", errorType: "PRO_REQUIRED" }, { status: 403 });
    }

    const body = await req.json();
    const { frontImage, sideImage, leftImage, rightImage, backImage, scanDate } = body;

    if (!frontImage && !sideImage && !leftImage && !rightImage && !backImage) {
      return NextResponse.json({ success: false, error: 'At least one photo is required' }, { status: 400 });
    }

    // Process image: upload to R2 if available, otherwise persist compressed base64 data URL
    const processImage = async (base64Img: string | undefined, tag: string): Promise<string | null> => {
      if (!base64Img || !base64Img.startsWith("data:image")) return null;

      if (isR2Configured && r2Client) {
        try {
          const [meta, data] = base64Img.split(",");
          const mimeType = meta.split(";")[0].split(":")[1];
          const ext = mimeType.split("/")[1] || "jpeg";
          const buffer = Buffer.from(data, "base64");
          const fileName = `grindlog/${user.id}/body_scans/${Date.now()}-${tag}.${ext}`;

          const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: fileName,
            Body: buffer,
            ContentType: mimeType,
          });

          await r2Client.send(command);
          const publicUrl = `${process.env.R2_PUBLIC_URL}/${fileName}`;
          return publicUrl;
        } catch (error) {
          console.warn(`R2 upload failed for ${tag}, falling back to direct storage:`, error);
          return base64Img;
        }
      }

      // Default resilient fallback: direct compressed base64 URI
      return base64Img;
    };

    const frontUrl = await processImage(frontImage, 'front');
    const leftUrl = await processImage(leftImage, 'left');
    const rightUrl = await processImage(rightImage, 'right');
    const backUrl = await processImage(backImage, 'back');
    const sideUrl = (await processImage(sideImage, 'side')) || leftUrl || rightUrl;

    if (!frontUrl && !sideUrl && !leftUrl && !rightUrl && !backUrl) {
      return NextResponse.json({ success: false, error: 'Failed to process photos' }, { status: 400 });
    }

    const finalScanDate = scanDate ? new Date(scanDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

    // Check existing scans in fitness_os_body_scans
    const { data: existingScans } = await supabase
      .from('fitness_os_body_scans')
      .select('*')
      .eq('user_id', user.id)
      .order('scan_date', { ascending: true })
      .order('created_at', { ascending: true });

    const scanPayload = {
      front_image_url: frontUrl,
      side_image_url: sideUrl,
      back_image_url: backUrl,
      scan_date: finalScanDate,
      ai_analysis_ref: {
        left_image_url: leftUrl,
        right_image_url: rightUrl
      }
    };

    // Storage lifecycle: Always preserve existingScans[0] (Day 1 Baseline scan).
    // Allow up to 10 historical check-in scans. Only prune excess intermediate scans beyond 10.
    if (existingScans && existingScans.length > 10) {
      // Keep baseline (index 0) and the 9 most recent; prune the oldest intermediate scans
      const scansToCleanup = existingScans.slice(1, existingScans.length - 9);
      const idsToDelete = scansToCleanup.map((s: any) => s.id);

      for (const oldScan of scansToCleanup) {
        await deleteScanPhotosFromR2(oldScan, user.id);
      }

      if (idsToDelete.length > 0) {
        await supabase
          .from('fitness_os_body_scans')
          .delete()
          .in('id', idsToDelete);
      }
    }

    // Insert the new scan as the updated Current scan
    const { error: scanError } = await supabase
      .from('fitness_os_body_scans')
      .insert({
        user_id: user.id,
        ...scanPayload
      });

    if (scanError) {
      console.error("Insert scan error:", scanError);
      throw scanError;
    }

    try {
      invalidateProgressServerCache(user.id);
    } catch {}

    return NextResponse.json({ 
      success: true, 
      frontUrl, 
      sideUrl, 
      leftUrl, 
      rightUrl, 
      backUrl, 
      scanDate: finalScanDate 
    });

  } catch (err: any) {
    console.error("Add Scan Error:", err);
    return NextResponse.json({ success: false, error: err.message || "Failed to save scan" }, { status: 500 });
  }
}

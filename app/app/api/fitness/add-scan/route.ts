import { NextResponse } from 'next/server';
import { createServerSupabase } from "@/lib/services/supabase/server";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { canUseFitnessFeature } from "@/lib/fitness/subscription/access";

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
      .order('scan_date', { ascending: true });

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

    if (existingScans && existingScans.length >= 2) {
      // Replace the latest scan record
      const latestScan = existingScans[existingScans.length - 1];
      
      const { error: scanError } = await supabase
        .from('fitness_os_body_scans')
        .update(scanPayload)
        .eq('id', latestScan.id);
        
      if (scanError) {
        console.error("Update scan error:", scanError);
        throw scanError;
      }
    } else {
      // Insert new scan record
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
    }

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

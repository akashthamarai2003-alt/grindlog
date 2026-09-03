import { NextResponse } from 'next/server';
import { createServerSupabase } from "@/lib/services/supabase/server";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { canUseFitnessFeature } from "@/lib/fitness/subscription/access";

// Configure R2 using env variables
const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

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

    const { frontImage, sideImage, leftImage, rightImage, backImage } = await req.json();

    if (!frontImage && !sideImage && !leftImage && !rightImage && !backImage) {
      return NextResponse.json({ success: false, error: 'At least one image is required' }, { status: 400 });
    }

    const uploadImage = async (base64Img: string | undefined, tag: string) => {
      if (!base64Img || !base64Img.startsWith("data:image")) return null;
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

        // Construct the public URL
        const publicUrl = `${process.env.R2_PUBLIC_URL}/${fileName}`;
        return publicUrl;
      } catch (error) {
        console.error(`Error uploading ${tag} image to R2:`, error);
        return null;
      }
    };

    const frontUrl = await uploadImage(frontImage, 'front');
    const sideUrl = await uploadImage(sideImage, 'side');
    const leftUrl = await uploadImage(leftImage, 'left');
    const rightUrl = await uploadImage(rightImage, 'right');
    const backUrl = await uploadImage(backImage, 'back');

    if (!frontUrl && !sideUrl && !leftUrl && !rightUrl && !backUrl) {
       return NextResponse.json({ success: false, error: 'Failed to upload images' }, { status: 500 });
    }

    // Check existing scans
    const { data: existingScans } = await supabase
      .from('fitness_os_body_scans')
      .select('*')
      .eq('user_id', user.id)
      .order('scan_date', { ascending: true });

    if (existingScans && existingScans.length >= 2) {
      // Replace the latest scan (the last one in the array)
      const latestScan = existingScans[existingScans.length - 1];
      
      // Delete old photos from R2
      const deleteImage = async (url: string | null) => {
        if (!url) return;
        try {
          const publicUrlBase = process.env.R2_PUBLIC_URL || '';
          if (url.startsWith(publicUrlBase)) {
            const key = url.slice(publicUrlBase.length + 1);
            const command = new DeleteObjectCommand({
              Bucket: process.env.R2_BUCKET_NAME,
              Key: key
            });
            await r2Client.send(command);
          }
        } catch (err) {
          console.error("Failed to delete old image:", err);
        }
      };

      await Promise.all([
        deleteImage(latestScan.front_image_url),
        deleteImage(latestScan.side_image_url),
        deleteImage(latestScan.left_image_url),
        deleteImage(latestScan.right_image_url),
        deleteImage(latestScan.back_image_url),
      ]);

      // Update record
      const { error: scanError } = await supabase
        .from('fitness_os_body_scans')
        .update({
          front_image_url: frontUrl,
          side_image_url: sideUrl,
          left_image_url: leftUrl,
          right_image_url: rightUrl,
          back_image_url: backUrl,
          scan_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', latestScan.id);
        
      if (scanError) throw scanError;

    } else {
      // Insert new scan
      const { error: scanError } = await supabase
        .from('fitness_os_body_scans')
        .insert({
          user_id: user.id,
          front_image_url: frontUrl,
          side_image_url: sideUrl,
          left_image_url: leftUrl,
          right_image_url: rightUrl,
          back_image_url: backUrl,
          scan_date: new Date().toISOString().split('T')[0]
        });

      if (scanError) throw scanError;
    }

    return NextResponse.json({ success: true, frontUrl, sideUrl, leftUrl, rightUrl, backUrl });

  } catch (err: any) {
    console.error("Add Scan Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

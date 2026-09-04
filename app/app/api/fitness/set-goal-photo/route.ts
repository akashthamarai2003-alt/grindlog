import { NextResponse } from 'next/server';
import { createServerSupabase } from "@/lib/services/supabase/server";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

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

const deleteR2File = async (url: string | null | undefined) => {
  if (!url || !isR2Configured || !r2Client || !process.env.R2_BUCKET_NAME) return;
  try {
    let key: string | null = null;
    if (url.includes('grindlog/')) {
      key = url.substring(url.indexOf('grindlog/'));
    } else if (process.env.R2_PUBLIC_URL && url.startsWith(process.env.R2_PUBLIC_URL)) {
      key = url.replace(`${process.env.R2_PUBLIC_URL}/`, '');
    }

    if (key) {
      await r2Client.send(new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key
      }));
      console.log(`[R2] Deleted old goal photo from storage: ${key}`);
    }
  } catch (err) {
    console.warn("Failed to delete old goal photo from R2:", err);
  }
};

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const { goalImage } = await req.json();

    let finalGoalUrl: string | null = null;

    if (goalImage) {
      if (typeof goalImage === 'string' && goalImage.startsWith('data:image')) {
        if (isR2Configured && r2Client) {
          try {
            const [meta, data] = goalImage.split(",");
            const mimeType = meta.split(";")[0].split(":")[1];
            const ext = mimeType.split("/")[1] || "jpeg";
            const buffer = Buffer.from(data, "base64");
            const fileName = `grindlog/${user.id}/body_scans/${Date.now()}-goal.${ext}`;

            const command = new PutObjectCommand({
              Bucket: process.env.R2_BUCKET_NAME,
              Key: fileName,
              Body: buffer,
              ContentType: mimeType,
            });

            await r2Client.send(command);
            finalGoalUrl = `${process.env.R2_PUBLIC_URL}/${fileName}`;
          } catch (err) {
            console.warn("R2 upload failed for goal image, falling back to base64:", err);
            finalGoalUrl = goalImage;
          }
        } else {
          finalGoalUrl = goalImage;
        }
      } else if (typeof goalImage === 'string' && goalImage.startsWith('http')) {
        finalGoalUrl = goalImage;
      }
    }

    // Clean up old goal photo from R2 to strictly enforce 1 goal photo per user
    const { data: currentProfile } = await supabase
      .from('fitness_os_profiles')
      .select('goal_physique_image')
      .eq('user_id', user.id)
      .maybeSingle();

    if (currentProfile?.goal_physique_image && currentProfile.goal_physique_image !== finalGoalUrl) {
      await deleteR2File(currentProfile.goal_physique_image);
    }

    // 1. Update fitness_os_profiles
    await supabase
      .from('fitness_os_profiles')
      .update({ goal_physique_image: finalGoalUrl })
      .eq('user_id', user.id);

    // 2. Update fitness_os_body_scans
    await supabase
      .from('fitness_os_body_scans')
      .update({ goal_image_url: finalGoalUrl })
      .eq('user_id', user.id);

    return NextResponse.json({
      success: true,
      goalUrl: finalGoalUrl
    });
  } catch (err: any) {
    console.error("Set goal photo error:", err);
    return NextResponse.json({ success: false, error: err.message || "Failed to update goal photo" }, { status: 500 });
  }
}

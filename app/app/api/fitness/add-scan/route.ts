import { NextResponse } from 'next/server';
import { createServerSupabase } from "@/lib/services/supabase/server";
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary using env variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const { frontImage, sideImage, backImage } = await req.json();

    if (!frontImage && !sideImage && !backImage) {
      return NextResponse.json({ success: false, error: 'At least one image is required' }, { status: 400 });
    }

    const uploadImage = async (base64Img: string | undefined, tag: string) => {
      if (!base64Img) return null;
      try {
        const uploadResponse = await cloudinary.uploader.upload(base64Img, {
          folder: `grindlog/${user.id}/body_scans`,
          tags: ['body_scan', tag],
          quality: 'auto:good', // optimize quality
          fetch_format: 'auto', // optimize format
        });
        return uploadResponse.secure_url;
      } catch (error) {
        console.error(`Error uploading ${tag} image:`, error);
        return null;
      }
    };

    const frontUrl = await uploadImage(frontImage, 'front');
    const sideUrl = await uploadImage(sideImage, 'side');
    const backUrl = await uploadImage(backImage, 'back');

    if (!frontUrl && !sideUrl && !backUrl) {
       return NextResponse.json({ success: false, error: 'Failed to upload images' }, { status: 500 });
    }

    const { error: scanError } = await supabase
      .from('fitness_os_body_scans')
      .insert({
        user_id: user.id,
        front_image_url: frontUrl,
        side_image_url: sideUrl,
        back_image_url: backUrl,
        scan_date: new Date().toISOString().split('T')[0]
      });

    if (scanError) throw scanError;

    return NextResponse.json({ success: true, frontUrl, sideUrl, backUrl });

  } catch (err: any) {
    console.error("Add Scan Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

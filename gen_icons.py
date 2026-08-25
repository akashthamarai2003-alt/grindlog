import os
from PIL import Image, ImageDraw, ImageOps

def make_perfect_icons():
    source = r"c:\manage\web\app\public\icons\ChatGPT Image Aug 25, 2026, 03_36_11 PM.png"
    public_dir = r"c:\manage\web\app\public"
    icons_dir = os.path.join(public_dir, "icons")
    
    img = Image.open(source).convert("RGBA")
    w, h = img.size
    
    # Create a circular mask
    mask = Image.new("L", (w, h), 0)
    draw = ImageDraw.Draw(mask)
    
    # The green ring might not touch the exact edges, let's add a small padding
    # By visual inspection of typical ChatGPT DALL-E logos, the circle touches the edges.
    # Let's use the full dimensions for the circle
    draw.ellipse((0, 0, w, h), fill=255)
    
    # Apply mask to image (makes corners transparent)
    img.putalpha(mask)
    
    # Generate favicon
    img.save(os.path.join(public_dir, "favicon.ico"), format="ICO", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
    
    # For standard icons (any), transparent is great
    icon_192 = img.resize((192, 192), Image.Resampling.LANCZOS)
    icon_192.save(os.path.join(icons_dir, "icon-192.png"), format="PNG")
    
    icon_512 = img.resize((512, 512), Image.Resampling.LANCZOS)
    icon_512.save(os.path.join(icons_dir, "icon-512.png"), format="PNG")
    
    apple_icon = img.resize((180, 180), Image.Resampling.LANCZOS)
    apple_icon.save(os.path.join(icons_dir, "apple-touch-icon.png"), format="PNG")
    
    # For maskable icons (Android Adaptive), they require a solid background and plenty of padding (safe zone is inner 80%).
    # We will create a solid black image and paste our circular logo in the center, scaled down.
    # Safe zone diameter is 80% of width. So we scale the logo to 80% of the image size.
    
    maskable_w_192 = 192
    maskable_logo_192 = img.resize((int(192 * 0.8), int(192 * 0.8)), Image.Resampling.LANCZOS)
    maskable_bg_192 = Image.new("RGBA", (192, 192), (0, 0, 0, 255))
    offset_192 = ((192 - int(192 * 0.8)) // 2, (192 - int(192 * 0.8)) // 2)
    maskable_bg_192.paste(maskable_logo_192, offset_192, maskable_logo_192)
    maskable_bg_192.save(os.path.join(icons_dir, "icon-192-maskable.png"), format="PNG")
    
    maskable_w_512 = 512
    maskable_logo_512 = img.resize((int(512 * 0.8), int(512 * 0.8)), Image.Resampling.LANCZOS)
    maskable_bg_512 = Image.new("RGBA", (512, 512), (0, 0, 0, 255))
    offset_512 = ((512 - int(512 * 0.8)) // 2, (512 - int(512 * 0.8)) // 2)
    maskable_bg_512.paste(maskable_logo_512, offset_512, maskable_logo_512)
    maskable_bg_512.save(os.path.join(icons_dir, "icon-512-maskable.png"), format="PNG")

    print("Icons generated perfectly!")
    
if __name__ == "__main__":
    make_perfect_icons()

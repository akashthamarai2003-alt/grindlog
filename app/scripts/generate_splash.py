import os
from PIL import Image, ImageDraw, ImageFont

def create_splash(w, h, out_path):
    im = Image.new('RGBA', (w, h), (10, 17, 8, 255))
    draw = ImageDraw.Draw(im)

    # Base scale relative to 1080p
    scale = max(0.35, min(w, h) / 1080.0)
    cx, cy = w // 2, h // 2

    # Shift center slightly up for optical balance (45% of height)
    logo_cy = int(h * 0.45)

    # Subtle radial glow behind emblem
    glow_radius = int(240 * scale)
    if glow_radius > 10:
        glow_im = Image.new('RGBA', (glow_radius * 2, glow_radius * 2), (0, 0, 0, 0))
        glow_draw = ImageDraw.Draw(glow_im)
        for r in range(glow_radius, 0, -3):
            alpha = int(24 * (1.0 - (r / glow_radius)) ** 1.8)
            glow_draw.ellipse(
                [glow_radius - r, glow_radius - r, glow_radius + r, glow_radius + r],
                fill=(173, 255, 0, alpha)
            )
        im.paste(glow_im, (cx - glow_radius, logo_cy - glow_radius), glow_im)

    # Emblem rounded rectangle
    box_size = max(40, int(150 * scale))
    corner_radius = max(10, int(40 * scale))
    x0 = cx - box_size // 2
    y0 = logo_cy - box_size // 2
    x1 = cx + box_size // 2
    y1 = logo_cy + box_size // 2

    draw.rounded_rectangle([x0, y0, x1, y1], radius=corner_radius, fill=(173, 255, 0, 255))

    # Inner 'G'
    font_path = 'C:/Windows/Fonts/arialbd.ttf' if os.path.exists('C:/Windows/Fonts/arialbd.ttf') else 'C:/Windows/Fonts/segoeuib.ttf'
    g_font_size = max(24, int(96 * scale))
    g_font = ImageFont.truetype(font_path, g_font_size)
    bbox = g_font.getbbox('G')
    gw = bbox[2] - bbox[0]
    gh = bbox[3] - bbox[1]
    gx = cx - gw // 2 - bbox[0]
    gy = logo_cy - gh // 2 - bbox[1]
    draw.text((gx, gy), 'G', font=g_font, fill=(0, 0, 0, 255))

    # Text: GRINDLOG.AI
    title_font_size = max(16, int(52 * scale))
    title_font = ImageFont.truetype(font_path, title_font_size)
    
    t_grind = 'GRINDLOG'
    t_ai = '.AI'
    b_grind = title_font.getbbox(t_grind)
    b_ai = title_font.getbbox(t_ai)
    w_grind = b_grind[2] - b_grind[0]
    w_ai = b_ai[2] - b_ai[0]
    total_w = w_grind + w_ai

    text_y = y1 + int(38 * scale)
    text_x0 = cx - total_w // 2

    draw.text((text_x0, text_y), t_grind, font=title_font, fill=(255, 255, 255, 255))
    draw.text((text_x0 + w_grind, text_y), t_ai, font=title_font, fill=(173, 255, 0, 255))

    # Subtitle: FITNESS AI OS
    sub_font_size = max(10, int(18 * scale))
    sub_font = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', sub_font_size)
    sub_text = 'F I T N E S S   A I   O S'
    b_sub = sub_font.getbbox(sub_text)
    w_sub = b_sub[2] - b_sub[0]
    sub_y = text_y + int(64 * scale)
    draw.text((cx - w_sub // 2, sub_y), sub_text, font=sub_font, fill=(145, 160, 140, 255))

    dir_name = os.path.dirname(out_path)
    if dir_name:
        os.makedirs(dir_name, exist_ok=True)
    im.save(out_path, 'PNG')
    print('Generated:', out_path, im.size)

# Target configurations for Android drawables
drawables = [
    ('android/app/src/main/res/drawable/splash.png', 480, 800),
    ('android/app/src/main/res/drawable-port-mdpi/splash.png', 320, 480),
    ('android/app/src/main/res/drawable-port-hdpi/splash.png', 480, 800),
    ('android/app/src/main/res/drawable-port-xhdpi/splash.png', 720, 1280),
    ('android/app/src/main/res/drawable-port-xxhdpi/splash.png', 960, 1600),
    ('android/app/src/main/res/drawable-port-xxxhdpi/splash.png', 1280, 1920),
    ('android/app/src/main/res/drawable-land-mdpi/splash.png', 480, 320),
    ('android/app/src/main/res/drawable-land-hdpi/splash.png', 800, 480),
    ('android/app/src/main/res/drawable-land-xhdpi/splash.png', 1280, 720),
    ('android/app/src/main/res/drawable-land-xxhdpi/splash.png', 1600, 960),
    ('android/app/src/main/res/drawable-land-xxxhdpi/splash.png', 1920, 1280),
]

for path, w, h in drawables:
    create_splash(w, h, path)

# Also create splash_icon.png (a clean centered emblem for Android 12+ Theme.SplashScreen)
icon_size = 512
icon_im = Image.new('RGBA', (icon_size, icon_size), (0, 0, 0, 0))
icon_draw = ImageDraw.Draw(icon_im)
box_size = 380
corner_radius = 96
x0 = (icon_size - box_size) // 2
y0 = (icon_size - box_size) // 2
x1 = x0 + box_size
y1 = y0 + box_size
icon_draw.rounded_rectangle([x0, y0, x1, y1], radius=corner_radius, fill=(173, 255, 0, 255))
font_path = 'C:/Windows/Fonts/arialbd.ttf' if os.path.exists('C:/Windows/Fonts/arialbd.ttf') else 'C:/Windows/Fonts/segoeuib.ttf'
g_font = ImageFont.truetype(font_path, 240)
bbox = g_font.getbbox('G')
gw = bbox[2] - bbox[0]
gh = bbox[3] - bbox[1]
gx = icon_size // 2 - gw // 2 - bbox[0]
gy = icon_size // 2 - gh // 2 - bbox[1]
icon_draw.text((gx, gy), 'G', font=g_font, fill=(0, 0, 0, 255))
icon_im.save('android/app/src/main/res/drawable/splash_icon.png', 'PNG')
print('Generated: android/app/src/main/res/drawable/splash_icon.png', icon_im.size)

from PIL import Image, ImageDraw
import os

img_path = r"C:\manage\web\app\public\images\ChatGPT Image Aug 26, 2026, 09_51_43 AM (1).png"
out_dir = r"C:\manage\web\app\public\images\goals"
os.makedirs(out_dir, exist_ok=True)

img = Image.open(img_path).convert("RGBA")
width, height = img.size

cols = 4
rows = 2
cell_w = width // cols
cell_h = height // rows

# The circles in DALL-E grids are usually centered in each cell.
# We'll crop a square from the center of each cell.
# The circle diameter is probably around 80-90% of the cell width.
size = min(cell_w, cell_h)
crop_size = int(size * 0.85) # Guessing the circle size

count = 1
for r in range(rows):
    for c in range(cols):
        if count > 7:
            break
            
        # Center of the cell
        cx = (c * cell_w) + (cell_w // 2)
        cy = (r * cell_h) + (cell_h // 2)
        
        # Crop box
        box = (cx - crop_size//2, cy - crop_size//2, cx + crop_size//2, cy + crop_size//2)
        icon = img.crop(box)
        
        # Create circular mask
        mask = Image.new('L', (crop_size, crop_size), 0)
        draw = ImageDraw.Draw(mask)
        draw.ellipse((0, 0, crop_size, crop_size), fill=255)
        
        # Apply mask
        icon.putalpha(mask)
        
        # Resize to a reasonable web size
        icon = icon.resize((128, 128), Image.Resampling.LANCZOS)
        
        icon.save(os.path.join(out_dir, f"goal-{count}.png"))
        count += 1

print("Done cropping icons!")

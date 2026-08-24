import os
import sys
from PIL import Image, ImageDraw, ImageFont

sys.stdout.reconfigure(encoding='utf-8')

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"
img_path = os.path.join(folder, "信信-01.png")
artifacts_dir = r"C:\Users\Jerry\.gemini\antigravity\brain\0198b957-90fd-47d6-8e0b-d00b1216d601"
output_path = os.path.join(artifacts_dir, "xinxin_grid.png")

if os.path.exists(img_path):
    with Image.open(img_path) as img:
        img = img.convert("RGBA")
        width, height = img.size
        print(f"Loaded image size: {width}x{height}")
        
        # Draw grid
        draw = ImageDraw.Draw(img)
        
        # We'll draw grid lines every 50 pixels
        grid_interval = 50
        
        # Horizontal lines
        for y in range(0, height, grid_interval):
            draw.line([(0, y), (width, y)], fill=(255, 0, 0, 150), width=1)
            draw.text((5, y + 2), f"y={y}", fill=(255, 0, 0, 255))
            
        # Vertical lines
        for x in range(0, width, grid_interval):
            draw.line([(x, 0), (x, height)], fill=(0, 0, 255, 150), width=1)
            draw.text((x + 2, 5), f"x={x}", fill=(0, 0, 255, 255))
            
        # Also draw minor grid lines every 10 pixels without label
        for y in range(0, height, 10):
            if y % 50 != 0:
                draw.line([(0, y), (width, y)], fill=(255, 100, 100, 50), width=1)
        for x in range(0, width, 10):
            if x % 50 != 0:
                draw.line([(x, 0), (x, height)], fill=(100, 100, 255, 50), width=1)
                
        img.save(output_path, "PNG")
        print(f"Saved grid image to: {output_path}")
else:
    print("File not found")

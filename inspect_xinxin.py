import os
import sys
from PIL import Image

# Reconfigure stdout to use utf-8
sys.stdout.reconfigure(encoding='utf-8')

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"
img_path = os.path.join(folder, "信信-01.png")

if os.path.exists(img_path):
    with Image.open(img_path) as img:
        img = img.convert("RGBA")
        width, height = img.size
        print(f"File width={width}, height={height}")
        
        bbox = img.getbbox()
        print(f"Overall bounding box: {bbox}")
        
        row_alphas = []
        for y in range(height):
            has_pixel = False
            for x in range(width):
                r, g, b, a = img.getpixel((x, y))
                if a > 10:
                    has_pixel = True
                    break
            row_alphas.append(1 if has_pixel else 0)
            
        y_segments = []
        in_segment = False
        start = 0
        for y in range(height):
            if row_alphas[y] > 0 and not in_segment:
                start = y
                in_segment = True
            elif row_alphas[y] == 0 and in_segment:
                y_segments.append((start, y - 1))
                in_segment = False
        if in_segment:
            y_segments.append((start, height - 1))
            
        print(f"Vertical segments: {y_segments}")
else:
    print("File not found")

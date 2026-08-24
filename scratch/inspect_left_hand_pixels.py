import os
import sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"
img_path = os.path.join(folder, "信信-01.png")

if not os.path.exists(img_path):
    print("信信-01.png not found!")
    sys.exit(1)

with Image.open(img_path) as img:
    img = img.convert("RGBA")
    # Left arm box: [81, 600, 364, 800]
    box = [81, 600, 364, 800]
    cropped = img.crop(box)
    w, h = cropped.size
    pixels = cropped.load()
    
    print(f"Cropped left arm size: {w}x{h}")
    # Let's find the non-white pixel boundaries in this box
    non_white_pixels = []
    for y in range(h):
        row_pixels = []
        for x in range(w):
            r, g, b, a = pixels[x, y]
            # Check if not white background (using high tolerance)
            if not (r > 240 and g > 240 and b > 240):
                row_pixels.append(x)
        if row_pixels:
            non_white_pixels.append((y, min(row_pixels), max(row_pixels)))
            
    print("\nNon-white pixel span per row (first 30 rows and last 30 rows):")
    for item in non_white_pixels[:30]:
        print(f"  y={item[0]:3} | x_min={item[1]:3} | x_max={item[2]:3}")
    print("  ...")
    for item in non_white_pixels[-30:]:
        print(f"  y={item[0]:3} | x_min={item[1]:3} | x_max={item[2]:3}")

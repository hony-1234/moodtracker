import os
import sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"
img_path = os.path.join(folder, "信信-01.png")

if os.path.exists(img_path):
    with Image.open(img_path) as img:
        img = img.convert("RGBA")
        pixels = img.load()
        
        # Print colors in column x=365 (center) from y=180 to y=280
        print("Analyzing vertical column x=365 (center) from y=180 to y=280:")
        for y in range(180, 280, 5):
            r, g, b, a = pixels[365, y]
            print(f"  y={y:3} | RGBA=({r:3}, {g:3}, {b:3}, {a:3})")
else:
    print("信信-01.png not found!")

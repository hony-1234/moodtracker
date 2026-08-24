import os
import sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"

for filename in ["xinxin_left_eye.png", "xinxin_right_eye.png"]:
    path = os.path.join(folder, filename)
    if os.path.exists(path):
        img = Image.open(path).convert("RGBA")
        colors = {}
        for y in range(img.height):
            for x in range(img.width):
                p = img.getpixel((x,y))
                colors[p] = colors.get(p, 0) + 1
        print(f"Distinct colors in {filename} (showing up to 5 most common):")
        sorted_colors = sorted(colors.items(), key=lambda item: item[1], reverse=True)
        for c, count in sorted_colors[:5]:
            print(f"  {c}: {count} pixels")

import os
import sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"
legs_path = os.path.join(folder, "xinxin_legs_v4.png")

if os.path.exists(legs_path):
    with Image.open(legs_path) as img:
        img = img.convert("RGBA")
        w, h = img.size
        pixels = img.load()
        
        # Print non-transparent pixels in the last 5 rows of xinxin_legs_v4.png
        print(f"Inspecting last 5 rows of legs (y={h-5} to y={h-1}):")
        for y in range(h-5, h):
            non_trans = []
            for x in range(w):
                r, g, b, a = pixels[x, y]
                if a > 0:
                    non_trans.append((x, (r, g, b, a)))
            print(f"  y={y} | Non-transparent pixels count: {len(non_trans)}")
            if len(non_trans) > 0:
                print(f"    First 3: {non_trans[:3]}")
                print(f"    Last 3: {non_trans[-3:]}")
else:
    print("xinxin_legs_v4.png not found!")

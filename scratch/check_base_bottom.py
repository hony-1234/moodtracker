import os
import sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"
base_path = os.path.join(folder, "xinxin_body_base_v4.png")

if os.path.exists(base_path):
    with Image.open(base_path) as img:
        img = img.convert("RGBA")
        w, h = img.size
        pixels = img.load()
        
        print(f"Body base size: {w}x{h}")
        # Find if there are any non-transparent pixels for y > 820
        non_trans_count = 0
        for y in range(821, h):
            for x in range(w):
                _, _, _, a = pixels[x, y]
                if a > 0:
                    non_trans_count += 1
        print(f"Number of non-transparent pixels below y=820 on body base: {non_trans_count}")
else:
    print("xinxin_body_base_v4.png not found!")

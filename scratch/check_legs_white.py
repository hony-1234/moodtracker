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
        
        # Let's count how many white pixels are in this cropped image
        white_count = 0
        for y in range(h):
            for x in range(w):
                r, g, b, a = pixels[x, y]
                # check if it is white or very close to white
                if r > 240 and g > 240 and b > 240 and a > 0:
                    white_count += 1
        print(f"Legs image size: {w}x{h}")
        print(f"Number of white pixels in legs: {white_count}")
else:
    print("xinxin_legs_v4.png not found!")

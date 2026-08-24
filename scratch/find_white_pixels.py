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
        
        print(f"Legs size: {w}x{h}")
        # Find first 10 pure white pixels and their coordinates
        white_pixels = []
        for y in range(h):
            for x in range(w):
                r, g, b, a = pixels[x, y]
                if r == 255 and g == 255 and b == 255 and a > 0:
                    white_pixels.append((x, y))
                    if len(white_pixels) >= 10:
                        break
            if len(white_pixels) >= 10:
                break
        print("First 10 white pixels:", white_pixels)
else:
    print("xinxin_legs_v4.png not found!")

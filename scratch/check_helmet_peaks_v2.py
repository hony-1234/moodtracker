import os
import sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"
img_path = os.path.join(folder, "信信-01.png")

if os.path.exists(img_path):
    with Image.open(img_path) as img:
        img = img.convert("RGBA")
        w, h = img.size
        pixels = img.load()
        
        # We want to find the first pixel in each column that is NOT white (the mascot boundary)
        print("Mascot outline top boundary in columns x=200 to x=550:")
        min_ys = {}
        for x in range(200, 550, 10):
            for y in range(h):
                r, g, b, a = pixels[x, y]
                # Check if it is NOT white background
                if not (r > 240 and g > 240 and b > 240):
                    min_ys[x] = (y, (r, g, b, a))
                    break
        for x, (y, color) in sorted(min_ys.items()):
            print(f"  x={x:3} | First mascot pixel y={y:3} | RGBA={color}")
else:
    print("信信-01.png not found!")

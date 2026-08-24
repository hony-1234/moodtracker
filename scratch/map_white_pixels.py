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
        
        # Print a simple 2D ASCII map of the white pixels
        # Let's downsample to 40x20
        dw, dh = 40, 20
        scale_x = w / dw
        scale_y = h / dh
        
        print("Map of white pixels (W) and other solid pixels (O):")
        for dy in range(dh):
            row = ""
            for dx in range(dw):
                # Sample a small block of pixels
                sx = int(dx * scale_x)
                sy = int(dy * scale_y)
                r, g, b, a = pixels[sx, sy]
                if a == 0:
                    row += "."
                elif r > 240 and g > 240 and b > 240:
                    row += "W"
                else:
                    row += "O"
            print(row)
else:
    print("xinxin_legs_v4.png not found!")

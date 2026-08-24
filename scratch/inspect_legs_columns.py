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
        
        # Let's inspect the row y = 820 (which is above row 830) across columns 218 to 509.
        # This will show where the legs are actually located before any modifications!
        print("Mascot pixels at row y = 820 (between 218 and 509):")
        for x in range(218, 510):
            r, g, b, a = pixels[x, 820]
            if a > 10 and not (r > 240 and g > 240 and b > 240):
                print(f"  Col {x:3} | RGBA=({r:3}, {g:3}, {b:3}, {a:3})")
else:
    print("信信-01.png not found")

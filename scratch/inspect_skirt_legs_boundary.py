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
    w, h = img.size
    pixels = img.load()
    
    # We want to find where the red dress ends in columns x = 218 to 509.
    # Let's inspect the vertical columns 250 (left leg), 365 (skirt bottom middle), and 470 (right leg)
    # from y = 780 to y = 840.
    for col_name, x in [("Left Leg Column", 250), ("Skirt Middle", 365), ("Right Leg Column", 470)]:
        print(f"\nInspecting {col_name} at x = {x}:")
        for y in range(780, 840):
            r, g, b, a = pixels[x, y]
            if a > 0:
                print(f"  y={y:3} | RGBA=({r:3}, {g:3}, {b:3}, {a:3})")

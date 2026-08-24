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
        
        # Let's inspect the central columns at rows y = 600, 650, 700, 750, 800
        # for x from 260 to 470
        print("Inspecting central dress/torso colors:")
        for y in [600, 650, 700, 750, 800]:
            print(f"\nRow y = {y}:")
            # Print average color or some samples
            samples = []
            for x in range(260, 480, 20):
                r, g, b, a = pixels[x, y]
                samples.append(f"x={x}:({r},{g},{b})")
            print("  " + " | ".join(samples))
else:
    print("File not found")

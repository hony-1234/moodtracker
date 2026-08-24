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
        
        # Print a detailed map of the colors and alphas of xinxin_legs_v4.png
        # Let's print the RGBA of some points on the left, right, and bottom borders
        print("Left border pixels (x=0 to x=10, y=h-10 to y=h-1):")
        for y in range(h-10, h):
            row = []
            for x in range(10):
                r, g, b, a = pixels[x, y]
                row.append(f"({r},{g},{b},{a})")
            print(f"y={y}: " + " ".join(row[:5]))
            
        print("\nRight border pixels (x=w-10 to x=w-1, y=h-10 to y=h-1):")
        for y in range(h-10, h):
            row = []
            for x in range(w-10, w):
                r, g, b, a = pixels[x, y]
                row.append(f"({r},{g},{b},{a})")
            print(f"y={y}: " + " ".join(row[-5:]))
else:
    print("xinxin_legs_v4.png not found!")

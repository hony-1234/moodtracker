import os
import sys
from PIL import Image
from collections import Counter

sys.stdout.reconfigure(encoding='utf-8')

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"
img_path = os.path.join(folder, "信信-01.png")

if os.path.exists(img_path):
    img = Image.open(img_path).convert("RGBA")
    width, height = img.size
    pixels = img.load()
    
    yellows = []
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if a > 10 and not (r >= 240 and g >= 240 and b >= 240):
                # Yellow: high R, high G, low B
                if r > 200 and g > 170 and b < 120:
                    yellows.append((r, g, b))
                    
    print("Top 10 yellow/trim colors in mascot:")
    for col, count in Counter(yellows).most_common(10):
        print(f"  Color {str(col):15} | Count: {count:4d}")
else:
    print("Not found")

import os
from PIL import Image

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"
img_path = os.path.join(folder, "信信-01.png")

if os.path.exists(img_path):
    img = Image.open(img_path).convert("RGBA")
    pixels = img.load()
    
    y = 830
    print(f"Row {y} non-white pixels:")
    for x in range(218, 510):
        r, g, b, a = pixels[x, y]
        if a > 10 and not (r >= 235 and g >= 235 and b >= 235):
            print(f"  Col {x} | Color: ({r}, {g}, {b}, {a})")
else:
    print("File not found")

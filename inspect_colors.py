import os
from PIL import Image
from collections import Counter

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"
img_path = os.path.join(folder, "xinxin_left_hand.png")

if os.path.exists(img_path):
    with Image.open(img_path) as img:
        img_rgba = img.convert("RGBA")
        colors = []
        for y in range(img_rgba.height):
            for x in range(img_rgba.width):
                r, g, b, a = img_rgba.getpixel((x, y))
                if a > 0:
                    colors.append((r, g, b))
        counter = Counter(colors)
        print("Most common opaque RGB colors:")
        for color, count in counter.most_common(20):
            print(f"  Color: {color} | Count: {count}")
else:
    print("File not found")

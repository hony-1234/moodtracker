import os
from PIL import Image
from collections import Counter

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"
img_path = os.path.join(folder, "xinxin_left_hand_v3.png")

if os.path.exists(img_path):
    with Image.open(img_path) as img:
        img_rgba = img.convert("RGBA")
        colors = []
        for y in range(img_rgba.height):
            for x in range(img_rgba.width):
                r, g, b, a = img_rgba.getpixel((x, y))
                if a == 255:
                    colors.append((r, g, b))
        counter = Counter(colors)
        print("Colors with count > 10 in xinxin_left_hand_v3.png:")
        for color, count in counter.most_common():
            if count > 10:
                print(f"  Color: {color} | Count: {count}")
else:
    print("File not found")

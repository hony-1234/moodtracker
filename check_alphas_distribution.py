import os
from PIL import Image
from collections import Counter

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"
img_path = os.path.join(folder, "xinxin_left_hand_v3.png")

if os.path.exists(img_path):
    with Image.open(img_path) as img:
        img_rgba = img.convert("RGBA")
        alphas = []
        for y in range(img_rgba.height):
            for x in range(img_rgba.width):
                r, g, b, a = img_rgba.getpixel((x, y))
                alphas.append(a)
        counter = Counter(alphas)
        print("Alpha distribution for xinxin_left_hand_v3.png:")
        for alpha, count in counter.most_common():
            print(f"  Alpha: {alpha:3} | Count: {count}")
else:
    print("File not found")

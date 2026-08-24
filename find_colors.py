import os
from PIL import Image
from collections import Counter

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"
img_path = os.path.join(folder, "信信-01.png")

if os.path.exists(img_path):
    with Image.open(img_path) as img:
        img_rgba = img.convert("RGBA")
        width, height = img.size
        
        # 1. Inspect brown helmet region (near the top crenels, e.g. y=200 to 240, x=300 to 450)
        helmet_colors = []
        for y in range(200, 240):
            for x in range(300, 450):
                helmet_colors.append(img_rgba.getpixel((x, y))[:3])
        
        # 2. Inspect yellow clothing region (e.g. y=700 to 750, x=300 to 450)
        yellow_colors = []
        for y in range(700, 750):
            for x in range(300, 450):
                yellow_colors.append(img_rgba.getpixel((x, y))[:3])
                
        # 3. Inspect red heart region (e.g. y=660 to 690, x=340 to 390)
        red_colors = []
        for y in range(660, 690):
            for x in range(340, 390):
                red_colors.append(img_rgba.getpixel((x, y))[:3])
                
        # 4. Inspect face skin-tone region (e.g. y=450 to 550, x=300 to 450)
        skin_colors = []
        for y in range(450, 550):
            for x in range(300, 450):
                skin_colors.append(img_rgba.getpixel((x, y))[:3])
                
        print("Helmet colors (most common):", Counter(helmet_colors).most_common(5))
        print("Yellow clothing colors (most common):", Counter(yellow_colors).most_common(5))
        print("Red heart colors (most common):", Counter(red_colors).most_common(5))
        print("Skin colors (most common):", Counter(skin_colors).most_common(5))
else:
    print("File not found")

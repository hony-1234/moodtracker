import os
from PIL import Image
from collections import Counter

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"
img_path = os.path.join(folder, "xinxin_legs_v4.png")

if os.path.exists(img_path):
    with Image.open(img_path) as img:
        img_rgba = img.convert("RGBA")
        width, height = img.size
        
        alphas = []
        for y in range(height):
            for x in range(width):
                r, g, b, a = img_rgba.getpixel((x, y))
                alphas.append(a)
                
        alpha_counter = Counter(alphas)
        print("Alpha counts:")
        for val, count in alpha_counter.items():
            print(f"  Alpha {val}: {count}")
            
        print("\nColors with count > 100 in solid pixels:")
        solid_colors = []
        for y in range(height):
            for x in range(width):
                r, g, b, a = img_rgba.getpixel((x, y))
                if a == 255:
                    solid_colors.append((r, g, b))
                    
        color_counter = Counter(solid_colors)
        for color, count in color_counter.most_common(20):
            print(f"  Color {color}: {count}")
else:
    print("xinxin_legs_v4.png not found")

import os
import sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"
img_path = os.path.join(folder, "信信-01.png")

if os.path.exists(img_path):
    with Image.open(img_path) as img:
        img = img.convert("RGBA")
        print("Corner (0,0) pixel:", img.getpixel((0, 0)))
        print("Center (365, 501) pixel:", img.getpixel((365, 501)))
        
        # Let's count transparent vs non-transparent pixels
        alpha = img.getchannel('A')
        trans_count = 0
        solid_count = 0
        for y in range(img.height):
            for x in range(img.width):
                a = alpha.getpixel((x, y))
                if a == 0:
                    trans_count += 1
                elif a == 255:
                    solid_count += 1
        print(f"Total pixels: {img.width * img.height}")
        print(f"Fully transparent (alpha=0): {trans_count}")
        print(f"Fully solid (alpha=255): {solid_count}")
        print(f"Other alpha: {img.width * img.height - trans_count - solid_count}")
else:
    print("File not found")

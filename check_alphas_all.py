import os
import sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"

for filename in os.listdir(folder):
    if filename.endswith(".png"):
        img_path = os.path.join(folder, filename)
        with Image.open(img_path) as img:
            img = img.convert("RGBA")
            alpha = img.getchannel('A')
            trans_count = sum(1 for y in range(img.height) for x in range(img.width) if alpha.getpixel((x, y)) == 0)
            solid_count = sum(1 for y in range(img.height) for x in range(img.width) if alpha.getpixel((x, y)) == 255)
            other_count = img.width * img.height - trans_count - solid_count
            print(f"{filename}: size={img.width}x{img.height}, transparent={trans_count}, solid={solid_count}, other={other_count}")

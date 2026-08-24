import os
import sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"

for filename in ["xinxin_left_eye.png", "xinxin_right_eye.png"]:
    path = os.path.join(folder, filename)
    if os.path.exists(path):
        img = Image.open(path).convert("RGBA")
        print(f"{filename} corner (0,0):", img.getpixel((0,0)))
        print(f"{filename} center ({img.width//2}, {img.height//2}):", img.getpixel((img.width//2, img.height//2)))

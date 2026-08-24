import os
from PIL import Image

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"

for filename in os.listdir(folder):
    if filename.endswith(".png"):
        path = os.path.join(folder, filename)
        with Image.open(path) as img:
            img = img.convert("RGBA")
            w, h = img.size
            print(f"File: {filename} | Size: {w}x{h}")

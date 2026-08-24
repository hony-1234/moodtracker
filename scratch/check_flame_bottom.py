import os
import sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"
fire_path = os.path.join(folder, "xinxin_fire_v4.png")

if os.path.exists(fire_path):
    with Image.open(fire_path) as img:
        img = img.convert("RGBA")
        w, h = img.size
        pixels = img.load()
        
        # Let's check the bottom row (y = h-1) of the flame image to see if it is transparent or solid
        transparent_count = 0
        solid_count = 0
        for x in range(w):
            _, _, _, a = pixels[x, y] # wait, y should be h-1!
        
        # Corrected code below
        for x in range(w):
            r, g, b, a = pixels[x, h-1]
            if a == 0:
                transparent_count += 1
            else:
                solid_count += 1
        print(f"Flame image size: {w}x{h}")
        print(f"Bottom row (y={h-1}): Transparent pixels: {transparent_count} | Solid pixels: {solid_count}")
else:
    print("xinxin_fire_v4.png not found!")

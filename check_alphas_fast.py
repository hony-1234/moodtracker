import os
import sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"

for filename in os.listdir(folder):
    if filename.endswith(".png"):
        img_path = os.path.join(folder, filename)
        try:
            with Image.open(img_path) as img:
                img = img.convert("RGBA")
                alpha = img.getchannel('A')
                # getextrema returns (min, max) of the band
                extrema = alpha.getextrema()
                print(f"{filename}: size={img.width}x{img.height}, alpha_range={extrema}")
        except Exception as e:
            print(f"Error reading {filename}: {e}")

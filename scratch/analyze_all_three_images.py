import os
import sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"

for name in ["信信-01.png", "信信-02.png", "信信-03.png"]:
    path = os.path.join(folder, name)
    if not os.path.exists(path):
        print(f"Error: {name} does not exist!")
        continue
    with Image.open(path) as img:
        print(f"=== {name} ===")
        print(f"  Dimensions: {img.width}x{img.height}")
        print(f"  Mode: {img.mode}")
        print(f"  Format: {img.format}")
        
        # Check if there is white background (high percentage of (255,255,255) pixels)
        pixels = img.convert("RGBA").getdata()
        white_count = sum(1 for p in pixels if p[0] > 245 and p[1] > 245 and p[2] > 245 and p[3] > 0)
        opaque_count = sum(1 for p in pixels if p[3] > 0)
        total_pixels = len(pixels)
        transparent_count = sum(1 for p in pixels if p[3] == 0)
        
        print(f"  Opaque pixels: {opaque_count} / {total_pixels} ({opaque_count/total_pixels:.1%})")
        print(f"  White-ish pixels: {white_count} / {opaque_count} ({white_count/opaque_count:.1%} of opaque)")
        print(f"  Transparent pixels: {transparent_count} / {total_pixels} ({transparent_count/total_pixels:.1%})")

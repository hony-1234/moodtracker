import os
import sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

workspace_dir = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker"
folder = os.path.join(workspace_dir, "public", "學校圖檔", "吉祥物")
base_v7_path = os.path.join(folder, "xinxin_body_base_v7.png")

if not os.path.exists(base_v7_path):
    print("xinxin_body_base_v7.png not found!")
    exit(1)

with Image.open(base_v7_path) as img:
    img = img.convert("RGBA")
    width, height = img.size
    
    # 1. Create Head Layer (y <= 703)
    head_img = img.copy()
    head_pixels = head_img.load()
    for y in range(height):
        for x in range(width):
            if y > 703:
                head_pixels[x, y] = (0, 0, 0, 0)
                
    head_path = os.path.join(folder, "xinxin_head_v8.png")
    head_img.save(head_path, "PNG")
    print(f"Generated head layer: {head_path}")
    
    # 2. Create Body Base Layer (y > 703, with vertical collar/neck extension up to y=660)
    body_img = img.copy()
    body_pixels = body_img.load()
    
    # Clear top area first
    for y in range(height):
        for x in range(width):
            if y <= 703:
                body_pixels[x, y] = (0, 0, 0, 0)
                
    # Extend the shoulders/neck straight upwards from row 704
    for y in range(650, 704):
        for x in range(212, 525):
            # Grab pixel from row 704
            r, g, b, a = img.getpixel((x, 704))
            body_pixels[x, y] = (r, g, b, a)
            
    body_path = os.path.join(folder, "xinxin_body_base_v8.png")
    body_img.save(body_path, "PNG")
    print(f"Generated body base layer: {body_path}")

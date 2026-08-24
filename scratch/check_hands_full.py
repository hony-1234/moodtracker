import os
from PIL import Image

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"
img_path = os.path.join(folder, "信信-01.png")

if os.path.exists(img_path):
    img = Image.open(img_path).convert("RGBA")
    width, height = img.size
    pixels = img.load()
    
    # We want to find the bounding box of non-transparent, non-white pixels
    # for the left hand area (x < 350, 600 <= y < 800)
    solid_lh = 0
    lh_ymin, lh_ymax = height, 0
    lh_xmin, lh_xmax = width, 0
    
    # Right hand area (x > 380, 600 <= y < 800)
    solid_rh = 0
    rh_ymin, rh_ymax = height, 0
    rh_xmin, rh_xmax = width, 0
    
    for y in range(600, 800):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if a > 10 and not (r >= 240 and g >= 240 and b >= 240):
                if x < 365:
                    solid_lh += 1
                    if y < lh_ymin: lh_ymin = y
                    if y > lh_ymax: lh_ymax = y
                    if x < lh_xmin: lh_xmin = x
                    if x > lh_xmax: lh_xmax = x
                elif x > 365:
                    solid_rh += 1
                    if y < rh_ymin: rh_ymin = y
                    if y > rh_ymax: rh_ymax = y
                    if x < rh_xmin: rh_xmin = x
                    if x > rh_xmax: rh_xmax = x
                    
    print(f"Original image size: {width}x{height}")
    print(f"Left Hand solid pixels: {solid_lh}")
    if solid_lh > 0:
        print(f"True Left Hand box: [{lh_xmin}, {lh_ymin}, {lh_xmax}, {lh_ymax}] (width {lh_xmax-lh_xmin+1}, height {lh_ymax-lh_ymin+1})")
    print(f"Right Hand solid pixels: {solid_rh}")
    if solid_rh > 0:
        print(f"True Right Hand box: [{rh_xmin}, {rh_ymin}, {rh_xmax}, {rh_ymax}] (width {rh_xmax-rh_xmin+1}, height {rh_ymax-rh_ymin+1})")
else:
    print("File not found")

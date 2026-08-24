import os
from PIL import Image

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"
img_path = os.path.join(folder, "信信-01.png")

if os.path.exists(img_path):
    img = Image.open(img_path).convert("RGBA")
    width, height = img.size
    pixels = img.load()
    
    # We want to find the bounding box of non-transparent, non-white pixels
    # in the eyes horizontal strips (450 <= y < 600)
    # Left eye (x < 380)
    solid_le = 0
    le_ymin, le_ymax = height, 0
    le_xmin, le_xmax = width, 0
    
    # Right eye (x > 380)
    solid_re = 0
    re_ymin, re_ymax = height, 0
    re_xmin, re_xmax = width, 0
    
    # We only look for the black/colored part of the eyes, wait, or let's look for anything non-skin-tone and non-white
    # Actually, let's look for dark pixels or just see where they are
    # The eyes are black/brown circles
    for y in range(450, 600):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if a > 10 and not (r >= 240 and g >= 240 and b >= 240):
                # The skin tone is approx (246, 225, 199)
                is_skin = (abs(r - 246) <= 15 and abs(g - 225) <= 15 and abs(b - 199) <= 15)
                if not is_skin:
                    if x < 380:
                        solid_le += 1
                        if y < le_ymin: le_ymin = y
                        if y > le_ymax: le_ymax = y
                        if x < le_xmin: le_xmin = x
                        if x > le_xmax: le_xmax = x
                    else:
                        solid_re += 1
                        if y < re_ymin: re_ymin = y
                        if y > re_ymax: re_ymax = y
                        if x < re_xmin: re_xmin = x
                        if x > re_xmax: re_xmax = x
                        
    print(f"Original image size: {width}x{height}")
    print(f"Left Eye solid pixels: {solid_le}")
    if solid_le > 0:
        print(f"True Left Eye box: [{le_xmin}, {le_ymin}, {le_xmax}, {le_ymax}] (width {le_xmax-le_xmin+1}, height {le_ymax-le_ymin+1})")
    print(f"Right Eye solid pixels: {solid_re}")
    if solid_re > 0:
        print(f"True Right Eye box: [{re_xmin}, {re_ymin}, {re_xmax}, {re_ymax}] (width {re_xmax-re_xmin+1}, height {re_ymax-re_ymin+1})")
else:
    print("File not found")

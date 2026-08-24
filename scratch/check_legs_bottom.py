import os
from PIL import Image

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"
img_path = os.path.join(folder, "信信-01.png")

if os.path.exists(img_path):
    img = Image.open(img_path).convert("RGBA")
    width, height = img.size
    pixels = img.load()
    
    # Let's see if there are any non-transparent and non-white pixels below y = 930
    solid_below_930 = 0
    y_min = height
    y_max = 0
    x_min = width
    x_max = 0
    
    for y in range(930, height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            # If not transparent and not white background
            if a > 10 and not (r >= 240 and g >= 240 and b >= 240):
                solid_below_930 += 1
                if y < y_min: y_min = y
                if y > y_max: y_max = y
                if x < x_min: x_min = x
                if x > x_max: x_max = x
                
    print(f"Original image size: {width}x{height}")
    print(f"Solid mascot pixels below y = 930: {solid_below_930}")
    if solid_below_930 > 0:
        print(f"Bounding box of solid mascot pixels below y = 930: [{x_min}, {y_min}, {x_max}, {y_max}] (width {x_max-x_min+1}, height {y_max-y_min+1})")
else:
    print("File not found")

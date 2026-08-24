import os
import sys
from PIL import Image

workspace_dir = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker"
folder = os.path.join(workspace_dir, "public", "學校圖檔", "吉祥物")
img_path = os.path.join(folder, "信信-01.png")

if not os.path.exists(img_path):
    print("信信-01.png not found")
    sys.exit(1)

with Image.open(img_path) as img:
    img = img.convert("RGBA")
    width, height = img.size
    print(f"Original image size: {width}x{height}")
    
    # Let's inspect the left hand box: [81, 600, 400, 800]
    box_l = [81, 600, 400, 800]
    cropped_l = img.crop(box_l)
    
    # Find all skin-colored pixels in this box
    skin_pixels = []
    for y in range(cropped_l.height):
        for x in range(cropped_l.width):
            r, g, b, a = cropped_l.getpixel((x, y))
            # skin-tone is around (246, 225, 199)
            if abs(r - 246) < 20 and abs(g - 225) < 20 and abs(b - 199) < 20 and a > 0:
                skin_pixels.append((x, y))
                
    print(f"Total skin pixels in left box: {len(skin_pixels)}")
    
    # Face ellipse parameters
    xc, yc, a_rad, b_rad = 355, 536, 199, 174
    
    # See how many skin pixels are inside/outside the face ellipse
    inside_count = 0
    outside_count = 0
    for x, y in skin_pixels:
        abs_x = box_l[0] + x
        abs_y = box_l[1] + y
        val = ((abs_x - xc) / a_rad)**2 + ((abs_y - yc) / b_rad)**2
        if val <= 1.0:
            inside_count += 1
        else:
            outside_count += 1
            
    print(f"Inside face ellipse: {inside_count}")
    print(f"Outside face ellipse: {outside_count}")

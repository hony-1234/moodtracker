import os
import sys
from PIL import Image

workspace_dir = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker"
folder = os.path.join(workspace_dir, "public", "學校圖檔", "吉祥物")
img_path = os.path.join(folder, "信信-01.png")

with Image.open(img_path) as img:
    img = img.convert("RGBA")
    box_l = [81, 600, 400, 800]
    cropped_l = img.crop(box_l)
    pix_l = cropped_l.load()
    
    # Face ellipse parameters: xc=355, yc=536, a_rad=199, b_rad=174
    xc, yc, a_rad, b_rad = 355, 536, 199, 174
    
    inside_orange = 0
    outside_orange = 0
    for y in range(cropped_l.height):
        for x in range(cropped_l.width):
            r, g, b, a = pix_l[x, y]
            is_orange = (180 <= r <= 245 and 110 <= g <= 175 and 40 <= b <= 105) and a > 0
            if is_orange:
                abs_x = box_l[0] + x
                abs_y = box_l[1] + y
                val = ((abs_x - xc) / a_rad)**2 + ((abs_y - yc) / b_rad)**2
                if val <= 1.0:
                    inside_orange += 1
                else:
                    outside_orange += 1
                    
    print(f"Inside face ellipse orange: {inside_orange}")
    print(f"Outside face ellipse orange: {outside_orange}")

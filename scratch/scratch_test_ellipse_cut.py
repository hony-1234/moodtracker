import os
import sys
import math
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

workspace_dir = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker"
folder = os.path.join(workspace_dir, "public", "學校圖檔", "吉祥物")
img_path = os.path.join(folder, "信信-01.png")
artifacts_dir = r"C:\Users\Jerry\.gemini\antigravity\brain\0198b957-90fd-47d6-8e0b-d00b1216d601"

with Image.open(img_path) as img:
    img = img.convert("RGBA")
    w, h = img.size
    pixels = img.load()
    
    # Ellipse parameters
    xc, yc, a_rad, b_rad = 355, 536, 199, 174
    
    # Left hand box [81, 600, 400, 800]
    box_l = [81, 600, 400, 800]
    crop_l = Image.new("RGBA", (box_l[2]-box_l[0], box_l[3]-box_l[1]), (0,0,0,0))
    cl_pix = crop_l.load()
    
    for y in range(box_l[1], box_l[3]):
        for x in range(box_l[0], box_l[2]):
            r, g, b, a = pixels[x, y]
            if a == 0:
                continue
            # Calculate distance to face ellipse
            val = ((x - xc) / a_rad) ** 2 + ((y - yc) / b_rad) ** 2
            
            # If outside face ellipse, it is hand/arm
            if val > 1.0:
                is_red_heart = (r > 140 and g < 100 and b < 100) and (x > 220) # exclude floating red heart on face
                if not is_red_heart:
                    cl_pix[x - box_l[0], y - box_l[1]] = (r, g, b, a)
                    
    out_path_l = os.path.join(artifacts_dir, "left_arm_ellipse_cut.png")
    crop_l.save(out_path_l, "PNG")
    print(f"Saved Left Arm Ellipse Cut: {out_path_l}")
    
    # Right hand box [340, 600, 631, 800]
    box_r = [340, 600, 631, 800]
    crop_r = Image.new("RGBA", (box_r[2]-box_r[0], box_r[3]-box_r[1]), (0,0,0,0))
    cr_pix = crop_r.load()
    
    for y in range(box_r[1], box_r[3]):
        for x in range(box_r[0], box_r[2]):
            r, g, b, a = pixels[x, y]
            if a == 0:
                continue
            val = ((x - xc) / a_rad) ** 2 + ((y - yc) / b_rad) ** 2
            
            if val > 1.0:
                is_red_heart = (r > 140 and g < 100 and b < 100) and (x < 480) # exclude floating red heart on face
                if not is_red_heart:
                    cr_pix[x - box_r[0], y - box_r[1]] = (r, g, b, a)
                    
    out_path_r = os.path.join(artifacts_dir, "right_arm_ellipse_cut.png")
    crop_r.save(out_path_r, "PNG")
    print(f"Saved Right Arm Ellipse Cut: {out_path_r}")

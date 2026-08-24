import os
import sys
import math
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

workspace_dir = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker"
folder = os.path.join(workspace_dir, "public", "學校圖檔", "吉祥物")
img_path = os.path.join(folder, "信信-01.png")

xc, yc, a_rad, b_rad = 355, 536, 199, 174 # Face ellipse parameters

with Image.open(img_path) as img:
    img = img.convert("RGBA")
    width, height = img.size
    pixels = img.load()
    
    # Let's inspect Left Hand Box [81, 600, 400, 800]
    box_l = [81, 600, 400, 800]
    lw = box_l[2] - box_l[0]
    lh = box_l[3] - box_l[1]
    
    print("Left hand skin pixels inspection:")
    for y in range(lh):
        abs_y = box_l[1] + y
        for x in range(lw):
            abs_x = box_l[0] + x
            r, g, b, a = pixels[abs_x, abs_y]
            if a > 0:
                is_skin = (abs(r - 246) < 20 and abs(g - 225) < 20 and abs(b - 199) < 20)
                if is_skin:
                    val = ((abs_x - xc) / a_rad) ** 2 + ((abs_y - yc) / b_rad) ** 2
                    # Print some representative pixels to understand their position relative to the face ellipse
                    if x % 20 == 0 and y % 20 == 0:
                        print(f"  Local ({x}, {y}) | Abs ({abs_x}, {abs_y}) | Color: ({r},{g},{b}) | Ellipse Val: {val:.4f}")

    print("\nRight hand skin pixels inspection [340, 600, 631, 800]:")
    box_r = [340, 600, 631, 800]
    rw = box_r[2] - box_r[0]
    rh = box_r[3] - box_r[1]
    for y in range(rh):
        abs_y = box_r[1] + y
        for x in range(rw):
            abs_x = box_r[0] + x
            r, g, b, a = pixels[abs_x, abs_y]
            if a > 0:
                is_skin = (abs(r - 246) < 20 and abs(g - 225) < 20 and abs(b - 199) < 20)
                if is_skin:
                    val = ((abs_x - xc) / a_rad) ** 2 + ((abs_y - yc) / b_rad) ** 2
                    if x % 20 == 0 and y % 20 == 0:
                        print(f"  Local ({x}, {y}) | Abs ({abs_x}, {abs_y}) | Color: ({r},{g},{b}) | Ellipse Val: {val:.4f}")

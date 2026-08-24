import os
from PIL import Image

workspace_dir = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker"
folder = os.path.join(workspace_dir, "public", "學校圖檔", "吉祥物")
img_path = os.path.join(folder, "信信-01.png")

with Image.open(img_path) as img:
    img = img.convert("RGBA")
    
    # Left hand crop box [81, 600, 400, 800]
    box_l = [81, 600, 400, 800]
    left_cropped = img.crop(box_l)
    lw, lh = left_cropped.size
    left_pix = left_cropped.load()
    
    print("=== Left Hand Crop Box Red Pixels x_abs Distribution ===")
    red_by_x_l = {}
    for y in range(lh):
        for x in range(lw):
            r, g, b, a = left_pix[x, y]
            if a > 0 and r > 130 and g < 130 and b < 130:
                x_abs = x + box_l[0]
                red_by_x_l[x_abs] = red_by_x_l.get(x_abs, 0) + 1
                
    sorted_xs_l = sorted(red_by_x_l.keys())
    print(f"Red pixels x_abs range: {sorted_xs_l[0]} to {sorted_xs_l[-1]}")
    # Let's see if there is a gap or a clear division
    for x_abs in range(sorted_xs_l[0], sorted_xs_l[-1]+1, 10):
        sum_pixels = sum(red_by_x_l.get(xx, 0) for xx in range(x_abs, x_abs+10))
        print(f"  x_abs [{x_abs:3} - {x_abs+9:3}]: {sum_pixels:4} red pixels")

    # Right hand crop box [340, 600, 631, 800]
    box_r = [340, 600, 631, 800]
    right_cropped = img.crop(box_r)
    rw, rh = right_cropped.size
    right_pix = right_cropped.load()
    
    print("\n=== Right Hand Crop Box Red Pixels x_abs Distribution ===")
    red_by_x_r = {}
    for y in range(rh):
        for x in range(rw):
            r, g, b, a = right_pix[x, y]
            if a > 0 and r > 130 and g < 130 and b < 130:
                x_abs = x + box_r[0]
                red_by_x_r[x_abs] = red_by_x_r.get(x_abs, 0) + 1
                
    sorted_xs_r = sorted(red_by_x_r.keys())
    print(f"Red pixels x_abs range: {sorted_xs_r[0]} to {sorted_xs_r[-1]}")
    for x_abs in range(sorted_xs_r[0], sorted_xs_r[-1]+1, 10):
        sum_pixels = sum(red_by_x_r.get(xx, 0) for xx in range(x_abs, x_abs+10))
        print(f"  x_abs [{x_abs:3} - {x_abs+9:3}]: {sum_pixels:4} red pixels")

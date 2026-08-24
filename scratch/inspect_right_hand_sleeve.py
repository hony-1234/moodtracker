import os
from PIL import Image

workspace_dir = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker"
folder = os.path.join(workspace_dir, "public", "學校圖檔", "吉祥物")
img_path = os.path.join(folder, "信信-01.png")

with Image.open(img_path) as img:
    img = img.convert("RGBA")
    width, height = img.size
    pixels = img.load()

    # Left Hand Box
    box_l = [81, 600, 400, 800]
    lw, lh = box_l[2] - box_l[0], box_l[3] - box_l[1]
    print("=== Left Hand Box Red Pixels (y >= 60) ===")
    xs_red_l = []
    ys_red_l = []
    for y in range(60, lh):
        for x in range(lw):
            r, g, b, a = pixels[box_l[0] + x, box_l[1] + y]
            if a > 0 and r > 150 and g < 100 and b < 100:
                xs_red_l.append(x)
                ys_red_l.append(y)
    if xs_red_l:
        print(f"Red x-range: [{min(xs_red_l)}, {max(xs_red_l)}], y-range: [{min(ys_red_l)}, {max(ys_red_l)}]")
    else:
        print("No red pixels found in y >= 60!")

    # Right Hand Box
    box_r = [340, 600, 631, 800]
    rw, rh = box_r[2] - box_r[0], box_r[3] - box_r[1]
    print("\n=== Right Hand Box Red Pixels (y >= 68) ===")
    xs_red_r = []
    ys_red_r = []
    for y in range(68, rh):
        for x in range(rw):
            r, g, b, a = pixels[box_r[0] + x, box_r[1] + y]
            if a > 0 and r > 150 and g < 100 and b < 100:
                xs_red_r.append(x)
                ys_red_r.append(y)
    if xs_red_r:
        print(f"Red x-range: [{min(xs_red_r)}, {max(xs_red_r)}], y-range: [{min(ys_red_r)}, {max(ys_red_r)}]")
    else:
        print("No red pixels found in y >= 68!")

import os
from PIL import Image

workspace_dir = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker"
folder = os.path.join(workspace_dir, "public", "學校圖檔", "吉祥物")

files_to_check = ["xinxin_left_leg_v7.png", "xinxin_right_leg_v7.png", "xinxin_body_base_v8.png"]

for fname in files_to_check:
    fpath = os.path.join(folder, fname)
    if not os.path.exists(fpath):
        print(f"{fname} not found!")
        continue
    with Image.open(fpath) as img:
        img = img.convert("RGBA")
        width, height = img.size
        # Let's inspect the bottom 10% of the image for opaque/semi-opaque pixels
        # especially dark ones (low RGB values)
        dark_pixels_count = 0
        for y in range(int(height * 0.9), height):
            for x in range(width):
                r, g, b, a = img.getpixel((x, y))
                if a > 0:
                    # Let's see if it's dark
                    if r < 150 and g < 150 and b < 150:
                        dark_pixels_count += 1
        print(f"{fname}: size {width}x{height}, dark pixels in bottom 10%: {dark_pixels_count}")

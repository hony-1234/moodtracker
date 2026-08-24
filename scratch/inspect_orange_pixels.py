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
    
    count_orange = 0
    for y in range(cropped_l.height):
        for x in range(cropped_l.width):
            r, g, b, a = pix_l[x, y]
            is_orange = (180 <= r <= 245 and 110 <= g <= 175 and 40 <= b <= 105) and a > 0
            if is_orange:
                count_orange += 1
                
    print(f"Total orange pixels in left hand box: {count_orange}")

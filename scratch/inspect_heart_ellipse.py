import os
import sys
from PIL import Image

workspace_dir = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker"
folder = os.path.join(workspace_dir, "public", "學校圖檔", "吉祥物")
img_path = os.path.join(folder, "信信-01.png")

with Image.open(img_path) as img:
    img = img.convert("RGBA")
    width, height = img.size
    pixels = img.load()
    
    # Face ellipse parameters: xc=355, yc=536, a_rad=199, b_rad=174
    xc, yc, a_rad, b_rad = 355, 536, 199, 174
    
    # Left cheek heart bounding box is [87, 589, 177, 677]
    inside_left = 0
    outside_left = 0
    for y in range(589, 678):
        for x in range(87, 178):
            r, g, b, a = pixels[x, y]
            if r > 120 and g < 100 and b < 100 and a > 0:
                val = ((x - xc) / a_rad)**2 + ((y - yc) / b_rad)**2
                if val <= 1.0:
                    inside_left += 1
                else:
                    outside_left += 1
                    
    print(f"Left cheek heart (red pixels): inside={inside_left}, outside={outside_left}")
    
    # Right cheek heart bounding box is [487, 536, 583, 643]
    inside_right = 0
    outside_right = 0
    for y in range(536, 644):
        for x in range(487, 584):
            r, g, b, a = pixels[x, y]
            if r > 120 and g < 100 and b < 100 and a > 0:
                val = ((x - xc) / a_rad)**2 + ((y - yc) / b_rad)**2
                if val <= 1.0:
                    inside_right += 1
                else:
                    outside_right += 1
                    
    print(f"Right cheek heart (red pixels): inside={inside_right}, outside={outside_right}")

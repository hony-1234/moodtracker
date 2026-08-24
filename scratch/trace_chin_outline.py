import os
import sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"
img_path = os.path.join(folder, "信信-01.png")

with Image.open(img_path) as img:
    img = img.convert("RGBA")
    width, height = img.size
    pixels = img.load()
    
    # Let's search for outline pixels in x = 200 to 530, y = 600 to 720
    # Outline is r < 90, g < 70, b < 50
    print("--- Searching for Outline Pixels around Chin and Neck ---")
    for y in range(600, 720, 5):
        row_outlines = []
        for x in range(200, 530):
            r, g, b, a = pixels[x, y]
            if r < 90 and g < 70 and b < 50 and a > 0:
                row_outlines.append(x)
        if row_outlines:
            # Group contiguous outlines
            groups = []
            if len(row_outlines) > 0:
                curr = [row_outlines[0]]
                for val in row_outlines[1:]:
                    if val == curr[-1] + 1:
                        curr.append(val)
                    else:
                        groups.append(curr)
                        curr = [val]
                groups.append(curr)
                
            groups_str = ", ".join([f"{g[0]}..{g[-1]}" for g in groups])
            print(f"y={y:3} | Outlines at x: {groups_str}")

import os
import sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"
img_path = os.path.join(folder, "信信-01.png")

if os.path.exists(img_path):
    img = Image.open(img_path).convert("RGBA")
    width, height = img.size
    pixels = img.load()
    
    # Inspect rows 820 to 860
    print("Row Analysis in original image for Y in [820, 860]:")
    for y in range(820, 861):
        # count different types of colors in this row
        non_white_non_trans = 0
        skin_count = 0
        red_count = 0
        yellow_count = 0
        outline_count = 0
        other_count = 0
        
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if a > 10 and not (r >= 240 and g >= 240 and b >= 240):
                non_white_non_trans += 1
                
                # skin tone
                if (r > 180 and g > 150 and b > 100):
                    skin_count += 1
                # outline
                elif (r < 100 and g < 100 and b < 100):
                    outline_count += 1
                # red dress
                elif (r > 120 and g < 80 and b < 80):
                    red_count += 1
                # yellow trim (usually high R and G, lower B)
                elif (r > 200 and g > 180 and b < 100):
                    yellow_count += 1
                else:
                    other_count += 1
                    
        if non_white_non_trans > 0:
            print(f"Y: {y:3d} | Solid Pixels: {non_white_non_trans:3d} | Skin: {skin_count:3d} | Outline: {outline_count:3d} | Red: {red_count:3d} | Yellow: {yellow_count:3d} | Other: {other_count:3d}")
else:
    print("Original file not found")

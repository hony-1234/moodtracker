import os
from PIL import Image

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"
orig_path = os.path.join(folder, "信信-01.png")

if os.path.exists(orig_path):
    with Image.open(orig_path) as img:
        img_rgba = img.convert("RGBA")
        # box_left_hand = [220, 640, 345, 770]
        lh_crop = img_rgba.crop((220, 640, 345, 770))
        
        # Let's inspect the corner colors of this cropped region
        corners = [
            lh_crop.getpixel((0, 0)),
            lh_crop.getpixel((lh_crop.width - 1, 0)),
            lh_crop.getpixel((0, lh_crop.height - 1)),
            lh_crop.getpixel((lh_crop.width - 1, lh_crop.height - 1))
        ]
        print("Left hand crop corner colors in original image:")
        print(f"  Top-Left: {corners[0]}")
        print(f"  Top-Right: {corners[1]}")
        print(f"  Bottom-Left: {corners[2]}")
        print(f"  Bottom-Right: {corners[3]}")
        
        # Let's count some border pixels colors
        border_colors = []
        for x in range(lh_crop.width):
            border_colors.append(lh_crop.getpixel((x, 0)))
            border_colors.append(lh_crop.getpixel((x, lh_crop.height - 1)))
        for y in range(lh_crop.height):
            border_colors.append(lh_crop.getpixel((0, y)))
            border_colors.append(lh_crop.getpixel((lh_crop.width - 1, y)))
            
        from collections import Counter
        print("\nCommon border colors in left hand crop:")
        for color, count in Counter(border_colors).most_common(5):
            print(f"  Color: {color} | Count: {count}")
else:
    print("Original file not found")

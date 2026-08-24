import os
import sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"
img_path = os.path.join(folder, "信信-01.png")

if os.path.exists(img_path):
    with Image.open(img_path) as img:
        img = img.convert("RGBA")
        w, h = img.size
        pixels = img.load()
        
        # For each row from y = 600 to 800, let's find the range of x where the torso/dress is.
        # How do we distinguish the torso/dress from the arms?
        # The dress is red (R > 130, G < 80, B < 80).
        # The skin is (R > 200, G > 160, B > 120).
        # The arms are on the left (x < 220) and right (x > 510).
        # Let's print out the leftmost and rightmost red/skin pixels in the central region [200, 530]
        print("Central Torso/Dress boundaries (y = 600 to 800):")
        for y in range(600, 801, 10):
            left_edge = None
            right_edge = None
            for x in range(200, 530):
                r, g, b, a = pixels[x, y]
                # Check if it is a mascot pixel (non-transparent and not white)
                if a > 10 and not (r > 240 and g > 240 and b > 240):
                    if left_edge is None:
                        left_edge = x
                    right_edge = x
            if left_edge is not None:
                # Print the colors at left, middle, right of this central row
                mid = (left_edge + right_edge) // 2
                print(f"  y={y:3} | Torso X range: [{left_edge:3} to {right_edge:3}] | Width: {right_edge-left_edge:3} | Mid: {mid}")
else:
    print("Not found")

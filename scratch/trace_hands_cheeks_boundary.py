import os
import sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"
img_path = os.path.join(folder, "信信-01.png")

if not os.path.exists(img_path):
    print("信信-01.png not found!")
    sys.exit(1)

with Image.open(img_path) as img:
    img = img.convert("RGBA")
    width, height = img.size
    pixels = img.load()
    
    # Let's inspect rows around the cheeks/face bottom: y = 600 to 700
    # Let's see where the skin tone (F6E1C7) and outline pixels are
    # Skin tone is approx (246, 225, 199)
    # Outline is approx (53, 32, 7)
    
    print("--- Left Hand Area: x = 180 to 260, y = 600 to 700 ---")
    for y in range(600, 700, 10):
        row_str = []
        for x in range(160, 280, 2):
            r, g, b, a = pixels[x, y]
            is_white = (r > 240 and g > 240 and b > 240)
            is_skin = (abs(r - 246) < 20 and abs(g - 225) < 20 and abs(b - 199) < 20)
            is_outline = (r < 90 and g < 70 and b < 50)
            is_red = (r > 150 and g < 100 and b < 100)
            
            if is_white:
                char = "."
            elif is_outline:
                char = "#"
            elif is_skin:
                char = "S"
            elif is_red:
                char = "R"
            else:
                char = "?"
            row_str.append(char)
        print(f"y={y:3}: {''.join(row_str)}  (x=160 to 280)")

    print("\n--- Right Hand Area: x = 460 to 560, y = 600 to 700 ---")
    for y in range(600, 700, 10):
        row_str = []
        for x in range(450, 570, 2):
            r, g, b, a = pixels[x, y]
            is_white = (r > 240 and g > 240 and b > 240)
            is_skin = (abs(r - 246) < 20 and abs(g - 225) < 20 and abs(b - 199) < 20)
            is_outline = (r < 90 and g < 70 and b < 50)
            is_red = (r > 150 and g < 100 and b < 100)
            
            if is_white:
                char = "."
            elif is_outline:
                char = "#"
            elif is_skin:
                char = "S"
            elif is_red:
                char = "R"
            else:
                char = "?"
            row_str.append(char)
        print(f"y={y:3}: {''.join(row_str)}  (x=450 to 570)")

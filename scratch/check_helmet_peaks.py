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
        
        # The helmet is brown/orange. Let's look at the color of the helmet.
        # It's brick/brown color, roughly (184, 115, 51) or similar.
        # Let's search for non-transparent pixels in the columns of the helmet from y = 0 to y = 250
        # and see where the helmet actually begins.
        # The helmet has castellations (peaks). Let's print out the min y for each column x in the range [200, 550]
        # where the pixel is part of the helmet (e.g., not the orange/red flame).
        # Flame colors are bright orange/red/yellow, e.g. R > 200, G in [100, 200], B < 100.
        # Helmet is brown/tan.
        # Let's just find the first non-transparent pixel in each column from x=200 to x=550.
        print("First non-transparent pixel in columns x=200 to x=550:")
        min_ys = {}
        for x in range(200, 550, 10):
            for y in range(h):
                r, g, b, a = pixels[x, y]
                if a > 0:
                    min_ys[x] = (y, (r, g, b, a))
                    break
        for x, (y, color) in sorted(min_ys.items()):
            print(f"  x={x:3} | First non-trans y={y:3} | RGBA={color}")
else:
    print("信信-01.png not found!")

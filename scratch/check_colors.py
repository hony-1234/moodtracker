import os
import sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"
legs_path = os.path.join(folder, "xinxin_legs_v4.png")

if os.path.exists(legs_path):
    with Image.open(legs_path) as img:
        img = img.convert("RGBA")
        w, h = img.size
        pixels = img.load()
        
        # Let's find unique colors in the legs image where alpha > 0
        colors = {}
        for y in range(h):
            for x in range(w):
                r, g, b, a = pixels[x, y]
                if a > 0:
                    color = (r, g, b)
                    colors[color] = colors.get(color, 0) + 1
                    
        # Sort by frequency
        sorted_colors = sorted(colors.items(), key=lambda item: item[1], reverse=True)
        print("Top 30 colors in legs image:")
        for color, count in sorted_colors[:30]:
            print(f"  Color: {color} | Count: {count}")
else:
    print("xinxin_legs_v4.png not found!")

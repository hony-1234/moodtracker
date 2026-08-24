import os
import sys
from PIL import Image
from collections import Counter

sys.stdout.reconfigure(encoding='utf-8')

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"
img_path = os.path.join(folder, "信信-01.png")

if os.path.exists(img_path):
    img = Image.open(img_path).convert("RGBA")
    pixels = img.load()
    
    # Analyze region of legs: x: 218 to 509, y: 800 to 955
    colors = []
    for y in range(800, 956):
        for x in range(218, 510):
            r, g, b, a = pixels[x, y]
            if a > 10 and not (r >= 240 and g >= 240 and b >= 240):
                colors.append((r, g, b))
                
    print("Most common colors in legs region:")
    for col, count in Counter(colors).most_common(50):
        # Let's see if our previous process_v5_transparent would keep it:
        r, g, b = col
        is_skin = (r > 180 and g > 150 and b > 100)
        is_outline = (r < 100 and g < 100 and b < 100)
        is_shadow = (175 <= r <= 215 and 155 <= g <= 195 and 125 <= b <= 165)
        kept = is_skin or is_outline or is_shadow
        status = "KEPT" if kept else "DELETED"
        print(f"  Color {str(col):15} | Count: {count:4d} | Status: {status}")
else:
    print("Not found")

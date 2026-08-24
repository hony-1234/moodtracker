import os
from PIL import Image

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"
img_path = os.path.join(folder, "信信-01.png")

with Image.open(img_path) as img:
    img = img.convert("RGBA")
    
    colors = {}
    for y in range(740, 800):
        for x in range(350, 380):
            r, g, b, a = img.getpixel((x, y))
            if a > 0:
                is_red = (r > 150 and g < 100 and b < 100)
                is_black = (r < 60 and g < 60 and b < 60)
                if not is_red and not is_black:
                    color = (r, g, b)
                    colors[color] = colors.get(color, 0) + 1
                    
    sorted_colors = sorted(colors.items(), key=lambda x: x[1], reverse=True)
    print("Top colors in central dress region:")
    for col, count in sorted_colors[:15]:
        print(f"Color: {col}, Count: {count}")

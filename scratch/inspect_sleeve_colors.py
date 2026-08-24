import os
from PIL import Image

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"
img_path = os.path.join(folder, "信信-01.png")

with Image.open(img_path) as img:
    img = img.convert("RGBA")
    
    # Let's inspect left box around the hand/sleeve area
    # Hand is at component 1: x_abs = 247 to 299, y_abs = 660 to 749.
    # Sleeve is to the right of the hand skin. Let's sample colors there!
    colors = {}
    for y in range(680, 760):
        for x in range(260, 320):
            r, g, b, a = img.getpixel((x, y))
            if a > 0:
                # exclude skin, red, black outlines
                is_skin = (abs(r - 246) < 20 and abs(g - 225) < 20 and abs(b - 199) < 20)
                is_red = (r > 150 and g < 100 and b < 100)
                is_black = (r < 60 and g < 60 and b < 60)
                if not is_skin and not is_red and not is_black:
                    color = (r, g, b)
                    colors[color] = colors.get(color, 0) + 1
                    
    # Print top 10 colors
    sorted_colors = sorted(colors.items(), key=lambda x: x[1], reverse=True)
    print("Top colors in left sleeve region:")
    for col, count in sorted_colors[:15]:
        print(f"Color: {col}, Count: {count}")

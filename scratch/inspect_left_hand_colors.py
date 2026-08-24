import os
from PIL import Image

workspace_dir = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker"
folder = os.path.join(workspace_dir, "public", "學校圖檔", "吉祥物")
p = os.path.join(folder, "xinxin_left_hand_v6.png")

with Image.open(p) as img:
    img = img.convert("RGBA")
    w, h = img.size
    pixels = img.load()
    
    colors = {}
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if a > 0:
                # Classify color
                is_red = (r > 130 and g < 110 and b < 110)
                is_skin = (abs(r - 246) < 20 and abs(g - 225) < 20 and abs(b - 199) < 20)
                is_orange = (180 <= r <= 245 and 110 <= g <= 175 and 40 <= b <= 105)
                
                label = "other"
                if is_red:
                    label = "red"
                elif is_skin:
                    label = "skin"
                elif is_orange:
                    label = "orange"
                    
                colors[label] = colors.get(label, 0) + 1
                
    print("Color composition in xinxin_left_hand_v6.png:")
    for label, count in colors.items():
        print(f"  {label}: {count} pixels")

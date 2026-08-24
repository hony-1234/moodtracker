import os
from PIL import Image

workspace_dir = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker"
folder = os.path.join(workspace_dir, "public", "學校圖檔", "吉祥物")

for hand_name in ["xinxin_left_hand_v6.png", "xinxin_right_hand_v6.png"]:
    p = os.path.join(folder, hand_name)
    if not os.path.exists(p):
        print(f"{hand_name} not found")
        continue
    with Image.open(p) as img:
        img_rgba = img.convert("RGBA")
        pixels = img_rgba.load()
        w, h = img_rgba.size
        
        # Find non-transparent bounding box
        min_x, max_x = w, 0
        min_y, max_y = h, 0
        count = 0
        
        for y in range(h):
            for x in range(w):
                _, _, _, a = pixels[x, y]
                if a > 0:
                    min_x = min(min_x, x)
                    max_x = max(max_x, x)
                    min_y = min(min_y, y)
                    max_y = max(max_y, y)
                    count += 1
                    
        print(f"{hand_name}: non-transparent pixels={count}, bounding box in crop=[{min_x}, {min_y}, {max_x}, {max_y}]")

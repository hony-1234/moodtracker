import os
from PIL import Image

workspace_dir = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker"
folder = os.path.join(workspace_dir, "public", "學校圖檔", "吉祥物")

left_hand_path = os.path.join(folder, "xinxin_left_hand_v5.png")
right_hand_path = os.path.join(folder, "xinxin_right_hand_v5.png")

for hand_name, path in [("Left Hand Layer", left_hand_path), ("Right Hand Layer", right_hand_path)]:
    if not os.path.exists(path):
        continue
    with Image.open(path) as img:
        img = img.convert("RGBA")
        width, height = img.size
        pixels = img.load()
        
        print(f"\n=== {hand_name} (y < 120) ===")
        # Count pixels by color group in y < 120
        red_cnt = 0
        skin_cnt = 0
        outline_cnt = 0
        other_cnt = 0
        
        for y in range(120):
            for x in range(width):
                r, g, b, a = pixels[x, y]
                if a > 0:
                    is_red = (r > 150 and g < 100 and b < 100)
                    is_skin = (abs(r - 246) < 20 and abs(g - 225) < 20 and abs(b - 199) < 20)
                    is_outline = (r < 90 and g < 70 and b < 50)
                    
                    if is_red:
                        red_cnt += 1
                    elif is_skin:
                        skin_cnt += 1
                    elif is_outline:
                        outline_cnt += 1
                    else:
                        other_cnt += 1
                        
        print(f"  Red pixels (sleeve): {red_cnt}")
        print(f"  Skin pixels (cheek/hand): {skin_cnt}")
        print(f"  Outline pixels: {outline_cnt}")
        print(f"  Other pixels: {other_cnt}")
        
        # Let's find the y range of each category
        for cat_name, cat_func in [
            ("Red", lambda r,g,b: r > 150 and g < 100 and b < 100),
            ("Skin", lambda r,g,b: abs(r - 246) < 20 and abs(g - 225) < 20 and abs(b - 199) < 20),
            ("Outline", lambda r,g,b: r < 90 and g < 70 and b < 50)
        ]:
            ys = []
            for y in range(height):
                for x in range(width):
                    r, g, b, a = pixels[x, y]
                    if a > 0 and cat_func(r, g, b):
                        ys.append(y)
            if ys:
                print(f"  {cat_name} category global y-range: [{min(ys)}, {max(ys)}]")
            else:
                print(f"  {cat_name} category global y-range: None")

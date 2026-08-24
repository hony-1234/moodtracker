import os
from PIL import Image

workspace_dir = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker"
folder = os.path.join(workspace_dir, "public", "學校圖檔", "吉祥物")
p = os.path.join(folder, "xinxin_right_hand_v6.png")

with Image.open(p) as img:
    img = img.convert("RGBA")
    w, h = img.size
    pixels = img.load()
    
    print("Non-transparent pixels in right hand layer at y < 30:")
    found_count = 0
    for y in range(30):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if a > 0:
                print(f"  x={x}, y={y} (abs_x={x+340}, abs_y={y+600}) | Color: R={r}, G={g}, B={b}, A={a}")
                found_count += 1
                if found_count > 50:
                    print("... truncated after 50 pixels ...")
                    break
        if found_count > 50:
            break
    print(f"Total non-transparent pixels at y < 30: {found_count}")

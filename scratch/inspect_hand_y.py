import os
from PIL import Image

workspace_dir = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker"
folder = os.path.join(workspace_dir, "public", "學校圖檔", "吉祥物")
path = os.path.join(folder, "xinxin_right_hand_v6.png")

with Image.open(path) as img:
    img = img.convert("RGBA")
    pixels = img.load()
    w, h = img.size
    
    print("Non-transparent pixels in right hand layer at y < 60:")
    for y in range(0, 60, 5):
        line_pixels = []
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if a > 0:
                line_pixels.append((x, r, g, b, a))
        if line_pixels:
            print(f"y={y:2} (absolute y={600+y}): count={len(line_pixels)} | first few: {line_pixels[:3]}")

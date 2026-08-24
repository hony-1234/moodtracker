import os
from PIL import Image

workspace_dir = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker"
folder = os.path.join(workspace_dir, "public", "學校圖檔", "吉祥物")

left_hand_path = os.path.join(folder, "xinxin_left_hand_v6.png")
right_hand_path = os.path.join(folder, "xinxin_right_hand_v6.png")

for name, path in [("Left Hand", left_hand_path), ("Right Hand", right_hand_path)]:
    if os.path.exists(path):
        img = Image.open(path)
        img_rgba = img.convert("RGBA")
        w, h = img_rgba.size
        pixels = img_rgba.load()
        
        # Count non-transparent pixels in top half vs bottom half
        top_count = 0
        bottom_count = 0
        for y in range(h):
            for x in range(w):
                if pixels[x, y][3] > 0:
                    if y < h / 2:
                        top_count += 1
                    else:
                        bottom_count += 1
                        
        print(f"{name}: size={w}x{h}, top_half_pixels={top_count}, bottom_half_pixels={bottom_count}")
    else:
        print(f"{name} does not exist at {path}!")

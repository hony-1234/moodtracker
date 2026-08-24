import os
from PIL import Image

workspace_dir = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker"
folder = os.path.join(workspace_dir, "public", "學校圖檔", "吉祥物")
img_path = os.path.join(folder, "信信-01.png")

with Image.open(img_path) as img:
    img = img.convert("RGBA")
    pixels = img.load()
    
    # Left arm region: box_left_hand = [81, 600, 400, 800]
    print("Left hand box orange pixels by y coordinate:")
    y_counts_l = {}
    for y in range(600, 800):
        for x in range(81, 400):
            r, g, b, a = pixels[x, y]
            is_orange = (180 <= r <= 245 and 110 <= g <= 175 and 40 <= b <= 105) and a > 0
            if is_orange:
                y_counts_l[y] = y_counts_l.get(y, 0) + 1
                
    for y in sorted(y_counts_l.keys()):
        print(f"  y={y}: count={y_counts_l[y]}")
        
    print("\nRight hand box orange pixels by y coordinate:")
    y_counts_r = {}
    for y in range(600, 800):
        for x in range(340, 631):
            r, g, b, a = pixels[x, y]
            is_orange = (180 <= r <= 245 and 110 <= g <= 175 and 40 <= b <= 105) and a > 0
            if is_orange:
                y_counts_r[y] = y_counts_r.get(y, 0) + 1
                
    for y in sorted(y_counts_r.keys()):
        if y_counts_r[y] > 5: # filter small noise
            print(f"  y={y}: count={y_counts_r[y]}")

import os
import sys
from PIL import Image
from collections import deque

workspace_dir = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker"
folder = os.path.join(workspace_dir, "public", "學校圖檔", "吉祥物")
img_path = os.path.join(folder, "信信-01.png")

if not os.path.exists(img_path):
    print("信信-01.png not found")
    sys.exit(1)

with Image.open(img_path) as img:
    img = img.convert("RGBA")
    width, height = img.size
    
    box_l = [81, 600, 400, 800]
    cropped_l = img.crop(box_l)
    lw, lh = cropped_l.size
    pixels_l = cropped_l.load()
    
    skin_pixels_l = []
    skin_set_l = set()
    for y in range(lh):
        for x in range(lw):
            r, g, b, a = pixels_l[x, y]
            is_skin = (abs(r - 246) < 20 and abs(g - 225) < 20 and abs(b - 199) < 20) and a > 0
            if is_skin:
                skin_pixels_l.append((x, y))
                skin_set_l.add((x, y))
                
    visited = set()
    components_l = []
    for p in skin_pixels_l:
        if p not in visited:
            comp = []
            queue = deque([p])
            visited.add(p)
            while queue:
                cx, cy = queue.popleft()
                comp.append((cx, cy))
                for dx, dy in [(-1,0), (1,0), (0,-1), (0,1), (-1,-1), (-1,1), (1,-1), (1,1)]:
                    nx, ny = cx + dx, cy + dy
                    if 0 <= nx < lw and 0 <= ny < lh:
                        if (nx, ny) in skin_set_l and (nx, ny) not in visited:
                            visited.add((nx, ny))
                            queue.append((nx, ny))
            components_l.append(comp)
            
    components_l_sorted = sorted(components_l, key=len, reverse=True)
    print(f"Number of components in left hand box: {len(components_l_sorted)}")
    for i in range(min(5, len(components_l_sorted))):
        comp = components_l_sorted[i]
        # Check how many are inside the face ellipse
        xc, yc, a_rad, b_rad = 355, 536, 199, 174
        inside = 0
        outside = 0
        for x, y in comp:
            abs_x = box_l[0] + x
            abs_y = box_l[1] + y
            val = ((abs_x - xc) / a_rad)**2 + ((abs_y - yc) / b_rad)**2
            if val <= 1.0:
                inside += 1
            else:
                outside += 1
        print(f"  Component {i}: total={len(comp)}, inside={inside}, outside={outside}")

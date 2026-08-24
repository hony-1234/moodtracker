import os
import sys
import math
from PIL import Image
from collections import deque

sys.stdout.reconfigure(encoding='utf-8')

workspace_dir = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker"
folder = os.path.join(workspace_dir, "public", "學校圖檔", "吉祥物")
img_path = os.path.join(folder, "信信-01.png")

xc, yc, a_rad, b_rad = 355, 536, 199, 174 # Face ellipse parameters

with Image.open(img_path) as img:
    img = img.convert("RGBA")
    width, height = img.size
    img_transparent = img.copy()
    pixels = img_transparent.load()
    
    # Let's flood-fill corners to match the main script
    visited = [[False for _ in range(width)] for _ in range(height)]
    queue = []
    target_color = (255, 255, 255)
    tol = 30
    for x in [0, width-1]:
        for y in [0, height-1]:
            r, g, b, a = pixels[x, y]
            if abs(r - target_color[0]) <= tol and abs(g - target_color[1]) <= tol and abs(b - target_color[2]) <= tol:
                queue.append((x, y))
                visited[y][x] = True
    while queue:
        cx, cy = queue.pop(0)
        pixels[cx, cy] = (0, 0, 0, 0)
        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < width and 0 <= ny < height:
                if not visited[ny][nx]:
                    r, g, b, a = pixels[nx, ny]
                    if abs(r - target_color[0]) <= tol and abs(g - target_color[1]) <= tol and abs(b - target_color[2]) <= tol:
                        visited[ny][nx] = True
                        queue.append((nx, ny))

    # Left Hand Box
    box_left_hand = [81, 600, 400, 800]
    left_hand_raw = img_transparent.crop(box_left_hand)
    lw, lh = left_hand_raw.size
    pixels_l = left_hand_raw.load()
    
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
    hand_skin_l = components_l_sorted[1]
    
    ellipse_vals_l = []
    for x, y in hand_skin_l:
        abs_x = x + box_left_hand[0]
        abs_y = y + box_left_hand[1]
        val = ((abs_x - xc) / a_rad) ** 2 + ((abs_y - yc) / b_rad) ** 2
        ellipse_vals_l.append(val)
        
    print(f"Left Hand Skin Component ({len(hand_skin_l)} pixels):")
    print(f"  Min Ellipse Val: {min(ellipse_vals_l):.4f}")
    print(f"  Max Ellipse Val: {max(ellipse_vals_l):.4f}")
    
    # Right Hand Box
    box_right_hand = [340, 600, 631, 800]
    right_hand_raw = img_transparent.crop(box_right_hand)
    rw, rh = right_hand_raw.size
    pixels_r = right_hand_raw.load()
    
    skin_pixels_r = []
    skin_set_r = set()
    for y in range(rh):
        for x in range(rw):
            r, g, b, a = pixels_r[x, y]
            is_skin = (abs(r - 246) < 20 and abs(g - 225) < 20 and abs(b - 199) < 20) and a > 0
            if is_skin:
                skin_pixels_r.append((x, y))
                skin_set_r.add((x, y))
                
    visited = set()
    components_r = []
    for p in skin_pixels_r:
        if p not in visited:
            comp = []
            queue = deque([p])
            visited.add(p)
            while queue:
                cx, cy = queue.popleft()
                comp.append((cx, cy))
                for dx, dy in [(-1,0), (1,0), (0,-1), (0,1), (-1,-1), (-1,1), (1,-1), (1,1)]:
                    nx, ny = cx + dx, cy + dy
                    if 0 <= nx < rw and 0 <= ny < rh:
                        if (nx, ny) in skin_set_r and (nx, ny) not in visited:
                            visited.add((nx, ny))
                            queue.append((nx, ny))
            components_r.append(comp)
            
    components_r_sorted = sorted(components_r, key=len, reverse=True)
    hand_skin_r = components_r_sorted[1]
    
    ellipse_vals_r = []
    for x, y in hand_skin_r:
        abs_x = x + box_right_hand[0]
        abs_y = y + box_right_hand[1]
        val = ((abs_x - xc) / a_rad) ** 2 + ((abs_y - yc) / b_rad) ** 2
        ellipse_vals_r.append(val)
        
    print(f"\nRight Hand Skin Component ({len(hand_skin_r)} pixels):")
    print(f"  Min Ellipse Val: {min(ellipse_vals_r):.4f}")
    print(f"  Max Ellipse Val: {max(ellipse_vals_r):.4f}")

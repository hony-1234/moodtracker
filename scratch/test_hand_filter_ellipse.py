import os
import sys
import math
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

workspace_dir = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker"
folder = os.path.join(workspace_dir, "public", "學校圖檔", "吉祥物")
img_path = os.path.join(folder, "信信-01.png")

with Image.open(img_path) as img:
    img = img.convert("RGBA")
    width, height = img.size
    pixels = img.load()
    
    # Clean background flood fill
    img_transparent = img.copy()
    pixels_t = img_transparent.load()
    visited = [[False for _ in range(width)] for _ in range(height)]
    queue = []
    target_color = (255, 255, 255)
    tol = 30
    
    for x in [0, width-1]:
         for y in [0, height-1]:
             r, g, b, a = pixels_t[x, y]
             if abs(r - target_color[0]) <= tol and abs(g - target_color[1]) <= tol and abs(b - target_color[2]) <= tol:
                 queue.append((x, y))
                 visited[y][x] = True
                 
    while queue:
        cx, cy = queue.pop(0)
        pixels_t[cx, cy] = (0, 0, 0, 0)
        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < width and 0 <= ny < height:
                if not visited[ny][nx]:
                    r, g, b, a = pixels_t[nx, ny]
                    if abs(r - target_color[0]) <= tol and abs(g - target_color[1]) <= tol and abs(b - target_color[2]) <= tol:
                        visited[ny][nx] = True
                        queue.append((nx, ny))
                        
    # Face ellipse parameters
    xc, yc, a_rad, b_rad = 355, 536, 199, 174
    
    # Left hand box
    box_left_hand = [81, 600, 400, 800]
    lw, lh = 400 - 81, 800 - 600
    pixels_l = img_transparent.crop(box_left_hand).load()
    
    # Find skin tone components
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
            q = [p]
            visited.add(p)
            while q:
                cx, cy = q.pop(0)
                comp.append((cx, cy))
                for dx, dy in [(-1,0), (1,0), (0,-1), (0,1), (-1,-1), (-1,1), (1,-1), (1,1)]:
                    nx, ny = cx + dx, cy + dy
                    if 0 <= nx < lw and 0 <= ny < lh:
                        if (nx, ny) in skin_set_l and (nx, ny) not in visited:
                            visited.add((nx, ny))
                            q.append((nx, ny))
            components_l.append(comp)
            
    components_l_sorted = sorted(components_l, key=len, reverse=True)
    hand_skin_l = set(components_l_sorted[1]) # Second largest skin component is hand
    
    core_l = set()
    for y in range(lh):
        for x in range(lw):
            r, g, b, a = pixels_l[x, y]
            if a == 0:
                continue
            
            x_abs = x + box_left_hand[0]
            y_abs = y + box_left_hand[1]
            val = ((x_abs - xc) / a_rad)**2 + ((y_abs - yc) / b_rad)**2
            
            # ELIPSE FILTER: Exclude any pixel inside face ellipse
            if val <= 1.0:
                continue
                
            is_hand_skin = (x, y) in hand_skin_l
            is_orange = (180 <= r <= 245 and 110 <= g <= 175 and 40 <= b <= 105)
            
            if is_hand_skin or (is_orange and x_abs < 340):
                core_l.add((x, y))
                
    # Add outlines near core_l
    final_l = set(core_l)
    for y in range(lh):
        for x in range(lw):
            r, g, b, a = pixels_l[x, y]
            if a == 0:
                continue
            x_abs = x + box_left_hand[0]
            y_abs = y + box_left_hand[1]
            val = ((x_abs - xc) / a_rad)**2 + ((y_abs - yc) / b_rad)**2
            if val <= 1.0:
                continue
            is_outline = (r < 100 and g < 75 and b < 55)
            if is_outline and (x, y) not in final_l:
                near_core = False
                for dy in range(-3, 4):
                    for dx in range(-3, 4):
                        nx, ny = x + dx, y + dy
                        if 0 <= nx < lw and 0 <= ny < lh:
                            if (nx, ny) in core_l:
                                near_core = True
                                break
                    if near_core:
                        break
                if near_core:
                    final_l.add((x, y))
                    
    print(f"Left Hand core pixels: {len(core_l)}, total final hand pixels (including outline): {len(final_l)}")
    
    # Right hand box
    box_right_hand = [340, 600, 631, 800]
    rw, rh = 631 - 340, 800 - 600
    pixels_r = img_transparent.crop(box_right_hand).load()
    
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
            q = [p]
            visited.add(p)
            while q:
                cx, cy = q.pop(0)
                comp.append((cx, cy))
                for dx, dy in [(-1,0), (1,0), (0,-1), (0,1), (-1,-1), (-1,1), (1,-1), (1,1)]:
                    nx, ny = cx + dx, cy + dy
                    if 0 <= nx < rw and 0 <= ny < rh:
                        if (nx, ny) in skin_set_r and (nx, ny) not in visited:
                            visited.add((nx, ny))
                            q.append((nx, ny))
            components_r.append(comp)
            
    components_r_sorted = sorted(components_r, key=len, reverse=True)
    hand_skin_r = set(components_r_sorted[1])
    
    core_r = set()
    for y in range(rh):
        for x in range(rw):
            r, g, b, a = pixels_r[x, y]
            if a == 0:
                continue
                
            x_abs = x + box_right_hand[0]
            y_abs = y + box_right_hand[1]
            val = ((x_abs - xc) / a_rad)**2 + ((y_abs - yc) / b_rad)**2
            
            # ELIPSE FILTER: Exclude any pixel inside face ellipse
            if val <= 1.0:
                continue
                
            is_hand_skin = (x, y) in hand_skin_r
            is_orange = (180 <= r <= 245 and 110 <= g <= 175 and 40 <= b <= 105)
            
            if is_hand_skin or (is_orange and x_abs > 390):
                core_r.add((x, y))
                
    # Add outlines near core_r
    final_r = set(core_r)
    for y in range(rh):
        for x in range(rw):
            r, g, b, a = pixels_r[x, y]
            if a == 0:
                continue
            x_abs = x + box_right_hand[0]
            y_abs = y + box_right_hand[1]
            val = ((x_abs - xc) / a_rad)**2 + ((y_abs - yc) / b_rad)**2
            if val <= 1.0:
                continue
            is_outline = (r < 100 and g < 75 and b < 55)
            if is_outline and (x, y) not in final_r:
                near_core = False
                for dy in range(-3, 4):
                    for dx in range(-3, 4):
                        nx, ny = x + dx, y + dy
                        if 0 <= nx < rw and 0 <= ny < rh:
                            if (nx, ny) in core_r:
                                near_core = True
                                break
                    if near_core:
                        break
                if near_core:
                    final_r.add((x, y))
                    
    print(f"Right Hand core pixels: {len(core_r)}, total final hand pixels (including outline): {len(final_r)}")
    
    # Print the bounding box of final_r
    ys = [p[1] for p in final_r]
    print(f"Right hand final y-range in crop: [{min(ys)}, {max(ys)}]")

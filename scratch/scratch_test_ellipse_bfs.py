import os
import sys
import math
from PIL import Image
from collections import deque

sys.stdout.reconfigure(encoding='utf-8')

workspace_dir = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker"
folder = os.path.join(workspace_dir, "public", "學校圖檔", "吉祥物")
img_path = os.path.join(folder, "信信-01.png")
artifacts_dir = r"C:\Users\Jerry\.gemini\antigravity\brain\0198b957-90fd-47d6-8e0b-d00b1216d601"

with Image.open(img_path) as img:
    img = img.convert("RGBA")
    w, h = img.size
    pixels = img.load()
    
    # Ellipse parameters
    xc, yc, a_rad, b_rad = 355, 536, 199, 174
    
    # --- LEFT HAND ---
    print("Processing Left Hand...")
    box_l = [81, 600, 400, 800]
    crop_l = img.crop(box_l)
    lw, lh = crop_l.size
    pixels_l = crop_l.load()
    
    # Find skin pixels
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
    hand_skin_l = set(components_l_sorted[1]) # Component 1 is left hand skin
    
    # Start BFS from hand_skin_l, restricted to val > 1.0 (outside ellipse) and not red
    queue_bfs_l = deque(hand_skin_l)
    visited_bfs_l = set(hand_skin_l)
    
    while queue_bfs_l:
        cx, cy = queue_bfs_l.popleft()
        for dx, dy in [(-1,0), (1,0), (0,-1), (0,1), (-1,-1), (-1,1), (1,-1), (1,1)]:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < lw and 0 <= ny < lh:
                if (nx, ny) not in visited_bfs_l:
                    r, g, b, a = pixels_l[nx, ny]
                    if a > 0:
                        abs_x = box_l[0] + nx
                        abs_y = box_l[1] + ny
                        # Check face ellipse
                        val = ((abs_x - xc) / a_rad) ** 2 + ((abs_y - yc) / b_rad) ** 2
                        is_red = (r > 140 and g < 100 and b < 100)
                        
                        # We only traverse if outside face ellipse and not red (floating heart)
                        if val > 1.0 and not is_red:
                            visited_bfs_l.add((nx, ny))
                            queue_bfs_l.append((nx, ny))
                            
    left_arm_img = Image.new("RGBA", (lw, lh), (0, 0, 0, 0))
    lap = left_arm_img.load()
    for x, y in visited_bfs_l:
        lap[x, y] = pixels_l[x, y]
        
    out_path_l = os.path.join(artifacts_dir, "left_arm_ellipse_bfs.png")
    left_arm_img.save(out_path_l, "PNG")
    print(f"Saved Left Arm Ellipse BFS: {out_path_l} | pixels: {len(visited_bfs_l)}")
    
    # --- RIGHT HAND ---
    print("Processing Right Hand...")
    box_r = [340, 600, 631, 800]
    crop_r = img.crop(box_r)
    rw, rh = crop_r.size
    pixels_r = crop_r.load()
    
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
    hand_skin_r = set(components_r_sorted[1]) # Component 1 is right hand skin
    
    queue_bfs_r = deque(hand_skin_r)
    visited_bfs_r = set(hand_skin_r)
    
    while queue_bfs_r:
        cx, cy = queue_bfs_r.popleft()
        for dx, dy in [(-1,0), (1,0), (0,-1), (0,1), (-1,-1), (-1,1), (1,-1), (1,1)]:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < rw and 0 <= ny < rh:
                if (nx, ny) not in visited_bfs_r:
                    r, g, b, a = pixels_r[nx, ny]
                    if a > 0:
                        abs_x = box_r[0] + nx
                        abs_y = box_r[1] + ny
                        val = ((abs_x - xc) / a_rad) ** 2 + ((abs_y - yc) / b_rad) ** 2
                        is_red = (r > 140 and g < 100 and b < 100)
                        
                        if val > 1.0 and not is_red:
                            visited_bfs_r.add((nx, ny))
                            queue_bfs_r.append((nx, ny))
                            
    right_arm_img = Image.new("RGBA", (rw, rh), (0, 0, 0, 0))
    rap = right_arm_img.load()
    for x, y in visited_bfs_r:
        rap[x, y] = pixels_r[x, y]
        
    out_path_r = os.path.join(artifacts_dir, "right_arm_ellipse_bfs.png")
    right_arm_img.save(out_path_r, "PNG")
    print(f"Saved Right Arm Ellipse BFS: {out_path_r} | pixels: {len(visited_bfs_r)}")

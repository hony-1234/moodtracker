import os
import sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

workspace_dir = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker"
folder = os.path.join(workspace_dir, "public", "學校圖檔", "吉祥物")
img_path = os.path.join(folder, "信信-01.png")

with Image.open(img_path) as img:
    img = img.convert("RGBA")
    w, h = img.size
    
    # --- LEFT HAND ---
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
                
    # Connected components
    visited = set()
    components_l = []
    for p in skin_pixels_l:
        if p not in visited:
            comp = []
            queue = [p]
            visited.add(p)
            while queue:
                cx, cy = queue.pop(0)
                comp.append((cx, cy))
                for dx, dy in [(-1,0), (1,0), (0,-1), (0,1), (-1,-1), (-1,1), (1,-1), (1,1)]:
                    nx, ny = cx + dx, cy + dy
                    if 0 <= nx < lw and 0 <= ny < lh:
                        if (nx, ny) in skin_set_l and (nx, ny) not in visited:
                            visited.add((nx, ny))
                            queue.append((nx, ny))
            components_l.append(comp)
            
    components_l_sorted = sorted(components_l, key=len, reverse=True)
    face_skin_l = set(components_l_sorted[0])
    hand_skin_l = set(components_l_sorted[1])
    
    # Run BFS for left arm
    left_arm_pixels = set()
    queue_l = list(hand_skin_l)
    visited_l = set(hand_skin_l)
    
    while queue_l:
        cx, cy = queue_l.pop(0)
        left_arm_pixels.add((cx, cy))
        
        for dx, dy in [(-1,0), (1,0), (0,-1), (0,1), (-1,-1), (-1,1), (1,-1), (1,1)]:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < lw and 0 <= ny < lh:
                if (nx, ny) not in visited_l:
                    r, g, b, a = pixels_l[nx, ny]
                    if a > 0:
                        # Classification checks
                        is_red = (r > 140 and g < 100 and b < 100)
                        is_face_skin = (nx, ny) in face_skin_l
                        is_helmet_or_top = (ny < 55) # prevent climbing up
                        is_far_right = (nx > 240 and ny < 130) # prevent climbing into central body too high
                        
                        if not is_red and not is_face_skin and not is_helmet_or_top and not is_far_right:
                            visited_l.add((nx, ny))
                            queue_l.append((nx, ny))
                            
    # Create left arm image
    left_arm_img = Image.new("RGBA", (lw, lh), (0, 0, 0, 0))
    lap = left_arm_img.load()
    for x, y in left_arm_pixels:
        lap[x, y] = pixels_l[x, y]
        
    left_arm_img.save(os.path.join(workspace_dir, "scratch", "left_arm_extracted_test.png"), "PNG")
    print(f"Extracted Left Arm: {len(left_arm_pixels)} pixels")
    
    # --- RIGHT HAND ---
    box_r = [340, 600, 631, 800]
    crop_r = img.crop(box_r)
    rw, rh = crop_r.size
    pixels_r = crop_r.load()
    
    # Find skin pixels
    skin_pixels_r = []
    skin_set_r = set()
    for y in range(rh):
        for x in range(rw):
            r, g, b, a = pixels_r[x, y]
            is_skin = (abs(r - 246) < 20 and abs(g - 225) < 20 and abs(b - 199) < 20) and a > 0
            if is_skin:
                skin_pixels_r.append((x, y))
                skin_set_r.add((x, y))
                
    # Connected components
    visited = set()
    components_r = []
    for p in skin_pixels_r:
        if p not in visited:
            comp = []
            queue = [p]
            visited.add(p)
            while queue:
                cx, cy = queue.pop(0)
                comp.append((cx, cy))
                for dx, dy in [(-1,0), (1,0), (0,-1), (0,1), (-1,-1), (-1,1), (1,-1), (1,1)]:
                    nx, ny = cx + dx, cy + dy
                    if 0 <= nx < rw and 0 <= ny < rh:
                        if (nx, ny) in skin_set_r and (nx, ny) not in visited:
                            visited.add((nx, ny))
                            queue.append((nx, ny))
            components_r.append(comp)
            
    components_r_sorted = sorted(components_r, key=len, reverse=True)
    face_skin_r = set(components_r_sorted[0])
    hand_skin_r = set(components_r_sorted[1])
    
    # Run BFS for right arm
    right_arm_pixels = set()
    queue_r = list(hand_skin_r)
    visited_r = set(hand_skin_r)
    
    while queue_r:
        cx, cy = queue_r.pop(0)
        right_arm_pixels.add((cx, cy))
        
        for dx, dy in [(-1,0), (1,0), (0,-1), (0,1), (-1,-1), (-1,1), (1,-1), (1,1)]:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < rw and 0 <= ny < rh:
                if (nx, ny) not in visited_r:
                    r, g, b, a = pixels_r[nx, ny]
                    if a > 0:
                        is_red = (r > 140 and g < 100 and b < 100)
                        is_face_skin = (nx, ny) in face_skin_r
                        is_helmet_or_top = (ny < 60)
                        is_far_left = (nx < 50 and ny < 130)
                        
                        if not is_red and not is_face_skin and not is_helmet_or_top and not is_far_left:
                            visited_r.add((nx, ny))
                            queue_r.append((nx, ny))
                            
    # Create right arm image
    right_arm_img = Image.new("RGBA", (rw, rh), (0, 0, 0, 0))
    rap = right_arm_img.load()
    for x, y in right_arm_pixels:
        rap[x, y] = pixels_r[x, y]
        
    right_arm_img.save(os.path.join(workspace_dir, "scratch", "right_arm_extracted_test.png"), "PNG")
    print(f"Extracted Right Arm: {len(right_arm_pixels)} pixels")

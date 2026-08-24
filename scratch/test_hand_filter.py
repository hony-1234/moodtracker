import os
import sys
import math
from PIL import Image, ImageDraw
from collections import deque

workspace_dir = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker"
folder = os.path.join(workspace_dir, "public", "學校圖檔", "吉祥物")
img_path = os.path.join(folder, "信信-01.png")

with Image.open(img_path) as img:
    img = img.convert("RGBA")
    width, height = img.size
    
    # Let's run a test extraction using the new coordinates filters
    img_transparent = img.copy()
    pixels = img_transparent.load()
    
    # 1. Clear background
    visited = [[False for _ in range(width)] for _ in range(height)]
    queue = [(0, 0), (width-1, 0), (0, height-1), (width-1, height-1)]
    for x, y in queue:
        visited[y][x] = True
    while queue:
        cx, cy = queue.pop(0)
        pixels[cx, cy] = (0, 0, 0, 0)
        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < width and 0 <= ny < height:
                if not visited[ny][nx]:
                    r, g, b, a = pixels[nx, ny]
                    if r > 220 and g > 220 and b > 220: # white background
                        visited[ny][nx] = True
                        queue.append((nx, ny))
                        
    box_left_hand = [81, 600, 400, 800]      
    box_right_hand = [340, 600, 631, 800]    
    
    # LEFT HAND skin segmentation
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
    visited_skin = set()
    components_l = []
    for p in skin_pixels_l:
        if p not in visited_skin:
            comp = []
            q = deque([p])
            visited_skin.add(p)
            while q:
                cx, cy = q.popleft()
                comp.append((cx, cy))
                for dx, dy in [(-1,0), (1,0), (0,-1), (0,1), (-1,-1), (-1,1), (1,-1), (1,1)]:
                    nx, ny = cx + dx, cy + dy
                    if 0 <= nx < lw and 0 <= ny < lh:
                        if (nx, ny) in skin_set_l and (nx, ny) not in visited_skin:
                            visited_skin.add((nx, ny))
                            q.append((nx, ny))
            components_l.append(comp)
    components_l_sorted = sorted(components_l, key=len, reverse=True)
    hand_skin_l = set(components_l_sorted[1])
    
    # LEFT hand core with coordinate filter x_abs < 340
    core_l = set()
    for y in range(lh):
        for x in range(lw):
            r, g, b, a = pixels_l[x, y]
            if a == 0: continue
            is_hand_skin = (x, y) in hand_skin_l
            is_orange = (180 <= r <= 245 and 110 <= g <= 175 and 40 <= b <= 105)
            x_abs = x + 81
            if is_hand_skin or (is_orange and x_abs < 340):
                core_l.add((x, y))
                
    left_hand_canvas = Image.new("RGBA", (lw, lh), (0, 0, 0, 0))
    l_pixels = left_hand_canvas.load()
    left_arm_absolute_mask = set()
    for y in range(lh):
        for x in range(lw):
            r, g, b, a = pixels_l[x, y]
            if a == 0: continue
            if (x, y) in core_l:
                l_pixels[x, y] = (r, g, b, a)
                left_arm_absolute_mask.add((x + 81, y + 600))
            else:
                is_outline = (r < 100 and g < 75 and b < 55)
                if is_outline:
                    near_core = False
                    for dy in range(-3, 4):
                        for dx in range(-3, 4):
                            nx, ny = x + dx, y + dy
                            if 0 <= nx < lw and 0 <= ny < lh:
                                if (nx, ny) in core_l:
                                    near_core = True
                                    break
                        if near_core: break
                    if near_core:
                        l_pixels[x, y] = (r, g, b, a)
                        left_arm_absolute_mask.add((x + 81, y + 600))
                        
    # Draw Left Joint backing
    left_draw_joint = ImageDraw.Draw(left_hand_canvas)
    left_draw_joint.ellipse([269 - 32, 170 - 32, 269 + 32, 170 + 32], fill=(216, 146, 67, 255))
    
    # RIGHT HAND skin segmentation
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
    visited_skin_r = set()
    components_r = []
    for p in skin_pixels_r:
        if p not in visited_skin_r:
            comp = []
            q = deque([p])
            visited_skin_r.add(p)
            while q:
                cx, cy = q.popleft()
                comp.append((cx, cy))
                for dx, dy in [(-1,0), (1,0), (0,-1), (0,1), (-1,-1), (-1,1), (1,-1), (1,1)]:
                    nx, ny = cx + dx, cy + dy
                    if 0 <= nx < rw and 0 <= ny < rh:
                        if (nx, ny) in skin_set_r and (nx, ny) not in visited_skin_r:
                            visited_skin_r.add((nx, ny))
                            q.append((nx, ny))
            components_r.append(comp)
    components_r_sorted = sorted(components_r, key=len, reverse=True)
    hand_skin_r = set(components_r_sorted[1])
    
    # RIGHT hand core with coordinate filter x_abs > 390
    core_r = set()
    for y in range(rh):
        for x in range(rw):
            r, g, b, a = pixels_r[x, y]
            if a == 0: continue
            is_hand_skin = (x, y) in hand_skin_r
            is_orange = (180 <= r <= 245 and 110 <= g <= 175 and 40 <= b <= 105)
            x_abs = x + 340
            if is_hand_skin or (is_orange and x_abs > 390):
                core_r.add((x, y))
                
    right_hand_canvas = Image.new("RGBA", (rw, rh), (0, 0, 0, 0))
    r_pixels = right_hand_canvas.load()
    right_arm_absolute_mask = set()
    for y in range(rh):
        for x in range(rw):
            r, g, b, a = pixels_r[x, y]
            if a == 0: continue
            if (x, y) in core_r:
                r_pixels[x, y] = (r, g, b, a)
                right_arm_absolute_mask.add((x + 340, y + 600))
            else:
                is_outline = (r < 100 and g < 75 and b < 55)
                if is_outline:
                    near_core = False
                    for dy in range(-3, 4):
                        for dx in range(-3, 4):
                            nx, ny = x + dx, y + dy
                            if 0 <= nx < rw and 0 <= ny < rh:
                                if (nx, ny) in core_r:
                                    near_core = True
                                    break
                        if near_core: break
                    if near_core:
                        r_pixels[x, y] = (r, g, b, a)
                        right_arm_absolute_mask.add((x + 340, y + 600))
                        
    # Draw Right Joint backing
    right_draw_joint = ImageDraw.Draw(right_hand_canvas)
    right_draw_joint.ellipse([39 - 32, 170 - 32, 39 + 32, 170 + 32], fill=(216, 146, 67, 255))
    
    # Save the test hand layers
    os.makedirs(os.path.join(workspace_dir, "scratch"), exist_ok=True)
    left_hand_canvas.save(os.path.join(workspace_dir, "scratch", "test_left_hand.png"), "PNG")
    right_hand_canvas.save(os.path.join(workspace_dir, "scratch", "test_right_hand.png"), "PNG")
    print("Saved test hand layers to scratch/test_left_hand.png and scratch/test_right_hand.png")
    
    # Now generate the test body base
    body_base = img_transparent.copy()
    base_pixels = body_base.load()
    
    # Erase arm regions based on masks
    for x, y in left_arm_absolute_mask:
        if 0 <= x < width and 0 <= y < height:
            base_pixels[x, y] = (0, 0, 0, 0)
    for x, y in right_arm_absolute_mask:
        if 0 <= x < width and 0 <= y < height:
            base_pixels[x, y] = (0, 0, 0, 0)
            
    # Draw perfect joint backing circles on body base
    draw_base = ImageDraw.Draw(body_base)
    draw_base.ellipse([350 - 32, 770 - 32, 350 + 32, 770 + 32], fill=(216, 146, 67, 255))
    draw_base.ellipse([379 - 32, 770 - 32, 379 + 32, 770 + 32], fill=(216, 146, 67, 255))
    
    # Restore the chest heart
    chest_heart_pixels = set()
    for y in range(738, 811):
        for x in range(316, 423):
            r, g, b, a = pixels[x, y]
            if a > 0:
                is_red = (r > 120 and g < 105 and b < 105)
                if is_red:
                    chest_heart_pixels.add((x, y))
    visited_heart = set(chest_heart_pixels)
    queue_heart = deque(chest_heart_pixels)
    heart_all_pixels = set(chest_heart_pixels)
    depths_heart = {p: 0 for p in chest_heart_pixels}
    while queue_heart:
        cx, cy = queue_heart.popleft()
        cd = depths_heart[(cx, cy)]
        if cd < 5:
            for dx, dy in [(-1,0), (1,0), (0,-1), (0,1), (-1,-1), (-1,1), (1,-1), (1,1)]:
                nx, ny = cx + dx, cy + dy
                if 310 <= nx <= 430 and 730 <= ny <= 820:
                    if (nx, ny) not in visited_heart:
                        r, g, b, a = pixels[nx, ny]
                        if a > 0:
                            is_outline = (r < 110 and g < 80 and b < 60)
                            is_red_too = (r > 120 and g < 105 and b < 105)
                            if is_outline or is_red_too:
                                visited_heart.add((nx, ny))
                                depths_heart[(nx, ny)] = cd + 1
                                queue_heart.append((nx, ny))
                                heart_all_pixels.add((nx, ny))
    for x, y in heart_all_pixels:
        base_pixels[x, y] = pixels[x, y]
        
    body_base.save(os.path.join(workspace_dir, "scratch", "test_body_base.png"), "PNG")
    print("Saved test body base to scratch/test_body_base.png")
    
    # Reassemble and save mockup
    canvas = Image.new("RGBA", body_base.size, (0, 0, 0, 0))
    canvas.alpha_composite(body_base, (0, 0))
    canvas.alpha_composite(left_hand_canvas, (81, 600))
    canvas.alpha_composite(right_hand_canvas, (340, 600))
    
    canvas.save(os.path.join(workspace_dir, "scratch", "reassembled_test.png"), "PNG")
    print("Saved reassembled mockup to scratch/reassembled_test.png")

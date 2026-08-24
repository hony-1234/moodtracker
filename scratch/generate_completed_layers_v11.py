import os
import sys
import math
from PIL import Image, ImageDraw
from collections import deque

sys.stdout.reconfigure(encoding='utf-8')

workspace_dir = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker"
folder = os.path.join(workspace_dir, "public", "學校圖檔", "吉祥物")
img_path = os.path.join(folder, "信信-01.png")

if not os.path.exists(img_path):
    print("信信-01.png not found!")
    sys.exit(1)

with Image.open(img_path) as img:
    img = img.convert("RGBA")
    width, height = img.size
    print(f"Loaded original image: {width}x{height}")
    
    # 1. Create fully transparent mascot template using BFS flood-fill from corners
    print("Step 1: Running flood-fill to clear the white background...")
    img_transparent = img.copy()
    pixels = img_transparent.load()
    
    visited = [[False for _ in range(width)] for _ in range(height)]
    queue = []
    target_color = (255, 255, 255)
    tol = 30 # high tolerance
    
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
                        
    print("Background cleared!")
    
    # 2. Define expanded crop boundaries [left, top, right, bottom]
    box_fire = [171, 50, 593, 212]          
    box_left_hand = [81, 600, 400, 800]      
    box_right_hand = [340, 600, 631, 800]    
    box_legs = [218, 760, 509, 955]          
    box_left_eye = [260, 470, 325, 580]
    box_right_eye = [430, 470, 490, 580]
    
    # --- FIRE ---
    print("Step 2: Cropping, cleaning and saving fire flame...")
    fire_img = img_transparent.crop(box_fire)
    fire_pixels = fire_img.load()
    fw, fh = fire_img.size
    
    for y in range(fh):
        abs_y = box_fire[1] + y
        for x in range(fw):
            r, g, b, a = fire_pixels[x, y]
            if a > 0:
                is_dark_brown = (r < 100 and g < 70 and b < 50)
                is_light_brown = (140 <= r <= 235 and 90 <= g <= 170 and 40 <= b <= 100)
                if (is_dark_brown or is_light_brown) and abs_y >= 212:
                    fire_pixels[x, y] = (0, 0, 0, 0)
                    
    fire_img.save(os.path.join(folder, "xinxin_fire_v5.png"), "PNG")
    print("Fire saved!")
    
    # --- EYES ---
    print("Step 3: Cropping, cleaning and saving eyes...")
    left_eye = img_transparent.crop(box_left_eye)
    right_eye = img_transparent.crop(box_right_eye)
    
    def make_eye_transparent(eye_img, target_color=(246, 225, 199), tol=15):
        c_img = eye_img.convert("RGBA")
        cw, ch = c_img.size
        cpix = c_img.load()
        
        visited = [[False for _ in range(cw)] for _ in range(ch)]
        queue = []
        for x in range(cw):
            for y in [0, ch-1]:
                r, g, b, a = cpix[x, y]
                if abs(r - target_color[0]) <= tol and abs(g - target_color[1]) <= tol and abs(b - target_color[2]) <= tol and a > 0:
                    queue.append((x, y))
                    visited[y][x] = True
        for y in range(ch):
            for x in [0, cw-1]:
                if not visited[y][x]:
                    r, g, b, a = cpix[x, y]
                    if abs(r - target_color[0]) <= tol and abs(g - target_color[1]) <= tol and abs(b - target_color[2]) <= tol and a > 0:
                        queue.append((x, y))
                        visited[y][x] = True
        while queue:
            cx, cy = queue.pop(0)
            cpix[cx, cy] = (0, 0, 0, 0)
            for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                nx, ny = cx + dx, cy + dy
                if 0 <= nx < cw and 0 <= ny < ch:
                    if not visited[ny][nx]:
                        r, g, b, a = cpix[nx, ny]
                        if abs(r - target_color[0]) <= tol and abs(g - target_color[1]) <= tol and abs(b - target_color[2]) <= tol and a > 0:
                            visited[ny][nx] = True
                            queue.append((nx, ny))
        return c_img
        
    make_eye_transparent(left_eye).save(os.path.join(folder, "xinxin_left_eye_v5.png"), "PNG")
    make_eye_transparent(right_eye).save(os.path.join(folder, "xinxin_right_eye_v5.png"), "PNG")
    print("Eyes saved!")
    
    # --- HANDS ---
    print("Step 4: Segmenting, cropping and drawing completed rounded joints on hands...")
    dress_red = (176, 47, 34, 255)
    skin_tone = (246, 225, 199, 255)
    outline_color = (53, 32, 7, 255)
    
    # --- LEFT HAND ---
    left_hand_raw = img_transparent.crop(box_left_hand)
    lw, lh = left_hand_raw.size
    
    # Perform skin connectivity grouping to separate cheek skin from hand skin
    skin_pixels_l = []
    skin_set_l = set()
    for y in range(lh):
        for x in range(lw):
            r, g, b, a = left_hand_raw.getpixel((x, y))
            is_skin = (abs(r - 246) < 20 and abs(g - 225) < 20 and abs(b - 199) < 20) and a > 0
            if is_skin:
                skin_pixels_l.append((x, y))
                skin_set_l.add((x, y))
                
    visited_set_l = set()
    components_l = []
    for p in skin_pixels_l:
        if p not in visited_set_l:
            comp = []
            queue = [p]
            visited_set_l.add(p)
            while queue:
                cx, cy = queue.pop(0)
                comp.append((cx, cy))
                for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (1, -1), (-1, 1), (1, 1)]:
                    nx, ny = cx + dx, cy + dy
                    if 0 <= nx < lw and 0 <= ny < lh:
                        if (nx, ny) in skin_set_l and (nx, ny) not in visited_set_l:
                            visited_set_l.add((nx, ny))
                            queue.append((nx, ny))
            components_l.append(comp)
            
    components_sorted_l = sorted(components_l, key=len, reverse=True)
    face_skin_l = set(components_sorted_l[0])
    hand_skin_l = set(components_sorted_l[1])
    
    # Assign ultra-precise, leak-proof core classifications
    arm_cores_l = set()
    face_cores_l = set()
    for y in range(lh):
        for x in range(lw):
            r, g, b, a = left_hand_raw.getpixel((x, y))
            if a == 0:
                continue
            is_red = (r > 150 and g < 100 and b < 100)
            
            # Left Hand Core Assignment Rules:
            if y < 60:
                face_cores_l.add((x, y)) # 1. Force all pixels above y = 60 to be FACE (no helmet/hair can leak!)
            elif (x, y) in hand_skin_l:
                arm_cores_l.add((x, y)) # 2. Hand skin component is 100% ARM
            elif (x, y) in face_skin_l:
                face_cores_l.add((x, y)) # 3. Cheek skin component is 100% FACE
            elif is_red:
                if x < 230:
                    arm_cores_l.add((x, y)) # 4. Sleeve red is ARM
                else:
                    face_cores_l.add((x, y)) # 4. Central body dress red is FACE
            else:
                if x < 150:
                    arm_cores_l.add((x, y)) # 5. Far left outline/details are ARM
                elif x >= 230:
                    face_cores_l.add((x, y)) # 5. Far right outline/details are FACE
                
    left_hand = Image.new('RGBA', (lw, lh), (0, 0, 0, 0))
    left_pixels = left_hand.load()
    raw_pixels_l = left_hand_raw.load()
    
    # High-Performance Multi-Source BFS Proximity Classification
    queue_l = deque()
    dist_grid_l = [[999999 for _ in range(lw)] for _ in range(lh)]
    label_grid_l = [[None for _ in range(lw)] for _ in range(lh)]
    
    for x, y in arm_cores_l:
        dist_grid_l[y][x] = 0
        label_grid_l[y][x] = 'ARM'
        queue_l.append((x, y))
    for x, y in face_cores_l:
        dist_grid_l[y][x] = 0
        label_grid_l[y][x] = 'FACE'
        queue_l.append((x, y))
        
    while queue_l:
        cx, cy = queue_l.popleft()
        current_dist = dist_grid_l[cy][cx]
        current_label = label_grid_l[cy][cx]
        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < lw and 0 <= ny < lh:
                if dist_grid_l[ny][nx] > current_dist + 1:
                    dist_grid_l[ny][nx] = current_dist + 1
                    label_grid_l[ny][nx] = current_label
                    queue_l.append((nx, ny))
                    
    left_arm_absolute_mask = set()
    for y in range(lh):
        for x in range(lw):
            r, g, b, a = raw_pixels_l[x, y]
            if a == 0:
                continue
            if label_grid_l[y][x] == 'ARM':
                left_pixels[x, y] = (r, g, b, a)
                left_arm_absolute_mask.add((x + box_left_hand[0], y + box_left_hand[1]))
                
    # Draw perfect completed rounded shoulder joint at left pivot (269, 170)
    left_draw_joint = ImageDraw.Draw(left_hand)
    pivot_l = (269, 170)
    radius_l = 32
    left_draw_joint.ellipse(
        [pivot_l[0] - radius_l, pivot_l[1] - radius_l, pivot_l[0] + radius_l, pivot_l[1] + radius_l],
        fill=dress_red
    )
    left_hand.save(os.path.join(folder, "xinxin_left_hand_v5.png"), "PNG")
    print("Left hand completed and saved!")
    
    # --- RIGHT HAND ---
    right_hand_raw = img_transparent.crop(box_right_hand)
    rw, rh = right_hand_raw.size
    
    # Perform skin connectivity grouping to separate cheek skin from hand skin
    skin_pixels_r = []
    skin_set_r = set()
    for y in range(rh):
        for x in range(rw):
            r, g, b, a = right_hand_raw.getpixel((x, y))
            is_skin = (abs(r - 246) < 20 and abs(g - 225) < 20 and abs(b - 199) < 20) and a > 0
            if is_skin:
                skin_pixels_r.append((x, y))
                skin_set_r.add((x, y))
                
    visited_set_r = set()
    components_r = []
    for p in skin_pixels_r:
        if p not in visited_set_r:
            comp = []
            queue = [p]
            visited_set_r.add(p)
            while queue:
                cx, cy = queue.pop(0)
                comp.append((cx, cy))
                for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (1, -1), (-1, 1), (1, 1)]:
                    nx, ny = cx + dx, cy + dy
                    if 0 <= nx < rw and 0 <= ny < rh:
                        if (nx, ny) in skin_set_r and (nx, ny) not in visited_set_r:
                            visited_set_r.add((nx, ny))
                            queue.append((nx, ny))
            components_r.append(comp)
            
    components_sorted_r = sorted(components_r, key=len, reverse=True)
    face_skin_r = set(components_sorted_r[0])
    hand_skin_r = set(components_sorted_r[1])
    
    # Assign ultra-precise, leak-proof core classifications
    arm_cores_r = set()
    face_cores_r = set()
    for y in range(rh):
        for x in range(rw):
            r, g, b, a = right_hand_raw.getpixel((x, y))
            if a == 0:
                continue
            is_red = (r > 150 and g < 100 and b < 100)
            
            # Right Hand Core Assignment Rules:
            if y < 68:
                face_cores_r.add((x, y)) # 1. Force all pixels above y = 68 to be FACE (no helmet/hair can leak!)
            elif (x, y) in hand_skin_r:
                arm_cores_r.add((x, y)) # 2. Hand skin component is 100% ARM
            elif (x, y) in face_skin_r:
                face_cores_r.add((x, y)) # 3. Cheek skin component is 100% FACE
            elif is_red:
                if x > 90:
                    arm_cores_r.add((x, y)) # 4. Sleeve red is ARM
                else:
                    face_cores_r.add((x, y)) # 4. Central body dress red is FACE
            else:
                if x > 160:
                    arm_cores_r.add((x, y)) # 5. Far right outline/details are ARM
                elif x <= 90:
                    face_cores_r.add((x, y)) # 5. Far left outline/details are FACE
                
    right_hand = Image.new('RGBA', (rw, rh), (0, 0, 0, 0))
    right_pixels = right_hand.load()
    raw_pixels_r = right_hand_raw.load()
    
    # High-Performance Multi-Source BFS Proximity Classification
    queue_r = deque()
    dist_grid_r = [[999999 for _ in range(rw)] for _ in range(rh)]
    label_grid_r = [[None for _ in range(rw)] for _ in range(rh)]
    
    for x, y in arm_cores_r:
        dist_grid_r[y][x] = 0
        label_grid_r[y][x] = 'ARM'
        queue_r.append((x, y))
    for x, y in face_cores_r:
        dist_grid_r[y][x] = 0
        label_grid_r[y][x] = 'FACE'
        queue_r.append((x, y))
        
    while queue_r:
        cx, cy = queue_r.popleft()
        current_dist = dist_grid_r[cy][cx]
        current_label = label_grid_r[cy][cx]
        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < rw and 0 <= ny < rh:
                if dist_grid_r[ny][nx] > current_dist + 1:
                    dist_grid_r[ny][nx] = current_dist + 1
                    label_grid_r[ny][nx] = current_label
                    queue_r.append((nx, ny))
                    
    right_arm_absolute_mask = set()
    for y in range(rh):
        for x in range(rw):
            r, g, b, a = raw_pixels_r[x, y]
            if a == 0:
                continue
            if label_grid_r[y][x] == 'ARM':
                right_pixels[x, y] = (r, g, b, a)
                right_arm_absolute_mask.add((x + box_right_hand[0], y + box_right_hand[1]))
                
    # Draw perfect completed rounded shoulder joint at right pivot (39, 170)
    right_draw_joint = ImageDraw.Draw(right_hand)
    pivot_r = (39, 170)
    radius_r = 32
    right_draw_joint.ellipse(
        [pivot_r[0] - radius_r, pivot_r[1] - radius_r, pivot_r[0] + radius_r, pivot_r[1] + radius_r],
        fill=dress_red
    )
    right_hand.save(os.path.join(folder, "xinxin_right_hand_v5.png"), "PNG")
    print("Right hand completed and saved!")
    
    # --- LEGS ---
    print("Step 5: Cropping, cleaning and extending legs upwards...")
    legs_raw = img_transparent.crop(box_legs)
    legw, legh = legs_raw.size
    leg_pixels = legs_raw.load()
    
    print("  - Clearing the enclosed white space between legs...")
    visited_leg = [[False for _ in range(legw)] for _ in range(legh)]
    queue_leg = [(146, 105)]
    visited_leg[105][146] = True
    
    target_color = (255, 255, 255)
    tol_leg = 30
    
    cleared_gap_count = 0
    while queue_leg:
        cx, cy = queue_leg.pop(0)
        leg_pixels[cx, cy] = (0, 0, 0, 0)
        cleared_gap_count += 1
        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < legw and 0 <= ny < legh:
                if not visited_leg[ny][nx]:
                    r, g, b, a = leg_pixels[nx, ny]
                    if a > 0:
                        if abs(r - target_color[0]) <= tol_leg and abs(g - target_color[1]) <= tol_leg and abs(b - target_color[2]) <= tol_leg:
                            visited_leg[ny][nx] = True
                            queue_leg.append((nx, ny))
    print(f"  - Cleared {cleared_gap_count} white gap pixels!")
    
    print("  - Projecting robust leg columns upwards and clearing empty spaces...")
    source_y = 50
    left_source = [leg_pixels[x, source_y] for x in range(76, 139)]
    right_source = [leg_pixels[x, source_y] for x in range(152, 221)]
    
    for y in range(0, source_y + 1):
        for x in range(legw):
            if 76 <= x <= 138:
                leg_pixels[x, y] = left_source[x - 76]
            elif 152 <= x <= 220:
                leg_pixels[x, y] = right_source[x - 152]
            else:
                leg_pixels[x, y] = (0, 0, 0, 0)
                
    legs_raw.save(os.path.join(folder, "xinxin_legs_v5.png"), "PNG")
    print("Legs completed and saved!")
    
    # --- BODY BASE ---
    print("Step 6: Generating clean inpainted body base template...")
    body_base = img_transparent.copy()
    base_pixels = body_base.load()
    
    # 6A. Erase flame and inpaint solid helmet crown
    print("  - Erasing flame and inpainting solid helmet crown...")
    for y in range(0, 180):
        for x in range(width):
            base_pixels[x, y] = (0, 0, 0, 0)
    helmet_rim_color = (50, 33, 10, 255)
    for x in range(width):
        if 240 <= x <= 500:
            val = (x - 370) / 130.0
            y_top = int(185 + 7 * val + 14 * (val ** 2))
            for y in range(180, y_top):
                base_pixels[x, y] = (0, 0, 0, 0)
            for y in range(y_top, 215):
                base_pixels[x, y] = helmet_rim_color
        else:
            for y in range(180, 215):
                base_pixels[x, y] = (0, 0, 0, 0)
                
    # 6B. Erase legs on body base below skirt (y >= 831)
    print("  - Erasing leg sticks and platform from body base...")
    for y in range(831, height):
        for x in range(width):
            if 218 <= x <= 509:
                base_pixels[x, y] = (0, 0, 0, 0)
                
    # 6C. Fill eye regions with skin-tone
    for rect in [box_left_eye, box_right_eye]:
        for x in range(rect[0], rect[2]):
            for y in range(rect[1], rect[3]):
                if 0 <= x < width and 0 <= y < height:
                    _, _, _, a = base_pixels[x, y]
                    if a > 0:
                        base_pixels[x, y] = skin_tone
                        
    # 6D. Cleanly remove/inpaint arms using our precision proximity masks!
    print("  - Removing outer sleeves and inpainting hands/cheeks on the body base...")
    
    # Erase/Inpaint Left Arm pixels
    for x, y in left_arm_absolute_mask:
        if 0 <= x < width and 0 <= y < height:
            if x < 230:
                base_pixels[x, y] = (0, 0, 0, 0) # Erase sleeve
            else:
                if y < 710:
                    base_pixels[x, y] = skin_tone # Inpaint cheek/neck collar
                else:
                    base_pixels[x, y] = dress_red  # Inpaint dress
                    
    # Erase/Inpaint Right Arm pixels
    for x, y in right_arm_absolute_mask:
        if 0 <= x < width and 0 <= y < height:
            if x > 500:
                base_pixels[x, y] = (0, 0, 0, 0) # Erase sleeve
            else:
                if y < 710:
                    base_pixels[x, y] = skin_tone # Inpaint cheek/neck collar
                else:
                    base_pixels[x, y] = dress_red  # Inpaint dress
                    
    # Perform clean torso flare erase for y >= 700 to ensure no jagged arm remnants remain outside
    for y in range(700, 801):
        x_left = int(240 + (y - 600) * (276 - 240) / 200.0)
        x_right = int(490 - (y - 600) * (490 - 467) / 200.0)
        for x in range(width):
            if x < x_left or x > x_right:
                _, _, _, a = base_pixels[x, y]
                if a > 0:
                    base_pixels[x, y] = (0, 0, 0, 0)
                    
    # Draw perfect completed shoulder joints backing circles (radius 32) on body base
    draw_base = ImageDraw.Draw(body_base)
    draw_base.ellipse([350 - 32, 770 - 32, 350 + 32, 770 + 32], fill=dress_red)
    draw_base.ellipse([379 - 32, 770 - 32, 379 + 32, 770 + 32], fill=dress_red)
    
    # Reconstruct/Draw complete smooth round face cheek outlines to bridge the face perfectly!
    print("  - Drawing reconstructed face cheek outlines...")
    for y in range(650, 696):
        val = (y - 650) / 45.0
        # Left cheek curve
        x_l = int(200 + 80 * val + 35 * val * (1 - val))
        draw_base.ellipse([x_l - 4, y - 4, x_l + 4, y + 4], fill=outline_color)
        
        # Right cheek curve (symmetrical!)
        x_r = width - x_l
        draw_base.ellipse([x_r - 4, y - 4, x_r + 4, y + 4], fill=outline_color)
        
    body_base.save(os.path.join(folder, "xinxin_body_base_v5.png"), "PNG")
    print("xinxin_body_base_v5.png created!")
    
print("\n🎉 ALL SEAMLESS, DETACHED AND STUCK-FACE mascot LAYERS SUCCESSFULLY GENERATED!")
sys.exit(0)

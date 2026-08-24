import os
sys = __import__('sys')
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
    
    # Define crop boxes
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
                    
    fire_img.save(os.path.join(folder, "xinxin_fire_v6.png"), "PNG")
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
        
    make_eye_transparent(left_eye).save(os.path.join(folder, "xinxin_left_eye_v6.png"), "PNG")
    make_eye_transparent(right_eye).save(os.path.join(folder, "xinxin_right_eye_v6.png"), "PNG")
    print("Eyes saved!")
    
    # --- HANDS ---
    print("Step 4: Segmenting left and right hands with optimized distance transform and coordinate/skin component filters...")
    orange_sleeve_color = (216, 146, 67, 255)
    skin_tone = (246, 225, 199, 255)
    outline_color = (53, 32, 7, 255)
    
    xc, yc, a_rad, b_rad = 355, 536, 199, 174 # Face ellipse parameters
    
    # --- LEFT HAND ---
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
    face_skin_l = set(components_l_sorted[0])
    hand_skin_l = set(components_l_sorted[1])
    
    # Left Arm Bounded BFS Distance Transform (Threshold 24)
    closest_source_l = {}
    queue_bfs = deque()
    for sx, sy in hand_skin_l:
        closest_source_l[(sx, sy)] = (sx, sy)
        queue_bfs.append((sx, sy))
        
    while queue_bfs:
        cx, cy = queue_bfs.popleft()
        sx, sy = closest_source_l[(cx, cy)]
        for dx, dy in [(-1,0), (1,0), (0,-1), (0,1), (-1,-1), (-1,1), (1,-1), (1,1)]:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < lw and 0 <= ny < lh:
                dist = math.sqrt((nx - sx)**2 + (ny - sy)**2)
                if dist <= 24:
                    if (nx, ny) not in closest_source_l:
                        closest_source_l[(nx, ny)] = (sx, sy)
                        queue_bfs.append((nx, ny))
                    else:
                        osx, osy = closest_source_l[(nx, ny)]
                        odist = math.sqrt((nx - osx)**2 + (ny - osy)**2)
                        if dist < odist:
                            closest_source_l[(nx, ny)] = (sx, sy)
                            queue_bfs.append((nx, ny))
                            
    left_arm_absolute_mask = set()
    left_hand_canvas = Image.new("RGBA", (lw, lh), (0, 0, 0, 0))
    l_pixels = left_hand_canvas.load()
    
    # Define Core Hand Pixels (Strictly no red blush hearts! Restricted to x_abs < 340 to exclude central dress)
    core_l = set()
    for y in range(lh):
        for x in range(lw):
            r, g, b, a = pixels_l[x, y]
            if a == 0:
                continue
            
            # Skin tone check
            is_hand_skin = (x, y) in hand_skin_l
            
            # Orange sleeve check (exclude central dress torso by restricting to x_abs < 340)
            is_orange = (180 <= r <= 245 and 110 <= g <= 175 and 40 <= b <= 105)
            x_abs = x + box_left_hand[0]
            
            # Red is EXCLUDED entirely to prevent grabbing cheek blush hearts
            
            if is_hand_skin or (is_orange and x_abs < 340):
                core_l.add((x, y))
                
    # Find all outline pixels near the hand core
    for y in range(lh):
        for x in range(lw):
            r, g, b, a = pixels_l[x, y]
            if a == 0:
                continue
                
            if (x, y) in core_l:
                l_pixels[x, y] = (r, g, b, a)
                left_arm_absolute_mask.add((x + box_left_hand[0], y + box_left_hand[1]))
            else:
                # Is it a dark-brown outline?
                is_outline = (r < 100 and g < 75 and b < 55)
                if is_outline:
                    # Check if any neighbor in 7x7 is in core_l (Chebychev distance <= 3)
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
                        l_pixels[x, y] = (r, g, b, a)
                        left_arm_absolute_mask.add((x + box_left_hand[0], y + box_left_hand[1]))
                        
    # Draw perfect rotating joint in orange-brown color (216, 146, 67)
    left_draw_joint = ImageDraw.Draw(left_hand_canvas)
    pivot_l = (269, 170)
    radius_l = 32
    left_draw_joint.ellipse(
        [pivot_l[0] - radius_l, pivot_l[1] - radius_l, pivot_l[0] + radius_l, pivot_l[1] + radius_l],
        fill=orange_sleeve_color
    )
    left_hand_canvas.save(os.path.join(folder, "xinxin_left_hand_v6.png"), "PNG")
    print("Left hand completed and saved!")
    
    # --- RIGHT HAND ---
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
    face_skin_r = set(components_r_sorted[0])
    hand_skin_r = set(components_r_sorted[1])
    
    # Right Arm Bounded BFS Distance Transform (Threshold 24)
    closest_source_r = {}
    queue_bfs = deque()
    for sx, sy in hand_skin_r:
        closest_source_r[(sx, sy)] = (sx, sy)
        queue_bfs.append((sx, sy))
        
    while queue_bfs:
        cx, cy = queue_bfs.popleft()
        sx, sy = closest_source_r[(cx, cy)]
        for dx, dy in [(-1,0), (1,0), (0,-1), (0,1), (-1,-1), (-1,1), (1,-1), (1,1)]:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < rw and 0 <= ny < rh:
                dist = math.sqrt((nx - sx)**2 + (ny - sy)**2)
                if dist <= 24:
                    if (nx, ny) not in closest_source_r:
                        closest_source_r[(nx, ny)] = (sx, sy)
                        queue_bfs.append((nx, ny))
                    else:
                        osx, osy = closest_source_r[(nx, ny)]
                        odist = math.sqrt((nx - osx)**2 + (ny - osy)**2)
                        if dist < odist:
                            closest_source_r[(nx, ny)] = (sx, sy)
                            queue_bfs.append((nx, ny))
                            
    right_arm_absolute_mask = set()
    right_hand_canvas = Image.new("RGBA", (rw, rh), (0, 0, 0, 0))
    r_pixels = right_hand_canvas.load()
    
    # Define Core Hand Pixels (Strictly no red blush hearts! Restricted to x_abs > 390 to exclude central dress)
    core_r = set()
    for y in range(rh):
        for x in range(rw):
            r, g, b, a = pixels_r[x, y]
            if a == 0:
                continue
            
            # Skin tone check
            is_hand_skin = (x, y) in hand_skin_r
            
            # Orange sleeve check (exclude central dress torso by restricting to x_abs > 390)
            is_orange = (180 <= r <= 245 and 110 <= g <= 175 and 40 <= b <= 105)
            x_abs = x + box_right_hand[0]
            
            # Red is EXCLUDED entirely to prevent grabbing cheek blush hearts
            
            if is_hand_skin or (is_orange and x_abs > 390):
                core_r.add((x, y))
                
    # Find all outline pixels near the hand core
    for y in range(rh):
        for x in range(rw):
            r, g, b, a = pixels_r[x, y]
            if a == 0:
                continue
                
            if (x, y) in core_r:
                r_pixels[x, y] = (r, g, b, a)
                right_arm_absolute_mask.add((x + box_right_hand[0], y + box_right_hand[1]))
            else:
                # Is it a dark-brown outline?
                is_outline = (r < 100 and g < 75 and b < 55)
                if is_outline:
                    # Check if any neighbor in 7x7 is in core_r (Chebychev distance <= 3)
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
                        r_pixels[x, y] = (r, g, b, a)
                        right_arm_absolute_mask.add((x + box_right_hand[0], y + box_right_hand[1]))
                        
    # Draw perfect rotating joint in orange-brown color (216, 146, 67)
    right_draw_joint = ImageDraw.Draw(right_hand_canvas)
    pivot_r = (39, 170)
    radius_r = 32
    right_draw_joint.ellipse(
        [pivot_r[0] - radius_r, pivot_r[1] - radius_r, pivot_r[0] + radius_r, pivot_r[1] + radius_r],
        fill=orange_sleeve_color
    )
    right_hand_canvas.save(os.path.join(folder, "xinxin_right_hand_v6.png"), "PNG")
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
                
    legs_raw.save(os.path.join(folder, "xinxin_legs_v6.png"), "PNG")
    print("Legs saved!")
    
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
                        
    # 6D. Cleanly remove left and right arms (Without touching the cheek blush hearts!)
    print("  - Erasing Left and Right arms from body base...")
    for x, y in left_arm_absolute_mask:
        if 0 <= x < width and 0 <= y < height:
            base_pixels[x, y] = (0, 0, 0, 0)
            
    for x, y in right_arm_absolute_mask:
        if 0 <= x < width and 0 <= y < height:
            base_pixels[x, y] = (0, 0, 0, 0)
            
    # Note: Step 6D_heart (which erased red hearts from cheeks) is completely REMOVED in v17!
    # This keeps the two big blush hearts perfectly static and intact on her cheeks!
            
    # 6E. Inpaint and draw face skin in the transparent regions of the cheeks/face ellipse
    print("  - Reconstructing face skin and cheeks inside the face ellipse...")
    for y in range(530, 750):
        for x in range(width):
            val = ((x - xc) / a_rad) ** 2 + ((y - yc) / b_rad) ** 2
            if val <= 1.0:
                r, g, b, a = base_pixels[x, y]
                # Fill only if it is transparent or semi-transparent
                if a < 255:
                    base_pixels[x, y] = skin_tone
                    
    # 6F. Draw reconstructed smooth round face contour/outline along the face ellipse
    print("  - Drawing clean round face outlines on cheeks...")
    draw_base = ImageDraw.Draw(body_base)
    for y in range(580, 712):
        val = 1.0 - ((y - yc) / b_rad) ** 2
        if val >= 0:
            x_offset = a_rad * math.sqrt(val)
            xl = int(round(xc - x_offset))
            xr = int(round(xc + x_offset))
            
            # Left cheek outline
            draw_base.ellipse([xl - 4, y - 4, xl + 4, y + 4], fill=outline_color)
            # Right cheek outline
            draw_base.ellipse([xr - 4, y - 4, xr + 4, y + 4], fill=outline_color)
            
    # 6G. Draw orange-brown joint backing circles on body base (radius 32)
    print("  - Drawing perfect backing circles for pivots on body base...")
    draw_base.ellipse([350 - 32, 770 - 32, 350 + 32, 770 + 32], fill=orange_sleeve_color)
    draw_base.ellipse([379 - 32, 770 - 32, 379 + 32, 770 + 32], fill=orange_sleeve_color)
    
    # 6H. Restore the red chest heart (including white text "Fai." and black outline) in the center of her dress/chest
    print("  - Restoring the red chest heart in the center of her dress with 'Fai.' text and black outlines...")
    chest_heart_pixels = set()
    for y in range(738, 811):
        for x in range(316, 423):
            r, g, b, a = pixels[x, y]
            if a > 0:
                is_red = (r > 120 and g < 105 and b < 105)
                is_white = (r > 180 and g > 180 and b > 180)
                if is_red or is_white:
                    chest_heart_pixels.add((x, y))
                    
    # Expand to capture dark outlines around the red/white chest heart
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
                            is_white_too = (r > 180 and g > 180 and b > 180)
                            if is_outline or is_red_too or is_white_too:
                                visited_heart.add((nx, ny))
                                depths_heart[(nx, ny)] = cd + 1
                                queue_heart.append((nx, ny))
                                heart_all_pixels.add((nx, ny))
                                
    # Write these chest heart pixels back onto body_base
    for x, y in heart_all_pixels:
        base_pixels[x, y] = pixels[x, y]
        
    body_base.save(os.path.join(folder, "xinxin_body_base_v6.png"), "PNG")
    print("xinxin_body_base_v6.png completed successfully with chest heart and 'Fai.' text restored!")

print("\n🎉 MASCOT LAYERS SUCCESSFULLY RE-GENERATED FLAWLESSLY WITH PERFECT CHEST HEART RESTORATION (VERSION V6)!")
sys.exit(0)

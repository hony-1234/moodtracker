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
    tol = 30 # high tolerance to clear any off-white compression artifacts
    
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
    box_fire = [171, 50, 593, 260] # Made taller (down to 260) to allow a continuous bottom apron
    box_left_hand = [81, 600, 400, 800]      
    box_right_hand = [340, 600, 631, 800]    
    box_legs = [218, 760, 509, 955]          
    box_left_eye = [260, 470, 325, 580]
    box_right_eye = [430, 470, 490, 580]
    
    # --- FIRE (FLAME WITH CONTINUOUS APRON) ---
    print("Step 2: Cropping, cleaning and extending fire flame...")
    fire_img = img_transparent.crop(box_fire)
    fire_pixels = fire_img.load()
    fw, fh = fire_img.size
    
    # Erase helmet pixels on the left/right sides to prevent double outlines peeking out
    # but keep and propagate the flame colors downwards to create a beautiful continuous apron
    for x in range(fw):
        bottom_flame_y = -1
        for y in range(fh):
            r, g, b, a = fire_pixels[x, y]
            if a > 0:
                is_brown = (r < 150 and g < 130 and b < 100) # helmet color
                is_flame = (r > 150 and g > 50) # red, orange, yellow
                if is_flame and not is_brown:
                    bottom_flame_y = y
        
        if bottom_flame_y != -1:
            # Propagate the flame color at bottom_flame_y all the way to the bottom of the image
            r_prop, g_prop, b_prop, a_prop = fire_pixels[x, bottom_flame_y]
            for y in range(bottom_flame_y + 1, fh):
                fire_pixels[x, y] = (r_prop, g_prop, b_prop, a_prop)
        else:
            for y in range(fh):
                fire_pixels[x, y] = (0, 0, 0, 0)
                
    fire_img.save(os.path.join(folder, "xinxin_fire_v7.png"), "PNG")
    print("Fire saved as xinxin_fire_v7.png with continuous apron!")
    
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
        
    make_eye_transparent(left_eye).save(os.path.join(folder, "xinxin_left_eye_v7.png"), "PNG")
    make_eye_transparent(right_eye).save(os.path.join(folder, "xinxin_right_eye_v7.png"), "PNG")
    print("Eyes saved as _v7.png!")
    
    # --- HANDS & ARMS SEGMENTATION (FACE ELLIPSE AND CONNECTED COMPONENTS) ---
    print("Step 4: Segmenting left and right arms to fully isolate from body torso and cheek skin...")
    
    # Face ellipse parameters
    xc, yc, a_rad, b_rad = 355, 536, 199, 174
    
    # --- LEFT ARM ---
    lw, lh = box_left_hand[2] - box_left_hand[0], box_left_hand[3] - box_left_hand[1]
    pixels_l = img_transparent.crop(box_left_hand).load()
    
    # Find skin tone components
    skin_pixels_l = []
    skin_set_l = set()
    for y in range(lh):
        for x in range(lw):
            r, g, b, a = pixels_l[x, y]
            is_skin = (abs(r - 246) < 22 and abs(g - 225) < 22 and abs(b - 199) < 22) and a > 0
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
    hand_skin_l = set(components_l_sorted[1]) # Second largest skin component is the left hand skin
    
    core_l = set()
    for y in range(lh):
        for x in range(lw):
            r, g, b, a = pixels_l[x, y]
            if a == 0:
                continue
            x_abs = x + box_left_hand[0]
            y_abs = y + box_left_hand[1]
            val = ((x_abs - xc) / a_rad)**2 + ((y_abs - yc) / b_rad)**2
            
            if val <= 1.0: # Exclude face ellipse
                continue
                
            is_hand_skin = (x, y) in hand_skin_l
            is_orange = (180 <= r <= 245 and 110 <= g <= 175 and 40 <= b <= 105)
            
            if is_hand_skin or (is_orange and x_abs < 340):
                core_l.add((x, y))
                
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
            is_outline = (r < 110 and g < 80 and b < 60)
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
                    
    left_hand_canvas = Image.new("RGBA", (lw, lh), (0, 0, 0, 0))
    l_pixels_canvas = left_hand_canvas.load()
    for x, y in final_l:
        l_pixels_canvas[x, y] = pixels_l[x, y]
    left_hand_canvas.save(os.path.join(folder, "xinxin_left_hand_v7.png"), "PNG")
    print("Left arm layer isolated perfectly and saved!")
    
    # --- RIGHT ARM ---
    rw, rh = box_right_hand[2] - box_right_hand[0], box_right_hand[3] - box_right_hand[1]
    pixels_r = img_transparent.crop(box_right_hand).load()
    
    skin_pixels_r = []
    skin_set_r = set()
    for y in range(rh):
        for x in range(rw):
            r, g, b, a = pixels_r[x, y]
            is_skin = (abs(r - 246) < 22 and abs(g - 225) < 22 and abs(b - 199) < 22) and a > 0
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
    hand_skin_r = set(components_r_sorted[1]) # Second largest skin component is the right hand skin
    
    core_r = set()
    for y in range(rh):
        for x in range(rw):
            r, g, b, a = pixels_r[x, y]
            if a == 0:
                continue
            x_abs = x + box_right_hand[0]
            y_abs = y + box_right_hand[1]
            val = ((x_abs - xc) / a_rad)**2 + ((y_abs - yc) / b_rad)**2
            
            if val <= 1.0: # Exclude face ellipse
                continue
                
            is_hand_skin = (x, y) in hand_skin_r
            is_orange = (180 <= r <= 245 and 110 <= g <= 175 and 40 <= b <= 105)
            
            if is_hand_skin or (is_orange and x_abs > 390):
                core_r.add((x, y))
                
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
            is_outline = (r < 110 and g < 80 and b < 60)
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
                    
    right_hand_canvas = Image.new("RGBA", (rw, rh), (0, 0, 0, 0))
    r_pixels_canvas = right_hand_canvas.load()
    for x, y in final_r:
        r_pixels_canvas[x, y] = pixels_r[x, y]
    right_hand_canvas.save(os.path.join(folder, "xinxin_right_hand_v7.png"), "PNG")
    print("Right arm layer isolated perfectly and saved!")
    
    # --- LEGS ---
    print("Step 5: Cropping, cleaning and extending legs upwards...")
    legs_raw = img_transparent.crop(box_legs)
    legw, legh = legs_raw.size
    leg_pixels = legs_raw.load()
    
    visited_leg = [[False for _ in range(legw)] for _ in range(legh)]
    queue_leg = [(146, 105)] # center gap coordinate inside leg box to clear the white filling
    visited_leg[105][146] = True
    
    target_color = (255, 255, 255)
    tol_leg = 30
    
    while queue_leg:
        cx, cy = queue_leg.pop(0)
        leg_pixels[cx, cy] = (0, 0, 0, 0)
        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < legw and 0 <= ny < legh:
                if not visited_leg[ny][nx]:
                    r, g, b, a = leg_pixels[nx, ny]
                    if a > 0:
                        if abs(r - target_color[0]) <= tol_leg and abs(g - target_color[1]) <= tol_leg and abs(b - target_color[2]) <= tol_leg:
                            visited_leg[ny][nx] = True
                            queue_leg.append((nx, ny))
                            
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
                
    left_leg_img = legs_raw.copy()
    left_leg_pixels = left_leg_img.load()
    right_leg_img = legs_raw.copy()
    right_leg_pixels = right_leg_img.load()
    
    for y in range(legh):
        for x in range(146, legw):
            left_leg_pixels[x, y] = (0, 0, 0, 0)
            
    for y in range(legh):
        for x in range(0, 146):
            right_leg_pixels[x, y] = (0, 0, 0, 0)
            
    left_leg_img.save(os.path.join(folder, "xinxin_left_leg_v7.png"), "PNG")
    right_leg_img.save(os.path.join(folder, "xinxin_right_leg_v7.png"), "PNG")
    print("Left and right legs split and saved as _v7.png!")
    
    # --- BODY BASE (WITH PERFECT PIXEL-LEVEL INPAINTING) ---
    print("Step 6: Generating clean inpainted body base template...")
    body_base = img_transparent.copy()
    base_pixels = body_base.load()
    
    # 6A. Erase flame cleanly by clearing pixels at y < 212
    print("  - Erasing flame above y = 212...")
    for y in range(0, 212):
        for x in range(width):
            base_pixels[x, y] = (0, 0, 0, 0)
                
    # 6B. Erase legs on body base below skirt (y >= 831)
    print("  - Erasing leg sticks and platform from body base...")
    for y in range(831, height):
        for x in range(width):
            if 218 <= x <= 509:
                base_pixels[x, y] = (0, 0, 0, 0)
                
    # 6C. Fill eye regions with skin-tone
    skin_tone = (246, 225, 199, 255)
    for rect in [box_left_eye, box_right_eye]:
        for x in range(rect[0], rect[2]):
            for y in range(rect[1], rect[3]):
                if 0 <= x < width and 0 <= y < height:
                    _, _, _, a = base_pixels[x, y]
                    if a > 0:
                        base_pixels[x, y] = skin_tone
                        
    # 6D. Cleanly remove left and right arms from body base using absolute masks
    print("  - Erasing entire left/right arm and shadow regions from body base...")
    
    # Convert local arm coordinates to absolute canvas coordinates
    left_arm_absolute_mask = {(x + box_left_hand[0], y + box_left_hand[1]) for x, y in final_l}
    right_arm_absolute_mask = {(x + box_right_hand[0], y + box_right_hand[1]) for x, y in final_r}
    arm_erased_mask = left_arm_absolute_mask | right_arm_absolute_mask
    
    # Dilate the arm erased mask slightly (by 2 pixels) to avoid outline bleeding
    dilated_arm_erased_mask = set(arm_erased_mask)
    for x, y in arm_erased_mask:
        for dy in range(-2, 3):
            for dx in range(-2, 3):
                nx, ny = x + dx, y + dy
                if 0 <= nx < width and 0 <= ny < height:
                    dilated_arm_erased_mask.add((nx, ny))
                    
    # Erase the dilated arm pixels from the body base
    for x, y in dilated_arm_erased_mask:
        if 0 <= x < width and 0 <= y < height:
            base_pixels[x, y] = (0, 0, 0, 0)
            
    # Compile a solid body silhouette to act as known pixels for color propagation
    solid_silhouette = set()
    for y in range(height):
        for x in range(width):
            r, g, b, a = img_transparent.getpixel((x, y))
            if a > 0:
                is_off_white = (r > 240 and g > 240 and b > 240)
                if not is_off_white:
                    solid_silhouette.add((x, y))
                    
    # Known solid pixels are non-erased pixels in the solid silhouette
    known_pixels = solid_silhouette - dilated_arm_erased_mask
    
    # Target inpaint pixels are erased pixels that are solid in the original mascot
    target_inpaint = dilated_arm_erased_mask & solid_silhouette
    
    # Propagate colors from the clean cheeks and torso into the transparent erased arm regions
    print("  - Propagating clean colors into erased regions (100% smooth, no outline ghosting)...")
    Q = deque()
    color_map = {}
    visited = set()
    
    for kx, ky in known_pixels:
        if not (0 <= kx < width and 0 <= ky < height):
            continue
        r, g, b, a = base_pixels[kx, ky]
        if a == 0:
            continue
            
        # Exclude red hearts as color sources to prevent red bleeding into cheeks
        is_red = (r > 120 and g < 105 and b < 105)
        # Exclude outline pixels as initial color sources to prevent black outlines from bleeding
        is_outline = (r < 110 and g < 80 and b < 60)
        
        if is_red or is_outline:
            continue
            
        for dx, dy in [(-1,0), (1,0), (0,-1), (0,1), (-1,-1), (-1,1), (1,-1), (1,1)]:
            nx, ny = kx + dx, ky + dy
            if 0 <= nx < width and 0 <= ny < height:
                if (nx, ny) in target_inpaint and (nx, ny) not in visited:
                    visited.add((nx, ny))
                    color_map[(nx, ny)] = (r, g, b, a)
                    Q.append((nx, ny))
                    
    while Q:
        cx, cy = Q.popleft()
        curr_color = color_map[(cx, cy)]
        
        for dx, dy in [(-1,0), (1,0), (0,-1), (0,1), (-1,-1), (-1,1), (1,-1), (1,1)]:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < width and 0 <= ny < height:
                if (nx, ny) in target_inpaint and (nx, ny) not in visited:
                    visited.add((nx, ny))
                    color_map[(nx, ny)] = curr_color
                    Q.append((nx, ny))
                    
    # Apply the beautiful, clean propagated colors to body base
    for (x, y), color in color_map.items():
        base_pixels[x, y] = color
        
    # Safety fallback only for pixels in target_inpaint
    for x, y in target_inpaint:
        r, g, b, a = base_pixels[x, y]
        if a == 0:
            if y < 720:
                base_pixels[x, y] = skin_tone
            else:
                base_pixels[x, y] = (216, 146, 67, 255) # orange dress
                    
    # 6E. Restore the red chest heart in the center of her dress (fully centered and outline intact)
    print("  - Restoring the red chest heart in the center of her dress...")
    chest_heart_pixels = set()
    for y in range(738, 811):
        for x in range(316, 423):
            r, g, b, a = img_transparent.getpixel((x, y))
            if a > 0:
                is_red = (r > 120 and g < 105 and b < 105)
                is_white = (r > 180 and g > 180 and b > 180)
                if is_red or is_white:
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
                        r, g, b, a = img_transparent.getpixel((nx, ny))
                        if a > 0:
                            is_outline = (r < 110 and g < 80 and b < 60)
                            is_red_too = (r > 120 and g < 105 and b < 105)
                            is_white_too = (r > 180 and g > 180 and b > 180)
                            if is_outline or is_red_too or is_white_too:
                                visited_heart.add((nx, ny))
                                depths_heart[(nx, ny)] = cd + 1
                                queue_heart.append((nx, ny))
                                heart_all_pixels.add((nx, ny))
                                
    for x, y in heart_all_pixels:
        base_pixels[x, y] = img_transparent.getpixel((x, y))
        
    body_base.save(os.path.join(folder, "xinxin_body_base_v7.png"), "PNG")
    print("xinxin_body_base_v7.png completed successfully with body image, chest heart, and 'Fai.' text fully restored!")

print("\n🎉 MASCOT LAYERS PIXEL-PERFECTLY RE-GENERATED FOR V7!")

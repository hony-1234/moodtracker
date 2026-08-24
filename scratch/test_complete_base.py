import os
import sys
from PIL import Image, ImageDraw

sys.stdout.reconfigure(encoding='utf-8')

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"
img_path = os.path.join(folder, "信信-01.png")

with Image.open(img_path) as img:
    img = img.convert("RGBA")
    width, height = img.size
    
    # Let's clone the transparent image first
    img_transparent = img.copy()
    pixels = img_transparent.load()
    
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
                        
    # Now let's perform Left and Right Hand extraction to get the masks
    box_l = [81, 600, 400, 800]
    cropped_l = img_transparent.crop(box_l)
    lw, lh = cropped_l.size
    pix_l = cropped_l.load()
    
    skin_pixels = []
    skin_set = set()
    for y in range(lh):
        for x in range(lw):
            r, g, b, a = pix_l[x, y]
            is_skin = (abs(r - 246) < 20 and abs(g - 225) < 20 and abs(b - 199) < 20) and a > 0
            if is_skin:
                skin_pixels.append((x, y))
                skin_set.add((x, y))
                
    visited_set = set()
    components = []
    for p in skin_pixels:
        if p not in visited_set:
            comp = []
            queue = [p]
            visited_set.add(p)
            while queue:
                cx, cy = queue.pop(0)
                comp.append((cx, cy))
                for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (1, -1), (-1, 1), (1, 1)]:
                    nx, ny = cx + dx, cy + dy
                    if 0 <= nx < lw and 0 <= ny < lh:
                        if (nx, ny) in skin_set and (nx, ny) not in visited_set:
                            visited_set.add((nx, ny))
                            queue.append((nx, ny))
            components.append(comp)
    components_sorted = sorted(components, key=len, reverse=True)
    face_skin_l = set(components_sorted[0])
    hand_skin_l = set(components_sorted[1])
    
    arm_cores_l = set()
    face_cores_l = set()
    for y in range(lh):
        for x in range(lw):
            r, g, b, a = pix_l[x, y]
            if a == 0:
                continue
            is_red = (r > 150 and g < 100 and b < 100)
            if is_red or ((x, y) in hand_skin_l):
                arm_cores_l.add((x, y))
            elif ((x, y) in face_skin_l) or (y < 70 and x > 150 and not is_red):
                face_cores_l.add((x, y))
                
    # Classify Left Hand pixels
    left_arm_mask = set()
    arm_core_list_l = list(arm_cores_l)
    face_core_list_l = list(face_cores_l)
    
    for y in range(lh):
        for x in range(lw):
            r, g, b, a = pix_l[x, y]
            if a == 0:
                continue
            if (x, y) in arm_cores_l:
                left_arm_mask.add((x + box_l[0], y + box_l[1]))
                continue
            if (x, y) in face_cores_l:
                continue
                
            min_arm_dist = 999999
            for ax, ay in arm_core_list_l:
                dist = (x - ax)**2 + (y - ay)**2
                if dist < min_arm_dist:
                    min_arm_dist = dist
                    if min_arm_dist == 1:
                        break
            min_face_dist = 999999
            for fx, fy in face_core_list_l:
                dist = (x - fx)**2 + (y - fy)**2
                if dist < min_face_dist:
                    min_face_dist = dist
                    if min_face_dist == 1:
                        break
            if min_arm_dist < min_face_dist:
                left_arm_mask.add((x + box_l[0], y + box_l[1]))
                
    # ------------------ RIGHT HAND ------------------
    box_r = [340, 600, 631, 800]
    cropped_r = img_transparent.crop(box_r)
    rw, rh = cropped_r.size
    pix_r = cropped_r.load()
    
    skin_pixels_r = []
    skin_set_r = set()
    for y in range(rh):
        for x in range(rw):
            r, g, b, a = pix_r[x, y]
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
    components_r_sorted = sorted(components_r, key=len, reverse=True)
    face_skin_r = set(components_r_sorted[0])
    hand_skin_r = set(components_r_sorted[1])
    
    arm_cores_r = set()
    face_cores_r = set()
    for y in range(rh):
        for x in range(rw):
            r, g, b, a = pix_r[x, y]
            if a == 0:
                continue
            is_red = (r > 150 and g < 100 and b < 100)
            if is_red or ((x, y) in hand_skin_r):
                arm_cores_r.add((x, y))
            elif ((x, y) in face_skin_r) or (y < 70 and x < rw - 150 and not is_red):
                face_cores_r.add((x, y))
                
    right_arm_mask = set()
    arm_core_list_r = list(arm_cores_r)
    face_core_list_r = list(face_cores_r)
    
    for y in range(rh):
        for x in range(rw):
            r, g, b, a = pix_r[x, y]
            if a == 0:
                continue
            if (x, y) in arm_cores_r:
                right_arm_mask.add((x + box_r[0], y + box_r[1]))
                continue
            if (x, y) in face_cores_r:
                continue
                
            min_arm_dist = 999999
            for ax, ay in arm_core_list_r:
                dist = (x - ax)**2 + (y - ay)**2
                if dist < min_arm_dist:
                    min_arm_dist = dist
                    if min_arm_dist == 1:
                        break
            min_face_dist = 999999
            for fx, fy in face_core_list_r:
                dist = (x - fx)**2 + (y - fy)**2
                if dist < min_face_dist:
                    min_face_dist = dist
                    if min_face_dist == 1:
                        break
            if min_arm_dist < min_face_dist:
                right_arm_mask.add((x + box_r[0], y + box_r[1]))
                
    # Now let's construct the Body Base
    body_base = img_transparent.copy()
    base_pixels = body_base.load()
    
    skin_tone = (246, 225, 199, 255)
    dress_red = (176, 47, 34, 255)
    outline_color = (53, 32, 7, 255)
    
    # Erase flame and inpaint a solid, rounded helmet crown (standard)
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
                
    # Erase legs on body base below skirt (y >= 831)
    for y in range(831, height):
        for x in range(width):
            if 218 <= x <= 509:
                base_pixels[x, y] = (0, 0, 0, 0)
                
    # Fill eyes regions with skin tone
    for rect in [[260, 470, 325, 580], [430, 470, 490, 580]]:
        for x in range(rect[0], rect[2]):
            for y in range(rect[1], rect[3]):
                if 0 <= x < width and 0 <= y < height:
                    _, _, _, a = base_pixels[x, y]
                    if a > 0:
                        base_pixels[x, y] = skin_tone
                        
    # Now let's remove/inpaint the arms and hands using our masks!
    print("Inpainting Left Hand and Right Hand regions...")
    
    # We define the left hand's sleeve-erasure boundary and hand-inpaint boundary:
    # Any pixel in left_arm_mask:
    # - If x < 230: it's part of the outer arm sleeve, so erase it (set to transparent).
    # - If x >= 230: it's part of the hand or shoulder, so inpaint/fill it with skin tone (if y < 710) or dress_red (if y >= 710)!
    for x, y in left_arm_mask:
        if x < 230:
            base_pixels[x, y] = (0, 0, 0, 0)
        else:
            if y < 710:
                base_pixels[x, y] = skin_tone
            else:
                base_pixels[x, y] = dress_red
                
    # Any pixel in right_arm_mask:
    # - If x > 500: it's part of the outer arm sleeve, so erase it (set to transparent).
    # - If x <= 500: it's part of the hand or shoulder, so inpaint/fill it with skin tone (if y < 710) or dress_red (if y >= 710)!
    for x, y in right_arm_mask:
        if x > 500:
            base_pixels[x, y] = (0, 0, 0, 0)
        else:
            if y < 710:
                base_pixels[x, y] = skin_tone
            else:
                base_pixels[x, y] = dress_red
                
    # Also erase anything outside torso in the dress region for y >= 700 (clean torso flare)
    for y in range(700, 801):
        x_left = int(240 + (y - 600) * (276 - 240) / 200.0)
        x_right = int(490 - (y - 600) * (490 - 467) / 200.0)
        for x in range(width):
            if x < x_left or x > x_right:
                _, _, _, a = base_pixels[x, y]
                if a > 0:
                    base_pixels[x, y] = (0, 0, 0, 0)
                    
    # Draw perfect completed shoulder joints backing circles (radius 32) at (350, 770) and (379, 770)
    draw_base = ImageDraw.Draw(body_base)
    draw_base.ellipse([350 - 32, 770 - 32, 350 + 32, 770 + 32], fill=dress_red)
    draw_base.ellipse([379 - 32, 770 - 32, 379 + 32, 770 + 32], fill=dress_red)
    
    # Reconstruct/Draw complete smooth round face cheek outlines!
    # Let's draw a nice curved dark outline for the left face cheek from x=200, y=650 curving down-right to x=280, y=695.
    # And a curved dark outline for the right face cheek from x=530, y=650 curving down-left to x=450, y=695.
    # Let's use thick bezier-like lines or circles to trace a perfect round cheek.
    # For a perfect round cheek:
    # Left cheek outline: can be drawn as an arc or a series of small lines.
    # Let's see: we can interpolate between (200, 650) and (280, 695).
    # Since it is a round face, the contour curves outwards.
    # Let's write a simple curve:
    # Left curve: for y from 650 to 695:
    # val = (y - 650) / 45.0
    # x = 200 + 80 * val + 25 * val * (1 - val)   # slightly outward curve
    # We draw a line of width 8 (matching Xinxin's thick dark outline) with outline_color!
    print("Drawing reconstructed face cheek outlines...")
    for y in range(650, 696):
        val = (y - 650) / 45.0
        # Left cheek curve
        x_l = int(200 + 80 * val + 35 * val * (1 - val))
        # Draw a small filled circle at (x_l, y) with radius 4 to create a thick outline of width ~8-9px
        draw_base.ellipse([x_l - 4, y - 4, x_l + 4, y + 4], fill=outline_color)
        
        # Right cheek curve (symmetric to left!)
        # Right side starts at x=530, y=650 and goes to x=450, y=695
        # Center of face is x=365. 530 is 165px right of 365, 200 is 165px left of 365.
        # So right side is perfectly symmetric!
        # Let's make it mathematically symmetric:
        x_r = width - x_l  # since width is 730: 730 - x_l
        draw_base.ellipse([x_r - 4, y - 4, x_r + 4, y + 4], fill=outline_color)
        
    body_base.save(os.path.join(workspace_dir, "scratch", "body_base_reconstructed_test.png"), "PNG")
    print("Saved body_base_reconstructed_test.png")

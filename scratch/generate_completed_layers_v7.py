import os
import sys
from PIL import Image, ImageDraw

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
    box_fire = [171, 50, 593, 280]          
    box_left_hand = [81, 600, 364, 800]      
    box_right_hand = [366, 600, 631, 800]    
    box_legs = [218, 760, 509, 955]          
    box_left_eye = [260, 470, 325, 580]
    box_right_eye = [430, 470, 490, 580]
    
    # --- FIRE ---
    print("Step 2: Cropping, cleaning and saving fire flame...")
    fire_img = img_transparent.crop(box_fire)
    fire_pixels = fire_img.load()
    fw, fh = fire_img.size
    
    # Clear any helmet-colored pixels at the bottom of the flame box to keep flame isolated
    for y in range(fh):
        abs_y = box_fire[1] + y
        for x in range(fw):
            abs_x = box_fire[0] + x
            r, g, b, a = fire_pixels[x, y]
            if a > 0:
                # If it's helmet color (dark brown or light brown) at the bottom
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
    
    # --- LEFT HAND ---
    left_hand_raw = img_transparent.crop(box_left_hand)
    lw, lh = left_hand_raw.size
    left_mask = Image.new('L', (lw, lh), 0)
    left_draw_mask = ImageDraw.Draw(left_mask)
    left_polygon = [
        (0, 0),
        (120, 0),
        (270, 110),
        (270, 145),
        (150, 170),
        (0, 85)
    ]
    left_draw_mask.polygon(left_polygon, fill=255)
    left_hand = Image.new('RGBA', (lw, lh), (0,0,0,0))
    left_hand.paste(left_hand_raw, (0,0), mask=left_mask)
    
    # Inpaint completed rounded shoulder joint at left pivot (269, 170)
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
    right_mask = Image.new('L', (rw, rh), 0)
    right_draw_mask = ImageDraw.Draw(right_mask)
    right_polygon = [
        (rw, 0),
        (145, 0),
        (50, 110),
        (50, 150),
        (150, 175),
        (rw, 85)
    ]
    right_draw_mask.polygon(right_polygon, fill=255)
    right_hand = Image.new('RGBA', (rw, rh), (0,0,0,0))
    right_hand.paste(right_hand_raw, (0,0), mask=right_mask)
    
    # Inpaint completed rounded shoulder joint at right pivot (13, 170)
    right_draw_joint = ImageDraw.Draw(right_hand)
    pivot_r = (13, 170)
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
    
    # Clear the enclosed white gap between the legs
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
    
    # Project the ACTUAL leg columns upwards using clean skin tone row
    print("  - Projecting robust leg columns upwards and clearing empty spaces...")
    source_y = 50 # y = 810 in original image, clean skin tone row
    
    # Store source pixels first so we don't overwrite them during copying
    left_source = [leg_pixels[x, source_y] for x in range(76, 139)] # Left Leg width 63
    right_source = [leg_pixels[x, source_y] for x in range(152, 221)] # Right Leg width 69
    
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
    
    # 6A. Erase flame and inpaint a solid, rounded dark brown helmet crown
    print("  - Erasing flame and inpainting solid helmet crown...")
    
    # Erase everything above the helmet peak area (y < 180)
    for y in range(0, 180):
        for x in range(width):
            base_pixels[x, y] = (0, 0, 0, 0)
            
    # Draw mathematically rounded dark brown helmet crown inpaint (y = y_top(x) to 215)
    # y_top(x) = int(185 + 7 * ((x - 370) / 130) + 14 * ((x - 370) / 130) ** 2)
    helmet_rim_color = (50, 33, 10, 255)
    for x in range(width):
        if 240 <= x <= 500:
            val = (x - 370) / 130.0
            y_top = int(185 + 7 * val + 14 * (val ** 2))
            
            # Erase flame above the helmet curve
            for y in range(180, y_top):
                base_pixels[x, y] = (0, 0, 0, 0)
                
            # Inpaint/draw helmet crown curve down to 215 with solid dark brown
            for y in range(y_top, 215):
                base_pixels[x, y] = helmet_rim_color
        else:
            # Erase anything above 215 on the sides of the helmet
            for y in range(180, 215):
                base_pixels[x, y] = (0, 0, 0, 0)
                
    # 6B. Erase legs completely on the body base below the skirt (y >= 831)
    print("  - Erasing leg sticks and platform from body base (y >= 831 inside columns 218 to 509)...")
    for y in range(831, height):
        for x in range(width):
            if 218 <= x <= 509:
                base_pixels[x, y] = (0, 0, 0, 0)
            
    # 6C. Fill eye regions on body_base with skin-tone
    for rect in [box_left_eye, box_right_eye]:
        for x in range(rect[0], rect[2]):
            for y in range(rect[1], rect[3]):
                if 0 <= x < width and 0 <= y < height:
                    _, _, _, a = base_pixels[x, y]
                    if a > 0:
                        base_pixels[x, y] = skin_tone
                        
    # 6D. Cleanly remove arms and inpaint smooth flared torso
    print("  - Cleanly removing arms and inpainting smooth flared torso on body base...")
    for y in range(600, 801):
        # Calculate mathematically smooth flared torso boundaries
        x_left = int(240 + (y - 600) * (276 - 240) / 200.0)
        x_right = int(490 - (y - 600) * (490 - 467) / 200.0)
        
        for x in range(width):
            # We only modify pixels inside the left and right hand boxes horizontal spans
            is_inside_left_box = (box_left_hand[0] <= x < box_left_hand[2])
            is_inside_right_box = (box_right_hand[0] <= x < box_right_hand[2])
            
            if is_inside_left_box or is_inside_right_box:
                _, _, _, a = base_pixels[x, y]
                if a > 0:
                    if x < x_left or x > x_right:
                        # Outside the torso flare: completely erase the arm!
                        base_pixels[x, y] = (0, 0, 0, 0)
                    else:
                        # Inside the torso flare: fill with smooth background body colors
                        if y < 710:
                            base_pixels[x, y] = skin_tone
                        else:
                            base_pixels[x, y] = dress_red
                            
    body_base.save(os.path.join(folder, "xinxin_body_base_v5.png"), "PNG")
    print("xinxin_body_base_v5.png created!")

print("\n🎉 ALL SEAMLESS & COMPLETED LAYERS SUCCESSFULLY GENERATED!")
sys.exit(0)

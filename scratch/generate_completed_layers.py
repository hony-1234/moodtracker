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
    
    # 2. Crop parts from the transparent mascot template
    box_fire = [171, 50, 593, 250]
    box_left_hand = [81, 600, 364, 800]
    box_right_hand = [366, 600, 631, 800]
    box_legs = [218, 800, 509, 955]
    box_left_eye = [260, 470, 325, 580]
    box_right_eye = [430, 470, 490, 580]
    
    # --- FIRE ---
    print("Step 2: Cropping and saving fire flame...")
    img_transparent.crop(box_fire).save(os.path.join(folder, "xinxin_fire_v5.png"), "PNG")
    
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
    
    # --- HANDS ---
    print("Step 4: Segmenting, cropping and saving left and right hands...")
    # Apply tight diagonal polygon masks
    left_hand_raw = img_transparent.crop(box_left_hand)
    lw, lh = left_hand_raw.size
    left_mask = Image.new('L', (lw, lh), 0)
    left_draw = ImageDraw.Draw(left_mask)
    left_polygon = [
        (0, 0),
        (120, 0),
        (270, 110),
        (270, 145),
        (150, 170),
        (0, 85)
    ]
    left_draw.polygon(left_polygon, fill=255)
    left_hand = Image.new('RGBA', (lw, lh), (0,0,0,0))
    left_hand.paste(left_hand_raw, (0,0), mask=left_mask)
    left_hand.save(os.path.join(folder, "xinxin_left_hand_v5.png"), "PNG")
    print("Left hand segmented and saved!")
    
    right_hand_raw = img_transparent.crop(box_right_hand)
    rw, rh = right_hand_raw.size
    right_mask = Image.new('L', (rw, rh), 0)
    right_draw = ImageDraw.Draw(right_mask)
    right_polygon = [
        (rw, 0),
        (145, 0),
        (50, 110),
        (50, 150),
        (150, 175),
        (rw, 85)
    ]
    right_draw.polygon(right_polygon, fill=255)
    right_hand = Image.new('RGBA', (rw, rh), (0,0,0,0))
    right_hand.paste(right_hand_raw, (0,0), mask=right_mask)
    right_hand.save(os.path.join(folder, "xinxin_right_hand_v5.png"), "PNG")
    print("Right hand segmented and saved!")
    
    # --- LEGS ---
    print("Step 5: Cropping, cleaning and extending legs...")
    legs_raw = img_transparent.crop(box_legs)
    legw, legh = legs_raw.size
    leg_pixels = legs_raw.load()
    
    # Clear the enclosed white gap between the legs
    print("  - Clearing the enclosed white space between legs...")
    # BFS from (146, 65) which is a guaranteed white pixel in the gap
    visited_leg = [[False for _ in range(legw)] for _ in range(legh)]
    queue_leg = [(146, 65)]
    visited_leg[65][146] = True
    
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
    
    # Clear the red dress / yellow trim from row 0 to 22 (the skirt overlaps)
    print("  - Clearing dress overlap from upper legs layer...")
    for y in range(0, 23):
        for x in range(legw):
            r, g, b, a = leg_pixels[x, y]
            if a > 0:
                is_red_dress = (r > 120 and g < 90 and b < 90)
                is_yellow_trim = (r > 205 and g > 135 and b < 120)
                if is_red_dress or is_yellow_trim:
                    leg_pixels[x, y] = (0, 0, 0, 0)
                    
    # Extend the leg sticks upwards straight from Row 25 to Row 0
    # Left leg is around columns 85 to 145.
    # Right leg is around columns 165 to 225.
    print("  - Extending leg columns upwards to provide solid overlaps under the skirt...")
    source_y = 25 # use row 25 as the clean source
    for x in range(legw):
        # We check if it is part of the left leg or right leg stick
        if (80 <= x <= 145) or (165 <= x <= 225):
            src_pixel = leg_pixels[x, source_y]
            # Copy this vertical strip all the way up to y = 0
            for y in range(0, source_y):
                leg_pixels[x, y] = src_pixel
                
    legs_raw.save(os.path.join(folder, "xinxin_legs_v5.png"), "PNG")
    print("Legs completed and saved!")
    
    # --- BODY BASE ---
    print("Step 6: Generating solid inpainted body base template...")
    body_base = img_transparent.copy()
    base_pixels = body_base.load()
    
    skin_tone = (246, 225, 199, 255)
    dress_red = (176, 47, 34, 255)
    
    # Erase flame above helmet top (y < 100)
    for y in range(0, 100):
        for x in range(width):
            base_pixels[x, y] = (0, 0, 0, 0)
            
    # Erase legs below skirt bottom (y > 820)
    for y in range(821, height):
        for x in range(width):
            base_pixels[x, y] = (0, 0, 0, 0)
            
    # Fill eye regions on body_base with skin-tone
    for rect in [box_left_eye, box_right_eye]:
        for x in range(rect[0], rect[2]):
            for y in range(rect[1], rect[3]):
                if 0 <= x < width and 0 <= y < height:
                    _, _, _, a = base_pixels[x, y]
                    if a > 0:
                        base_pixels[x, y] = skin_tone
                        
    # Inpaint left hand box area (restrict to x >= 220 to preserve cheek heart)
    for x in range(box_left_hand[0], box_left_hand[2]):
        if x < 220:
            continue
        for y in range(box_left_hand[1], box_left_hand[3]):
            if 0 <= x < width and 0 <= y < height:
                _, _, _, a = base_pixels[x, y]
                if a > 0:
                    if y < 700:
                        base_pixels[x, y] = skin_tone
                    else:
                        base_pixels[x, y] = dress_red
                        
    # Inpaint right hand box area (restrict to x <= 510 to preserve cheek heart)
    for x in range(box_right_hand[0], box_right_hand[2]):
        if x > 510:
            continue
        for y in range(box_right_hand[1], box_right_hand[3]):
            if 0 <= x < width and 0 <= y < height:
                _, _, _, a = base_pixels[x, y]
                if a > 0:
                    if y < 700:
                        base_pixels[x, y] = skin_tone
                    else:
                        base_pixels[x, y] = dress_red
                        
    body_base.save(os.path.join(folder, "xinxin_body_base_v5.png"), "PNG")
    print("xinxin_body_base_v5.png created!")

print("\n🎉 ALL COMPLETED LAYERS SUCCESSFULLY GENERATED (V5)!")
sys.exit(0)

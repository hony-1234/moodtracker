import os
from PIL import Image

workspace_dir = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker"
folder = os.path.join(workspace_dir, "public", "學校圖檔", "吉祥物")
img_path = os.path.join(folder, "信信-01.png")

with Image.open(img_path) as img:
    img = img.convert("RGBA")
    width, height = img.size
    pixels = img.load()

    # --- LEFT HAND ---
    box_l = [81, 600, 400, 800]
    lw, lh = box_l[2] - box_l[0], box_l[3] - box_l[1]
    left_raw = img.crop(box_l)
    left_raw_pixels = left_raw.load()
    
    # Extract left skin components
    skin_pixels_l = []
    skin_set_l = set()
    for y in range(lh):
        for x in range(lw):
            r, g, b, a = left_raw.getpixel((x, y))
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
    
    # Refined core assignment
    arm_cores_l = set()
    face_cores_l = set()
    
    for y in range(lh):
        for x in range(lw):
            r, g, b, a = left_raw_pixels[x, y]
            if a == 0:
                continue
            is_red = (r > 150 and g < 100 and b < 100)
            
            # Left arm is on the left: sleeve red and hand skin
            if (is_red and x < 230) or ((x, y) in hand_skin_l):
                arm_cores_l.add((x, y))
            # Face, hair, helmet, neck, and central body dress are on the right/top/bottom
            elif ((x, y) in face_skin_l) or (y < 60) or (x > 240) or (is_red and x >= 230):
                face_cores_l.add((x, y))
                
    # Run BFS
    queue_l = []
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
        cx, cy = queue_l.pop(0)
        current_dist = dist_grid_l[cy][cx]
        current_label = label_grid_l[cy][cx]
        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < lw and 0 <= ny < lh:
                if dist_grid_l[ny][nx] > current_dist + 1:
                    dist_grid_l[ny][nx] = current_dist + 1
                    label_grid_l[ny][nx] = current_label
                    queue_l.append((nx, ny))
                    
    # Generate left arm image with refined mask
    left_hand = Image.new('RGBA', (lw, lh), (0, 0, 0, 0))
    left_pixels = left_hand.load()
    
    arm_pixel_count = 0
    ys = []
    for y in range(lh):
        for x in range(lw):
            if label_grid_l[y][x] == 'ARM':
                left_pixels[x, y] = left_raw_pixels[x, y]
                arm_pixel_count += 1
                ys.append(y)
                
    print(f"Refined Left Arm pixel count: {arm_pixel_count}")
    print(f"Vertical range of ARM labeled pixels: [{min(ys)}, {max(ys)}]")
    
    # Check what kind of pixels are at y < 60
    leak_y_60 = 0
    for y in range(60):
        for x in range(lw):
            if label_grid_l[y][x] == 'ARM':
                leak_y_60 += 1
    print(f"Leakage pixels at y < 60: {leak_y_60}")

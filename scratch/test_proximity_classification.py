import os
import sys
import math
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"
img_path = os.path.join(folder, "信信-01.png")

with Image.open(img_path) as img:
    img = img.convert("RGBA")
    
    # ------------------ LEFT HAND ------------------
    box = [81, 600, 400, 800]
    cropped = img.crop(box)
    w, h = cropped.size
    pixels = cropped.load()
    
    # Let's find skin pixels and run connected components to identify:
    # - Component 1: Face Skin
    # - Component 2: Hand Skin
    skin_pixels = []
    skin_set = set()
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            is_skin = (abs(r - 246) < 20 and abs(g - 225) < 20 and abs(b - 199) < 20) and a > 0
            if is_skin:
                skin_pixels.append((x, y))
                skin_set.add((x, y))
                
    visited = set()
    components = []
    for p in skin_pixels:
        if p not in visited:
            comp = []
            queue = [p]
            visited.add(p)
            while queue:
                cx, cy = queue.pop(0)
                comp.append((cx, cy))
                for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (1, -1), (-1, 1), (1, 1)]:
                    nx, ny = cx + dx, cy + dy
                    if 0 <= nx < w and 0 <= ny < h:
                        if (nx, ny) in skin_set and (nx, ny) not in visited:
                            visited.add((nx, ny))
                            queue.append((nx, ny))
            components.append(comp)
            
    components_sorted = sorted(components, key=len, reverse=True)
    face_skin = set(components_sorted[0])
    hand_skin = set(components_sorted[1])
    
    # Define Cores
    arm_cores = set()
    face_cores = set()
    
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if a == 0:
                continue
                
            is_red = (r > 150 and g < 100 and b < 100)
            is_skin = (x, y) in skin_set
            
            # Arm Cores: Red sleeve + Hand Skin
            if is_red or ((x, y) in hand_skin):
                arm_cores.add((x, y))
            # Face Cores: Face Skin + any non-white, non-red, non-hand skin pixel at top-right (y < 70, x > 150)
            elif ((x, y) in face_skin) or (y < 70 and x > 150 and not is_red):
                face_cores.add((x, y))
                
    # Now let's classify every pixel in the cropped image
    out_img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    out_pixels = out_img.load()
    
    # We can precompute distance grids or just search the nearest for speed since size is small (319x200 = 63800 pixels)
    arm_core_list = list(arm_cores)
    face_core_list = list(face_cores)
    
    print(f"Arm Cores: {len(arm_core_list)} pixels, Face Cores: {len(face_core_list)} pixels")
    
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if a == 0:
                continue
                
            # If it's already a core, we know its classification
            if (x, y) in arm_cores:
                out_pixels[x, y] = (r, g, b, a)
                continue
            if (x, y) in face_cores:
                continue # transparent
                
            # For other pixels (like outlines), classify based on proximity to nearest core
            # Let's find squared distance to nearest arm core and nearest face core
            min_arm_dist = 999999
            for ax, ay in arm_core_list:
                dist = (x - ax)**2 + (y - ay)**2
                if dist < min_arm_dist:
                    min_arm_dist = dist
                    if min_arm_dist == 1: # early exit
                        break
                        
            min_face_dist = 999999
            for fx, fy in face_core_list:
                dist = (x - fx)**2 + (y - fy)**2
                if dist < min_face_dist:
                    min_face_dist = dist
                    if min_face_dist == 1:
                        break
                        
            if min_arm_dist < min_face_dist:
                out_pixels[x, y] = (r, g, b, a)
                
    out_img.save(os.path.join(workspace_dir, "scratch", "left_hand_proximity_test.png"), "PNG")
    print("Saved left_hand_proximity_test.png")

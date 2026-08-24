import os
import sys
import math
from PIL import Image
from collections import deque

workspace_dir = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker"
folder = os.path.join(workspace_dir, "public", "學校圖檔", "吉祥物")
img_path = os.path.join(folder, "信信-01.png")

with Image.open(img_path) as img:
    img = img.convert("RGBA")
    
    # Right hand crop box [340, 600, 631, 800]
    box_r = [340, 600, 631, 800]
    right_cropped = img.crop(box_r)
    rw, rh = right_cropped.size
    right_pix = right_cropped.load()
    
    # 1. Get hand skin pixels
    skin_pixels_r = []
    skin_set_r = set()
    for y in range(rh):
        for x in range(rw):
            r, g, b, a = right_pix[x, y]
            is_skin = (abs(r - 246) < 20 and abs(g - 225) < 20 and abs(b - 199) < 20) and a > 0
            if is_skin:
                skin_pixels_r.append((x, y))
                skin_set_r.add((x, y))
                
    visited = set()
    components_skin = []
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
            components_skin.append(comp)
            
    components_skin_sorted = sorted(components_skin, key=len, reverse=True)
    face_skin_r = set(components_skin_sorted[0])
    hand_skin_r = set(components_skin_sorted[1])
    
    # 2. Find red components inside Right Crop Box
    red_pixels = []
    red_set = set()
    for y in range(rh):
        for x in range(rw):
            r, g, b, a = right_pix[x, y]
            if a > 0 and r > 130 and g < 130 and b < 130:
                red_pixels.append((x, y))
                red_set.add((x, y))
                
    visited = set()
    components_red = []
    for p in red_pixels:
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
                        if (nx, ny) in red_set and (nx, ny) not in visited:
                            visited.add((nx, ny))
                            queue.append((nx, ny))
            components_red.append(comp)
            
    components_red_sorted = sorted(components_red, key=len, reverse=True)
    print("Distance from top 5 red components to right hand skin (hand_skin_r):")
    for idx, comp in enumerate(components_red_sorted[:5]):
        min_dist = float('inf')
        for rx, ry in comp:
            for hx, hy in hand_skin_r:
                dist = math.sqrt((rx - hx)**2 + (ry - hy)**2)
                if dist < min_dist:
                    min_dist = dist
        print(f"  Red Component {idx}: size={len(comp):5} | Bbox=[{min(p[0] for p in comp):3}, {min(p[1] for p in comp):3}, {max(p[0] for p in comp):3}, {max(p[1] for p in comp):3}] | Min Distance={min_dist:.1f} pixels")

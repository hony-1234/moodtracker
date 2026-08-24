import os
import sys
import math
from PIL import Image
from collections import deque

sys.stdout.reconfigure(encoding='utf-8')

workspace_dir = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker"
folder = os.path.join(workspace_dir, "public", "學校圖檔", "吉祥物")
img_path = os.path.join(folder, "信信-01.png")
artifacts_dir = r"C:\Users\Jerry\.gemini\antigravity\brain\0198b957-90fd-47d6-8e0b-d00b1216d601"

with Image.open(img_path) as img:
    img = img.convert("RGBA")
    
    # Left hand crop
    box_l = [81, 600, 400, 800]
    crop_l = img.crop(box_l)
    lw, lh = crop_l.size
    pixels_l = crop_l.load()
    
    # Find skin pixels
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
    
    # We will compute the exact distance transform from hand_skin_l for ALL pixels in the box
    # Using a BFS queue with no distance bounds, to make it fast but cover the whole box
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
                if (nx, ny) not in closest_source_l:
                    closest_source_l[(nx, ny)] = (sx, sy)
                    queue_bfs.append((nx, ny))
                else:
                    osx, osy = closest_source_l[(nx, ny)]
                    odist = math.sqrt((nx - osx)**2 + (ny - osy)**2)
                    if dist < odist:
                        closest_source_l[(nx, ny)] = (sx, sy)
                        queue_bfs.append((nx, ny))
                        
    # Save images for different thresholds
    for threshold in [8, 12, 16, 20, 24, 30]:
        left_arm_pixels = set()
        for y in range(lh):
            for x in range(lw):
                r, g, b, a = pixels_l[x, y]
                if a == 0:
                    continue
                if (x, y) in closest_source_l:
                    sx, sy = closest_source_l[(x, y)]
                    dist = math.sqrt((x - sx)**2 + (y - sy)**2)
                    if dist <= threshold:
                        is_red = (r > 140 and g < 100 and b < 100)
                        is_cheek_skin = (x, y) in face_skin_l
                        if not is_red and not is_cheek_skin:
                            left_arm_pixels.add((x, y))
                            
        left_arm_img = Image.new("RGBA", (lw, lh), (0, 0, 0, 0))
        lap = left_arm_img.load()
        for x, y in left_arm_pixels:
            lap[x, y] = pixels_l[x, y]
            
        out_path = os.path.join(artifacts_dir, f"left_arm_dist_{threshold}.png")
        left_arm_img.save(out_path, "PNG")
        print(f"Saved threshold {threshold} | pixels: {len(left_arm_pixels)} | path: {out_path}")
        
    print("Done!")

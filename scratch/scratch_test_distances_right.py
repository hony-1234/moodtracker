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
    
    # Right hand crop [340, 600, 631, 800]
    box_r = [340, 600, 631, 800]
    crop_r = img.crop(box_r)
    rw, rh = crop_r.size
    pixels_r = crop_r.load()
    
    # Find skin pixels
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
    
    # Bounded BFS distance transform
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
                if (nx, ny) not in closest_source_r:
                    closest_source_r[(nx, ny)] = (sx, sy)
                    queue_bfs.append((nx, ny))
                else:
                    osx, osy = closest_source_r[(nx, ny)]
                    odist = math.sqrt((nx - osx)**2 + (ny - osy)**2)
                    if dist < odist:
                        closest_source_r[(nx, ny)] = (sx, sy)
                        queue_bfs.append((nx, ny))
                        
    # Save images for different thresholds
    for threshold in [8, 12, 16, 20, 24, 30]:
        right_arm_pixels = set()
        for y in range(rh):
            for x in range(rw):
                r, g, b, a = pixels_r[x, y]
                if a == 0:
                    continue
                if (x, y) in closest_source_r:
                    sx, sy = closest_source_r[(x, y)]
                    dist = math.sqrt((x - sx)**2 + (y - sy)**2)
                    if dist <= threshold:
                        is_red = (r > 140 and g < 100 and b < 100)
                        is_cheek_skin = (x, y) in face_skin_r
                        if not is_red and not is_cheek_skin:
                            right_arm_pixels.add((x, y))
                            
        right_arm_img = Image.new("RGBA", (rw, rh), (0, 0, 0, 0))
        rap = right_arm_img.load()
        for x, y in right_arm_pixels:
            rap[x, y] = pixels_r[x, y]
            
        out_path = os.path.join(artifacts_dir, f"right_arm_dist_{threshold}.png")
        right_arm_img.save(out_path, "PNG")
        print(f"Saved threshold {threshold} | pixels: {len(right_arm_pixels)} | path: {out_path}")
        
    print("Done!")

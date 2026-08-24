import os
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
    
    # We find red pixels inside the right crop box
    red_pixels = []
    red_set = set()
    for y in range(rh):
        for x in range(rw):
            r, g, b, a = right_pix[x, y]
            if a > 0 and r > 130 and g < 130 and b < 130:
                red_pixels.append((x, y))
                red_set.add((x, y))
                
    visited = set()
    components = []
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
            components.append(comp)
            
    components_sorted = sorted(components, key=len, reverse=True)
    print(f"Found {len(components_sorted)} red components inside Right Crop Box.")
    for idx, comp in enumerate(components_sorted[:10]):
        xs = [p[0] for p in comp]
        ys = [p[1] for p in comp]
        min_x, max_x = min(xs), max(xs)
        min_y, max_y = min(ys), max(ys)
        centroid_x = sum(xs) / len(comp)
        centroid_y = sum(ys) / len(comp)
        abs_cx = centroid_x + box_r[0]
        abs_cy = centroid_y + box_r[1]
        print(f"Component {idx}: size={len(comp):5} | Bbox=[{min_x:3}, {min_y:3}, {max_x:3}, {max_y:3}] | CentroidLocal=({centroid_x:.1f}, {centroid_y:.1f}) | CentroidAbs=({abs_cx:.1f}, {abs_cy:.1f})")

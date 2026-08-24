import os
import sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"
img_path = os.path.join(folder, "信信-01.png")

if not os.path.exists(img_path):
    print("Mascot not found!")
    sys.exit(1)

with Image.open(img_path) as img:
    img = img.convert("RGBA")
    w, h = img.size
    print(f"Mascot size: {w}x{h}")
    
    # Let's inspect Left Hand box: [81, 600, 400, 800]
    box_l = [81, 600, 400, 800]
    crop_l = img.crop(box_l)
    lw, lh = crop_l.size
    
    skin_pixels_l = []
    skin_set_l = set()
    for y in range(lh):
        for x in range(lw):
            r, g, b, a = crop_l.getpixel((x, y))
            # Skin tone definition
            is_skin = (abs(r - 246) < 20 and abs(g - 225) < 20 and abs(b - 199) < 20) and a > 0
            if is_skin:
                skin_pixels_l.append((x, y))
                skin_set_l.add((x, y))
                
    # Connected components
    visited = set()
    components_l = []
    for p in skin_pixels_l:
        if p not in visited:
            comp = []
            queue = [p]
            visited.add(p)
            while queue:
                cx, cy = queue.pop(0)
                comp.append((cx, cy))
                for dx, dy in [(-1,0), (1,0), (0,-1), (0,1), (-1,-1), (-1,1), (1,-1), (1,1)]:
                    nx, ny = cx + dx, cy + dy
                    if 0 <= nx < lw and 0 <= ny < lh:
                        if (nx, ny) in skin_set_l and (nx, ny) not in visited:
                            visited.add((nx, ny))
                            queue.append((nx, ny))
            components_l.append(comp)
            
    print(f"\n--- LEFT BOX skin components (total {len(components_l)}):")
    components_l_sorted = sorted(components_l, key=len, reverse=True)
    for idx, comp in enumerate(components_l_sorted[:5]):
        xs = [p[0] for p in comp]
        ys = [p[1] for p in comp]
        min_x, max_x = min(xs), max(xs)
        min_y, max_y = min(ys), max(ys)
        centroid_x = sum(xs) / len(comp)
        centroid_y = sum(ys) / len(comp)
        print(f"Component {idx}: size={len(comp)}, bbox=[{min_x}, {min_y}, {max_x}, {max_y}], centroid=({centroid_x:.1f}, {centroid_y:.1f})")

    # Let's inspect Right Hand box: [340, 600, 631, 800]
    box_r = [340, 600, 631, 800]
    crop_r = img.crop(box_r)
    rw, rh = crop_r.size
    
    skin_pixels_r = []
    skin_set_r = set()
    for y in range(rh):
        for x in range(rw):
            r, g, b, a = crop_r.getpixel((x, y))
            is_skin = (abs(r - 246) < 20 and abs(g - 225) < 20 and abs(b - 199) < 20) and a > 0
            if is_skin:
                skin_pixels_r.append((x, y))
                skin_set_r.add((x, y))
                
    visited = set()
    components_r = []
    for p in skin_pixels_r:
        if p not in visited:
            comp = []
            queue = [p]
            visited.add(p)
            while queue:
                cx, cy = queue.pop(0)
                comp.append((cx, cy))
                for dx, dy in [(-1,0), (1,0), (0,-1), (0,1), (-1,-1), (-1,1), (1,-1), (1,1)]:
                    nx, ny = cx + dx, cy + dy
                    if 0 <= nx < rw and 0 <= ny < rh:
                        if (nx, ny) in skin_set_r and (nx, ny) not in visited:
                            visited.add((nx, ny))
                            queue.append((nx, ny))
            components_r.append(comp)
            
    print(f"\n--- RIGHT BOX skin components (total {len(components_r)}):")
    components_r_sorted = sorted(components_r, key=len, reverse=True)
    for idx, comp in enumerate(components_r_sorted[:5]):
        xs = [p[0] for p in comp]
        ys = [p[1] for p in comp]
        min_x, max_x = min(xs), max(xs)
        min_y, max_y = min(ys), max(ys)
        centroid_x = sum(xs) / len(comp)
        centroid_y = sum(ys) / len(comp)
        print(f"Component {idx}: size={len(comp)}, bbox=[{min_x}, {min_y}, {max_x}, {max_y}], centroid=({centroid_x:.1f}, {centroid_y:.1f})")

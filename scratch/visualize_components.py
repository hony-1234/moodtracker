import os
from PIL import Image
from collections import deque

workspace_dir = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker"
folder = os.path.join(workspace_dir, "public", "學校圖檔", "吉祥物")
img_path = os.path.join(folder, "信信-01.png")

with Image.open(img_path) as img:
    img = img.convert("RGBA")
    width, height = img.size
    pixels = img.load()
    
    red_set = set()
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if a > 0 and r > 120 and g < 130 and b < 130:
                red_set.add((x, y))
                
    visited = set()
    components = []
    for p in red_set:
        if p not in visited:
            comp = []
            queue = deque([p])
            visited.add(p)
            while queue:
                cx, cy = queue.popleft()
                comp.append((cx, cy))
                for dx, dy in [(-1,0), (1,0), (0,-1), (0,1), (-1,-1), (-1,1), (1,-1), (1,1)]:
                    nx, ny = cx + dx, cy + dy
                    if 0 <= nx < width and 0 <= ny < height:
                        if (nx, ny) in red_set and (nx, ny) not in visited:
                            visited.add((nx, ny))
                            queue.append((nx, ny))
            components.append(comp)
            
    components_sorted = sorted(components, key=len, reverse=True)
    os.makedirs(os.path.join(workspace_dir, "scratch_components"), exist_ok=True)
    for idx, comp in enumerate(components_sorted[:10]):
        xs = [p[0] for p in comp]
        ys = [p[1] for p in comp]
        min_x, max_x = min(xs), max(xs)
        min_y, max_y = min(ys), max(ys)
        
        # Crop the bounding box of this component with 5px padding
        padding = 5
        bx1 = max(0, min_x - padding)
        by1 = max(0, min_y - padding)
        bx2 = min(width, max_x + padding)
        by2 = min(height, max_y + padding)
        
        comp_img = Image.new("RGBA", (bx2 - bx1, by2 - by1), (0, 0, 0, 0))
        comp_pixels = comp_img.load()
        for x, y in comp:
            comp_pixels[x - bx1, y - by1] = pixels[x, y]
            
        out_path = os.path.join(workspace_dir, "scratch_components", f"red_comp_{idx}.png")
        comp_img.save(out_path, "PNG")
        print(f"Saved Component {idx} (size={len(comp)}) to {out_path}")

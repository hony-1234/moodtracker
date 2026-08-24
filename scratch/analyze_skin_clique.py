import os
import sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"
img_path = os.path.join(folder, "信信-01.png")

with Image.open(img_path) as img:
    img = img.convert("RGBA")
    
    # Left hand box [81, 600, 400, 800]
    box = [81, 600, 400, 800]
    cropped = img.crop(box)
    w, h = cropped.size
    pixels = cropped.load()
    
    # Let's find all skin pixels (excluding outlines and white)
    skin_mask = [[False for _ in range(w)] for _ in range(h)]
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            is_skin = (abs(r - 246) < 20 and abs(g - 225) < 20 and abs(b - 199) < 20) and a > 0
            if is_skin:
                skin_mask[y][x] = True
                
    # Connected components of skin pixels
    visited = [[False for _ in range(w)] for _ in range(h)]
    components = []
    
    for y in range(h):
        for x in range(w):
            if skin_mask[y][x] and not visited[y][x]:
                # Start BFS
                comp = []
                queue = [(x, y)]
                visited[y][x] = True
                while queue:
                    cx, cy = queue.pop(0)
                    comp.append((cx, cy))
                    for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (1, -1), (-1, 1), (1, 1)]:
                        nx, ny = cx + dx, cy + dy
                        if 0 <= nx < w and 0 <= ny < h:
                            if skin_mask[ny][nx] and not visited[ny][nx]:
                                visited[ny][nx] = True
                                queue.append((nx, ny))
                components.append(comp)
                
    print(f"Found {len(components)} skin connected components in Left Hand box:")
    for idx, comp in enumerate(sorted(components, key=len, reverse=True)):
        xs = [p[0] for p in comp]
        ys = [p[1] for p in comp]
        min_x, max_x = min(xs), max(xs)
        min_y, max_y = min(ys), max(ys)
        print(f"  Component {idx+1}: size={len(comp)}, bounding box=[x: {min_x}..{max_x}, y: {min_y}..{max_y}] (Absolute: x: {min_x+box[0]}..{max_x+box[0]}, y: {min_y+box[1]}..{max_y+box[1]})")

import os
import sys
from PIL import Image
from collections import deque

workspace_dir = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker"
folder = os.path.join(workspace_dir, "public", "學校圖檔", "吉祥物")
img_path = os.path.join(folder, "信信-01.png")

with Image.open(img_path) as img:
    img = img.convert("RGBA")
    width, height = img.size
    pixels = img.load()
    
    red_pixels = []
    red_set = set()
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            # Match red/pinkish colors
            if r > 130 and g < 130 and b < 130 and a > 0:
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
                    if 0 <= nx < width and 0 <= ny < height:
                        if (nx, ny) in red_set and (nx, ny) not in visited:
                            visited.add((nx, ny))
                            queue.append((nx, ny))
            components.append(comp)
            
    components_sorted = sorted(components, key=len, reverse=True)
    print("Top 10 largest red components:")
    for i, comp in enumerate(components_sorted[:10]):
        xs = [p[0] for p in comp]
        ys = [p[1] for p in comp]
        min_x, max_x = min(xs), max(xs)
        min_y, max_y = min(ys), max(ys)
        print(f"Red Component {i}: size={len(comp):5} | bbox=[{min_x:3}, {min_y:3}, {max_x:3}, {max_y:3}]")

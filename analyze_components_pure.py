import os
import sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"
img_path = os.path.join(folder, "信信-01.png")

if os.path.exists(img_path):
    with Image.open(img_path) as img:
        img = img.convert("RGBA")
        width, height = img.size
        print(f"Loaded image size: {width}x{height}")
        
        # We can scan the image and identify clusters of pixels
        # Let's resize the image to a smaller size, say 146x200, to run pure Python flood fill extremely fast and avoid memory/recursion limits
        scale = 5
        small_w = width // scale
        small_h = height // scale
        img_small = img.resize((small_w, small_h), Image.Resampling.BOX)
        
        visited = [[False for _ in range(small_w)] for _ in range(small_h)]
        components = []
        
        for y in range(small_h):
            for x in range(small_w):
                r, g, b, a = img_small.getpixel((x, y))
                if a > 15 and not visited[y][x]:
                    # Start BFS
                    queue = [(x, y)]
                    visited[y][x] = True
                    comp_pixels = []
                    
                    while queue:
                        cx, cy = queue.pop(0)
                        comp_pixels.append((cx, cy))
                        for dx, dy in [(-1,0), (1,0), (0,-1), (0,1)]:
                            nx, ny = cx + dx, cy + dy
                            if 0 <= nx < small_w and 0 <= ny < small_h:
                                if not visited[ny][nx]:
                                    _, _, _, na = img_small.getpixel((nx, ny))
                                    if na > 15:
                                        visited[ny][nx] = True
                                        queue.append((nx, ny))
                                        
                    # Found a component
                    min_cx = min(p[0] for p in comp_pixels)
                    max_cx = max(p[0] for p in comp_pixels)
                    min_cy = min(p[1] for p in comp_pixels)
                    max_cy = max(p[1] for p in comp_pixels)
                    
                    components.append({
                        "small_bbox": (min_cx, min_cy, max_cx, max_cy),
                        "orig_bbox": (min_cx * scale, min_cy * scale, (max_cx + 1) * scale, (max_cy + 1) * scale),
                        "size": len(comp_pixels)
                    })
                    
        # Sort components by size descending
        components.sort(key=lambda c: c["size"], reverse=True)
        print(f"Found {len(components)} connected components (at scale 1/{scale}):")
        for i, comp in enumerate(components):
            if comp["size"] > 5: # filter out tiny noise particles
                print(f"Component {i+1}: size={comp['size']} pixels, orig_bbox={comp['orig_bbox']}")
else:
    print("File not found")

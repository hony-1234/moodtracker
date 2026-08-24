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
        
        # Load pixel access object (C-speed lookups)
        px = img.load()
        
        dark_pixels = []
        for y in range(450, 650):
            for x in range(250, 650):
                r, g, b, a = px[x, y]
                # Low RGB means dark brown/black
                if r < 120 and g < 100 and b < 100 and a > 200:
                    dark_pixels.append((x, y))
                    
        print(f"Found {len(dark_pixels)} dark pixels in face region.")
        
        # Let's group them into features using BFS
        visited = set()
        features = []
        
        dark_pixels_set = set(dark_pixels)
        
        for px_coord in dark_pixels:
            if px_coord not in visited:
                queue = [px_coord]
                visited.add(px_coord)
                feat_pixels = []
                
                while queue:
                    # To be super fast, pop from end or use collections.deque. But standard pop is fine for tiny features
                    cx, cy = queue.pop()
                    feat_pixels.append((cx, cy))
                    
                    for dx, dy in [(-1,0), (1,0), (0,-1), (0,1), (-1,-1), (-1,1), (1,-1), (1,1)]:
                        nx, ny = cx + dx, cy + dy
                        neighbor = (nx, ny)
                        if neighbor in dark_pixels_set and neighbor not in visited:
                            visited.add(neighbor)
                            queue.append(neighbor)
                            
                xs = [p[0] for p in feat_pixels]
                ys = [p[1] for p in feat_pixels]
                min_x, max_x = min(xs), max(xs)
                min_y, max_y = min(ys), max(ys)
                features.append({
                    "bbox": (min_x, min_y, max_x, max_y),
                    "size": len(feat_pixels)
                })
                
        features.sort(key=lambda f: f["size"], reverse=True)
        print(f"Detected {len(features)} dark features in face area:")
        for idx, feat in enumerate(features):
            if feat["size"] > 20:
                bbox = feat["bbox"]
                w = bbox[2] - bbox[0] + 1
                h = bbox[3] - bbox[1] + 1
                print(f"  Feature {idx+1}: size={feat['size']} pixels, bbox=[x:{bbox[0]} to {bbox[2]} (w:{w}), y:{bbox[1]} to {bbox[3]} (h:{h})]")
else:
    print("File not found")

import os
import sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"
img_path = os.path.join(folder, "信信-01.png")

if os.path.exists(img_path):
    with Image.open(img_path).convert("RGBA") as img:
        width, height = img.size
        
        # Scan the face area for dark brown/black pixels of the eyes
        # Eyes are solid dark brown ovals. Let's find pixels in the face region
        # Face is roughly y in [450, 650], x in [250, 650]
        # Dark pixels will have low R, G, B values.
        # Let's collect all such pixels and output their clusters
        dark_pixels = []
        for y in range(450, 650):
            for x in range(250, 650):
                r, g, b, a = img.getpixel((x, y))
                # Check for dark brown/black (e.g. r < 100, g < 80, b < 80)
                if r < 120 and g < 100 and b < 100 and a > 200:
                    dark_pixels.append((x, y))
                    
        print(f"Found {len(dark_pixels)} dark pixels in the face region.")
        
        # Group adjacent dark pixels into connected features (BFS)
        visited = set()
        features = []
        
        for px, py in dark_pixels:
            if (px, py) not in visited:
                # Start BFS
                queue = [(px, py)]
                visited.add((px, py))
                feat_pixels = []
                
                while queue:
                    cx, cy = queue.pop(0)
                    feat_pixels.append((cx, cy))
                    
                    for dx, dy in [(-1,0), (1,0), (0,-1), (0,1), (-1,-1), (-1,1), (1,-1), (1,1)]:
                        nx, ny = cx + dx, cy + dy
                        if (nx, ny) in dark_pixels and (nx, ny) not in visited:
                            visited.add((nx, ny))
                            queue.append((nx, ny))
                            
                # Finished a feature, compute bounding box
                xs = [p[0] for p in feat_pixels]
                ys = [p[1] for p in feat_pixels]
                min_x, max_x = min(xs), max(xs)
                min_y, max_y = min(ys), max(ys)
                features.append({
                    "bbox": (min_x, min_y, max_x, max_y),
                    "size": len(feat_pixels)
                })
                
        # Sort features by size
        features.sort(key=lambda f: f["size"], reverse=True)
        print(f"Detected {len(features)} dark features in the face area:")
        for idx, feat in enumerate(features):
            if feat["size"] > 20: # ignore noise
                bbox = feat["bbox"]
                w = bbox[2] - bbox[0] + 1
                h = bbox[3] - bbox[1] + 1
                print(f"  Feature {idx+1}: size={feat['size']} pixels, bbox=[x:{bbox[0]} to {bbox[2]} (w:{w}), y:{bbox[1]} to {bbox[3]} (h:{h})]")
else:
    print("File not found")

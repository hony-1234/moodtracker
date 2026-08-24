import os
import sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

artifacts_dir = r"C:\Users\Jerry\.gemini\antigravity\brain\0198b957-90fd-47d6-8e0b-d00b1216d601"
diff_map_path = os.path.join(artifacts_dir, "xinxin_diff_map.png")

if not os.path.exists(diff_map_path):
    print("Diff map not found")
    sys.exit(1)

with Image.open(diff_map_path) as img:
    img = img.convert("RGBA")
    width, height = img.size
    pixels = img.load()
    
    visited = [[False for _ in range(width)] for _ in range(height)]
    clusters = []
    
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if r == 255 and g == 0 and b == 255 and a == 255 and not visited[y][x]:
                # Found a mismatched pixel, run BFS to find the whole cluster
                queue = [(x, y)]
                visited[y][x] = True
                
                min_x, max_x = x, x
                min_y, max_y = y, y
                size = 0
                
                while queue:
                    cx, cy = queue.pop(0)
                    size += 1
                    min_x = min(min_x, cx)
                    max_x = max(max_x, cx)
                    min_y = min(min_y, cy)
                    max_y = max(max_y, cy)
                    
                    for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                        nx, ny = cx + dx, cy + dy
                        if 0 <= nx < width and 0 <= ny < height:
                            if not visited[ny][nx]:
                                nr, ng, nb, na = pixels[nx, ny]
                                if nr == 255 and ng == 0 and nb == 255 and na == 255:
                                    visited[ny][nx] = True
                                    queue.append((nx, ny))
                                    
                if size > 10: # Only list significant clusters
                    clusters.append({
                        "bbox": [min_x, min_y, max_x, max_y],
                        "size": size
                    })
                    
    clusters_sorted = sorted(clusters, key=lambda x: x["size"], reverse=True)
    print("Mismatched pixel clusters found (sorted by size):")
    for idx, c in enumerate(clusters_sorted[:15]):
        bbox = c["bbox"]
        print(f"Cluster {idx+1}: Size={c['size']:5} | Bounding Box=[{bbox[0]:3}, {bbox[1]:3}, {bbox[2]:3}, {bbox[3]:3}]")

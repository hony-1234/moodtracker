import os
import sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

artifacts_dir = r"C:\Users\Jerry\.gemini\antigravity\brain\0198b957-90fd-47d6-8e0b-d00b1216d601"
img_path = os.path.join(artifacts_dir, "xinxin_reassembled_test_v3.png")

if os.path.exists(img_path):
    with Image.open(img_path) as img:
        img = img.convert("RGBA")
        w, h = img.size
        pixels = img.load()
        
        # We want to find any "empty gaps" inside the character
        # Let's find the bounding box of non-transparent pixels first
        min_x, max_x = w, 0
        min_y, max_y = h, 0
        for y in range(h):
            for x in range(w):
                _, _, _, a = pixels[x, y]
                if a > 0:
                    if x < min_x: min_x = x
                    if x > max_x: max_x = x
                    if y < min_y: min_y = y
                    if y > max_y: max_y = y
                    
        print(f"Mascot bounds: X=[{min_x}, {max_x}], Y=[{min_y}, {max_y}]")
        
        # Let's find if there are any fully transparent pixels (a == 0) inside the mascot body
        # Specifically, let's do a flood fill from the outside of the canvas to identify the true "exterior" background.
        # Any transparent pixel that is NOT reachable from the outside boundaries of the image is an "interior hole/gap".
        visited = [[False for _ in range(w)] for _ in range(h)]
        queue = []
        
        # Seed boundaries
        for x in range(w):
            for y in [0, h-1]:
                _, _, _, a = pixels[x, y]
                if a == 0:
                    queue.append((x, y))
                    visited[y][x] = True
        for y in range(h):
            for x in [0, w-1]:
                if not visited[y][x]:
                    _, _, _, a = pixels[x, y]
                    if a == 0:
                        queue.append((x, y))
                        visited[y][x] = True
                        
        while queue:
            cx, cy = queue.pop(0)
            for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                nx, ny = cx + dx, cy + dy
                if 0 <= nx < w and 0 <= ny < h:
                    if not visited[ny][nx]:
                        _, _, _, a = pixels[nx, ny]
                        if a == 0:
                            visited[ny][nx] = True
                            queue.append((nx, ny))
                            
        # Now, any pixel with a == 0 that is NOT visited is an interior hole!
        holes = []
        for y in range(min_y, max_y + 1):
            for x in range(min_x, max_x + 1):
                _, _, _, a = pixels[x, y]
                if a == 0 and not visited[y][x]:
                    holes.append((x, y))
                    
        print(f"Number of interior transparent holes: {len(holes)}")
        if len(holes) > 0:
            print("First 20 holes coordinates:")
            print(holes[:20])
            
            # Let's map these holes back to original image coordinates or parts
        else:
            print("No interior transparent holes found in the reassembled image!")
else:
    print("Reassembled test image not found!")

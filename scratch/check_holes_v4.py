import os
from PIL import Image

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"
img_path = os.path.join(folder, "xinxin_body_base_v4.png")

if os.path.exists(img_path):
    img = Image.open(img_path).convert("RGBA")
    width, height = img.size
    pixels = img.load()
    
    # Check if there are fully transparent holes
    visited = [[False for _ in range(width)] for _ in range(height)]
    queue = []
    
    for x in range(width):
        for y in [0, height - 1]:
            if pixels[x, y][3] == 0:
                queue.append((x, y))
                visited[y][x] = True
    for y in range(height):
        for x in [0, width - 1]:
            if pixels[x, y][3] == 0 and not visited[y][x]:
                queue.append((x, y))
                visited[y][x] = True
                
    while queue:
        cx, cy = queue.pop(0)
        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < width and 0 <= ny < height:
                if not visited[ny][nx] and pixels[nx, ny][3] == 0:
                    visited[ny][nx] = True
                    queue.append((nx, ny))
                    
    internal_holes = []
    for y in range(height):
        for x in range(width):
            if pixels[x, y][3] == 0 and not visited[y][x]:
                internal_holes.append((x, y))
                
    print(f"Total internal transparent hole pixels: {len(internal_holes)}")
    if len(internal_holes) > 0:
        print("First 20 hole coordinates:")
        for h in internal_holes[:20]:
            print(f"  {h}")
else:
    print("xinxin_body_base_v4.png not found")

import os
import sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"
legs_path = os.path.join(folder, "xinxin_legs_v4.png")

if os.path.exists(legs_path):
    with Image.open(legs_path) as img:
        img = img.convert("RGBA")
        w, h = img.size
        pixels = img.load()
        
        # We start BFS flood-fill from (94, 65)
        start_x, start_y = 94, 65
        
        # Verify if the starting pixel is white
        r, g, b, a = pixels[start_x, start_y]
        print(f"Start pixel color: ({r},{g},{b},{a})")
        
        visited = [[False for _ in range(w)] for _ in range(h)]
        queue = [(start_x, start_y)]
        visited[start_y][start_x] = True
        
        target_color = (255, 255, 255)
        tol = 30 # high tolerance to clear off-white compression fringes in the gap
        
        cleared_count = 0
        while queue:
            cx, cy = queue.pop(0)
            pixels[cx, cy] = (0, 0, 0, 0)
            cleared_count += 1
            
            for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                nx, ny = cx + dx, cy + dy
                if 0 <= nx < w and 0 <= ny < h:
                    if not visited[ny][nx]:
                        cr, cg, cb, ca = pixels[nx, ny]
                        if ca > 0: # only check non-transparent
                            # If it is close to white, flood-fill it
                            if abs(cr - target_color[0]) <= tol and abs(cg - target_color[1]) <= tol and abs(cb - target_color[2]) <= tol:
                                visited[ny][nx] = True
                                queue.append((nx, ny))
                                
        print(f"Cleared {cleared_count} white/off-white pixels in the legs gap!")
        
        # Save the updated image
        img.save(legs_path, "PNG")
        print("Updated legs image saved successfully!")
else:
    print("xinxin_legs_v4.png not found!")

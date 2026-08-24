import os
import sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"

def flood_fill_transparency(img_path, output_path):
    if not os.path.exists(img_path):
        print(f"File not found: {img_path}")
        return
        
    img = Image.open(img_path).convert("RGBA")
    width, height = img.size
    pixels = img.load()
    
    # BFS to find all connected background white pixels
    visited = [[False for _ in range(width)] for _ in range(height)]
    
    # We will seed the BFS with the four corners of the image
    # and any other boundary pixels that are white
    queue = []
    
    # Check boundaries for white pixels
    for x in range(width):
        # Top boundary
        r, g, b, a = pixels[x, 0]
        if r >= 250 and g >= 250 and b >= 250 and a > 0:
            queue.append((x, 0))
            visited[0][x] = True
        # Bottom boundary
        r, g, b, a = pixels[x, height - 1]
        if r >= 250 and g >= 250 and b >= 250 and a > 0:
            queue.append((x, height - 1))
            visited[height - 1][x] = True
            
    for y in range(height):
        # Left boundary
        r, g, b, a = pixels[0, y]
        if r >= 250 and g >= 250 and b >= 250 and a > 0:
            if not visited[y][0]:
                queue.append((0, y))
                visited[y][0] = True
        # Right boundary
        r, g, b, a = pixels[width - 1, y]
        if r >= 250 and g >= 250 and b >= 250 and a > 0:
            if not visited[y][width - 1]:
                queue.append((width - 1, y))
                visited[y][width - 1] = True
                
    # Run BFS
    while queue:
        cx, cy = queue.pop(0)
        # Make this pixel fully transparent
        pixels[cx, cy] = (0, 0, 0, 0)
        
        # Check neighbors
        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < width and 0 <= ny < height:
                if not visited[ny][nx]:
                    r, g, b, a = pixels[nx, ny]
                    # If neighbor is very close to white, add to queue
                    # Note: we use 248 to allow for some compression artifacts or anti-aliasing near boundaries
                    if r >= 248 and g >= 248 and b >= 248 and a > 0:
                        visited[ny][nx] = True
                        queue.append((nx, ny))
                        
    # Save the processed image
    img.save(output_path, "PNG")
    print(f"Processed {os.path.basename(img_path)} -> saved transparent image to {os.path.basename(output_path)}")

# Apply transparency to all cropped parts and base body
files_to_process = [
    "xinxin_body_base.png",
    "xinxin_fire.png",
    "xinxin_left_hand.png",
    "xinxin_right_hand.png",
    "xinxin_legs.png",
    "xinxin_left_eye.png",
    "xinxin_right_eye.png"
]

for filename in files_to_process:
    path = os.path.join(folder, filename)
    flood_fill_transparency(path, path) # overwrite with transparent version

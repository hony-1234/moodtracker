import os
import sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"
img_path = os.path.join(folder, "信信-01.png")

with Image.open(img_path) as img:
    img = img.convert("RGBA")
    
    # Right hand box [340, 600, 631, 800]
    box = [340, 600, 631, 800]
    cropped = img.copy()
    pixels = cropped.load()
    
    w, h = img.size
    
    # Define skin-tone pixels in absolute coordinates of the right box
    skin_pixels = []
    skin_set = set()
    for y in range(600, 800):
        for x in range(340, 631):
            r, g, b, a = pixels[x, y]
            is_skin = (abs(r - 246) < 20 and abs(g - 225) < 20 and abs(b - 199) < 20) and a > 0
            if is_skin:
                skin_pixels.append((x, y))
                skin_set.add((x, y))
                
    # Connected components
    visited = set()
    components = []
    for p in skin_pixels:
        if p not in visited:
            comp = []
            queue = [p]
            visited.add(p)
            while queue:
                cx, cy = queue.pop(0)
                comp.append((cx, cy))
                for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (1, -1), (-1, 1), (1, 1)]:
                    nx, ny = cx + dx, cy + dy
                    if 340 <= nx < 631 and 600 <= ny < 800:
                        if (nx, ny) in skin_set and (nx, ny) not in visited:
                            visited.add((nx, ny))
                            queue.append((nx, ny))
            components.append(comp)
            
    components_sorted = sorted(components, key=len, reverse=True)
    face_skin = set(components_sorted[0])
    hand_skin = set(components_sorted[1])
    
    import math
    min_dist = 999999
    nearest_pair = None
    for fp in face_skin:
        for hp in hand_skin:
            dist = (fp[0] - hp[0])**2 + (fp[1] - hp[1])**2
            if dist < min_dist:
                min_dist = dist
                nearest_pair = (fp, hp)
                
    actual_dist = math.sqrt(min_dist)
    print(f"Minimum distance between Right Face Cheek skin and Right Hand skin: {actual_dist:.2f} pixels")
    print(f"Nearest pair: Face {nearest_pair[0]} and Hand {nearest_pair[1]}")
    
    fx, fy = nearest_pair[0]
    hx, hy = nearest_pair[1]
    
    print("\nPixels in the gap between them:")
    x_start, x_end = min(fx, hx) - 5, max(fx, hx) + 5
    y_start, y_end = min(fy, hy) - 5, max(fy, hy) + 5
    
    for y in range(y_start, y_end + 1):
        row = []
        for x in range(x_start, x_end + 1):
            r, g, b, a = pixels[x, y]
            if (x, y) in face_skin:
                char = "F"
            elif (x, y) in hand_skin:
                char = "H"
            elif r < 90 and g < 70 and b < 50:
                char = "#" # outline
            elif r > 150 and g < 100 and b < 100:
                char = "R" # red
            elif r > 240 and g > 240 and b > 240:
                char = "." # white background
            else:
                char = "?"
            row.append(f"{char}")
        print(f"y={y:3}: {''.join(row)} (x={x_start} to {x_end})")

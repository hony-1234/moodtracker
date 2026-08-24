import os
from PIL import Image
from collections import deque

workspace_dir = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker"
folder = os.path.join(workspace_dir, "public", "學校圖檔", "吉祥物")
img_path = os.path.join(folder, "信信-01.png")

with Image.open(img_path) as img:
    img = img.convert("RGBA")
    width, height = img.size
    pixels = img.load()
    
    # 1. Identify all red pixels of the central heart
    # Bbox of central heart: [316, 738, 422, 810]
    heart_pixels = set()
    for y in range(738, 811):
        for x in range(316, 423):
            r, g, b, a = pixels[x, y]
            if a > 0:
                is_red = (r > 120 and g < 105 and b < 105)
                if is_red:
                    heart_pixels.add((x, y))
                    
    print(f"Found {len(heart_pixels)} core red heart pixels.")
    
    # 2. Run a BFS to capture the dark outlines surrounding the heart
    # Outline color is typically dark brown/black (r < 100, g < 75, b < 55)
    visited = set(heart_pixels)
    queue = deque(heart_pixels)
    heart_all_pixels = set(heart_pixels)
    
    # We can expand a few pixels outwards to capture outline
    # Store depth to control how far we expand
    depths = {p: 0 for p in heart_pixels}
    
    while queue:
        cx, cy = queue.popleft()
        cd = depths[(cx, cy)]
        
        if cd < 5: # check neighbors up to 5 pixels away
            for dx, dy in [(-1,0), (1,0), (0,-1), (0,1), (-1,-1), (-1,1), (1,-1), (1,1)]:
                nx, ny = cx + dx, cy + dy
                if 310 <= nx <= 430 and 730 <= ny <= 820: # stay within chest region
                    if (nx, ny) not in visited:
                        r, g, b, a = pixels[nx, ny]
                        if a > 0:
                            is_outline = (r < 110 and g < 80 and b < 60)
                            is_red_too = (r > 120 and g < 105 and b < 105)
                            if is_outline or is_red_too:
                                visited.add((nx, ny))
                                depths[(nx, ny)] = cd + 1
                                queue.append((nx, ny))
                                heart_all_pixels.add((nx, ny))
                                
    print(f"Total chest heart + outline pixels: {len(heart_all_pixels)}")
    
    # Save a visualization of extracted heart on a transparent canvas
    vis = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    v_pixels = vis.load()
    for x, y in heart_all_pixels:
        v_pixels[x, y] = pixels[x, y]
        
    os.makedirs(os.path.join(workspace_dir, "scratch"), exist_ok=True)
    out_path = os.path.join(workspace_dir, "scratch", "extracted_chest_heart.png")
    vis.save(out_path, "PNG")
    print(f"Saved visualization to {out_path}")

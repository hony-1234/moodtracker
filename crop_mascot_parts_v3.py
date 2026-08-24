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
        
        # 1. Create a fully transparent mascot by flood-filling the white background
        # Seed BFS flood-fill from the four corners of the image
        print("Running high-tolerance background clearing...")
        img_transparent = img.copy()
        pixels = img_transparent.load()
        
        visited = [[False for _ in range(width)] for _ in range(height)]
        queue = []
        target_color = (255, 255, 255)
        tol = 15 # Higher tolerance to fully capture compression artifacts near edges
        
        # Seed corners
        for x in [0, width-1]:
            for y in [0, height-1]:
                r, g, b, a = pixels[x, y]
                if abs(r - target_color[0]) <= tol and abs(g - target_color[1]) <= tol and abs(b - target_color[2]) <= tol:
                    queue.append((x, y))
                    visited[y][x] = True
                    
        # BFS Flood Fill
        while queue:
            cx, cy = queue.pop(0)
            pixels[cx, cy] = (0, 0, 0, 0) # Set to fully transparent
            for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                nx, ny = cx + dx, cy + dy
                if 0 <= nx < width and 0 <= ny < height:
                    if not visited[ny][nx]:
                        r, g, b, a = pixels[nx, ny]
                        if abs(r - target_color[0]) <= tol and abs(g - target_color[1]) <= tol and abs(b - target_color[2]) <= tol:
                            visited[ny][nx] = True
                            queue.append((nx, ny))
                            
        print("Background cleared! Saving transparent mascot template...")
        temp_transparent_path = os.path.join(folder, "xinxin_transparent_full.png")
        img_transparent.save(temp_transparent_path, "PNG")
        
        # 2. Crop parts directly from the clean transparent mascot template
        # Bounding boxes [left, top, right, bottom]
        box_fire = [240, 50, 520, 245]
        box_left_hand = [220, 640, 345, 770]
        box_right_hand = [410, 640, 530, 770]
        box_legs = [270, 800, 480, 930]
        box_left_eye = [260, 470, 325, 580]
        box_right_eye = [430, 470, 490, 580]
        
        print("Cropping 2.5D segment files...")
        img_transparent.crop(box_fire).save(os.path.join(folder, "xinxin_fire.png"), "PNG")
        img_transparent.crop(box_left_hand).save(os.path.join(folder, "xinxin_left_hand.png"), "PNG")
        img_transparent.crop(box_right_hand).save(os.path.join(folder, "xinxin_right_hand.png"), "PNG")
        img_transparent.crop(box_legs).save(os.path.join(folder, "xinxin_legs.png"), "PNG")
        
        # For the eyes, we crop them directly so they retain the exact surrounding skin-tone.
        # This allows them to blend 100% seamlessly over the face circle template.
        img_transparent.crop(box_left_eye).save(os.path.join(folder, "xinxin_left_eye.png"), "PNG")
        img_transparent.crop(box_right_eye).save(os.path.join(folder, "xinxin_right_eye.png"), "PNG")
        print("Cropped segments saved with perfect transparency boundaries!")
        
        # 3. Create the Solid Body Base Template
        # We start with the full transparent mascot, and ONLY paint over the eyes region.
        # Keeping the hands, legs, and fire solid underneath guarantees that when they move/rotate,
        # absolutely no empty spaces, holes, or gaps are exposed!
        print("Generating solid body base template...")
        body_base = img_transparent.copy()
        base_pixels = body_base.load()
        
        skin_tone = (246, 225, 199, 255) # Match the exact face skin-tone
        
        # Fill left and right eye rectangular areas with face skin-tone
        for rect in [box_left_eye, box_right_eye]:
            for x in range(rect[0], rect[2]):
                for y in range(rect[1], rect[3]):
                    if 0 <= x < width and 0 <= y < height:
                        _, _, _, a = base_pixels[x, y]
                        if a > 0: # Only fill actual face region, leave outer transparency untouched
                            base_pixels[x, y] = skin_tone
                            
        body_base.save(os.path.join(folder, "xinxin_body_base.png"), "PNG")
        print("xinxin_body_base.png created with clean solid templates and eye paint-over!")
        
        # Clean up temporary full transparent image
        if os.path.exists(temp_transparent_path):
            os.remove(temp_transparent_path)
            
        print("\n🎉 ALL ASSETS SUCCESSFULLY RE-SEGMENTED AND CLEANED!")
else:
    print("信信-01.png not found!")

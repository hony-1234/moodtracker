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
        print("Running high-tolerance background clearing...")
        img_transparent = img.copy()
        pixels = img_transparent.load()
        
        visited = [[False for _ in range(width)] for _ in range(height)]
        queue = []
        target_color = (255, 255, 255)
        tol = 30 # High tolerance to fully capture all off-white compression fringes near edges
        
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
        
        # 2. Crop parts directly from the clean transparent mascot template
        # New complete bounding boxes [left, top, right, bottom]
        box_fire = [171, 50, 593, 250]
        box_left_hand = [81, 600, 364, 800]
        box_right_hand = [366, 600, 631, 800]
        box_legs = [218, 800, 509, 955]
        box_left_eye = [260, 470, 325, 580]
        box_right_eye = [430, 470, 490, 580]
        
        print("Cropping 2.5D segment files with expanded coordinates...")
        img_transparent.crop(box_fire).save(os.path.join(folder, "xinxin_fire_v5.png"), "PNG")
        img_transparent.crop(box_left_hand).save(os.path.join(folder, "xinxin_left_hand_v5.png"), "PNG")
        img_transparent.crop(box_right_hand).save(os.path.join(folder, "xinxin_right_hand_v5.png"), "PNG")
        img_transparent.crop(box_legs).save(os.path.join(folder, "xinxin_legs_v5.png"), "PNG")
        img_transparent.crop(box_left_eye).save(os.path.join(folder, "xinxin_left_eye_v5.png"), "PNG")
        img_transparent.crop(box_right_eye).save(os.path.join(folder, "xinxin_right_eye_v5.png"), "PNG")
        
        # BFS Flood Fill Transparency Function for Eyes (remove skin background around pupils)
        def make_transparent(file_path, target_color, tol=15):
            if not os.path.exists(file_path):
                return
            c_img = Image.open(file_path).convert("RGBA")
            cw, ch = c_img.size
            cpix = c_img.load()
            
            visited = [[False for _ in range(cw)] for _ in range(ch)]
            queue = []
            
            # Seed boundaries
            for x in range(cw):
                for y in [0, ch-1]:
                    r, g, b, a = cpix[x, y]
                    if abs(r - target_color[0]) <= tol and abs(g - target_color[1]) <= tol and abs(b - target_color[2]) <= tol and a > 0:
                        queue.append((x, y))
                        visited[y][x] = True
            for y in range(ch):
                for x in [0, cw-1]:
                    if not visited[y][x]:
                        r, g, b, a = cpix[x, y]
                        if abs(r - target_color[0]) <= tol and abs(g - target_color[1]) <= tol and abs(b - target_color[2]) <= tol and a > 0:
                            queue.append((x, y))
                            visited[y][x] = True
                            
            # BFS
            while queue:
                cx, cy = queue.pop(0)
                cpix[cx, cy] = (0, 0, 0, 0)
                for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                    nx, ny = cx + dx, cy + dy
                    if 0 <= nx < cw and 0 <= ny < ch:
                        if not visited[ny][nx]:
                            r, g, b, a = cpix[nx, ny]
                            if abs(r - target_color[0]) <= tol and abs(g - target_color[1]) <= tol and abs(b - target_color[2]) <= tol and a > 0:
                                visited[ny][nx] = True
                                queue.append((nx, ny))
            c_img.save(file_path, "PNG")
            print(f"Applied flood-fill transparency to {os.path.basename(file_path)}")
            
        # Make skin tone around eyes transparent
        flesh = (246, 225, 199)
        make_transparent(os.path.join(folder, "xinxin_left_eye_v5.png"), flesh, tol=15)
        make_transparent(os.path.join(folder, "xinxin_right_eye_v5.png"), flesh, tol=15)
        
        # 3. Create the Solid Body Base Template with inpainting
        print("Generating solid body base template...")
        body_base = img_transparent.copy()
        base_pixels = body_base.load()
        
        skin_tone = (246, 225, 199, 255) # Match the exact face skin-tone
        dress_red = (176, 47, 34, 255) # Match the dress red
        
        # Erase flame above helmet top (y < 100)
        for y in range(0, 100):
            for x in range(width):
                base_pixels[x, y] = (0, 0, 0, 0)
                
        # Erase legs below skirt bottom (y > 820)
        for y in range(821, height):
            for x in range(width):
                base_pixels[x, y] = (0, 0, 0, 0)
                
        # Fill eye regions on body_base with skin-tone to leave a clean face
        for rect in [box_left_eye, box_right_eye]:
            for x in range(rect[0], rect[2]):
                for y in range(rect[1], rect[3]):
                    if 0 <= x < width and 0 <= y < height:
                        _, _, _, a = base_pixels[x, y]
                        if a > 0: # only fill within mascot face boundary
                            base_pixels[x, y] = skin_tone
                            
        # Inpaint left hand box area (restrict to x >= 220 to preserve floating heart near left cheek)
        for x in range(box_left_hand[0], box_left_hand[2]):
            if x < 220:
                continue
            for y in range(box_left_hand[1], box_left_hand[3]):
                if 0 <= x < width and 0 <= y < height:
                    _, _, _, a = base_pixels[x, y]
                    if a > 0: # only fill within mascot boundary
                        if y < 700:
                            base_pixels[x, y] = skin_tone
                        else:
                            base_pixels[x, y] = dress_red
                            
        # Inpaint right hand box area (restrict to x <= 510 to preserve floating heart near right cheek)
        for x in range(box_right_hand[0], box_right_hand[2]):
            if x > 510:
                continue
            for y in range(box_right_hand[1], box_right_hand[3]):
                if 0 <= x < width and 0 <= y < height:
                    _, _, _, a = base_pixels[x, y]
                    if a > 0: # only fill within mascot boundary
                        if y < 700:
                            base_pixels[x, y] = skin_tone
                        else:
                            base_pixels[x, y] = dress_red
                            
        body_base.save(os.path.join(folder, "xinxin_body_base_v5.png"), "PNG")
        print("xinxin_body_base_v5.png created with clean solid inpainting!")
        print("\n🎉 ALL ASSETS SUCCESSFULLY RE-SEGMENTED AND INPAINTED (V5)!")
else:
    print("信信-01.png not found!")
sys.exit(0)

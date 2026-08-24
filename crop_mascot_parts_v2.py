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
        
        # Bounding boxes [left, top, right, bottom]
        box_fire = [240, 50, 520, 245]
        box_left_hand = [220, 640, 345, 770]
        box_right_hand = [410, 640, 530, 770]
        box_legs = [270, 800, 480, 930]
        box_left_eye = [260, 470, 325, 580]
        box_right_eye = [430, 470, 490, 580]
        
        # Save raw crops
        img.crop(box_fire).save(os.path.join(folder, "xinxin_fire.png"), "PNG")
        img.crop(box_left_hand).save(os.path.join(folder, "xinxin_left_hand.png"), "PNG")
        img.crop(box_right_hand).save(os.path.join(folder, "xinxin_right_hand.png"), "PNG")
        img.crop(box_legs).save(os.path.join(folder, "xinxin_legs.png"), "PNG")
        img.crop(box_left_eye).save(os.path.join(folder, "xinxin_left_eye.png"), "PNG")
        img.crop(box_right_eye).save(os.path.join(folder, "xinxin_right_eye.png"), "PNG")
        print("Cropped parts saved!")
        
        # Create base body
        body_base = img.copy()
        pixels = body_base.load()
        
        # Erase parts on body_base by setting alpha to 0
        def erase_rect(rect):
            for x in range(rect[0], rect[2]):
                for y in range(rect[1], rect[3]):
                    if 0 <= x < width and 0 <= y < height:
                        pixels[x, y] = (0, 0, 0, 0)
                        
        erase_rect(box_fire)
        erase_rect(box_left_hand)
        erase_rect(box_right_hand)
        erase_rect(box_legs)
        
        # Erase the three background hearts
        box_heart_ul = [50, 310, 180, 400]
        box_heart_ll = [110, 580, 250, 695]
        box_heart_lr = [480, 520, 600, 650]
        erase_rect(box_heart_ul)
        erase_rect(box_heart_ll)
        erase_rect(box_heart_lr)
        
        # Fill eye regions on body_base with the flesh skin-tone (246, 225, 199, 255)
        # to leave a clean face circle for eye overlay
        skin_tone = (246, 225, 199, 255)
        for rect in [box_left_eye, box_right_eye]:
            for x in range(rect[0], rect[2]):
                for y in range(rect[1], rect[3]):
                    if 0 <= x < width and 0 <= y < height:
                        r, g, b, a = pixels[x, y]
                        if a > 0: # only fill non-transparent face parts
                            pixels[x, y] = skin_tone
                            
        body_base.save(os.path.join(folder, "xinxin_body_base.png"), "PNG")
        print("xinxin_body_base.png created!")

        # BFS Flood Fill Transparency Function
        def make_transparent(file_path, target_color, tol=5):
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

        # Make base body and white-background parts transparent (white target)
        white = (255, 255, 255)
        make_transparent(os.path.join(folder, "xinxin_body_base.png"), white, tol=8)
        make_transparent(os.path.join(folder, "xinxin_fire.png"), white, tol=8)
        make_transparent(os.path.join(folder, "xinxin_left_hand.png"), white, tol=8)
        make_transparent(os.path.join(folder, "xinxin_right_hand.png"), white, tol=8)
        make_transparent(os.path.join(folder, "xinxin_legs.png"), white, tol=8)
        
        # Make flesh-background eyes transparent (skin-tone target)
        flesh = (246, 225, 199)
        make_transparent(os.path.join(folder, "xinxin_left_eye.png"), flesh, tol=5)
        make_transparent(os.path.join(folder, "xinxin_right_eye.png"), flesh, tol=5)
        
        print("All assets finalized and made transparent!")
else:
    print("File not found")

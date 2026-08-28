import os
from PIL import Image, ImageDraw
from collections import deque

expr_sheet1 = r"C:\Users\Jerry\.gemini\antigravity\brain\0198b957-90fd-47d6-8e0b-d00b1216d601\enen_expressive_eyes_1787878537104.png"
expr_sheet2 = r"C:\Users\Jerry\.gemini\antigravity\brain\0198b957-90fd-47d6-8e0b-d00b1216d601\enen_minimalist_eyes_1787878628820.png"
expr_dir = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物\expressions"
os.makedirs(expr_dir, exist_ok=True)

def flood_fill_clean(crop):
    cw, ch = crop.size
    px = crop.load()
    visited = [[False]*ch for _ in range(cw)]
    
    # Check if a pixel is background checkerboard / pure background
    def is_bg(x, y):
        r, g, b, a = px[x, y]
        if a == 0:
            return True
        # Checkerboard colors in generated image: #FFFFFF, #E6E6E6, #D9D9D9, #CCCCCC
        # Pure neutral grey/white
        diff = max(abs(r-g), abs(g-b), abs(r-b))
        if diff < 12 and r > 195:
            return True
        return False

    # Multi-source BFS from all boundary pixels
    q = deque()
    for x in range(cw):
        for y in [0, ch-1]:
            if is_bg(x, y):
                visited[x][y] = True
                q.append((x, y))
    for y in range(ch):
        for x in [0, cw-1]:
            if not visited[x][y] and is_bg(x, y):
                visited[x][y] = True
                q.append((x, y))

    while q:
        cx, cy = q.popleft()
        px[cx, cy] = (0, 0, 0, 0)
        for dx, dy in [(-1,0), (1,0), (0,-1), (0,1)]:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < cw and 0 <= ny < ch and not visited[nx][ny]:
                if is_bg(nx, ny):
                    visited[nx][ny] = True
                    q.append((nx, ny))

    # Clean isolated checkerboard fringes
    for y in range(ch):
        for x in range(cw):
            r, g, b, a = px[x, y]
            if a > 0:
                diff = max(abs(r-g), abs(g-b), abs(r-b))
                # If neutral grey and adjacent to transparent
                if diff < 8 and r > 200:
                    has_trans = False
                    for dx, dy in [(-1,0),(1,0),(0,-1),(0,1)]:
                        nx, ny = x+dx, y+dy
                        if 0 <= nx < cw and 0 <= ny < ch and px[nx, ny][3] == 0:
                            has_trans = True
                            break
                    if has_trans:
                        px[x, y] = (0, 0, 0, 0)

    bbox = crop.getbbox()
    if bbox:
        crop = crop.crop(bbox)
    return crop

def extract_and_save(sheet_path, box, filename):
    sheet = Image.open(sheet_path).convert("RGBA")
    crop = sheet.crop(box)
    cleaned = flood_fill_clean(crop)
    cleaned.save(os.path.join(expr_dir, filename))
    print(f"Saved {filename} with size {cleaned.size}")

# Sheet 1
extract_and_save(expr_sheet1, (40, 70, 480, 270), "star_anime.png")
extract_and_save(expr_sheet1, (530, 70, 960, 270), "heart_love.png")
extract_and_save(expr_sheet1, (50, 330, 480, 530), "happy_blush.png")
extract_and_save(expr_sheet1, (520, 320, 960, 530), "sparkle_blue.png")
extract_and_save(expr_sheet1, (70, 570, 470, 780), "playful_wink.png")
extract_and_save(expr_sheet1, (540, 580, 940, 740), "blush_cheeks.png")
extract_and_save(expr_sheet1, (70, 820, 490, 940), "sleep_lashes.png")

# Sheet 2
extract_and_save(expr_sheet2, (70, 90, 470, 230), "min_happy.png")
extract_and_save(expr_sheet2, (530, 60, 940, 260), "min_surprised.png")
extract_and_save(expr_sheet2, (70, 290, 470, 490), "min_dizzy.png")
extract_and_save(expr_sheet2, (550, 300, 910, 480), "min_wink_sweat.png")
extract_and_save(expr_sheet2, (90, 540, 450, 710), "min_diamond_stars.png")
extract_and_save(expr_sheet2, (520, 550, 950, 720), "min_touched_tears.png")
extract_and_save(expr_sheet2, (80, 800, 460, 890), "min_sleep_dashes.png")
extract_and_save(expr_sheet2, (550, 770, 710, 920), "min_mouth_o.png")
extract_and_save(expr_sheet2, (730, 770, 940, 920), "min_mouth_w.png")

print("All expressions extracted cleanly via flood fill!")

import os
import sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"
img_path = os.path.join(folder, "信信-01.png")

with Image.open(img_path) as img:
    img = img.convert("RGBA")
    
    # ------------------ LEFT HAND ------------------
    box_l = [81, 600, 400, 800]
    cropped_l = img.crop(box_l)
    wl, hl = cropped_l.size
    pix_l = cropped_l.load()
    
    # Let's define the pixels belonging to the left arm/sleeve/hand.
    # The sleeve is red (R>150, G<100, B<100)
    # The hand is skin-tone (around 246, 225, 199)
    # The outline of the sleeve and hand is dark (R<90, G<70, B<50)
    # We want to identify the connected component of (red + skin hand + arm outlines) 
    # starting from the left-most column of the box where the sleeve enters (since the sleeve comes from the left).
    # Specifically, x=0..120 contains the red sleeve.
    
    arm_l_mask = [[False for _ in range(wl)] for _ in range(hl)]
    for y in range(hl):
        for x in range(wl):
            r, g, b, a = pix_l[x, y]
            is_white = (r > 240 and g > 240 and b > 240) or (a == 0)
            if not is_white:
                # We want to exclude face pixels.
                # Let's see: face is Component 1 of skin pixels which is in x >= 123, y <= 94 in the box
                # Face outline is also around it.
                # If we start from the left-most columns (x=0 to 10), any non-white pixel must be part of the arm.
                # Let's seed our BFS with all non-white pixels in x=0..10.
                arm_l_mask[y][x] = True
                
    # Run BFS from x=0..10 non-white seeds
    visited_l = [[False for _ in range(wl)] for _ in range(hl)]
    queue_l = []
    for y in range(hl):
        for x in range(15):
            if arm_l_mask[y][x]:
                queue_l.append((x, y))
                visited_l[y][x] = True
                
    while queue_l:
        cx, cy = queue_l.pop(0)
        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (1, -1), (-1, 1), (1, 1)]:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < wl and 0 <= ny < hl:
                if arm_l_mask[ny][nx] and not visited_l[ny][nx]:
                    # To prevent leaking into the face:
                    # Let's check if (nx, ny) is part of the face.
                    # We know face skin is in [123..318, 0..94] in the box.
                    # Is there a bridge? Let's check where the boundary is.
                    # The left hand itself is x <= 220, y >= 60.
                    # If nx > 220 and ny < 100: is this face skin/outline?
                    # Let's see: face chin and cheeks are on the right side of the box.
                    # The pivot is at x=269, y=170. The sleeve ends around there.
                    # So the arm is: sleeve from x=0 to x=269, hand around x=166..218, y=60..150.
                    # Face is at x >= 123, y <= 94.
                    # Let's check if we restrict nx and ny to NOT enter the face.
                    # Specifically, if ny < 110 and nx > 120, we can exclude it unless it is red sleeve.
                    # Red sleeve is R > 150, G < 100, B < 100.
                    # Let's check if we only allow red sleeve and its outline in the upper-right region.
                    # Let's analyze the exact path.
                    pass
                
    # Let's write a python script to save the connected component of non-white pixels from left edge
    # but with a simple rule: if it is skin-toned, it must NOT belong to Component 1 of skin pixels!
    # Yes! This is a perfect, extremely robust rule:
    # A pixel (x, y) is part of the arm if:
    # 1. It is non-white.
    # 2. If it is skin-toned, it must NOT be part of Component 1 of skin pixels (which we found to be the face cheek!).
    # 3. It is connected to the arm.
    # Let's see if this rule isolates the left arm perfectly.
    
    # Let's find Component 1 coordinates:
    face_skin_coords = set()
    # We will compute Component 1 again in the script and save its coordinates.
    # Let's see if this works!
    print("Isolating left arm using face-exclusion...")

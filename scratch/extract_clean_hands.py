import os
import sys
import math
from PIL import Image, ImageDraw
from collections import deque

workspace_dir = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker"
folder = os.path.join(workspace_dir, "public", "學校圖檔", "吉祥物")
img_path = os.path.join(folder, "信信-01.png")

if not os.path.exists(img_path):
    print("信信-01.png not found")
    sys.exit(1)

with Image.open(img_path) as img:
    img = img.convert("RGBA")
    width, height = img.size
    pixels = img.load()
    
    # Let's extract the left hand cleanly
    box_l = [81, 600, 400, 800]
    cropped_l = img.crop(box_l)
    lw, lh = cropped_l.size
    pix_l = cropped_l.load()
    
    # 1. Find the skin-tone pixels of the hand
    skin_pixels = []
    skin_set = set()
    for y in range(lh):
        for x in range(lw):
            r, g, b, a = pix_l[x, y]
            is_skin = (abs(r - 246) < 20 and abs(g - 225) < 20 and abs(b - 199) < 20) and a > 0
            if is_skin:
                skin_pixels.append((x, y))
                skin_set.add((x, y))
                
    # Run connected components on skin pixels
    visited = set()
    components = []
    for p in skin_pixels:
        if p not in visited:
            comp = []
            queue = deque([p])
            visited.add(p)
            while queue:
                cx, cy = queue.popleft()
                comp.append((cx, cy))
                for dx, dy in [(-1,0), (1,0), (0,-1), (0,1), (-1,-1), (-1,1), (1,-1), (1,1)]:
                    nx, ny = cx + dx, cy + dy
                    if 0 <= nx < lw and 0 <= ny < lh:
                        if (nx, ny) in skin_set and (nx, ny) not in visited:
                            visited.add((nx, ny))
                            queue.append((nx, ny))
            components.append(comp)
            
    components_sorted = sorted(components, key=len, reverse=True)
    # The largest component inside the left box is the face skin.
    # The second largest is the hand skin!
    # Let's verify that the second largest is indeed the hand skin and doesn't contain any cheek pixels
    face_skin = set(components_sorted[0])
    hand_skin = set(components_sorted[1])
    
    print(f"Face skin component size: {len(face_skin)}")
    print(f"Hand skin component size: {len(hand_skin)}")
    
    # Let's remove any pixels from hand_skin that are inside the face ellipse
    # Face ellipse parameters: xc=355, yc=536, a_rad=199, b_rad=174
    xc, yc, a_rad, b_rad = 355, 536, 199, 174
    cleaned_hand_skin = set()
    removed_face_pixels_count = 0
    for x, y in hand_skin:
        abs_x = box_l[0] + x
        abs_y = box_l[1] + y
        val = ((abs_x - xc) / a_rad)**2 + ((abs_y - yc) / b_rad)**2
        if val <= 1.0:
            removed_face_pixels_count += 1
        else:
            cleaned_hand_skin.add((x, y))
            
    print(f"Removed {removed_face_pixels_count} cheek pixels from left hand skin.")
    print(f"Cleaned left hand skin size: {len(cleaned_hand_skin)}")
    
    # 2. Find the orange sleeve pixels connected to cleaned_hand_skin
    # Sleeve colors are orange/brown: r is around 216, g around 146, b around 67
    orange_set = set()
    for y in range(lh):
        for x in range(lw):
            r, g, b, a = pix_l[x, y]
            is_orange = (180 <= r <= 245 and 110 <= g <= 175 and 40 <= b <= 105) and a > 0
            if is_orange:
                orange_set.add((x, y))
                
    # We want to find the orange sleeve connected to the hand skin.
    # Let's run a BFS starting from cleaned_hand_skin, propagating to orange_set
    queue = deque(list(cleaned_hand_skin))
    hand_and_sleeve = set(cleaned_hand_skin)
    visited_or = set(cleaned_hand_skin)
    
    while queue:
        cx, cy = queue.popleft()
        for dx, dy in [(-1,0), (1,0), (0,-1), (0,1), (-1,-1), (-1,1), (1,-1), (1,1)]:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < lw and 0 <= ny < lh:
                if (nx, ny) in orange_set and (nx, ny) not in visited_or:
                    visited_or.add((nx, ny))
                    hand_and_sleeve.add((nx, ny))
                    queue.append((nx, ny))
                    
    print(f"Total hand + sleeve pixels (excluding outlines): {len(hand_and_sleeve)}")
    
    # 3. Add outlines (dark colors) near the hand + sleeve
    final_hand = set(hand_and_sleeve)
    for y in range(lh):
        for x in range(lw):
            r, g, b, a = pix_l[x, y]
            if a == 0:
                continue
            is_outline = (r < 100 and g < 75 and b < 55)
            if is_outline and (x, y) not in final_hand:
                # Check if any neighbor in 7x7 is in hand_and_sleeve
                near_hand = False
                for dy in range(-3, 4):
                    for dx in range(-3, 4):
                        nx, ny = x + dx, y + dy
                        if 0 <= nx < lw and 0 <= ny < lh:
                            if (nx, ny) in hand_and_sleeve:
                                near_hand = True
                                break
                    if near_hand:
                        break
                if near_hand:
                    final_hand.add((x, y))
                    
    print(f"Total hand + sleeve + outlines pixels: {len(final_hand)}")
    
    # Save the extracted clean left hand to see how it looks
    out_img = Image.new("RGBA", (lw, lh), (0, 0, 0, 0))
    out_pix = out_img.load()
    for x, y in final_hand:
        out_pix[x, y] = pix_l[x, y]
        
    out_path = os.path.join(workspace_dir, "left_arm_extracted_test_v5.png")
    out_img.save(out_path, "PNG")
    print(f"Saved clean left hand test to {out_path}")

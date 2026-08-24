import os
from PIL import Image

workspace_dir = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker"
folder = os.path.join(workspace_dir, "public", "學校圖檔", "吉祥物")
img_path = os.path.join(folder, "信信-01.png")

if not os.path.exists(img_path):
    print("信信-01.png not found!")
    exit(1)

with Image.open(img_path) as img:
    img = img.convert("RGBA")
    width, height = img.size
    pixels = img.load()

    # Left Hand Box: [81, 600, 400, 800]
    box = [81, 600, 400, 800]
    lw, lh = box[2] - box[0], box[3] - box[1]
    
    # Identify Hand Skin Core
    hand_seed = None
    for y in range(lh):
        for x in range(lw):
            if 166 <= x <= 218 and 60 <= y <= 149:
                r, g, b, a = pixels[box[0] + x, box[1] + y]
                is_skin = (abs(r - 246) < 15 and abs(g - 225) < 15 and abs(b - 199) < 15) and a > 0
                if is_skin:
                    hand_seed = (x, y)
                    break
        if hand_seed:
            break
            
    print(f"Hand seed pixel: {hand_seed}")
    if not hand_seed:
        print("Could not find hand seed!")
        exit(1)
        
    # We will find all non-outline, non-bg pixels connected to hand_seed
    visited_core = set([hand_seed])
    queue = [hand_seed]
    
    while queue:
        cx, cy = queue.pop(0)
        
        # 8-connectivity
        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (1, -1), (-1, 1), (1, 1)]:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < lw and 0 <= ny < lh:
                if (nx, ny) not in visited_core:
                    nr, ng, nb, na = pixels[box[0] + nx, box[1] + ny]
                    
                    # Background is transparent or white
                    is_bg = (nr >= 235 and ng >= 235 and nb >= 235) or na == 0
                    # Outline is dark brown
                    is_outline = (nr < 90 and ng < 70 and nb < 50)
                    
                    # Only flow into skin or red/cuff pixels, NOT outline and NOT bg
                    if not is_bg and not is_outline:
                        visited_core.add((nx, ny))
                        queue.append((nx, ny))
                        
    print(f"Total core pixels (skin + sleeve red): {len(visited_core)}")
    xs_core = [p[0] for p in visited_core]
    ys_core = [p[1] for p in visited_core]
    print(f"Core bounds: x in [{min(xs_core)}, {max(xs_core)}], y in [{min(ys_core)}, {max(ys_core)}]")
    
    # Now, let's add the outline pixels that are immediately adjacent to the core pixels
    visited_all = set(visited_core)
    for cx, cy in visited_core:
        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (1, -1), (-1, 1), (1, 1)]:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < lw and 0 <= ny < lh:
                nr, ng, nb, na = pixels[box[0] + nx, box[1] + ny]
                is_outline = (nr < 90 and ng < 70 and nb < 50) and na > 0
                if is_outline:
                    visited_all.add((nx, ny))
                    
    print(f"Total pixels in arm (core + outline): {len(visited_all)}")
    xs_all = [p[0] for p in visited_all]
    ys_all = [p[1] for p in visited_all]
    print(f"Full arm bounds: x in [{min(xs_all)}, {max(xs_all)}], y in [{min(ys_all)}, {max(ys_all)}]")
    
    # Save a test image showing this connected component
    out_img = Image.new("RGBA", (lw, lh), (0, 0, 0, 0))
    out_pix = out_img.load()
    for x, y in visited_all:
        out_pix[x, y] = pixels[box[0] + x, box[1] + y]
    out_img.save("scratch/left_arm_traced_test_v2.png")
    print("Saved test image to scratch/left_arm_traced_test_v2.png")

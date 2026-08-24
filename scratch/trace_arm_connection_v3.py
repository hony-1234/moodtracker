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

    for hand_name, box, y_limit, x_limit_func in [
        ("Left Hand", [81, 600, 400, 800], 60, lambda x, y: x < 280), # Left arm is on the left
        ("Right Hand", [340, 600, 631, 800], 68, lambda x, y: x > 30)  # Right arm is on the right
    ]:
        lw, lh = box[2] - box[0], box[3] - box[1]
        
        # Identify Hand Skin Core
        hand_seed = None
        for y in range(lh):
            for x in range(lw):
                if y_limit <= y <= 155:
                    r, g, b, a = pixels[box[0] + x, box[1] + y]
                    is_skin = (abs(r - 246) < 15 and abs(g - 225) < 15 and abs(b - 199) < 15) and a > 0
                    if is_skin:
                        # Make sure it's in the arm region
                        if hand_name == "Left Hand" and x > 230: continue
                        if hand_name == "Right Hand" and x < 80: continue
                        hand_seed = (x, y)
                        break
            if hand_seed:
                break
                
        print(f"\n=== {hand_name} Tracing ===")
        print(f"  Hand seed pixel: {hand_seed}")
        if not hand_seed:
            print("  Could not find hand seed!")
            continue
            
        visited_core = set([hand_seed])
        queue = [hand_seed]
        
        while queue:
            cx, cy = queue.pop(0)
            
            for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (1, -1), (-1, 1), (1, 1)]:
                nx, ny = cx + dx, cy + dy
                if 0 <= nx < lw and y_limit <= ny < lh: # enforce y_limit spatial constraint!
                    if (nx, ny) not in visited_core:
                        if x_limit_func(nx, ny): # enforce horizontal sleeve limits to avoid crossing center dress
                            nr, ng, nb, na = pixels[box[0] + nx, box[1] + ny]
                            is_bg = (nr >= 235 and ng >= 235 and nb >= 235) or na == 0
                            is_outline = (nr < 90 and ng < 70 and nb < 50)
                            
                            if not is_bg and not is_outline:
                                visited_core.add((nx, ny))
                                queue.append((nx, ny))
                                
        print(f"  Total core pixels (skin + sleeve red): {len(visited_core)}")
        xs_core = [p[0] for p in visited_core]
        ys_core = [p[1] for p in visited_core]
        print(f"  Core bounds: x in [{min(xs_core)}, {max(xs_core)}], y in [{min(ys_core)}, {max(ys_core)}]")
        
        # Add the outline pixels adjacent to core
        visited_all = set(visited_core)
        for cx, cy in visited_core:
            for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (1, -1), (-1, 1), (1, 1)]:
                nx, ny = cx + dx, cy + dy
                if 0 <= nx < lw and y_limit - 4 <= ny < lh: # let the outline extend slightly above y_limit to be smooth
                    nr, ng, nb, na = pixels[box[0] + nx, box[1] + ny]
                    is_outline = (nr < 90 and ng < 70 and nb < 50) and na > 0
                    if is_outline:
                        visited_all.add((nx, ny))
                        
        print(f"  Total pixels in arm (core + outline): {len(visited_all)}")
        xs_all = [p[0] for p in visited_all]
        ys_all = [p[1] for p in visited_all]
        print(f"  Full arm bounds: x in [{min(xs_all)}, {max(xs_all)}], y in [{min(ys_all)}, {max(ys_all)}]")
        
        # Save a test image
        out_img = Image.new("RGBA", (lw, lh), (0, 0, 0, 0))
        out_pix = out_img.load()
        for x, y in visited_all:
            out_pix[x, y] = pixels[box[0] + x, box[1] + y]
        out_path = f"scratch/{hand_name.lower().replace(' ', '_')}_traced_test_v3.png"
        out_img.save(out_path)
        print(f"  Saved test image to {out_path}")

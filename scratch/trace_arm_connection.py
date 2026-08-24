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
    # We know the hand skin is Component 1 from our previous run (bounds: x_local in [166, 218], y_local in [60, 149])
    # Let's find one sure hand skin pixel
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
        
    # Let's trace connected non-white pixels starting from hand_seed
    visited = set([hand_seed])
    queue = [hand_seed]
    
    while queue:
        cx, cy = queue.pop(0)
        abs_x = box[0] + cx
        abs_y = box[1] + cy
        
        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (1, -1), (-1, 1), (1, 1)]:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < lw and 0 <= ny < lh:
                if (nx, ny) not in visited:
                    nr, ng, nb, na = pixels[box[0] + nx, box[1] + ny]
                    # Check if it is a non-background pixel
                    # Background is off-white or transparent
                    is_bg = (nr >= 235 and ng >= 235 and nb >= 235) or na == 0
                    if not is_bg:
                        # Let's see if we want to restrict where the arm can go to prevent leakage
                        # For example, we don't want the arm to leak into the face skin or helmet rim
                        # Face skin starts around x_local >= 123 (which overlaps, but face skin is Component 0)
                        # Let's check if the neighbor is a face skin pixel
                        # Face skin is at Component 0: x in [123, 318], y in [0, 94]
                        # Let's check if (nx, ny) is a face skin pixel
                        is_face_skin = (abs(nr - 246) < 20 and abs(ng - 225) < 20 and abs(nb - 199) < 20) and ny <= 94 and nx >= 123
                        
                        if not is_face_skin:
                            visited.add((nx, ny))
                            queue.append((nx, ny))
                            
    print(f"Total pixels connected to hand (excluding face skin): {len(visited)}")
    xs = [p[0] for p in visited]
    ys = [p[1] for p in visited]
    print(f"Bounds of connected arm: x in [{min(xs)}, {max(xs)}], y in [{min(ys)}, {max(ys)}]")
    
    # Save a test image showing this connected component
    out_img = Image.new("RGBA", (lw, lh), (0, 0, 0, 0))
    out_pix = out_img.load()
    for x, y in visited:
        out_pix[x, y] = pixels[box[0] + x, box[1] + y]
    out_img.save("scratch/left_arm_traced_test.png")
    print("Saved test image to scratch/left_arm_traced_test.png")

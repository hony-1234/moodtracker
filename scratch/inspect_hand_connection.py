import os
from PIL import Image

workspace_dir = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker"
folder = os.path.join(workspace_dir, "public", "學校圖檔", "吉祥物")
img_path = os.path.join(folder, "信信-01.png")

if not os.path.exists(img_path):
    print("Mascot image not found!")
    exit(1)

with Image.open(img_path) as img:
    img = img.convert("RGBA")
    width, height = img.size
    pixels = img.load()

    for hand_name, box in [("Left Hand", [81, 600, 400, 800]), ("Right Hand", [340, 600, 631, 800])]:
        lw, lh = box[2] - box[0], box[3] - box[1]
        
        # Extract all skin pixels in this crop box
        skin_pixels = []
        skin_set = set()
        for y in range(lh):
            for x in range(lw):
                abs_x = box[0] + x
                abs_y = box[1] + y
                r, g, b, a = pixels[abs_x, abs_y]
                is_skin = (abs(r - 246) < 20 and abs(g - 225) < 20 and abs(b - 199) < 20) and a > 0
                if is_skin:
                    skin_pixels.append((x, y))
                    skin_set.add((x, y))
                    
        # Group connected components
        visited = set()
        components = []
        for p in skin_pixels:
            if p not in visited:
                comp = []
                queue = [p]
                visited.add(p)
                while queue:
                    cx, cy = queue.pop(0)
                    comp.append((cx, cy))
                    # 8-connectivity
                    for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (1, -1), (-1, 1), (1, 1)]:
                        nx, ny = cx + dx, cy + dy
                        if 0 <= nx < lw and 0 <= ny < lh:
                            if (nx, ny) in skin_set and (nx, ny) not in visited:
                                visited.add((nx, ny))
                                queue.append((nx, ny))
                components.append(comp)
                
        print(f"=== {hand_name} ===")
        print(f"Number of skin-toned components: {len(components)}")
        components_sorted = sorted(components, key=len, reverse=True)
        for idx, c in enumerate(components_sorted[:5]):
            print(f"  Component {idx}: size {len(c)} pixels")
            xs = [p[0] for p in c]
            ys = [p[1] for p in c]
            print(f"    Bounds: x in [{min(xs)}, {max(xs)}], y in [{min(ys)}, {max(ys)}]")

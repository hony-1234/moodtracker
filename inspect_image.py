import os
from PIL import Image

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"
img_path = os.path.join(folder, "圖片1.png")

if os.path.exists(img_path):
    with Image.open(img_path) as img:
        # Convert to RGBA just in case
        img = img.convert("RGBA")
        width, height = img.size
        
        # We can find connected components or just project alpha onto x-axis
        alpha_proj = [0] * width
        for x in range(width):
            for y in range(height):
                r, g, b, a = img.getpixel((x, y))
                if a > 10: # non-transparent
                    alpha_proj[x] += 1
        
        # Let's find contiguous segments of non-transparent columns
        segments = []
        in_segment = False
        start = 0
        for x in range(width):
            if alpha_proj[x] > 0 and not in_segment:
                start = x
                in_segment = True
            elif alpha_proj[x] == 0 and in_segment:
                segments.append((start, x - 1))
                in_segment = False
        if in_segment:
            segments.append((start, width - 1))
            
        print(f"Number of non-transparent segments on X axis: {len(segments)}")
        for idx, (s, e) in enumerate(segments):
            # Find Y bounds for this segment
            min_y = height
            max_y = 0
            for x in range(s, e + 1):
                for y in range(height):
                    r, g, b, a = img.getpixel((x, y))
                    if a > 10:
                        if y < min_y: min_y = y
                        if y > max_y: max_y = y
            print(f"  Segment {idx}: X bounds [{s}, {e}] (width {e-s+1}), Y bounds [{min_y}, {max_y}] (height {max_y-min_y+1})")
else:
    print("圖片1.png not found")

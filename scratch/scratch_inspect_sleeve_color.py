import os
import sys
from PIL import Image
from collections import Counter

sys.stdout.reconfigure(encoding='utf-8')

artifacts_dir = r"C:\Users\Jerry\.gemini\antigravity\brain\0198b957-90fd-47d6-8e0b-d00b1216d601"
img_path = os.path.join(artifacts_dir, "left_arm_dist_24.png")

with Image.open(img_path) as img:
    img = img.convert("RGBA")
    w, h = img.size
    pixels = img.load()
    
    colors = []
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if a > 100: # non-transparent
                is_skin = (abs(r - 246) < 20 and abs(g - 225) < 20 and abs(b - 199) < 20)
                is_outline = (r < 80 and g < 60 and b < 40)
                if not is_skin and not is_outline:
                    colors.append((r, g, b))
                    
    counter = Counter(colors)
    print("Most common orange-brown sleeve colors:")
    for color, count in counter.most_common(5):
        print(f"  Color {color} | Count: {count}")

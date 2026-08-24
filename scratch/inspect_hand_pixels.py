import os
import sys
from PIL import Image

workspace_dir = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker"
folder = os.path.join(workspace_dir, "public", "學校圖檔", "吉祥物")
img_path = os.path.join(folder, "信信-01.png")

if not os.path.exists(img_path):
    print("信信-01.png not found")
    sys.exit(1)

with Image.open(img_path) as img:
    img = img.convert("RGBA")
    
    # Left hand box: [81, 600, 400, 800]
    box_l = [81, 600, 400, 800]
    cropped_l = img.crop(box_l)
    pixels_l = cropped_l.load()
    
    print("Left hand box red regions:")
    # Let's find red connected components inside this box
    # A pixel is red if r > 120, g < 100, b < 100
    red_pts = []
    for y in range(cropped_l.height):
        for x in range(cropped_l.width):
            r, g, b, a = pixels_l[x, y]
            if r > 120 and g < 100 and b < 100 and a > 0:
                red_pts.append((x, y))
    print(f"  Total red pixels in left hand box: {len(red_pts)}")
    # Where are they located?
    if red_pts:
        xs = [p[0] for p in red_pts]
        ys = [p[1] for p in red_pts]
        print(f"  Red pixels x-range: [{min(xs)}, {max(xs)}], y-range: [{min(ys)}, {max(ys)}]")
        
    # Right hand box: [340, 600, 631, 800]
    box_r = [340, 600, 631, 800]
    cropped_r = img.crop(box_r)
    pixels_r = cropped_r.load()
    
    print("\nRight hand box red regions:")
    red_pts_r = []
    for y in range(cropped_r.height):
        for x in range(cropped_r.width):
            r, g, b, a = pixels_r[x, y]
            if r > 120 and g < 100 and b < 100 and a > 0:
                red_pts_r.append((x, y))
    print(f"  Total red pixels in right hand box: {len(red_pts_r)}")
    if red_pts_r:
        xs = [p[0] for p in red_pts_r]
        ys = [p[1] for p in red_pts_r]
        print(f"  Red pixels x-range: [{min(xs)}, {max(xs)}], y-range: [{min(ys)}, {max(ys)}]")

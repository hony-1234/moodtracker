import os
from PIL import Image

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"
img_path = os.path.join(folder, "信信-01.png")

if os.path.exists(img_path):
    img = Image.open(img_path).convert("RGBA")
    width, height = img.size
    pixels = img.load()
    
    # Check for rows from 825 to 855
    for y in range(825, 856):
        # Find solid columns (alpha > 10, non-white)
        cols = []
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if a > 10 and not (r >= 235 and g >= 235 and b >= 235):
                cols.append(x)
        if cols:
            print(f"Row {y} | Count: {len(cols)} | Range: {min(cols)} to {max(cols)}")
            # Print a few samples of colors in this row
            sample_x = [cols[0], cols[len(cols)//4], cols[len(cols)//2], cols[3*len(cols)//4], cols[-1]]
            sample_colors = [pixels[x, y] for x in sample_x]
            print(f"  Samples: {list(zip(sample_x, sample_colors))}")
else:
    print("File not found")

import os
import sys
import numpy as np
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"
img_path = os.path.join(folder, "信信-01.png")

if os.path.exists(img_path):
    with Image.open(img_path) as img:
        img = img.convert("RGBA")
        width, height = img.size
        print(f"Loaded image size: {width}x{height}")
        
        # Convert alpha to a binary mask
        alpha = np.array(img.getchannel('A'))
        binary = (alpha > 10).astype(int)
        
        # Label connected components
        from scipy.ndimage import label
        labeled, num_features = label(binary)
        print(f"Number of connected components found: {num_features}")
        
        for idx in range(1, num_features + 1):
            coords = np.argwhere(labeled == idx)
            min_y, min_x = coords.min(axis=0)
            max_y, max_x = coords.max(axis=0)
            comp_w = max_x - min_x + 1
            comp_h = max_y - min_y + 1
            pixel_count = len(coords)
            print(f"Component {idx}: Bounding Box [x: {min_x} to {max_x} (w: {comp_w}), y: {min_y} to {max_y} (h: {comp_h})], area: {pixel_count} pixels")
else:
    print("File not found")

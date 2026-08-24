import os
import sys
import math
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"
img_path = os.path.join(folder, "信信-01.png")

with Image.open(img_path) as img:
    img = img.convert("RGBA")
    width, height = img.size
    pixels = img.load()
    
    # Let's collect face outline pixels that are NOT obscured by hands.
    # Obscured parts are mainly y >= 640.
    # Clean cheek outlines are y in [500..640].
    # Let's find outline pixels in y = 500 to 640.
    # Outline is r < 90, g < 70, b < 50
    outline_points = []
    for y in range(500, 640, 2):
        left_x = None
        right_x = None
        for x in range(150, 360):
            r, g, b, a = pixels[x, y]
            if r < 100 and g < 70 and b < 50 and a > 0:
                left_x = x
                break
        for x in range(570, 360, -1):
            r, g, b, a = pixels[x, y]
            if r < 100 and g < 70 and b < 50 and a > 0:
                right_x = x
                break
        if left_x is not None:
            outline_points.append((left_x, y))
        if right_x is not None:
            outline_points.append((right_x, y))
            
    print(f"Collected {len(outline_points)} clean face outline points.")
    
    # We want to fit an ellipse of the form:
    # ((x - xc)/a)^2 + ((y - yc)/b)^2 = 1
    # Since the face is highly symmetric, let's assume xc = 360 (or let's optimize xc as well).
    # Let's run a grid search to find xc, yc, a, b that minimizes the sum of squared errors:
    # Error = sum( ( ((x - xc)/a)^2 + ((y - yc)/b)^2 - 1 )^2 )
    
    best_error = 99999999
    best_params = None
    
    # Grid search boundaries
    for xc in range(355, 366):
        for yc in range(530, 561, 2):
            for a in range(185, 215, 2):
                for b in range(150, 175, 2):
                    error = 0
                    for px, py in outline_points:
                        term1 = ((px - xc) / a) ** 2
                        term2 = ((py - yc) / b) ** 2
                        error += (term1 + term2 - 1.0) ** 2
                    if error < best_error:
                        best_error = error
                        best_params = (xc, yc, a, b)
                        
    print(f"Best fit ellipse parameters:")
    print(f"  Center: ({best_params[0]}, {best_params[1]})")
    print(f"  Radii: a = {best_params[2]}, b = {best_params[3]}")
    print(f"  Mean Squared Error: {best_error / len(outline_points):.6f}")
    
    # Let's print some points on the fitted ellipse at y = 640..710
    xc, yc, a, b = best_params
    print("\nFitted Ellipse points:")
    for y in range(640, 715, 5):
        val = 1.0 - ((y - yc) / b) ** 2
        if val >= 0:
            x_offset = a * math.sqrt(val)
            xl = xc - x_offset
            xr = xc + x_offset
            print(f"  y={y} | x_left={xl:.1f}, x_right={xr:.1f}")
        else:
            print(f"  y={y} | outside ellipse bounds!")

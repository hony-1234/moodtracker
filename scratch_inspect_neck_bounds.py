import os
from PIL import Image

workspace_dir = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker"
folder = os.path.join(workspace_dir, "public", "學校圖檔", "吉祥物")
base_path = os.path.join(folder, "xinxin_body_base_v7.png")

if os.path.exists(base_path):
    with Image.open(base_path) as img:
        img = img.convert("RGBA")
        width, height = img.size
        pixels = img.load()
        
        # Let's inspect row y=704 across all columns to find the non-transparent segment
        non_transparent_xs = []
        for x in range(width):
            r, g, b, a = pixels[x, 704]
            if a > 0:
                non_transparent_xs.append((x, (r, g, b)))
                
        print(f"Row y=704 has {len(non_transparent_xs)} non-transparent pixels.")
        if len(non_transparent_xs) > 0:
            print(f"Starts at x={non_transparent_xs[0][0]}, ends at x={non_transparent_xs[-1][0]}")
            # Print the outline and inside colors
            print("First 10 non-transparent pixels:")
            for item in non_transparent_xs[:10]:
                print(f"  x={item[0]:3} | RGB={item[1]}")
            print("Last 10 non-transparent pixels:")
            for item in non_transparent_xs[-10:]:
                print(f"  x={item[0]:3} | RGB={item[1]}")
else:
    print("xinxin_body_base_v7.png not found!")

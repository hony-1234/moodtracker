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
        
        # Let's inspect rows around y=680 to y=750 in the middle columns x=300 to x=400
        # to find where the collar/neck begins.
        # Her face is centered at x=355.
        print("Inspecting neck column x=355 from y=680 to y=750:")
        for y in range(680, 750):
            r, g, b, a = pixels[355, y]
            if a > 0:
                print(f"  y={y:3} | RGBA=({r:3}, {g:3}, {b:3}, {a:3})")
else:
    print("xinxin_body_base_v7.png not found!")

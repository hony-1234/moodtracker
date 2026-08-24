import os
import sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"
img_path = os.path.join(folder, "信信-01.png")

if not os.path.exists(img_path):
    print("信信-01.png not found!")
    sys.exit(1)

with Image.open(img_path) as img:
    img = img.convert("RGBA")
    w, h = img.size
    pixels = img.load()
    
    # Let's inspect rows around the helmet-flame boundary (y = 200 to 260)
    print("Inspecting rows y = 210 to 260 at center column x = 365:")
    x = 365
    for y in range(210, 265):
        r, g, b, a = pixels[x, y]
        print(f"  y={y:3} | RGBA=({r:3}, {g:3}, {b:3}, {a:3})")
        
    print("\nInspecting horizontal slice at y = 230 across columns x = 200 to 520 (step 15):")
    y = 230
    for x in range(200, 530, 15):
        r, g, b, a = pixels[x, y]
        print(f"  x={x:3} | RGBA=({r:3}, {g:3}, {b:3}, {a:3})")

import os
import sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

workspace_dir = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker"
mascot_folder = os.path.join(workspace_dir, "public", "學校圖檔", "吉祥物")

files = ["信信-01.png", "信信-02.png", "信信-03.png"]

for f in files:
    path = os.path.join(mascot_folder, f)
    if os.path.exists(path):
        with Image.open(path) as img:
            print(f"{f}: Size={img.width}x{img.height} | Format={img.format} | Mode={img.mode}")
    else:
        print(f"{f} not found!")

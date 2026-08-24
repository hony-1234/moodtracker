import os
import sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"
files = [
    "xinxin_body_base_v6.png",
    "xinxin_fire_v6.png",
    "xinxin_legs_v6.png",
    "xinxin_left_eye_v6.png",
    "xinxin_right_eye_v6.png",
    "xinxin_left_hand_v6.png",
    "xinxin_right_hand_v6.png"
]

print("Checking assets in folder:", folder)
for f in files:
    p = os.path.join(folder, f)
    if os.path.exists(p):
        with Image.open(p) as img:
            print(f"  - {f:25} | Size: {img.width:4}x{img.height:4} | Mode: {img.mode}")
    else:
        print(f"  - {f:25} | MISSING!")

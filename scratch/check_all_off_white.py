import os
import sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"
required_parts = [
    "xinxin_body_base_v4.png",
    "xinxin_fire_v4.png",
    "xinxin_left_eye_v4.png",
    "xinxin_left_hand_v4.png",
    "xinxin_legs_v4.png",
    "xinxin_right_eye_v4.png",
    "xinxin_right_hand_v4.png"
]

print("Checking for off-white pixels (R,G,B > 240) inside each asset where alpha > 0:")
for part in required_parts:
    path = os.path.join(folder, part)
    if os.path.exists(path):
        with Image.open(path) as img:
            img = img.convert("RGBA")
            w, h = img.size
            pixels = img.load()
            
            off_white_pixels = 0
            for y in range(h):
                for x in range(w):
                    r, g, b, a = pixels[x, y]
                    if r > 240 and g > 240 and b > 240 and a > 0:
                        # Skip skin tone which is (246, 225, 199), i.e., blue is 199 <= 240
                        # But wait, skin tone blue is 199, which is <= 240, so it is automatically skipped!
                        # Let's make sure:
                        off_white_pixels += 1
            print(f"  - {part:25} | Size: {w:4}x{h:4} | Off-White Pixels: {off_white_pixels}")
    else:
        print(f"  - {part:25} | Not found!")

import os
from PIL import Image

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"

files = [
    "xinxin_body_base_v4.png",
    "xinxin_fire_v4.png",
    "xinxin_left_eye_v4.png",
    "xinxin_left_hand_v4.png",
    "xinxin_legs_v4.png",
    "xinxin_right_eye_v4.png",
    "xinxin_right_hand_v4.png"
]

for f in files:
    path = os.path.join(folder, f)
    if os.path.exists(path):
        img = Image.open(path).convert("RGBA")
        pixels = img.load()
        transparent = 0
        white_solid = 0
        other_solid = 0
        for y in range(img.height):
            for x in range(img.width):
                r, g, b, a = pixels[x, y]
                if a == 0:
                    transparent += 1
                elif r >= 240 and g >= 240 and b >= 240 and a == 255:
                    white_solid += 1
                else:
                    other_solid += 1
        total = img.width * img.height
        print(f"{f}: size={img.width}x{img.height}, total={total}, transparent={transparent} ({transparent/total*100:.1f}%), white_solid={white_solid} ({white_solid/total*100:.1f}%), other_solid={other_solid} ({other_solid/total*100:.1f}%)")
    else:
        print(f"{f} not found")

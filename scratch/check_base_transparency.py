import os
from PIL import Image

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"
base_path = os.path.join(folder, "xinxin_body_base_v4.png")

box_fire = [240, 50, 520, 245]
box_left_hand = [220, 640, 345, 770]
box_right_hand = [410, 640, 530, 770]
box_legs = [270, 800, 480, 930]
box_left_eye = [260, 470, 325, 580]
box_right_eye = [430, 470, 490, 580]

if os.path.exists(base_path):
    img = Image.open(base_path).convert("RGBA")
    pixels = img.load()
    w, h = img.size
    
    def count_transparent(box):
        count = 0
        total = 0
        for y in range(max(0, box[1]), min(h, box[3])):
            for x in range(max(0, box[0]), min(w, box[2])):
                total += 1
                if pixels[x, y][3] == 0:
                    count += 1
        return count, total

    print(f"Body base image size: {w}x{h}")
    print(f"Fire area: {count_transparent(box_fire)}")
    print(f"Left Hand area: {count_transparent(box_left_hand)}")
    print(f"Right Hand area: {count_transparent(box_right_hand)}")
    print(f"Legs area: {count_transparent(box_legs)}")
    print(f"Left Eye area: {count_transparent(box_left_eye)}")
    print(f"Right Eye area: {count_transparent(box_right_eye)}")
else:
    print("xinxin_body_base_v4.png not found")

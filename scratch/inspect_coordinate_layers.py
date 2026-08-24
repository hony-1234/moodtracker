import os
import sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

workspace_dir = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker"
mascot_folder = os.path.join(workspace_dir, "public", "學校圖檔", "吉祥物")
artifacts_dir = r"C:\Users\Jerry\.gemini\antigravity\brain\0198b957-90fd-47d6-8e0b-d00b1216d601"

required_parts = [
    "xinxin_body_base_v6.png",
    "xinxin_fire_v6.png",
    "xinxin_left_eye_v6.png",
    "xinxin_left_hand_v6.png",
    "xinxin_legs_v6.png",
    "xinxin_right_eye_v6.png",
    "xinxin_right_hand_v6.png"
]

crop_boxes = {
    "xinxin_body_base_v6.png": [0, 0, 730, 1002],
    "xinxin_fire_v6.png": [171, 50, 593, 212],
    "xinxin_left_hand_v6.png": [81, 600, 400, 800],
    "xinxin_right_hand_v6.png": [340, 600, 631, 800],
    "xinxin_legs_v6.png": [218, 760, 509, 955],
    "xinxin_left_eye_v6.png": [260, 470, 325, 580],
    "xinxin_right_eye_v6.png": [430, 470, 490, 580]
}

target_coords = [
    (345, 738), # Cluster 1
    (515, 620), # Cluster 2
    (410, 690), # Cluster 3
    (170, 600), # Cluster 4
    (330, 212), # Cluster 5
    (440, 212), # Cluster 6
]

for coord in target_coords:
    cx, cy = coord
    print(f"\n--- Checking coordinate ({cx}, {cy}) ---")
    for part in required_parts:
        part_path = os.path.join(mascot_folder, part)
        if os.path.exists(part_path):
            box = crop_boxes[part]
            # Check if coordinate falls inside this part's box
            if box[0] <= cx < box[2] and box[1] <= cy < box[3]:
                with Image.open(part_path) as img:
                    img_rgba = img.convert("RGBA")
                    rx = cx - box[0]
                    ry = cy - box[1]
                    pixel = img_rgba.getpixel((rx, ry))
                    if pixel[3] > 0:
                        print(f"  {part:25}: Relative coord ({rx}, {ry}) | Color: {pixel}")

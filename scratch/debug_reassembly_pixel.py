import os
import sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

workspace_dir = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker"
mascot_folder = os.path.join(workspace_dir, "public", "學校圖檔", "吉祥物")

crop_boxes = {
    "xinxin_fire_v6.png": [171, 50, 593, 212],
    "xinxin_left_hand_v6.png": [81, 600, 400, 800],
    "xinxin_right_hand_v6.png": [340, 600, 631, 800],
    "xinxin_legs_v6.png": [218, 760, 509, 955],
    "xinxin_left_eye_v6.png": [260, 470, 325, 580],
    "xinxin_right_eye_v6.png": [430, 470, 490, 580]
}

cx, cy = 345, 738
print(f"Tracking coordinate ({cx}, {cy}) step-by-step:")

base_path = os.path.join(mascot_folder, "xinxin_body_base_v6.png")
base_img = Image.open(base_path).convert("RGBA")
canvas = Image.new("RGBA", base_img.size, (0, 0, 0, 0))
canvas.alpha_composite(base_img, (0, 0))

print(f"After base image: {canvas.getpixel((cx, cy))}")

for part, box in crop_boxes.items():
    part_path = os.path.join(mascot_folder, part)
    if os.path.exists(part_path):
        part_img = Image.open(part_path).convert("RGBA")
        
        # Check relative pixel in the part image
        rx = cx - box[0]
        ry = cy - box[1]
        p_color = None
        if 0 <= rx < part_img.width and 0 <= ry < part_img.height:
            p_color = part_img.getpixel((rx, ry))
            
        canvas.alpha_composite(part_img, (box[0], box[1]))
        after_color = canvas.getpixel((cx, cy))
        print(f"After {part:25} (rel: {rx},{ry} color: {p_color}): {after_color}")

import os
import shutil

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"

files_to_copy = [
    ("xinxin_body_base.png", "xinxin_body_base_v3.png"),
    ("xinxin_fire.png", "xinxin_fire_v3.png"),
    ("xinxin_left_eye.png", "xinxin_left_eye_v3.png"),
    ("xinxin_left_hand.png", "xinxin_left_hand_v3.png"),
    ("xinxin_legs.png", "xinxin_legs_v3.png"),
    ("xinxin_right_eye.png", "xinxin_right_eye_v3.png"),
    ("xinxin_right_hand.png", "xinxin_right_hand_v3.png"),
]

for src, dst in files_to_copy:
    src_path = os.path.join(folder, src)
    dst_path = os.path.join(folder, dst)
    if os.path.exists(src_path):
        shutil.copy2(src_path, dst_path)
        print(f"Copied {src} to {dst}")
    else:
        print(f"Source file {src} not found!")

print("All copies completed successfully!")

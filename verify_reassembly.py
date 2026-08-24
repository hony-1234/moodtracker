import os
import sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"
artifacts_dir = r"C:\Users\Jerry\.gemini\antigravity\brain\0198b957-90fd-47d6-8e0b-d00b1216d601"

# Define crop boxes [left, top, right, bottom]
box_fire = [240, 50, 520, 245]
box_left_hand = [220, 640, 345, 770]
box_right_hand = [410, 640, 530, 770]
box_legs = [270, 800, 480, 930]
box_left_eye = [260, 470, 325, 580]
box_right_eye = [430, 470, 490, 580]

try:
    # Open parts
    base = Image.open(os.path.join(folder, "xinxin_body_base.png")).convert("RGBA")
    fire = Image.open(os.path.join(folder, "xinxin_fire.png")).convert("RGBA")
    lh = Image.open(os.path.join(folder, "xinxin_left_hand.png")).convert("RGBA")
    rh = Image.open(os.path.join(folder, "xinxin_right_hand.png")).convert("RGBA")
    legs = Image.open(os.path.join(folder, "xinxin_legs.png")).convert("RGBA")
    le = Image.open(os.path.join(folder, "xinxin_left_eye.png")).convert("RGBA")
    re = Image.open(os.path.join(folder, "xinxin_right_eye.png")).convert("RGBA")
    
    # Create canvas
    canvas = Image.new("RGBA", base.size, (0, 0, 0, 0))
    
    # Paste in order
    canvas.alpha_composite(base, (0, 0))
    canvas.alpha_composite(fire, (box_fire[0], box_fire[1]))
    canvas.alpha_composite(lh, (box_left_hand[0], box_left_hand[1]))
    canvas.alpha_composite(rh, (box_right_hand[0], box_right_hand[1]))
    canvas.alpha_composite(legs, (box_legs[0], box_legs[1]))
    canvas.alpha_composite(le, (box_left_eye[0], box_left_eye[1]))
    canvas.alpha_composite(re, (box_right_eye[0], box_right_eye[1]))
    
    canvas.save(os.path.join(artifacts_dir, "xinxin_reassembled_test_v2.png"), "PNG")
    print("Reassembly verification image saved successfully!")
except Exception as err:
    print(f"Error: {err}")

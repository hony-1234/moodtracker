import os
from PIL import Image

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"
base_path = os.path.join(folder, "xinxin_body_base.png")

box_left_hand = [220, 640, 345, 770]
box_right_hand = [410, 640, 530, 770]
box_legs = [270, 800, 480, 930]

if os.path.exists(base_path):
    img = Image.open(base_path).convert("RGBA")
    pixels = img.load()
    
    # Check if left hand bounding box contains any fully transparent pixels
    lh_trans = sum(1 for y in range(box_left_hand[1], box_left_hand[3]) 
                     for x in range(box_left_hand[0], box_left_hand[2]) 
                     if pixels[x, y][3] == 0)
    
    # Check if right hand bounding box contains any fully transparent pixels
    rh_trans = sum(1 for y in range(box_right_hand[1], box_right_hand[3]) 
                     for x in range(box_right_hand[0], box_right_hand[2]) 
                     if pixels[x, y][3] == 0)
                     
    # Check if legs bounding box contains any fully transparent pixels
    legs_trans = sum(1 for y in range(box_legs[1], box_legs[3]) 
                       for x in range(box_legs[0], box_legs[2]) 
                       if pixels[x, y][3] == 0)
                       
    print(f"Transparent pixels in Left Hand box of body base: {lh_trans} / {125*130}")
    print(f"Transparent pixels in Right Hand box of body base: {rh_trans} / {120*130}")
    print(f"Transparent pixels in Legs box of body base: {legs_trans} / {210*130}")
else:
    print("xinxin_body_base.png not found")

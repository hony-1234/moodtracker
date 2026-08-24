import os
import sys
from PIL import Image, ImageDraw

sys.stdout.reconfigure(encoding='utf-8')

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"
img_path = os.path.join(folder, "信信-01.png")

if os.path.exists(img_path):
    with Image.open(img_path) as img:
        img = img.convert("RGBA")
        width, height = img.size
        print(f"Loaded image size: {width}x{height}")
        
        # Define crop boxes [left, top, right, bottom]
        box_fire = [240, 50, 520, 245]
        box_left_hand = [220, 640, 345, 770]
        box_right_hand = [410, 640, 530, 770]
        box_legs = [270, 800, 480, 930]
        box_left_eye = [320, 520, 345, 575]
        box_right_eye = [410, 520, 435, 575]
        
        # Save cropped parts
        img.crop(box_fire).save(os.path.join(folder, "xinxin_fire.png"), "PNG")
        img.crop(box_left_hand).save(os.path.join(folder, "xinxin_left_hand.png"), "PNG")
        img.crop(box_right_hand).save(os.path.join(folder, "xinxin_right_hand.png"), "PNG")
        img.crop(box_legs).save(os.path.join(folder, "xinxin_legs.png"), "PNG")
        img.crop(box_left_eye).save(os.path.join(folder, "xinxin_left_eye.png"), "PNG")
        img.crop(box_right_eye).save(os.path.join(folder, "xinxin_right_eye.png"), "PNG")
        print("Saved all cropped parts successfully!")
        
        # Create base body
        body_base = img.copy()
        
        # We will erase the cropped parts from the body_base by setting alpha to 0
        # For the fire, left hand, right hand, legs
        # For the eyes, we fill with solid white on the face
        
        # To make it super clean, let's use ImageDraw to erase/fill
        draw = ImageDraw.Draw(body_base)
        
        # Erase Fire (set RGBA to 0,0,0,0)
        # Note: we can crop with a transparent mask or draw a rectangle with fill=(0,0,0,0) and joint/outline
        # In Pillow, drawing with transparent color on RGBA image overlays it, it doesn't replace.
        # To replace with transparency, we can load the pixel data or use a mask.
        # Let's do pixel manipulation for perfect precision!
        pixels = body_base.load()
        
        # 1. Erase Fire
        for x in range(box_fire[0], box_fire[1]):
            for y in range(box_fire[2], box_fire[3]):
                pass # let's write a general helper to erase
                
        def erase_rect(rect):
            for x in range(rect[0], rect[2]):
                for y in range(rect[1], rect[3]):
                    if 0 <= x < width and 0 <= y < height:
                        pixels[x, y] = (0, 0, 0, 0)
                        
        def fill_rect_white(rect):
            for x in range(rect[0], rect[2]):
                for y in range(rect[1], rect[3]):
                    if 0 <= x < width and 0 <= y < height:
                        # Only fill with white if the pixel is part of the white face (highly bright and not black outline)
                        r, g, b, a = pixels[x, y]
                        if a > 10:
                            # Let's fill it with solid white to cover the eyes
                            pixels[x, y] = (255, 255, 255, 255)
                            
        erase_rect(box_fire)
        erase_rect(box_left_hand)
        erase_rect(box_right_hand)
        erase_rect(box_legs)
        
        # Erase the three background hearts
        box_heart_ul = [50, 310, 180, 400]
        box_heart_ll = [110, 580, 250, 695]
        box_heart_lr = [480, 520, 600, 650]
        
        erase_rect(box_heart_ul)
        erase_rect(box_heart_ll)
        erase_rect(box_heart_lr)
        
        # Fill eyes with white
        fill_rect_white(box_left_eye)
        fill_rect_white(box_right_eye)
        
        # Save body base
        body_base.save(os.path.join(folder, "xinxin_body_base.png"), "PNG")
        print("Created and saved xinxin_body_base.png successfully!")
else:
    print("File not found")

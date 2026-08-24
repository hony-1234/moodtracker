import os
from PIL import Image

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"

for filename in ["xinxin_left_hand.png", "xinxin_right_hand.png", "xinxin_legs.png", "xinxin_left_eye.png", "xinxin_right_eye.png", "xinxin_fire.png", "xinxin_body_base.png"]:
    img_path = os.path.join(folder, filename)
    if os.path.exists(img_path):
        with Image.open(img_path) as img:
            img_rgba = img.convert("RGBA")
            # Count transparent vs opaque pixels
            transparent_count = 0
            white_count = 0
            other_count = 0
            
            for y in range(img_rgba.height):
                for x in range(img_rgba.width):
                    r, g, b, a = img_rgba.getpixel((x, y))
                    if a == 0:
                        transparent_count += 1
                    elif r > 240 and g > 240 and b > 240:
                        white_count += 1
                    else:
                        other_count += 1
            print(f"{filename}: size={img.width}x{img.height}, transparent={transparent_count}, white={white_count}, other={other_count}")
    else:
        print(f"{filename} does not exist!")

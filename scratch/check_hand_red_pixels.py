import os
import sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"
hands = ["xinxin_left_hand_v6.png", "xinxin_right_hand_v6.png"]

for h in hands:
    p = os.path.join(folder, h)
    if os.path.exists(p):
        with Image.open(p) as img:
            img = img.convert("RGBA")
            pixels = img.load()
            w, h_size = img.size
            
            # Count red/pink pixels
            red_count = 0
            for y in range(h_size):
                for x in range(w):
                    r, g, b, a = pixels[x, y]
                    if a > 0:
                        is_red = (r > 120 and g < 110 and b < 110) or (r > 150 and g < 130 and b < 130)
                        if is_red:
                            red_count += 1
            print(f"{h}: found {red_count} red/pink pixels.")
    else:
        print(f"{h}: MISSING!")

import os
import sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"
img_path = os.path.join(folder, "信信-01.png")

with Image.open(img_path) as img:
    img = img.convert("RGBA")
    width, height = img.size
    
    # Right hand box [340, 600, 631, 800]
    box = [340, 600, 631, 800]
    cropped = img.crop(box)
    
    w, h = cropped.size
    classified = Image.new("RGBA", (w, h), (255, 255, 255, 255))
    c_pix = classified.load()
    orig_pix = cropped.load()
    
    for y in range(h):
        abs_y = box[1] + y
        for x in range(w):
            abs_x = box[0] + x
            r, g, b, a = orig_pix[x, y]
            
            is_white = (r > 240 and g > 240 and b > 240)
            is_outline = (r < 90 and g < 70 and b < 50)
            is_skin = (abs(r - 246) < 20 and abs(g - 225) < 20 and abs(b - 199) < 20)
            is_red = (r > 150 and g < 100 and b < 100)
            
            if is_white:
                c_pix[x, y] = (255, 255, 255, 255) # white
            elif is_outline:
                c_pix[x, y] = (0, 0, 0, 255) # black outline
            elif is_skin:
                # Is it face or hand?
                # For right hand box, face is on the left side of the box (smaller x, smaller y).
                if abs_x < 480 and abs_y < 710:
                    c_pix[x, y] = (0, 0, 255, 255) # Blue = Face Skin
                else:
                    c_pix[x, y] = (0, 255, 0, 255) # Green = Hand Skin
            elif is_red:
                c_pix[x, y] = (255, 0, 0, 255) # Red = Sleeve
            else:
                c_pix[x, y] = (128, 128, 128, 255) # Grey = Other
                
    classified.save(os.path.join(r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker", "scratch", "right_hand_classification.png"), "PNG")
    print("Saved right_hand_classification.png")

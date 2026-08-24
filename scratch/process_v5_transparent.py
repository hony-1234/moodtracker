import os
import sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"

def process_image(filename, is_legs=False):
    filepath = os.path.join(folder, filename)
    if not os.path.exists(filepath):
        print(f"Error: {filename} not found!")
        return
        
    img = Image.open(filepath).convert("RGBA")
    w, h = img.size
    pixels = img.load()
    
    cleared = 0
    kept = 0
    
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if a == 0:
                continue
                
            # Red dress
            is_red_dress = (r > 120 and g < 90 and b < 90)
            
            # Yellow trim of the dress
            is_yellow_trim = (r > 210 and g > 160 and b < 115)
            
            if is_red_dress or is_yellow_trim:
                pixels[x, y] = (0, 0, 0, 0)
                cleared += 1
            else:
                kept += 1
                
    img.save(filepath, "PNG")
    print(f"Processed {filename}: kept {kept} pixels, cleared {cleared} pixels.")

if __name__ == "__main__":
    process_image("xinxin_left_hand_v5.png")
    process_image("xinxin_right_hand_v5.png")
    process_image("xinxin_legs_v5.png", is_legs=True)
    print("🎉 V5 isolation transparency completed!")

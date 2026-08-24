import os
from PIL import Image

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"
lh_path = os.path.join(folder, "xinxin_left_hand.png")

if os.path.exists(lh_path):
    img = Image.open(lh_path).convert("RGBA")
    width, height = img.size
    pixels = img.load()
    
    # We want to keep skin tone and black outline, and make everything else transparent.
    # Skin tone is bright: R > 200, G > 180, B > 150
    # Outline is dark: R < 90, G < 80, B < 70
    
    kept_count = 0
    cleared_count = 0
    
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if a == 0:
                continue
                
            is_skin = (r > 200 and g > 180 and b > 150)
            is_outline = (r < 90 and g < 80 and b < 70)
            
            # Keep only skin tone and outline, make everything else transparent
            if is_skin or is_outline:
                kept_count += 1
            else:
                pixels[x, y] = (0, 0, 0, 0)
                cleared_count += 1
                
    img.save(os.path.join(folder, "xinxin_left_hand_test.png"), "PNG")
    print(f"Kept: {kept_count}, Cleared: {cleared_count}")
else:
    print("File not found")

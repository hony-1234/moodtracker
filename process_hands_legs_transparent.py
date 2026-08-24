import os
from PIL import Image

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"

# 1. Process Left Hand
lh_path = os.path.join(folder, "xinxin_left_hand.png")
if os.path.exists(lh_path):
    img = Image.open(lh_path).convert("RGBA")
    width, height = img.size
    pixels = img.load()
    
    # We want to keep only the hand skin tone and black outline.
    # Skin tone: R > 200, G > 180, B > 140
    # Outline: R < 100, G < 100, B < 100
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            is_skin = (r > 200 and g > 180 and b > 140)
            is_outline = (r < 100 and g < 100 and b < 100)
            
            if is_skin or is_outline:
                # Keep it as-is
                pass
            else:
                # Make it transparent
                pixels[x, y] = (0, 0, 0, 0)
                
    img.save(lh_path, "PNG")
    print("Successfully processed left hand transparency!")

# 2. Process Right Hand
rh_path = os.path.join(folder, "xinxin_right_hand.png")
if os.path.exists(rh_path):
    img = Image.open(rh_path).convert("RGBA")
    width, height = img.size
    pixels = img.load()
    
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            is_skin = (r > 200 and g > 180 and b > 140)
            is_outline = (r < 100 and g < 100 and b < 100)
            
            if is_skin or is_outline:
                pass
            else:
                pixels[x, y] = (0, 0, 0, 0)
                
    img.save(rh_path, "PNG")
    print("Successfully processed right hand transparency!")

# 3. Process Legs
legs_path = os.path.join(folder, "xinxin_legs.png")
if os.path.exists(legs_path):
    img = Image.open(legs_path).convert("RGBA")
    width, height = img.size
    pixels = img.load()
    
    # Legs consist of the exact same skin tone and black outlines.
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            is_skin = (r > 200 and g > 180 and b > 140)
            is_outline = (r < 100 and g < 100 and b < 100)
            
            if is_skin or is_outline:
                pass
            else:
                pixels[x, y] = (0, 0, 0, 0)
                
    img.save(legs_path, "PNG")
    print("Successfully processed legs transparency!")

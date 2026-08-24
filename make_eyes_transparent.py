import os
from PIL import Image

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"

for filename in ["xinxin_left_eye.png", "xinxin_right_eye.png"]:
    path = os.path.join(folder, filename)
    if os.path.exists(path):
        img = Image.open(path).convert("RGBA")
        width, height = img.size
        pixels = img.load()
        
        # Skin tone threshold: skin tone is very bright, whereas the eye lines are very dark.
        # We can check if the red channel is high.
        for y in range(height):
            for x in range(width):
                r, g, b, a = pixels[x, y]
                # If the pixel is close to skin tone, make it transparent
                if r > 120 and g > 120:
                    pixels[x, y] = (0, 0, 0, 0)
                    
        img.save(path, "PNG")
        print(f"Made {filename} transparent!")
else:
    print("Done")

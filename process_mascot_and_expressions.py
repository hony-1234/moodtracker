import os
from PIL import Image, ImageDraw

src_path = r"C:\Users\Jerry\.gemini\antigravity\brain\0198b957-90fd-47d6-8e0b-d00b1216d601\.user_uploaded\media_1787875559704.png"
expr_sheet1 = r"C:\Users\Jerry\.gemini\antigravity\brain\0198b957-90fd-47d6-8e0b-d00b1216d601\enen_expressive_eyes_1787878537104.png"
expr_sheet2 = r"C:\Users\Jerry\.gemini\antigravity\brain\0198b957-90fd-47d6-8e0b-d00b1216d601\enen_minimalist_eyes_1787878628820.png"

output_dir = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"
expr_dir = os.path.join(output_dir, "expressions")
os.makedirs(expr_dir, exist_ok=True)

im = Image.open(src_path).convert("RGBA")
W, H = im.size
print(f"Processing mascot {W}x{H}...")

# 1. Precise Left Wing Extraction (strictly below hat, y >= 162)
# Hat boundary on left is around y <= 162. Left wing starts at y >= 164.
left_wing_mask = Image.new("L", (W, H), 0)
mask_draw = ImageDraw.Draw(left_wing_mask)
mask_draw.polygon([
    (0, 163), (118, 163), (145, 195), (138, 260), (70, 265), (0, 240)
], fill=255)

# Clear any remaining cream/yellow hat pixels that might touch the top border
left_wing_raw = Image.composite(im, Image.new("RGBA", (W, H), (0, 0, 0, 0)), left_wing_mask)
left_wing_pixels = left_wing_raw.load()
for y in range(H):
    for x in range(W):
        r, g, b, a = left_wing_pixels[x, y]
        if a > 0:
            # If it's the hat cream color: r > 240, g > 235, b < 225
            if r > 240 and g > 235 and b < 225:
                left_wing_pixels[x, y] = (0, 0, 0, 0)
left_wing_raw.save(os.path.join(output_dir, "enen_left_wing.png"), "PNG")

# 2. Precise Right Wing Extraction (strictly below hat, y >= 162)
right_wing_mask = Image.new("L", (W, H), 0)
mask_draw = ImageDraw.Draw(right_wing_mask)
mask_draw.polygon([
    (372, 163), (491, 163), (491, 240), (420, 265), (350, 260), (345, 195)
], fill=255)

right_wing_raw = Image.composite(im, Image.new("RGBA", (W, H), (0, 0, 0, 0)), right_wing_mask)
right_wing_pixels = right_wing_raw.load()
for y in range(H):
    for x in range(W):
        r, g, b, a = right_wing_pixels[x, y]
        if a > 0:
            if r > 240 and g > 235 and b < 225:
                right_wing_pixels[x, y] = (0, 0, 0, 0)
right_wing_raw.save(os.path.join(output_dir, "enen_right_wing.png"), "PNG")

# 3. Halo (top hat with golden cross, cleanly keeping hat only)
halo_mask = Image.new("L", (W, H), 0)
ImageDraw.Draw(halo_mask).ellipse([(80, 0), (415, 178)], fill=255)
halo_im = Image.composite(im, Image.new("RGBA", (W, H), (0, 0, 0, 0)), halo_mask)
halo_im.save(os.path.join(output_dir, "enen_halo.png"), "PNG")

# 4. Body Base with covered original eyes
body_im = im.copy()
body_draw = ImageDraw.Draw(body_im)
# Erase wings outside the body contour
body_draw.polygon([(0, 160), (115, 160), (110, 270), (0, 240)], fill=(0, 0, 0, 0))
body_draw.polygon([(376, 160), (491, 160), (491, 240), (381, 270)], fill=(0, 0, 0, 0))
body_draw.rectangle([(0, 480), (W, 522)], fill=(0, 0, 0, 0))

face_color = (255, 248, 242, 255)
body_draw.ellipse([(195, 185), (225, 210)], fill=face_color)
body_draw.ellipse([(265, 185), (295, 210)], fill=face_color)
body_im.save(os.path.join(output_dir, "enen_body_base.png"), "PNG")

# 5. Default Original Eye Dots
left_eye_mask = Image.new("L", (W, H), 0)
ImageDraw.Draw(left_eye_mask).ellipse([(190, 180), (230, 215)], fill=255)
left_eye_im = Image.composite(im, Image.new("RGBA", (W, H), (0, 0, 0, 0)), left_eye_mask)
left_eye_im.save(os.path.join(output_dir, "enen_left_eye.png"), "PNG")

right_eye_mask = Image.new("L", (W, H), 0)
ImageDraw.Draw(right_eye_mask).ellipse([(260, 180), (300, 215)], fill=255)
right_eye_im = Image.composite(im, Image.new("RGBA", (W, H), (0, 0, 0, 0)), right_eye_mask)
right_eye_im.save(os.path.join(output_dir, "enen_right_eye.png"), "PNG")

# 6. Ground Shadow
shadow_mask = Image.new("L", (W, H), 0)
ImageDraw.Draw(shadow_mask).rectangle([(0, 470), (W, 522)], fill=255)
shadow_im = Image.composite(im, Image.new("RGBA", (W, H), (0, 0, 0, 0)), shadow_mask)
shadow_im.save(os.path.join(output_dir, "enen_shadow.png"), "PNG")

# 7. Helper function to remove checkerboard/white background from generated sheets
def clean_and_crop(sheet_path, box, bg_threshold=240):
    sheet = Image.open(sheet_path).convert("RGBA")
    crop = sheet.crop(box)
    cw, ch = crop.size
    px = crop.load()
    
    # Transparentify checkerboard / light grey background pixels
    for y in range(ch):
        for x in range(cw):
            r, g, b, a = px[x, y]
            # If color is near-white or light grey checkerboard
            if r > bg_threshold and g > bg_threshold and b > bg_threshold:
                px[x, y] = (0, 0, 0, 0)
            elif abs(r - g) < 8 and abs(g - b) < 8 and r > 215:
                px[x, y] = (0, 0, 0, 0)
                
    # Trim transparent borders
    bbox = crop.getbbox()
    if bbox:
        crop = crop.crop(bbox)
    return crop

print("Extracting expression assets from generated sheets...")
# Sheet 1: 1024x1024 Rich Anime Eyes Sheet
# Row 1 Left: Golden Star Eyes
star_anime = clean_and_crop(expr_sheet1, (50, 80, 480, 260))
star_anime.save(os.path.join(expr_dir, "star_anime.png"))

# Row 1 Right: Pink Heart Eyes
heart_love = clean_and_crop(expr_sheet1, (540, 80, 950, 260))
heart_love.save(os.path.join(expr_dir, "heart_love.png"))

# Row 2 Left: Happy Smiling Curves + Blush + Mouth
happy_blush = clean_and_crop(expr_sheet1, (60, 340, 470, 520))
happy_blush.save(os.path.join(expr_dir, "happy_blush.png"))

# Row 2 Right: Blue Starry Eyes
sparkle_blue = clean_and_crop(expr_sheet1, (530, 330, 950, 520))
sparkle_blue.save(os.path.join(expr_dir, "sparkle_blue.png"))

# Row 3 Left: Playful Wink + Mouth
playful_wink = clean_and_crop(expr_sheet1, (80, 580, 460, 770))
playful_wink.save(os.path.join(expr_dir, "playful_wink.png"))

# Row 3 Right: Cute Rosy Blush Cheeks
blush_cheeks = clean_and_crop(expr_sheet1, (550, 590, 930, 730))
blush_cheeks.save(os.path.join(expr_dir, "blush_cheeks.png"))

# Row 4 Left: Sleeping Eyelashes
sleep_lashes = clean_and_crop(expr_sheet1, (80, 830, 480, 930))
sleep_lashes.save(os.path.join(expr_dir, "sleep_lashes.png"))


# Sheet 2: 1024x1024 Minimalist Crayon Eyes Sheet
# Row 1 Left: Minimal Happy Arcs
min_happy = clean_and_crop(expr_sheet2, (80, 100, 460, 220))
min_happy.save(os.path.join(expr_dir, "min_happy.png"))

# Row 1 Right: Surprised Circles
min_surprised = clean_and_crop(expr_sheet2, (540, 70, 930, 250))
min_surprised.save(os.path.join(expr_dir, "min_surprised.png"))

# Row 2 Left: Dizzy Spirals
min_dizzy = clean_and_crop(expr_sheet2, (80, 300, 460, 480))
min_dizzy.save(os.path.join(expr_dir, "min_dizzy.png"))

# Row 2 Right: Wink Sweat
min_wink_sweat = clean_and_crop(expr_sheet2, (560, 310, 900, 470))
min_wink_sweat.save(os.path.join(expr_dir, "min_wink_sweat.png"))

# Row 3 Left: Diamond Stars
min_diamond_stars = clean_and_crop(expr_sheet2, (100, 550, 440, 700))
min_diamond_stars.save(os.path.join(expr_dir, "min_diamond_stars.png"))

# Row 3 Right: Touched Joy Tears
min_touched_tears = clean_and_crop(expr_sheet2, (530, 560, 940, 710))
min_touched_tears.save(os.path.join(expr_dir, "min_touched_tears.png"))

# Row 4 Left: Sleepy Dashes
min_sleep_dashes = clean_and_crop(expr_sheet2, (90, 810, 450, 880))
min_sleep_dashes.save(os.path.join(expr_dir, "min_sleep_dashes.png"))

# Row 4 Right: Mouths (O & W)
min_mouth_o = clean_and_crop(expr_sheet2, (560, 780, 700, 910))
min_mouth_o.save(os.path.join(expr_dir, "min_mouth_o.png"))

min_mouth_w = clean_and_crop(expr_sheet2, (740, 780, 930, 910))
min_mouth_w.save(os.path.join(expr_dir, "min_mouth_w.png"))

# Test Reassembly
comp = Image.new('RGBA', (W, H), (0, 0, 0, 0))
comp.alpha_composite(shadow_im)
comp.alpha_composite(left_wing_raw)
comp.alpha_composite(right_wing_raw)
comp.alpha_composite(body_im)
comp.alpha_composite(halo_im)
comp.alpha_composite(left_eye_im)
comp.alpha_composite(right_eye_im)
comp.save(os.path.join(output_dir, "enen_clean_reassembled.png"))

print("All layers and expressions processed successfully!")

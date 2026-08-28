import os
from PIL import Image, ImageDraw

src_path = r"C:\Users\Jerry\.gemini\antigravity\brain\0198b957-90fd-47d6-8e0b-d00b1216d601\.user_uploaded\media_1787875559704.png"
output_dir = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"
os.makedirs(output_dir, exist_ok=True)

im = Image.open(src_path).convert("RGBA")
W, H = im.size
print(f"Refining layers for {W}x{H}...")

# 1. Full image
im.save(os.path.join(output_dir, "enen_full.png"), "PNG")
im.save(os.path.join(output_dir, "恩恩_correct.png"), "PNG")

# 2. Extract Left Wing (Smooth curve with root overlapping into the body area)
left_wing_mask = Image.new("L", (W, H), 0)
mask_draw = ImageDraw.Draw(left_wing_mask)
# Polygon covering the left wing and extending into the body under the contour
mask_draw.polygon([
    (0, 130), (145, 140), (160, 200), (145, 275), (80, 275), (0, 240)
], fill=255)
left_wing_im = Image.composite(im, Image.new("RGBA", (W, H), (0, 0, 0, 0)), left_wing_mask)
left_wing_im.save(os.path.join(output_dir, "enen_left_wing.png"), "PNG")

# 3. Extract Right Wing (Smooth curve with root overlapping into the body area)
right_wing_mask = Image.new("L", (W, H), 0)
mask_draw = ImageDraw.Draw(right_wing_mask)
mask_draw.polygon([
    (345, 140), (491, 130), (491, 240), (410, 275), (330, 275), (330, 200)
], fill=255)
right_wing_im = Image.composite(im, Image.new("RGBA", (W, H), (0, 0, 0, 0)), right_wing_mask)
right_wing_im.save(os.path.join(output_dir, "enen_right_wing.png"), "PNG")

# 4. Extract Halo (top halo with golden cross)
halo_mask = Image.new("L", (W, H), 0)
ImageDraw.Draw(halo_mask).ellipse([(80, 0), (415, 175)], fill=255)
halo_im = Image.composite(im, Image.new("RGBA", (W, H), (0, 0, 0, 0)), halo_mask)
halo_im.save(os.path.join(output_dir, "enen_halo.png"), "PNG")

# 5. Extract Eyes
left_eye_mask = Image.new("L", (W, H), 0)
ImageDraw.Draw(left_eye_mask).ellipse([(190, 180), (230, 215)], fill=255)
left_eye_im = Image.composite(im, Image.new("RGBA", (W, H), (0, 0, 0, 0)), left_eye_mask)
left_eye_im.save(os.path.join(output_dir, "enen_left_eye.png"), "PNG")

right_eye_mask = Image.new("L", (W, H), 0)
ImageDraw.Draw(right_eye_mask).ellipse([(260, 180), (300, 215)], fill=255)
right_eye_im = Image.composite(im, Image.new("RGBA", (W, H), (0, 0, 0, 0)), right_eye_mask)
right_eye_im.save(os.path.join(output_dir, "enen_right_eye.png"), "PNG")

# 6. Extract Ground Shadow
shadow_mask = Image.new("L", (W, H), 0)
ImageDraw.Draw(shadow_mask).rectangle([(0, 470), (W, 522)], fill=255)
shadow_im = Image.composite(im, Image.new("RGBA", (W, H), (0, 0, 0, 0)), shadow_mask)
shadow_im.save(os.path.join(output_dir, "enen_shadow.png"), "PNG")

# 7. Create Body Base:
# The body base contains the entire body contour (keeping body outer stroke intact!)
# We only erase the wings OUTSIDE the body contour (x < 115 for left wing, x > 375 for right wing)
# and erase the ground shadow at y > 480.
body_im = im.copy()
body_draw = ImageDraw.Draw(body_im)

# Erase strictly outside body boundary
body_draw.polygon([(0, 140), (115, 150), (110, 270), (0, 240)], fill=(0, 0, 0, 0))
body_draw.polygon([(376, 150), (491, 140), (491, 240), (381, 270)], fill=(0, 0, 0, 0))
body_draw.rectangle([(0, 480), (W, 522)], fill=(0, 0, 0, 0))

# Cover eye pupils with the clean face color
face_color = im.getpixel((245, 195)) # (255, 248, 242, 255)
body_draw.ellipse([(195, 185), (225, 210)], fill=face_color)
body_draw.ellipse([(265, 185), (295, 210)], fill=face_color)

body_im.save(os.path.join(output_dir, "enen_body_base.png"), "PNG")

# Test reassembly
comp = Image.new('RGBA', (W, H), (0, 0, 0, 0))
comp.alpha_composite(shadow_im)
comp.alpha_composite(left_wing_im)
comp.alpha_composite(right_wing_im)
comp.alpha_composite(body_im)
comp.alpha_composite(left_eye_im)
comp.alpha_composite(right_eye_im)
comp.save(os.path.join(output_dir, "enen_reassembled_test.png"))
print("Done refining layers!")

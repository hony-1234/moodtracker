import os
import sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

workspace_dir = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker"
mascot_folder = os.path.join(workspace_dir, "public", "學校圖檔", "吉祥物")
original_path = os.path.join(mascot_folder, "信信-01.png")
artifacts_dir = r"C:\Users\Jerry\.gemini\antigravity\brain\0198b957-90fd-47d6-8e0b-d00b1216d601"
reassembled_path = os.path.join(artifacts_dir, "xinxin_reassembled_test_v4.png")

if not os.path.exists(original_path):
    print("Original not found")
    sys.exit(1)
if not os.path.exists(reassembled_path):
    print("Reassembled not found")
    sys.exit(1)

with Image.open(original_path) as orig_img, Image.open(reassembled_path) as re_img:
    orig_img = orig_img.convert("RGBA")
    re_img = re_img.convert("RGBA")
    
    width, height = orig_img.size
    diff_canvas = Image.new("RGBA", (width, height), (128, 128, 128, 255))
    diff_pixels = diff_canvas.load()
    
    for y in range(height):
        for x in range(width):
            r1, g1, b1, a1 = orig_img.getpixel((x, y))
            r2, g2, b2, a2 = re_img.getpixel((x, y))
            
            # Exclude cleared background (white in original, transparent in reassembled)
            if a1 == 0 and a2 == 0:
                diff_pixels[x, y] = (0, 0, 0, 0)
                continue
            if r1 > 245 and g1 > 245 and b1 > 245 and a2 == 0:
                diff_pixels[x, y] = (0, 0, 0, 0)
                continue
                
            # Exclude legs (y >= 831), flame (y < 212), and eyes (470 <= y <= 580 inside rects), as they are dynamic
            if y >= 831 or y < 212 or (470 <= y <= 580 and (260 <= x <= 325 or 430 <= x <= 490)):
                diff_pixels[x, y] = (0, 0, 0, 0)
                continue
                
            # Visually compare pixels
            if abs(r1 - r2) > 5 or abs(g1 - g2) > 5 or abs(b1 - b2) > 5 or abs(a1 - a2) > 5:
                # Highlight mismatch in bright magenta
                diff_pixels[x, y] = (255, 0, 255, 255)
            else:
                # Draw the original pixel with a faint overlay
                diff_pixels[x, y] = (r1, g1, b1, 100)
                
    out_path = os.path.join(artifacts_dir, "xinxin_diff_map.png")
    diff_canvas.save(out_path, "PNG")
    print(f"Diff visualization map saved to: {out_path}")

import os
import sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

workspace_dir = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker"
mascot_folder = os.path.join(workspace_dir, "public", "學校圖檔", "吉祥物")
original_path = os.path.join(mascot_folder, "信信-01.png")
reassembled_path = os.path.join(workspace_dir, "dist", "assets") # Or from artifacts
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
    re_w, re_h = re_img.size
    print(f"Original size: {width}x{height}, Reassembled size: {re_w}x{re_h}")
    
    diff_count = 0
    diff_by_region = {}
    
    for y in range(height):
        for x in range(width):
            r1, g1, b1, a1 = orig_img.getpixel((x, y))
            r2, g2, b2, a2 = re_img.getpixel((x, y))
            
            # Check if there's any visible difference
            if abs(r1 - r2) > 5 or abs(g1 - g2) > 5 or abs(b1 - b2) > 5 or abs(a1 - a2) > 5:
                # Exclude the background since original has white background, reassembled is transparent
                if a1 == 0 and a2 == 0:
                    continue
                if r1 > 250 and g1 > 250 and b1 > 250 and a2 == 0:
                    # White background cleared, this is expected
                    continue
                # Also exclude legs below y = 831, flame above y = 212, and eyes, as they are dynamic
                if y >= 831 or y < 212 or (470 <= y <= 580 and (260 <= x <= 325 or 430 <= x <= 490)):
                    continue
                    
                diff_count += 1
                region = "Face/Head" if y < 600 else "Torso/Arms"
                diff_by_region[region] = diff_by_region.get(region, 0) + 1
                
                if diff_count <= 20:
                    print(f"Diff at ({x}, {y}): Original=({r1},{g1},{b1},{a1}) | Reassembled=({r2},{g2},{b2},{a2})")
                    
    print(f"\nTotal structural mismatched pixels: {diff_count}")
    print("Mismatch counts by region:", diff_by_region)

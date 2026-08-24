import os
import sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

workspace_dir = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker"
mascot_folder = os.path.join(workspace_dir, "public", "學校圖檔", "吉祥物")
original_path = os.path.join(mascot_folder, "信信-01.png")
artifacts_dir = r"C:\Users\Jerry\.gemini\antigravity\brain\0198b957-90fd-47d6-8e0b-d00b1216d601"
reassembled_path = os.path.join(artifacts_dir, "xinxin_reassembled_test_v4.png")

clusters = [
    {"name": "Cluster 1", "bbox": [526, 235, 526, 253]},
    {"name": "Cluster 2", "bbox": [597, 279, 597, 295]},
    {"name": "Cluster 3", "bbox": [536, 222, 550, 222]},
]

with Image.open(original_path) as orig_img, Image.open(reassembled_path) as re_img:
    orig_img = orig_img.convert("RGBA")
    re_img = re_img.convert("RGBA")
    
    for c in clusters:
        name = c["name"]
        bbox = c["bbox"]
        print(f"\n=== {name} ({bbox}) ===")
        for y in range(bbox[1], bbox[3] + 1):
            for x in range(bbox[0], bbox[2] + 1):
                p1 = orig_img.getpixel((x, y))
                p2 = re_img.getpixel((x, y))
                print(f"  ({x}, {y}) | Original: {p1} | Reassembled: {p2}")

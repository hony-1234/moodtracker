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
    {"name": "Cluster 1", "bbox": [294, 738, 438, 809]},
    {"name": "Cluster 2", "bbox": [478, 576, 552, 675]},
    {"name": "Cluster 3", "bbox": [382, 684, 454, 706]},
    {"name": "Cluster 4", "bbox": [160, 584, 179, 625]},
    {"name": "Cluster 5", "bbox": [286, 212, 380, 214]},
    {"name": "Cluster 6", "bbox": [408, 212, 484, 214]},
]

with Image.open(original_path) as orig_img, Image.open(reassembled_path) as re_img:
    orig_img = orig_img.convert("RGBA")
    re_img = re_img.convert("RGBA")
    
    for c in clusters:
        name = c["name"]
        bbox = c["bbox"]
        print(f"\n=== Inspecting {name}: Bounding Box {bbox} ===")
        
        # Sample a few pixels in the box to see what's different
        diffs = []
        count = 0
        for y in range(bbox[1], bbox[3] + 1):
            for x in range(bbox[0], bbox[2] + 1):
                p1 = orig_img.getpixel((x, y))
                p2 = re_img.getpixel((x, y))
                
                if abs(p1[0] - p2[0]) > 5 or abs(p1[1] - p2[1]) > 5 or abs(p1[2] - p2[2]) > 5 or abs(p1[3] - p2[3]) > 5:
                    count += 1
                    if len(diffs) < 5:
                        diffs.append(((x, y), p1, p2))
                        
        print(f"Total mismatched pixels in this box: {count}")
        print("Sample differences (Coord | Original -> Reassembled):")
        for d in diffs:
            print(f"  {d[0]} | {d[1]} -> {d[2]}")

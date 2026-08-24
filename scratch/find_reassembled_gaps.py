import os
from PIL import Image

folder = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\吉祥物"
original_path = os.path.join(folder, "信信-01.png")
reassembled_path = r"C:\Users\Jerry\.gemini\antigravity\brain\0198b957-90fd-47d6-8e0b-d00b1216d601\xinxin_reassembled_test_v3.png"

if os.path.exists(original_path) and os.path.exists(reassembled_path):
    orig = Image.open(original_path).convert("RGBA")
    reas = Image.open(reassembled_path).convert("RGBA")
    
    if orig.size != reas.size:
        print(f"Size mismatch: Original {orig.size} vs Reassembled {reas.size}")
        # Resize to match or handle
        sys.exit(1)
        
    width, height = orig.size
    orig_pixels = orig.load()
    reas_pixels = reas.load()
    
    gaps = []
    for y in range(height):
        for x in range(width):
            # Check if original is non-transparent (alpha > 10)
            # but reassembled is transparent (alpha <= 10)
            orig_a = orig_pixels[x, y][3]
            reas_a = reas_pixels[x, y][3]
            
            if orig_a > 10 and reas_a <= 10:
                # Also filter out if it's white background that we cleared!
                # Wait, the white background was transparent in reassembled, and was white in original.
                # So if original was off-white, it's not a mascot gap.
                r, g, b, _ = orig_pixels[x, y]
                is_orig_white = (r >= 235 and g >= 235 and b >= 235)
                if not is_orig_white:
                    gaps.append((x, y, orig_pixels[x, y]))
                    
    print(f"Total pixel gaps found: {len(gaps)}")
    if len(gaps) > 0:
        print("First 50 gap coordinates & original colors:")
        for g in gaps[:50]:
            print(f"  Coord: ({g[0]}, {g[1]}) | Original Color: {g[2]}")
            
        # Group gaps by vertical coordinate to see which parts have gaps
        from collections import defaultdict
        y_groups = defaultdict(int)
        for g in gaps:
            y_groups[g[1]] += 1
            
        print("\nGap counts by Y coordinates (top 15 rows with gaps):")
        for y, count in sorted(y_groups.items(), key=lambda item: item[1], reverse=True)[:15]:
            print(f"  Y: {y} | Pixels: {count}")
else:
    print(f"Original path exists: {os.path.exists(original_path)}")
    print(f"Reassembled path exists: {os.path.exists(reassembled_path)}")

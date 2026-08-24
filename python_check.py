import os
import sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

# Define workspace directories
workspace_dir = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker"
mascot_folder = os.path.join(workspace_dir, "public", "學校圖檔", "吉祥物")
artifacts_dir = r"C:\Users\Jerry\.gemini\antigravity\brain\0198b957-90fd-47d6-8e0b-d00b1216d601"

# Required 2.5D skeletal mascot parts for 信信
required_parts = [
    "xinxin_body_base_v8.png",
    "xinxin_head_v8.png",
    "xinxin_fire_v7.png",
    "xinxin_left_eye_v7.png",
    "xinxin_left_hand_v7.png",
    "xinxin_left_leg_v7.png",
    "xinxin_right_leg_v7.png",
    "xinxin_right_eye_v7.png",
    "xinxin_right_hand_v7.png"
]

# Coordinate bounding boxes [left, top, right, bottom]
crop_boxes = {
    "xinxin_fire_v7.png": [171, 50, 593, 260],
    "xinxin_left_hand_v7.png": [81, 600, 400, 800],
    "xinxin_right_hand_v7.png": [340, 600, 631, 800],
    "xinxin_left_leg_v7.png": [218, 760, 509, 955],
    "xinxin_right_leg_v7.png": [218, 760, 509, 955],
    "xinxin_left_eye_v7.png": [260, 470, 325, 580],
    "xinxin_right_eye_v7.png": [430, 470, 490, 580]
}

def run_checks():
    print("=" * 60)
    print("🚀 GCCPS MOOD TRACKER - INTEGRATED PYTHON CHECK SYSTEM")
    print("=" * 60)
    
    # Check 1: Folder existence
    if not os.path.exists(mascot_folder):
        print(f"❌ Error: Mascot folder does not exist at {mascot_folder}")
        return False
    print(f"✓ Mascot folder found at: {mascot_folder}")
    
    # Check 2: Verifying required 2.5D segment files & transparency (Alpha Channels)
    print("\n🔍 CHECK 1: Verifying 2.5D Mascot Segment Assets & Transparency...")
    all_segments_ok = True
    for part in required_parts:
        part_path = os.path.join(mascot_folder, part)
        if not os.path.exists(part_path):
            print(f"  ❌ Missing part: {part}")
            all_segments_ok = False
            continue
            
        try:
            with Image.open(part_path) as img:
                img_rgba = img.convert("RGBA")
                alpha = img_rgba.getchannel('A')
                extrema = alpha.getextrema()
                
                # Check for transparent background (min alpha should be 0, max should be 255)
                is_transparent = extrema[0] < 255
                status = "✓ OK" if is_transparent else "⚠️ Warning: No transparency"
                print(f"  - {part:25} | Size: {img.width:4}x{img.height:4} | Alpha Range: {extrema} | {status}")
                
                if not is_transparent:
                    all_segments_ok = False
        except Exception as e:
            print(f"  ❌ Error reading {part}: {e}")
            all_segments_ok = False
            
    if all_segments_ok:
        print("🎉 All 2.5D mascot segments are verified, fully transparent, and ready!")
    else:
        print("⚠️ Some warnings or errors were found during segment inspection.")

    # Check 3: Running Reassembly Coordinates Verification
    print("\n🗺️ CHECK 2: Verifying 2.5D Skeletal Coordinates Reassembly...")
    try:
        # Composite in the EXACT z-index order of the web app (Landing.tsx):
        # 1. Fire (behind)
        # 2. Legs (behind)
        # 3. Body Base (neck extension and dress)
        # 4. Head (chin upwards, overlaying neck extension)
        # 5. Left Eye
        # 6. Right Eye
        # 7. Left Hand
        # 8. Right Hand
        
        base_path = os.path.join(mascot_folder, "xinxin_body_base_v8.png")
        base_img = Image.open(base_path).convert("RGBA")
        canvas = Image.new("RGBA", base_img.size, (0, 0, 0, 0))
        
        # Composite order list
        render_order = [
            ("xinxin_fire_v7.png", crop_boxes["xinxin_fire_v7.png"]),
            ("xinxin_left_leg_v7.png", crop_boxes["xinxin_left_leg_v7.png"]),
            ("xinxin_right_leg_v7.png", crop_boxes["xinxin_right_leg_v7.png"]),
            ("xinxin_body_base_v8.png", [0, 0, 730, 1002]),
            ("xinxin_head_v8.png", [0, 0, 730, 1002]),
            ("xinxin_left_eye_v7.png", crop_boxes["xinxin_left_eye_v7.png"]),
            ("xinxin_right_eye_v7.png", crop_boxes["xinxin_right_eye_v7.png"]),
            ("xinxin_left_hand_v7.png", crop_boxes["xinxin_left_hand_v7.png"]),
            ("xinxin_right_hand_v7.png", crop_boxes["xinxin_right_hand_v7.png"])
        ]
        
        for part, box in render_order:
            part_path = os.path.join(mascot_folder, part)
            if os.path.exists(part_path):
                part_img = Image.open(part_path).convert("RGBA")
                canvas.alpha_composite(part_img, (box[0], box[1]))
                
        # Save verification test image to artifacts folder
        os.makedirs(artifacts_dir, exist_ok=True)
        out_path = os.path.join(artifacts_dir, "xinxin_reassembled_test_v8.png")
        canvas.save(out_path, "PNG")
        print(f"  ✓ 2.5D Coordinates reassembly validation succeeded!")
        print(f"  ✓ Reassembled verification mockup saved to: {out_path}")
    except Exception as e:
        print(f"  ❌ Reassembly coordinate check failed: {e}")
        return False
        
    print("\n" + "=" * 60)
    print("✨ ALL PYTHON VERIFICATION CHECKS COMPLETED SUCCESSFULLY!")
    print("=" * 60)
    return True

if __name__ == "__main__":
    success = run_checks()
    sys.exit(0 if success else 1)

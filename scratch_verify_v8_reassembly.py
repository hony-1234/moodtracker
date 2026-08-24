import os
import sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

workspace_dir = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker"
mascot_folder = os.path.join(workspace_dir, "public", "學校圖檔", "吉祥物")
artifacts_dir = r"C:\Users\Jerry\.gemini\antigravity\brain\0198b957-90fd-47d6-8e0b-d00b1216d601"

crop_boxes = {
    "xinxin_fire_v7.png": [171, 50, 593, 260],
    "xinxin_left_hand_v7.png": [81, 600, 400, 800],
    "xinxin_right_hand_v7.png": [340, 600, 631, 800],
    "xinxin_left_leg_v7.png": [218, 760, 509, 955],
    "xinxin_right_leg_v7.png": [218, 760, 509, 955],
    "xinxin_left_eye_v7.png": [260, 470, 325, 580],
    "xinxin_right_eye_v7.png": [430, 470, 490, 580]
}

def verify_reassembly():
    print("=" * 60)
    print("🧪 V8 MASCOT SEGMENT REASSEMBLY VERIFICATION")
    print("=" * 60)
    
    try:
        # Load base layer to get proportions
        base_v8_path = os.path.join(mascot_folder, "xinxin_body_base_v8.png")
        base_img = Image.open(base_v8_path).convert("RGBA")
        canvas = Image.new("RGBA", base_img.size, (0, 0, 0, 0))
        
        # New render order incorporating head layer
        render_order = [
            ("xinxin_fire_v7.png", crop_boxes["xinxin_fire_v7.png"]),
            ("xinxin_left_leg_v7.png", crop_boxes["xinxin_left_leg_v7.png"]),
            ("xinxin_right_leg_v7.png", crop_boxes["xinxin_right_leg_v7.png"]),
            ("xinxin_body_base_v8.png", [0, 0, 730, 1002]),
            ("xinxin_head_v8.png", [0, 0, 730, 1002]), # overlay head over the body neck extension
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
                print(f"  ✓ Composite {part:25} at position {box}")
            else:
                print(f"  ❌ Missing part: {part}")
                return False
                
        # Save verification test image to artifacts folder
        os.makedirs(artifacts_dir, exist_ok=True)
        out_path = os.path.join(artifacts_dir, "xinxin_reassembled_test_v8.png")
        canvas.save(out_path, "PNG")
        print(f"\n🎉 2.5D coordinates reassembly succeeded for V8!")
        print(f"🎉 Verification mockup saved to: {out_path}")
        return True
    except Exception as e:
        print(f"  ❌ Reassembly failed: {e}")
        return False

if __name__ == "__main__":
    success = verify_reassembly()
    sys.exit(0 if success else 1)

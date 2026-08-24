import os
from PIL import Image

input_dir = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\scratch_pdf_images"
output_dir = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\scratch_pdf_pngs"
os.makedirs(output_dir, exist_ok=True)

files = os.listdir(input_dir)
print(f"Total files in pdf images: {len(files)}")

for file in files:
    if file.endswith((".jp2", ".png")):
        in_path = os.path.join(input_dir, file)
        out_name = os.path.splitext(file)[0] + ".png"
        out_path = os.path.join(output_dir, out_name)
        try:
            with Image.open(in_path) as img:
                print(f"File {file}: Format={img.format}, Size={img.size}, Mode={img.mode}")
                # Save as PNG
                img.save(out_path, "PNG")
                print(f"  Converted and saved to {out_path}")
        except Exception as e:
            print(f"Error processing {file}: {e}")

import os
from pypdf import PdfReader

pdf_path = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\忠信圖片(更新).pdf"
output_dir = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\scratch_pdf_images"
os.makedirs(output_dir, exist_ok=True)

reader = PdfReader(pdf_path)
print(f"Total pages: {len(reader.pages)}")

for page_idx, page in enumerate(reader.pages):
    print(f"\n--- Page {page_idx + 1} ---")
    images = page.images
    print(f"Number of images on page: {len(images)}")
    for img_idx, img in enumerate(images):
        name = img.name
        data = img.data
        print(f"Image {img_idx + 1}: Name={name}, Size={len(data)} bytes")
        # Save image
        ext = os.path.splitext(name)[1] if os.path.splitext(name)[1] else ".png"
        out_name = f"page_{page_idx+1}_img_{img_idx+1}_{name}"
        if not out_name.endswith(ext):
            out_name += ext
        out_path = os.path.join(output_dir, out_name)
        with open(out_path, "wb") as f:
            f.write(data)
        print(f"  Saved to {out_path}")

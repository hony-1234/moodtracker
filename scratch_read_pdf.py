import os
from pypdf import PdfReader

pdf_path = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\public\學校圖檔\忠信圖片(更新).pdf"

if not os.path.exists(pdf_path):
    print(f"Error: PDF not found at {pdf_path}")
    exit(1)

reader = PdfReader(pdf_path)
print(f"Total pages: {len(reader.pages)}")

for idx, page in enumerate(reader.pages):
    text = page.extract_text()
    if text:
        print(f"--- Page {idx + 1} ---")
        print(text.strip())
    else:
        print(f"--- Page {idx + 1}: No text ---")

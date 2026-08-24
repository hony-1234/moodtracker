import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

# Search for any paragraphs mentioning "信信-02" or "信信-03" in mascot_entries.txt
if not os.path.exists("mascot_entries.txt"):
    print("mascot_entries.txt not found!")
    sys.exit(1)

with open("mascot_entries.txt", "r", encoding="utf-8", errors="ignore") as f:
    text = f.read()

keywords = ["信信-01", "信信-02", "信信-03", "信信1"]
paragraphs = text.split("\n\n")

print(f"Total paragraphs in mascot_entries.txt: {len(paragraphs)}")

for keyword in keywords:
    print(f"\n=== MENTIONS OF {keyword} ===")
    count = 0
    for para in paragraphs:
        if keyword in para:
            print(f"--- Paragraph (contains {keyword}):")
            lines = para.split("\n")
            # print up to 10 lines of the paragraph to avoid clutter
            for line in lines[:20]:
                print("  " + line)
            if len(lines) > 20:
                print("  ...")
            count += 1
            if count >= 3:
                print(f"  (showing first 3 of multiple matches)")
                break
    if count == 0:
        print("  None found.")

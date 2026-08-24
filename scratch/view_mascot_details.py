import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

log_file = "mascot_entries.txt"
if not os.path.exists(log_file):
    print(f"{log_file} not found!")
    sys.exit(1)

with open(log_file, "r", encoding="utf-8", errors="ignore") as f:
    text = f.read()

keywords = ["信信-02", "信信-03"]
paragraphs = text.split("\n\n")

print(f"Total paragraphs: {len(paragraphs)}")

match_count = 0
for i, para in enumerate(paragraphs):
    if any(kw in para for kw in keywords):
        print(f"\n==========================================")
        print(f"MATCHING PARAGRAPH {match_count} (Index {i}):")
        print(f"==========================================")
        print(para)
        match_count += 1
        if match_count >= 10:
            print("Truncated further matches...")
            break

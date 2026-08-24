import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

workspace_dir = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker"

print("Searching for files containing '信信' or 'xinxin' in their name...")
for root, dirs, files in os.walk(workspace_dir):
    for f in files:
        if "信信" in f or "xinxin" in f.lower():
            full_path = os.path.join(root, f)
            rel_path = os.path.relpath(full_path, workspace_dir)
            size = os.path.getsize(full_path)
            print(f"  - {rel_path} | Size: {size} bytes")

import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

landing_path = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\src\components\Portals\Landing.tsx"

if not os.path.exists(landing_path):
    print(f"Error: {landing_path} not found!")
    sys.exit(1)

with open(landing_path, "r", encoding="utf-8") as f:
    content = f.read()

count = content.count("_v6.png")
print(f"Found {count} occurrences of '_v6.png' in Landing.tsx.")

if count > 0:
    new_content = content.replace("_v6.png", "_v7.png")
    with open(landing_path, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Successfully replaced all occurrences with '_v7.png' and saved!")
else:
    print("No occurrences of '_v6.png' found, nothing to replace.")

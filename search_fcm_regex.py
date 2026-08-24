import os
import re

log_path = r"C:\Users\Jerry\.gemini\antigravity\brain\0198b957-90fd-47d6-8e0b-d00b1216d601\.system_generated\logs\transcript.jsonl"

if os.path.exists(log_path):
    print("Scanning for FCM Legacy Keys (starting with AAAA) in logs...")
    # Find all instances of AAAA...
    fcm_pattern = re.compile(r'AAAA[A-Za-z0-9_-]{10,180}')
    with open(log_path, 'r', encoding='utf-8') as f:
        content = f.read()
        matches = fcm_pattern.findall(content)
        if matches:
            unique_matches = sorted(list(set(matches)))
            print(f"Found {len(unique_matches)} unique FCM key matches:")
            for m in unique_matches:
                print(f" - {m}")
        else:
            print("No legacy FCM keys found.")
else:
    print("Logs do not exist.")

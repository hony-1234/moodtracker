import json
import os

log_path = r"C:\Users\Jerry\.gemini\antigravity\brain\0198b957-90fd-47d6-8e0b-d00b1216d601\.system_generated\logs\transcript.jsonl"
out_path = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\scratch\all_user_inputs.txt"

print(f"Reading {log_path}...")
count = 0
with open(out_path, 'w', encoding='utf-8') as out:
    if os.path.exists(log_path):
        with open(log_path, 'r', encoding='utf-8') as f:
            for i, line in enumerate(f):
                try:
                    obj = json.loads(line)
                    if obj.get('type') == 'USER_INPUT' or (obj.get('source') == 'USER_EXPLICIT' and 'content' in obj):
                        content = obj.get('content', '')
                        out.write(f"--- INPUT {count} (Line {i}) ---\n{content}\n\n")
                        count += 1
                except Exception as e:
                    pass
        print(f"Wrote {count} inputs to {out_path}")
    else:
        print("Log file not found.")

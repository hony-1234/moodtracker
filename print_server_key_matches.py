import os
import json
import re

log_path = r"C:\Users\Jerry\.gemini\antigravity\brain\0198b957-90fd-47d6-8e0b-d00b1216d601\.system_generated\logs\transcript.jsonl"
out_path = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\server_key_extracts.txt"

if not os.path.exists(log_path):
    print("Log not found.")
else:
    with open(log_path, "r", encoding="utf-8") as f:
        lines = f.readlines()
    
    with open(out_path, "w", encoding="utf-8") as out:
        out.write("Searching for FCM server key pattern (starts with AAAA) in logs...\n")
        fcm_pattern = re.compile(r'AAAA[A-Za-z0-9_-]{50,200}')
        
        for idx, line in enumerate(lines):
            matches = fcm_pattern.findall(line)
            if matches:
                out.write(f"\n--- Line {idx+1} has key match: ---\n")
                for m in set(matches):
                    out.write(f"Key: {m}\n")
                try:
                    data = json.loads(line)
                    out.write(f"Source: {data.get('source')}, Type: {data.get('type')}\n")
                    out.write(f"Content: {data.get('content', '')[:1000]}\n")
                except:
                    out.write(f"Raw: {line[:1000]}\n")
                    
            if "server key" in line.lower() or "server_key" in line.lower():
                # Let's see if there are other keys
                try:
                    data = json.loads(line)
                    content = data.get("content", "")
                    if "BOAMWObDC" not in content and any(k in content for k in ["key", "Key", "server"]):
                        out.write(f"\n--- Line {idx+1} has 'server key' without VAPID key: ---\n")
                        out.write(f"Source: {data.get('source')}, Type: {data.get('type')}\n")
                        out.write(f"Content: {content[:1000]}\n")
                except:
                    pass
    print("Done search. Output in server_key_extracts.txt")

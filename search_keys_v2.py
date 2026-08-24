import os
import json

log_path = r"C:\Users\Jerry\.gemini\antigravity\brain\0198b957-90fd-47d6-8e0b-d00b1216d601\.system_generated\logs\transcript.jsonl"
out_path = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\key_search_results.txt"

if not os.path.exists(log_path):
    with open(out_path, "w", encoding="utf-8") as out:
        out.write("Log file not found.\n")
else:
    with open(log_path, "r", encoding="utf-8") as f:
        lines = f.readlines()
    
    with open(out_path, "w", encoding="utf-8") as out:
        out.write(f"Total lines in log: {len(lines)}\n")
        count = 0
        for idx, line in enumerate(lines):
            if any(term in line for term in ["fcm_server_key", "server_key", "AAAA", "BOAMWObDC"]):
                try:
                    data = json.loads(line)
                    content = data.get("content", "")
                    if "fcm_server_key" in line or "AAAA" in line or "BOAMWObDC" in line:
                        out.write(f"\n--- Match #{count+1} (Line {idx+1}, Source: {data.get('source')}, Type: {data.get('type')}) ---\n")
                        out.write(content + "\n")
                        count += 1
                except:
                    out.write(f"\n--- Raw Match #{count+1} (Line {idx+1}) ---\n")
                    out.write(line[:1000] + "\n")
                    count += 1
    print(f"Done searching. Found {count} matches.")

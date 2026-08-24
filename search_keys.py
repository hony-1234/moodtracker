import os
import json

log_path = r"C:\Users\Jerry\.gemini\antigravity\brain\0198b957-90fd-47d6-8e0b-d00b1216d601\.system_generated\logs\transcript.jsonl"

if not os.path.exists(log_path):
    print(f"Log path does not exist: {log_path}")
    # Try parent directory
    parent = os.path.dirname(log_path)
    if os.path.exists(parent):
        print(f"Parent dir contents: {os.listdir(parent)}")
else:
    print(f"Searching for keys in {log_path}...")
    found_keys = []
    with open(log_path, 'r', encoding='utf-8') as f:
        for line in f:
            if 'AAAA' in line or 'fcm_server_key' in line or 'AIza' in line:
                # Find occurrences
                found_keys.append(line)
                
    print(f"Found {len(found_keys)} matching lines in transcript.")
    for idx, line in enumerate(found_keys[:30]): # Show first 30 matches
        try:
            data = json.loads(line)
            content = data.get('content', '')
            if content:
                print(f"Match #{idx+1} (Source: {data.get('source')}):")
                # Truncate content to keep it readable
                print(content[:300] + ("..." if len(content) > 300 else ""))
            else:
                # Try step_index
                print(f"Match #{idx+1} (Type: {data.get('type')}): {line[:300]}")
        except Exception as e:
            print(f"Match #{idx+1} (Raw): {line[:300]}")

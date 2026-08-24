import json

log_path = r"C:\Users\Jerry\.gemini\antigravity\brain\0198b957-90fd-47d6-8e0b-d00b1216d601\.system_generated\logs\transcript.jsonl"
keywords = ["gap", "empty", "space", "hole", "white"]

print("User messages matching keywords:")
with open(log_path, "r", encoding="utf-8") as f:
    for line in f:
        try:
            data = json.loads(line)
            # Filter for user messages
            if data.get('type') == 'USER_INPUT' or data.get('source') == 'USER_EXPLICIT':
                content = data.get('content', '')
                if content and any(kw in content.lower() for kw in keywords):
                    print(f"- {content.strip()}")
        except Exception as e:
            pass

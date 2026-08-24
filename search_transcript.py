import json

log_path = r"C:\Users\Jerry\.gemini\antigravity\brain\0198b957-90fd-47d6-8e0b-d00b1216d601\.system_generated\logs\transcript.jsonl"

user_inputs = []
with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            if data.get('type') == 'USER_INPUT' or (data.get('source') == 'USER_EXPLICIT' and 'content' in data):
                user_inputs.append(data)
        except Exception as e:
            pass

mascot_entries = []
with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            # Find elements with content mentioning "些" or "堅" or "mascot" or "吉祥物"
            content = data.get('content', '')
            if content and any(x in content for x in ["些", "堅", "mascot", "吉祥物"]):
                mascot_entries.append((data.get('source'), data.get('type'), content[:400]))
        except Exception as e:
            pass

with open("mascot_entries.txt", "w", encoding="utf-8") as out:
    out.write(f"Total entries found: {len(mascot_entries)}\n")
    for idx, (source, type_, content) in enumerate(mascot_entries):
        out.write(f"[{source} | {type_}] {content}\n\n")



import json

log_path = r"C:\Users\Jerry\.gemini\antigravity\brain\0198b957-90fd-47d6-8e0b-d00b1216d601\.system_generated\logs\transcript.jsonl"

user_inputs = []
with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            if data.get('type') == 'USER_INPUT' or (data.get('source') == 'USER_EXPLICIT' and 'content' in data):
                user_inputs.append(data.get('content', ''))
        except Exception as e:
            pass

with open("scratch/recent_inputs.txt", "w", encoding="utf-8") as out:
    out.write(f"Total user inputs: {len(user_inputs)}\n")
    for idx, inp in enumerate(user_inputs[-30:]):
        out.write(f"\n--- USER INPUT {len(user_inputs) - 30 + idx} ---\n")
        out.write(inp)
        out.write("\n")

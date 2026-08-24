import os
import sys
import json

sys.stdout.reconfigure(encoding='utf-8')

log_path = r"C:\Users\Jerry\.gemini\antigravity\brain\0198b957-90fd-47d6-8e0b-d00b1216d601\.system_generated\logs\transcript.jsonl"

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            step = json.loads(line)
            idx = step.get("step_index", 0)
            if 6840 <= idx <= 6865:
                print(f"\n=== Step {idx} ({step.get('type')}) ===")
                if step.get("content"):
                    print(step.get("content")[:1000] + ("..." if len(step.get("content")) > 1000 else ""))
                if step.get("tool_calls"):
                    print("Tool Calls:", json.dumps(step.get("tool_calls"), indent=2, ensure_ascii=False))
        except Exception as e:
            pass

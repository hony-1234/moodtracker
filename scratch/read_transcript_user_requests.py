import os
import sys
import json

sys.stdout.reconfigure(encoding='utf-8')

log_path = r"C:\Users\Jerry\.gemini\antigravity\brain\0198b957-90fd-47d6-8e0b-d00b1216d601\.system_generated\logs\transcript.jsonl"

if not os.path.exists(log_path):
    print(f"Log path not found at {log_path}")
    sys.exit(1)

print("--- TRANSCRIPT USER INPUTS AND RECENT STEPS ---")
with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            step = json.loads(line)
            source = step.get("source", "")
            step_type = step.get("type", "")
            content = step.get("content", "")
            
            # Print user inputs
            if step_type == "USER_INPUT" or source == "USER_EXPLICIT":
                print(f"\n[Step {step.get('step_index')}] USER:")
                print(content)
                print("-" * 40)
            # Or print model messages that contain user instructions
            elif step_type == "PLANNER_RESPONSE" or step_type == "MODEL_RESPONSE":
                # Only print the last few model responses to keep output concise
                pass
        except Exception as e:
            pass

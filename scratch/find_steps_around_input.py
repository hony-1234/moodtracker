import json

log_path = r"C:\Users\Jerry\.gemini\antigravity\brain\0198b957-90fd-47d6-8e0b-d00b1216d601\.system_generated\logs\transcript.jsonl"

steps = []
with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            steps.append(data)
        except Exception as e:
            pass

print(f"Total steps: {len(steps)}")

# Find index of step containing "try to improve model"
target_idx = -1
for idx, s in enumerate(steps):
    content = s.get('content', '')
    if "try to improve model" in content:
        target_idx = idx
        break

print(f"Target index found: {target_idx}")

if target_idx != -1:
    with open("scratch/steps_around_target.txt", "w", encoding="utf-8") as out:
        # Write 20 steps before and 10 steps after target_idx
        start = max(0, target_idx - 20)
        end = min(len(steps), target_idx + 10)
        for i in range(start, end):
            step = steps[i]
            out.write(f"\n================ STEP {i} (Index: {step.get('step_index')}, Source: {step.get('source')}, Type: {step.get('type')}) ================\n")
            out.write(step.get('content', ''))
            if 'tool_calls' in step:
                out.write("\nTool Calls: " + json.dumps(step.get('tool_calls'), indent=2))
            out.write("\n")
else:
    print("Could not find the target text in steps!")

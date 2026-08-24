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
with open("scratch/last_model_responses.txt", "w", encoding="utf-8") as out:
    # Find model text responses that occurred before step 7000 (since 7081+ is the current run)
    model_responses = []
    for step in reversed(steps):
        step_idx = step.get('step_index', 0)
        if step_idx >= 7000:
            continue
        source = step.get('source')
        type_ = step.get('type')
        content = step.get('content', '')
        # Only model text responses
        if source == 'MODEL' and content and not 'tool_calls' in step:
            model_responses.append(step)
            if len(model_responses) >= 10:
                break
                
    for step in reversed(model_responses):
        out.write(f"\n================ STEP {step.get('step_index')} (Source: {step.get('source')}, Type: {step.get('type')}) ================\n")
        out.write(step.get('content', ''))
        out.write("\n")

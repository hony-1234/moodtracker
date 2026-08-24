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
with open("scratch/recent_messages.txt", "w", encoding="utf-8") as out:
    # Find last 15 steps with source in USER or MODEL and containing text content or tool calls
    recent_relevant = []
    for step in reversed(steps):
        source = step.get('source')
        type_ = step.get('type')
        content = step.get('content', '')
        
        # We want to capture text responses or interesting inputs
        if source in ('USER_EXPLICIT', 'USER', 'SYSTEM') or type_ in ('USER_INPUT', 'PLANNER_RESPONSE', 'MODEL_RESPONSE'):
            # Check if there is content or it's a model response
            if content or 'tool_calls' in step:
                recent_relevant.append(step)
                if len(recent_relevant) >= 30:
                    break
                    
    for idx, step in enumerate(reversed(recent_relevant)):
        out.write(f"\n================ STEP {step.get('step_index')} (Source: {step.get('source')}, Type: {step.get('type')}) ================\n")
        content = step.get('content', '')
        if not content and 'tool_calls' in step:
            content = "Tool Calls: " + json.dumps(step.get('tool_calls'), indent=2)
        out.write(content)
        out.write("\n")

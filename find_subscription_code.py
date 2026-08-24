import os

app_path = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\src\components\Dashboards\TeacherDashboard\PushNotificationPanel.tsx"
out_path = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker\search_results.txt"

if not os.path.exists(app_path):
    with open(out_path, "w", encoding="utf-8") as out:
        out.write(f"File not found: {app_path}\n")
else:
    with open(app_path, "r", encoding="utf-8") as f:
        lines = f.readlines()
    
    with open(out_path, "w", encoding="utf-8") as out:
        out.write("Searching for GCCPS, selectedClass, and safety in PushNotificationPanel.tsx...\n")
        for idx, line in enumerate(lines):
            if any(term in line for term in ["GCCPS", "selectedClass", "safety"]):
                out.write(f"Line {idx + 1}: {line.rstrip()}\n")
    print("Done writing to search_results.txt")

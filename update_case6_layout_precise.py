import re

with open(r"C:\manage\web\app\components\fitness\onboarding\onboarding-flow.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace the specific lines
content = content.replace('                  <div className="space-y-8 pr-[32%]">', '                  <div className="space-y-8">')
content = content.replace('                <div className="space-y-3">', '                <div className="space-y-3 pr-[32%]">', 1)

with open(r"C:\manage\web\app\components\fitness\onboarding\onboarding-flow.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated successfully!")

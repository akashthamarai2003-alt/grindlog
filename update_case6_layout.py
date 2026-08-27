with open(r"C:\manage\web\app\components\fitness\onboarding\onboarding-flow.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_wrapper = '''              <div className="pt-6">
                <StepHeader title="Workout Environment" subtitle="Where will you train?" />
                <div className="space-y-8 pr-[32%]">
                  <div className="space-y-3">'''

new_wrapper = '''              <div className="pt-6">
                <StepHeader title="Workout Environment" subtitle="Where will you train?" />
                <div className="space-y-8">
                  <div className="space-y-3 pr-[32%]">'''

content = content.replace(old_wrapper, new_wrapper)

with open(r"C:\manage\web\app\components\fitness\onboarding\onboarding-flow.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated successfully!")

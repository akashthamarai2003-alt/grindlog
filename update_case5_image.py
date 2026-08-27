import re

with open(r"C:\manage\web\app\components\fitness\onboarding\onboarding-flow.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace Image tag
old_image = '''<Image 
                src="/images/wan2.7-image_b_make_thi_man_to_x_me.png" 
                alt="Background" 
                fill 
                className="object-cover object-top opacity-100 scale-[1.05]" 
                priority
                unoptimized
              />'''
new_image = '''<Image 
                src="/images/wan2.7-image_b_make_thi_man_to_x_me.png" 
                alt="Background" 
                fill 
                className="object-cover object-top opacity-100 -translate-y-[80px] scale-[1.15]" 
                priority
                unoptimized
              />'''
content = content.replace(old_image, new_image)

# Replace gradients
old_gradients = '''{/* Simple gradient from solid black at bottom to transparent at top */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050905] via-[#050905]/80 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#050905] via-[#050905]/60 to-transparent opacity-90" />'''

new_gradients = '''{/* Simple gradient from solid black at bottom to transparent at top */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050905] via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#050905] via-[#050905]/80 to-transparent w-[85%]" />'''
              
content = content.replace(old_gradients, new_gradients)

with open(r"C:\manage\web\app\components\fitness\onboarding\onboarding-flow.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated successfully")

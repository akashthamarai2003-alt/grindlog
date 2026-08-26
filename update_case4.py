import re

with open(r"C:\manage\web\app\components\fitness\onboarding\onboarding-flow.tsx", "r", encoding="utf-8") as f:
    content = f.read()

target = '''              <div className="space-y-4">
                {[
                  { id: "Lose Fat", emoji: "🔥" },
                  { id: "Build Muscle", emoji: "💪" },
                  { id: "Gain Weight", emoji: "📈" },
                  { id: "Lose Fat + Build Muscle", emoji: "🔥💪" },
                  { id: "Build Strength", emoji: "🏋️" },
                  { id: "Improve Fitness", emoji: "🏃" },
                  { id: "Maintain", emoji: "⚖️" }
                ].map(opt => (
                  <motion.button
                    key={opt.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleUpdate({ goal: opt.id as any })}
                    className={`w-full flex items-center p-4 rounded-2xl border-2 text-left transition-all ${
                      data.goal === opt.id ? "border-[#ADFF00] bg-[#ADFF00]/10" : "border-[#1A2619] bg-[#0D150D] hover:border-[#233522]"
                    }`}
                  >
                    <div className={`text-2xl mr-4 ${data.goal === opt.id ? "" : "opacity-70 grayscale"}`}>
                      {opt.emoji}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold text-lg ${data.goal === opt.id ? "text-[#ADFF00]" : "text-gray-200"}`}>{opt.id}</h3>
                    </div>
                    {data.goal === opt.id && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[#ADFF00] ml-4">
                        <Check size={24} />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>'''

replacement = '''              <div className="space-y-3">
                {[
                  { id: "Lose Fat", img: "/images/goals/goal-1.png", desc: "Reduce body fat & get lean" },
                  { id: "Build Muscle", img: "/images/goals/goal-2.png", desc: "Build size & muscular definition" },
                  { id: "Gain Weight", img: "/images/goals/goal-3.png", desc: "Increase healthy body weight" },
                  { id: "Lose Fat + Build Muscle", img: "/images/goals/goal-4.png", desc: "Get lean while building muscle" },
                  { id: "Build Strength", img: "/images/goals/goal-5.png", desc: "Increase power & lifting performance" },
                  { id: "Improve Fitness", img: "/images/goals/goal-6.png", desc: "Improve endurance & overall fitness" },
                  { id: "Maintain", img: "/images/goals/goal-7.png", desc: "Stay strong & maintain your physique" }
                ].map((opt, i) => {
                  const isSelected = data.goal === opt.id;
                  return (
                    <motion.button
                      key={opt.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleUpdate({ goal: opt.id as any })}
                      className={`w-full flex items-center p-3 rounded-2xl border-[1.5px] text-left transition-all ${
                        isSelected ? "border-[#ADFF00] shadow-[0_0_20px_rgba(173,255,0,0.15)] bg-gradient-to-r from-[#ADFF00]/5 to-transparent" : "border-[#1A2619] bg-[#0A1108] hover:border-[#233522]"
                      }`}
                    >
                      <div className={`relative w-[60px] h-[60px] rounded-full overflow-hidden mr-4 border-2 ${isSelected ? "border-[#ADFF00]" : "border-[#1A2619]"}`}>
                        <Image src={opt.img} alt={opt.id} fill className="object-cover" unoptimized />
                        {!isSelected && <div className="absolute inset-0 bg-black/40" />}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className={`font-bold text-[17px] tracking-tight ${isSelected ? "text-white" : "text-gray-200"}`}>{opt.id}</h3>
                        <p className={`text-[13px] leading-snug mt-0.5 ${isSelected ? "text-gray-300" : "text-gray-500"}`}>{opt.desc}</p>
                      </div>
                      
                      <div className="ml-4 mr-2">
                        <div className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected ? "border-[#ADFF00]" : "border-gray-600"
                        }`}>
                          {isSelected && <div className="w-[10px] h-[10px] rounded-full bg-[#ADFF00]" />}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>'''

# The original has emojis which might mess up regex. I'll just use a regex block replace for the `space-y-4` div.

# We'll use re.sub for safety
pattern = re.compile(r'<\s*div\s+className="space-y-4".*?<\s*/div\s*>', re.DOTALL)
new_content, count = pattern.subn(replacement, content)

if count > 0:
    with open(r"C:\manage\web\app\components\fitness\onboarding\onboarding-flow.tsx", "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Replaced!")
else:
    print("Not found! Let me search for it.")
    # let's try a different pattern.
    pattern2 = re.compile(r'<div className="space-y-4">.*?</div>\s*<BottomBar', re.DOTALL)
    replacement2 = replacement + "\n                  <BottomBar"
    new_content2, count2 = pattern2.subn(replacement2, content)
    if count2 > 0:
        with open(r"C:\manage\web\app\components\fitness\onboarding\onboarding-flow.tsx", "w", encoding="utf-8") as f:
            f.write(new_content2)
        print("Replaced with pattern2!")
    else:
        print("Failed both.")

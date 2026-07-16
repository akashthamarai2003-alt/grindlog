import Link from "next/link";
import { 
  Sprout, 
  Brain, 
  Dumbbell, 
  BookOpen, 
  Target, 
  Wallet, 
  Moon, 
  GraduationCap, 
  Calendar, 
  LineChart,
  Trophy,
  Medal,
  Gift
} from "lucide-react";

import { ForwardRefExoticComponent, RefAttributes } from "react";
import { LucideProps } from "lucide-react";
import { NotificationPrompt } from "@/components/notifications/notification-prompt";

type Module = {
  id: string;
  name: string;
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  path: string;
  color: string;
  comingSoon?: boolean;
};

const MODULES: Module[] = [
  { id: "habits", name: "Habits", icon: Sprout, path: "/dashboard", color: "from-[#34C759] to-[#28a745]" },
  { id: "coach", name: "AI Coach", icon: Brain, path: "/coach", color: "from-[#007AFF] to-[#5856D6]" },
  { id: "planner", name: "Planner", icon: Calendar, path: "/calendar", color: "from-[#FF9500] to-[#FF3B30]" },
  { id: "analytics", name: "Analytics", icon: LineChart, path: "/analytics", color: "from-[#5856D6] to-[#AF52DE]" },
  { id: "fitness", name: "Fitness", icon: Dumbbell, path: "/fitness", color: "from-[#FF2D55] to-[#FF3B30]" },
  { id: "journal", name: "Journal", icon: BookOpen, path: "/journal", color: "from-[#00C7BE] to-[#32ADE6]" },
  { id: "goals", name: "Goals", icon: Target, path: "/goals", color: "from-[#FFD60A] to-[#FF9500]" },
  { id: "finance", name: "Finance", icon: Wallet, path: "/finance", color: "from-[#30B0C7] to-[#007AFF]" },
  { id: "sleep", name: "Sleep", icon: Moon, path: "/sleep", color: "from-[#5856D6] to-[#3A3A3C]" },
  { id: "learning", name: "Learning", icon: GraduationCap, path: "/learning", color: "from-[#FF9500] to-[#FF2D55]" },
  { id: "achievements", name: "Achievements", icon: Trophy, path: "/achievements", color: "from-[#FFD60A] to-[#FF9500]" },
  { id: "quests", name: "Quests", icon: Target, path: "/quests", color: "from-[#FF2D55] to-[#AF52DE]" },
  { id: "leaderboard", name: "Leaderboard", icon: Medal, path: "/leaderboard", color: "from-[#007AFF] to-[#32ADE6]" },
  { id: "season", name: "Season Rewards", icon: Gift, path: "/season", color: "from-[#34C759] to-[#00C7BE]" },
];

export default function HubPage() {
  return (
    <div className="flex flex-col min-h-dvh px-5 pb-8 pt-4 safe-top bg-[var(--color-bg-primary)]">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-[var(--color-text-primary)] tracking-tight">
          Life Hub
        </h1>
        <p className="text-sm font-semibold text-[var(--color-text-secondary)] mt-1">
          All your modules in one place.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {MODULES.map((mod) => {
          const Icon = mod.icon;
          return (
            <Link 
              key={mod.id} 
              href={mod.path}
              className="relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-[24px] bg-[var(--color-bg-elevated)] p-6 shadow-sm ring-1 ring-[var(--color-bg-tertiary)]/50 transition-transform hover:scale-95 active:scale-90"
            >
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${mod.color} shadow-sm`}>
                <Icon className="h-7 w-7 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-[13px] font-bold text-[var(--color-text-primary)] tracking-wide">
                {mod.name}
              </span>
              
              {mod.comingSoon && (
                <div className="absolute right-0 top-0 flex h-full w-full items-center justify-center bg-[var(--color-bg-elevated)]/80 backdrop-blur-sm">
                  <span className="rounded-full bg-[var(--color-bg-tertiary)] px-2 py-1 text-[10px] font-black uppercase tracking-wider text-[var(--color-text-secondary)]">
                    Soon
                  </span>
                </div>
              )}
            </Link>
          );
        })}
      </div>
      
      <NotificationPrompt />
      
      <div className="h-8" />
    </div>
  );
}

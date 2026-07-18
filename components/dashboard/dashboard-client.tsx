"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from 'next/dynamic';
import confetti from "canvas-confetti";
import { Bell, Quote, Trophy, Flame, Plus, Sparkles, Target, Medal, Gift, CircleDollarSign } from "lucide-react";
import { HabitCard } from "@/components/habits/habit-card";
import { Confetti } from "@/components/gamification/confetti";
import { toggleHabitCompletion, getHabitLogsForDate, updateHabitRemark } from "@/app/actions/habits";
import { isHabitScheduled } from "@/lib/habit-utils";
import { createClient } from "@/lib/services/supabase/client";

const NotificationPrompt = dynamic(() => import('@/components/notifications/notification-prompt').then(mod => mod.NotificationPrompt), {
  ssr: false,
});

interface Profile {
  display_name: string;
  xp: number;
  level: number;
  coins?: number;
}

interface HabitWithLog {
  id: string;
  name: string;
  emoji: string;
  frequency?: string;
  customDays?: number[] | null;
  targetCount: number;
  targetUnit: string;
  color: string;
  currentStreak: number;
  isCompleted: boolean;
  preferredTime?: string;
  reminderTime?: string | null;
  createdAt?: string;
}

interface DashboardClientProps {
  profile: Profile;
  initialHabits: HabitWithLog[];
  todayDateStr: string;
}

const QUOTES = [
  { text: "Discipline is doing what needs to be done, even when you don't feel like it.", author: "Unknown" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
  { text: "Success is the product of daily habits—not once-in-a-lifetime transformations.", author: "James Clear" },
  { text: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "James Clear" },
  { text: "He who conquers himself is the mightiest warrior.", author: "Confucius" },
  { text: "It is not that we have a short time to live, but that we waste a lot of it.", author: "Seneca" },
  { text: "Amateurs sit and wait for inspiration, the rest of us just get up and go to work.", author: "Stephen King" },
  { text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
  { text: "The secret of your future is hidden in your daily routine.", author: "Mike Murdock" },
  { text: "Don't count the days, make the days count.", author: "Muhammad Ali" },
  { text: "Waste no more time arguing what a good man should be. Be one.", author: "Marcus Aurelius" },
  { text: "If you want to achieve greatness stop asking for permission.", author: "Anonymous" },
  { text: "Things work out best for those who make the best of how things work out.", author: "John Wooden" },
  { text: "To live a creative life, we must lose our fear of being wrong.", author: "Anonymous" },
  { text: "If you are not willing to risk the usual you will have to settle for the ordinary.", author: "Jim Rohn" },
  { text: "Trust because you are willing to accept the risk, not because it's safe or certain.", author: "Anonymous" },
  { text: "All our dreams can come true if we have the courage to pursue them.", author: "Walt Disney" },
  { text: "Good things come to people who wait, but better things come to those who go out and get them.", author: "Anonymous" },
  { text: "If you do what you always did, you will get what you always got.", author: "Anonymous" },
  { text: "Success is walking from failure to failure with no loss of enthusiasm.", author: "Winston Churchill" },
  { text: "Just when the caterpillar thought the world was ending, he turned into a butterfly.", author: "Proverb" },
  { text: "Successful entrepreneurs are givers and not takers of positive energy.", author: "Anonymous" },
  { text: "Whenever you see a successful person you only see the public glories, never the private sacrifices to reach them.", author: "Vaibhav Shah" },
  { text: "Opportunities don't happen, you create them.", author: "Chris Grosser" },
  { text: "Try not to become a person of success, but rather try to become a person of value.", author: "Albert Einstein" },
  { text: "Great minds discuss ideas; average minds discuss events; small minds discuss people.", author: "Eleanor Roosevelt" },
  { text: "I have not failed. I've just found 10,000 ways that won't work.", author: "Thomas A. Edison" },
  { text: "If you don't value your time, neither will others. Stop giving away your time and talents—start charging for it.", author: "Kim Garst" },
  { text: "A successful man is one who can lay a firm foundation with the bricks others have thrown at him.", author: "David Brinkley" },
  { text: "No one can make you feel inferior without your consent.", author: "Eleanor Roosevelt" },
  { text: "The whole secret of a successful life is to find out what is one's destiny to do, and then do it.", author: "Henry Ford" },
  { text: "If you're going through hell keep going.", author: "Winston Churchill" },
  { text: "What seems to us as bitter trials are often blessings in disguise.", author: "Oscar Wilde" },
  { text: "The meaning of life is to find your gift. The purpose of life is to give it away.", author: "Anonymous" },
  { text: "The distance between insanity and genius is measured only by success.", author: "Bruce Feirstein" },
  { text: "When you stop chasing the wrong things, you give the right things a chance to catch you.", author: "Lolly Daskal" },
  { text: "I believe that the only courage anybody ever needs is the courage to follow their own dreams.", author: "Oprah Winfrey" },
  { text: "No masterpiece was ever created by a lazy artist.", author: "Anonymous" },
  { text: "Happiness is a butterfly, which when pursued, is always just beyond your grasp, but which, if you will sit down quietly, may alight upon you.", author: "Nathaniel Hawthorne" },
  { text: "If you can't explain it simply, you don't understand it well enough.", author: "Albert Einstein" },
  { text: "Blessed are those who can give without remembering and take without forgetting.", author: "Anonymous" },
  { text: "Do one thing every day that scares you.", author: "Anonymous" },
  { text: "What's the point of being alive if you don't at least try to do something remarkable.", author: "Anonymous" },
  { text: "Life is not about finding yourself. Life is about creating yourself.", author: "Lolly Daskal" },
  { text: "Nothing in the world is more common than unsuccessful people with talent.", author: "Anonymous" },
  { text: "Knowledge is being aware of what you can do. Wisdom is knowing when not to do it.", author: "Anonymous" },
  { text: "Your problem isn't the problem. Your reaction is the problem.", author: "Anonymous" },
  { text: "You can do anything, but not everything.", author: "Anonymous" },
  { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
  { text: "There are two types of people who will tell you that you cannot make a difference in this world: those who are afraid to try and those who are afraid you will succeed.", author: "Ray Goforth" },
  { text: "Thinking should become your capital asset, no matter whatever ups and downs you come across in your life.", author: "A.P.J. Abdul Kalam" },
  { text: "I find that the harder I work, the more luck I seem to have.", author: "Thomas Jefferson" },
  { text: "The starting point of all achievement is desire.", author: "Napoleon Hill" },
  { text: "Success is the sum of small efforts, repeated day-in and day-out.", author: "Robert Collier" },
  { text: "If you want to achieve excellence, you can get there today. As of this second, quit doing less-than-excellent work.", author: "Thomas J. Watson" },
  { text: "All progress takes place outside the comfort zone.", author: "Michael John Bobak" },
  { text: "You may only succeed if you desire succeeding; you may only fail if you do not mind failing.", author: "Philippos" },
  { text: "Courage is resistance to fear, mastery of fear—not absence of fear.", author: "Mark Twain" },
  { text: "Only put off until tomorrow what you are willing to die having left undone.", author: "Pablo Picasso" },
  { text: "People often say that motivation doesn't last. Well, neither does bathing—that's why we recommend it daily.", author: "Zig Ziglar" },
  { text: "We become what we think about most of the time, and that's the strangest secret.", author: "Earl Nightingale" },
  { text: "The only place where success comes before work is in the dictionary.", author: "Vidal Sassoon" },
  { text: "Too many of us are not living our dreams because we are living our fears.", author: "Les Brown" },
  { text: "I find that when you have a real interest in life and a curious life, that sleep is not the most important thing.", author: "Martha Stewart" },
  { text: "It's not what you look at that matters, it's what you see.", author: "Anonymous" },
  { text: "The road to success and the road to failure are almost exactly the same.", author: "Colin R. Davis" },
  { text: "The function of leadership is to produce more leaders, not more followers.", author: "Ralph Nader" },
  { text: "Success is liking yourself, liking what you do, and liking how you do it.", author: "Maya Angelou" },
  { text: "As we look ahead into the next century, leaders will be those who empower others.", author: "Bill Gates" },
  { text: "A real entrepreneur is somebody who has no safety net underneath them.", author: "Henry Kravis" },
  { text: "The first step toward success is taken when you refuse to be a captive of the environment in which you first find yourself.", author: "Mark Caine" },
  { text: "People who succeed have momentum. The more they succeed, the more they want to succeed, and the more they find a way to succeed.", author: "Tony Robbins" },
  { text: "When I dare to be powerful, to use my strength in the service of my vision, then it becomes less and less important whether I am afraid.", author: "Audre Lorde" },
  { text: "Whenever you find yourself on the side of the majority, it is time to pause and reflect.", author: "Mark Twain" },
  { text: "The successful warrior is the average man, with laser-like focus.", author: "Bruce Lee" },
  { text: "There is no traffic jam along the extra mile.", author: "Roger Staubach" },
  { text: "Develop success from failures. Discouragement and failure are two of the surest stepping stones to success.", author: "Dale Carnegie" },
  { text: "If you don't design your own life plan, chances are you'll fall into someone else's plan. And guess what they have planned for you? Not much.", author: "Jim Rohn" },
  { text: "If you genuinely want something, don't wait for it—teach yourself to be impatient.", author: "Gurbaksh Chahal" },
  { text: "Don't let the fear of losing be greater than the excitement of winning.", author: "Robert Kiyosaki" },
  { text: "If you want to make a permanent change, stop focusing on the size of your problems and start focusing on the size of you!", author: "T. Harv Eker" },
  { text: "You can't connect the dots looking forward; you can only connect them looking backwards. So you have to trust that the dots will somehow connect in your future.", author: "Steve Jobs" },
  { text: "Two roads diverged in a wood and I  took the one less traveled by, and that has made all the difference.", author: "Robert Frost" },
  { text: "The number one reason people fail in life is because they listen to their friends, family, and neighbors.", author: "Napoleon Hill" },
  { text: "The reason most people never reach their goals is that they don't define them, or ever seriously consider them as believable or achievable.", author: "Denis Waitley" },
  { text: "In my experience, there is only one motivation, and that is desire. No reasons or principle contain it or stand against it.", author: "Jane Smiley" },
  { text: "Success does not consist in never making mistakes but in never making the same one a second time.", author: "George Bernard Shaw" },
  { text: "I don't want to get to the end of my life and find that I lived just the length of it. I want to have lived the width of it as well.", author: "Diane Ackerman" },
  { text: "You must expect great things of yourself before you can do them.", author: "Michael Jordan" },
  { text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
  { text: "People rarely succeed unless they have fun in what they are doing.", author: "Dale Carnegie" },
  { text: "There is no chance, no destiny, no fate, that can hinder or control the firm resolve of a determined soul.", author: "Ella Wheeler Wilcox" },
  { text: "Our greatest fear should not be of failure but of succeeding at things in life that don't really matter.", author: "Francis Chan" },
  { text: "You've got to get up every morning with determination if you're going to go to bed with satisfaction.", author: "George Lorimer" },
  { text: "A goal is not always meant to be reached; it often serves simply as something to aim at.", author: "Bruce Lee" },
  { text: "Success is ... knowing your purpose in life, growing to reach your maximum potential, and sowing seeds that benefit others.", author: "John C. Maxwell" },
  { text: "Be miserable. Or motivate yourself. Whatever has to be done, it's always your choice.", author: "Wayne Dyer" },
  { text: "To accomplish great things, we must not only act, but also dream, not only plan, but also believe.", author: "Anatole France" },
  { text: "Most of the important things in the world have been accomplished by people who have kept on trying when there seemed to be no help at all.", author: "Dale Carnegie" },
  { text: "You measure the size of the accomplishment by the obstacles you had to overcome to reach your goals.", author: "Booker T. Washington" }
];

export function DashboardClient({ profile, initialHabits, todayDateStr }: DashboardClientProps) {
  const supabase = createClient();
  const [showConfetti, setShowConfetti] = useState(false);
  const [optimisticHabits, setOptimisticHabits] = useState(initialHabits);
  const [optimisticXp, setOptimisticXp] = useState(profile.xp);
  const [optimisticCoins, setOptimisticCoins] = useState(profile.coins || 0);
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [selectedDateStr, setSelectedDateStr] = useState(todayDateStr);
  const [isFetchingLogs, setIsFetchingLogs] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);
  const [cheatConfirm, setCheatConfirm] = useState<{habitId: string, currentCompletedStatus: boolean, streak: number} | null>(null);
  const [remarkPrompt, setRemarkPrompt] = useState<{ habitId: string; dateStr: string; } | null>(null);
  const [remarkText, setRemarkText] = useState("");
  const [isSavingRemark, setIsSavingRemark] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [greeting, setGreeting] = useState("Hello,");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning,");
    else if (hour < 18) setGreeting("Good Afternoon,");
    else setGreeting("Good Evening,");
  }, []);

  useEffect(() => {
    if (!hasMounted) {
      setHasMounted(true);
      return;
    }
    async function loadLogs() {
      setIsFetchingLogs(true);
      const logs = await getHabitLogsForDate(selectedDateStr);
      const logsMap = new Map(logs.map((l: any) => [l.habit_id, l.status]));
      setOptimisticHabits(prev => prev.map(h => ({
        ...h,
        isCompleted: logsMap.get(h.id) === "completed"
      })));
      setIsFetchingLogs(false);
    }
    loadLogs();
  }, [selectedDateStr, hasMounted]);

  useEffect(() => {
    async function loadUnreadCount() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { count } = await supabase
        .from("in_app_notifications")
        .select("*", { count: "exact", head: true })
        .eq("read", false);
      setUnreadCount(count || 0);
    }
    loadUnreadCount();
  }, []);
  useEffect(() => {
    // Generate a consistent index for the day so they get a "Quote of the Day"
    // that only changes when the actual day changes, ensuring they see new ones sequentially.
    const dateObj = new Date(todayDateStr);
    const dayOfYear = Math.floor((dateObj.getTime() - new Date(dateObj.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
    setQuoteIdx(dayOfYear % QUOTES.length);
  }, [todayDateStr]);

  const visibleHabits = useMemo(() => {
    return optimisticHabits.filter(h => {
      // 1. Must be created on or before the selected date
      if (h.createdAt) {
        const createdDateStr = h.createdAt.split("T")[0];
        if (createdDateStr > selectedDateStr) return false;
      }
      
      // 2. Must be scheduled for this day of the week
      const dateObj = new Date(selectedDateStr + "T12:00:00Z");
      return isHabitScheduled(h.frequency, h.customDays, dateObj);
    });
  }, [optimisticHabits, selectedDateStr]);

  const completedCount = visibleHabits.filter((h) => h.isCompleted).length;
  const totalCount = visibleHabits.length;
  const progressPct = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
  const isPerfectDay = totalCount > 0 && completedCount === totalCount;

  // Calculate level progress (assuming 1000 XP per level)
  const currentLevelXp = optimisticXp % 1000;
  const levelProgressPct = currentLevelXp / 1000;
  const nextLevelTotalXp = (profile.level * 1000);

  // Generate week calendar for visual strip
  const today = new Date();
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    const dayOfWeek = today.getDay() || 7; 
    d.setDate(today.getDate() - dayOfWeek + 1 + i); // Start from Monday
    const dateStr = d.toISOString().split("T")[0];
    return {
      dayStr: ["S", "M", "T", "W", "T", "F", "S"][d.getDay()],
      isToday: dateStr === todayDateStr,
      isSelected: dateStr === selectedDateStr,
      dateObj: d,
      dateStr: dateStr,
    };
  });

  const handleHabitComplete = async (habitId: string, currentCompletedStatus: boolean, streak: number) => {
    const newStatus = !currentCompletedStatus;
    
    // Optimistic UI update
    if (newStatus) {
      setOptimisticXp(prev => prev + 10);
      setOptimisticCoins(prev => prev + 5);
      
      // Prompt for remark
      setRemarkPrompt({ habitId, dateStr: selectedDateStr });
      setRemarkText("");
      
      const newCompletedCount = completedCount + 1;
      if (newCompletedCount === totalCount && totalCount > 0 && !isPerfectDay) {
        // Trigger a single, clean poppers blast for Perfect Day
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { x: 0, y: 1 },
          colors: ['#FFD700', '#FF9500', '#34C759'],
          angle: 60,
        });
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { x: 1, y: 1 },
          colors: ['#FFD700', '#FF9500', '#34C759'],
          angle: 120,
        });
      } else {
        setShowConfetti(true);
      }
    } else {
      setOptimisticXp(prev => Math.max(0, prev - 10)); // Revert if un-checked
      setOptimisticCoins(prev => Math.max(0, prev - 5));
    }

    setOptimisticHabits(prev => 
      prev.map(h => h.id === habitId ? { ...h, isCompleted: newStatus } : h)
    );

    // Call server action
    try {
      await toggleHabitCompletion(habitId, selectedDateStr, newStatus, streak, 10);
    } catch (e) {
      // Revert on failure
      setOptimisticHabits(initialHabits);
      setOptimisticXp(profile.xp);
      setOptimisticCoins(profile.coins || 0);
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col gap-7 px-5 pb-8 pt-4 safe-top min-h-dvh">
      {/* Dashboard-Specific Background Picture - Full Screen */}
      <div 
        className="fixed inset-0 z-[-2] bg-cover bg-center bg-no-repeat bg-fixed"
        style={{ backgroundImage: 'url("/background.png")' }}
      />
      <Confetti trigger={showConfetti} onComplete={() => setShowConfetti(false)} />

      {/* Header */}
      <div className="flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex flex-col">
          <p className="text-[13px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
            {greeting}
          </p>
          <h1 className="text-3xl font-black text-[var(--color-text-primary)] tracking-tight flex items-center gap-2 mt-0.5">
            {profile.display_name?.split(' ')[0] || "There"} <span className="inline-block origin-bottom-right animate-tree-sway">👋</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/tree" prefetch={true} className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#34C759]/10 hover:bg-[#34C759]/20 text-[#34C759] transition-colors shadow-sm ring-1 ring-[#34C759]/20 overflow-hidden">
            <Image src="/tree-in-the-wind.svg" width={32} height={32} alt="Tree" className="drop-shadow-sm scale-[1.15]" />
          </Link>
          <Link href="/notifications" prefetch={true} className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors">
            <Bell className="h-5 w-5 text-[var(--color-text-secondary)]" />
            {unreadCount > 0 && (
              <div className="absolute top-0 right-0 -mr-1 -mt-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[var(--color-bg-primary)] bg-[var(--color-error)] text-[10px] font-bold text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </div>
            )}
          </Link>
          <Link href="/profile" prefetch={true}>
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#34C759] to-[#28a745] text-white shadow-sm ring-2 ring-[var(--color-bg-primary)] ring-offset-1">
              <span className="font-bold text-lg">{profile.display_name?.charAt(0).toUpperCase() || "?"}</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Hero Card */}
      <div 
        className="relative overflow-hidden rounded-[32px] p-6 shadow-xl animate-in fade-in zoom-in-95 duration-500 group border border-[var(--color-bg-tertiary)]/50"
      >
        {/* User-Provided Background Picture */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out group-hover:scale-105"
          style={{ backgroundImage: 'url("/modal-card-bg.png")' }}
        />
        
        {/* Transparent overlay so the bright meadow is ALWAYS visible, regardless of device theme */}
        <div className="absolute inset-0 bg-white/10" />
        
        {/* Inner ring */}
        <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-[32px]" />
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h3 className="text-5xl font-black tracking-tighter text-slate-900 drop-shadow-sm">
              {completedCount}
              <span className="text-2xl text-slate-700">/{totalCount}</span>
            </h3>
            <p className="text-[15px] font-bold text-slate-700 drop-shadow-sm">Done Today ✨</p>
            
            {/* Streak Badge */}
            <div className="mt-2 flex items-center gap-1.5 w-max rounded-[12px] bg-white/60 backdrop-blur-md px-3 py-1.5 shadow-sm ring-1 ring-black/5">
              <Flame className="h-4 w-4 fill-[#FF9500] text-[#FF9500]" />
              <span className="text-xs font-black text-slate-900 drop-shadow-sm">
                {visibleHabits.reduce((acc, h) => Math.max(acc, h.currentStreak), 0)} Day Streak
              </span>
            </div>
          </div>
          
          {/* Progress Ring */}
          <div className="relative flex h-[100px] w-[100px] items-center justify-center">
            {/* Outer Glow */}
            <div className="absolute inset-0 rounded-full bg-[#34C759] opacity-20 blur-xl" />
            
            <svg className="h-full w-full rotate-[-90deg] drop-shadow-sm" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" className="fill-none stroke-black/5 stroke-[10]" />
              <circle
                cx="50"
                cy="50"
                r="42"
                className="fill-none stroke-[url(#progressGradient)] stroke-[10]"
                strokeLinecap="round"
                strokeDasharray="263.89"
                strokeDashoffset={263.89 - (263.89 * Math.max(progressPct, 1)) / 100}
                style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)" }}
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#34C759" />
                  <stop offset="100%" stopColor="#32ADE6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-black text-slate-900 drop-shadow-sm">{Math.round(progressPct)}%</span>
            </div>
          </div>
        </div>
        
        {/* Level & XP Bar */}
        <div className="relative z-10 mt-6 flex flex-col gap-2.5 rounded-[20px] bg-white/50 p-4 shadow-sm ring-1 ring-black/5 backdrop-blur-md">
          <div className="flex items-center justify-between text-[13px] font-black">
            <span className="text-slate-900 flex items-center gap-1.5 drop-shadow-sm">
              <Sparkles className="h-4 w-4 text-[#FF9500]" />
              Level {profile.level}
            </span>
            <span className="text-slate-700 drop-shadow-sm">Next Level</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-black/10 shadow-inner ring-1 ring-inset ring-black/5">
            <div
              className="relative h-full rounded-full bg-gradient-to-r from-[#34C759] via-[#00C7BE] to-[#32ADE6] transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,199,190,0.5)]"
              style={{ width: `${Math.max(levelProgressPct * 100, 2)}%` }}
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/30 to-transparent" />
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 uppercase tracking-wider drop-shadow-sm">
            <span>{optimisticXp.toLocaleString()} XP</span>
            <span>{nextLevelTotalXp.toLocaleString()} XP</span>
          </div>
        </div>
      </div>

      {/* Gamification Quick Links */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scroll-pl-5 scroll-pr-5 snap-x hide-scrollbar">
        {[
          { name: "Quests", icon: Target, path: "/quests", color: "from-[#FF2D55] to-[#AF52DE]" },
          { name: "Leaderboard", icon: Medal, path: "/leaderboard", color: "from-[#007AFF] to-[#32ADE6]" },
          { name: "Achievements", icon: Trophy, path: "/achievements", color: "from-[#FFD60A] to-[#FF9500]" },
          { name: "Season", icon: Gift, path: "/season", color: "from-[#34C759] to-[#00C7BE]" },
        ].map((item) => (
          <Link 
            key={item.name} 
            href={item.path}
            onClick={() => setNavigatingTo(item.name)}
            className="snap-start shrink-0 flex items-center gap-3 rounded-[20px] bg-[var(--color-bg-elevated)] p-3 pr-6 shadow-sm ring-1 ring-[var(--color-bg-tertiary)]/50 transition-transform active:scale-95 relative overflow-hidden"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} shadow-sm relative z-10`}>
              {navigatingTo === item.name ? (
                <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <item.icon className="h-5 w-5 text-white" strokeWidth={2.5} />
              )}
            </div>
            <span className="text-[13px] font-bold text-[var(--color-text-primary)] relative z-10">
              {item.name}
            </span>
            {navigatingTo === item.name && (
              <div className="absolute inset-0 bg-white/40 dark:bg-black/20 z-0 animate-pulse" />
            )}
          </Link>
        ))}
      </div>

      {/* Mini Week Calendar Strip */}
      <div className="flex justify-between rounded-[20px] bg-[var(--color-bg-elevated)] p-4 shadow-sm ring-1 ring-[var(--color-bg-tertiary)]/50">
        {weekDays.map((day, i) => {
          const isFuture = day.dateStr > todayDateStr;
          return (
          <div key={i} className="flex flex-col items-center gap-2">
            <span className="text-[11px] font-bold text-[var(--color-text-tertiary)]">{day.dayStr}</span>
            <div 
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all ${
              day.isSelected
                ? isPerfectDay
                  ? "bg-[var(--color-accent-green)] text-white shadow-[var(--shadow-glow-green)]"
                  : "ring-2 ring-[var(--color-accent-green)] ring-offset-2 ring-offset-[var(--color-bg-elevated)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]"
                : day.isToday
                  ? "ring-1 ring-[var(--color-accent-green)]/50 text-[var(--color-accent-green)] hover:bg-[var(--color-bg-tertiary)] cursor-pointer"
                  : `bg-[var(--color-bg-secondary)] text-[var(--color-text-tertiary)] ${isFuture ? "opacity-30 cursor-not-allowed" : "hover:bg-[var(--color-bg-tertiary)] cursor-pointer"}`
            }`}
              onClick={() => {
                if (!isFuture) setSelectedDateStr(day.dateStr);
              }}
            >
              {day.dateObj.getDate()}
            </div>
          </div>
        )})}
      </div>

      {/* Perfect Day Banner */}
      {isPerfectDay && (
          <div
            className="flex items-center justify-center gap-2 rounded-[20px] bg-gradient-to-r from-[#FFD700]/20 via-[#FF9500]/20 to-[#FFD700]/20 py-3 text-sm font-extrabold text-[#d48806] ring-1 ring-[#FFD700]/30 shadow-sm animate-in fade-in zoom-in-95 duration-300"
          >
            <Trophy className="h-4 w-4" />
            Perfect Day Achieved!
            <Trophy className="h-4 w-4" />
          </div>
      )}

      {/* Today's Habits */}
      <div
        className={`flex flex-col gap-4 transition-opacity duration-300 ${isFetchingLogs ? "opacity-50 pointer-events-none" : "opacity-100"} animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 fill-mode-both`}
      >
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black tracking-tight text-[var(--color-text-primary)]">
              {selectedDateStr === todayDateStr ? "Today's Habits" : new Date(selectedDateStr).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            </h2>
            <Link href="/store" prefetch={true} className="flex items-center gap-1 rounded-full bg-[#FFD60A]/15 px-2.5 py-1 shadow-sm ring-1 ring-[#FFD60A]/30 transition-transform hover:scale-105 active:scale-95 ml-1">
              <CircleDollarSign className="h-3.5 w-3.5 text-[#d48806]" />
              <span className="text-xs font-black text-[#d48806]">{optimisticCoins}</span>
            </Link>
            <Link href="/habits/new" prefetch={true} className="inline-flex ml-1">
              <button 
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-accent-green)]/15 text-[var(--color-accent-green)] hover:bg-[var(--color-accent-green)]/25 hover:scale-105 active:scale-95 transition-all shadow-sm"
                title="Add Habit"
              >
                <Plus className="h-4 w-4" strokeWidth={3.5} />
              </button>
            </Link>
          </div>
          <Link href="/habits" className="rounded-full bg-[var(--color-bg-secondary)] px-3 py-1 text-xs font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
            See All
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          {visibleHabits.length === 0 ? (
            <div className="text-center p-6 bg-[var(--color-bg-elevated)] rounded-2xl border border-dashed border-[var(--color-bg-tertiary)]">
              <p className="text-sm font-semibold text-[var(--color-text-secondary)]">No active habits today.</p>
              <Link href="/habits/new" className="mt-2 inline-block rounded-full bg-[var(--color-accent-green)]/10 px-4 py-2 text-xs font-bold text-[var(--color-accent-green)]">
                + Add a new habit
              </Link>
            </div>
          ) : (
            <>
              {visibleHabits.map((habit) => (
                <div key={habit.id}>
                  <HabitCard 
                    habit={habit} 
                    onComplete={() => {
                      if (!habit.isCompleted && selectedDateStr < todayDateStr) {
                        setCheatConfirm({ habitId: habit.id, currentCompletedStatus: habit.isCompleted, streak: habit.currentStreak });
                        return;
                      }
                      handleHabitComplete(habit.id, habit.isCompleted, habit.currentStreak);
                    }} 
                  />
                </div>
              ))}
              <div>
                <Link 
                  href="/habits/new" 
                  prefetch={true}
                  className="group relative overflow-hidden flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#34C759]/40 py-4 text-sm font-bold text-[#34C759] transition-all hover:border-[#34C759] hover:bg-[#34C759]/10 bg-[var(--color-bg-elevated)]"
                  style={{ boxShadow: 'var(--shadow-card)' }}
                >
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#34C759]/20 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full" />
                  <Sparkles className="h-5 w-5 text-[#34C759] fill-[#34C759] animate-pulse drop-shadow-[0_0_8px_rgba(52,199,89,0.6)]" />
                  <span className="relative z-10 drop-shadow-sm">
                    Add a Habit
                  </span>
                  <Sparkles className="h-5 w-5 text-[#34C759] fill-[#34C759] animate-pulse drop-shadow-[0_0_8px_rgba(52,199,89,0.6)]" style={{ animationDelay: '300ms' }} />
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Today's Quote */}
      <div 
        className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both"
      >
        <h2 className="text-lg font-black tracking-tight text-[var(--color-text-primary)] px-1">Inspiration</h2>
        <div className="relative overflow-hidden rounded-[24px] p-6 shadow-xl ring-1 ring-white/10">
          <Image 
            src="/inspiration.png" 
            alt="Inspiration Background" 
            fill 
            className="object-cover absolute inset-0 z-0" 
            priority
          />
          <div className="absolute inset-0 bg-black/50 z-0" />
          <Quote className="absolute -right-4 -top-4 h-32 w-32 text-white/5 rotate-12" />
          
          <div className="relative z-10 flex flex-col gap-5">
            <p className="text-[15px] font-medium italic leading-relaxed text-slate-200">
              "{QUOTES[quoteIdx].text}"
            </p>
            <div className="flex items-center gap-3">
              <div className="h-[1px] w-8 bg-amber-500/50" />
              <p className="text-xs font-bold text-amber-500 uppercase tracking-[0.2em]">{QUOTES[quoteIdx].author}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Notification Prompt (only shows if not enabled) */}
      <NotificationPrompt variant="modal" />

      <div className="h-6" />

    {/* ── Anti-Cheat Modal ── */}
      {cheatConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[var(--color-bg-primary)] p-6 rounded-[28px] w-full max-w-[320px] shadow-2xl flex flex-col items-center text-center gap-4 border-2 border-[#FF3B30]/20 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <div className="w-14 h-14 rounded-full bg-[#FF3B30]/10 flex items-center justify-center mb-1">
              <span className="text-3xl">🛑</span>
            </div>
            <h2 className="text-lg font-black text-[var(--color-text-primary)] tracking-tight">Don't cheat yourself!</h2>
            <p className="text-[13px] font-bold text-[var(--color-text-secondary)] leading-relaxed">
              If you really completed this habit on this day, then only check in. Did you actually do it?
            </p>
            
            <div className="flex gap-2 w-full mt-3">
              <button
                onClick={() => setCheatConfirm(null)}
                className="flex-1 py-3.5 rounded-[18px] font-black text-[13px] uppercase tracking-wide bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] active:scale-95 transition-transform"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleHabitComplete(cheatConfirm.habitId, cheatConfirm.currentCompletedStatus, cheatConfirm.streak);
                  setCheatConfirm(null);
                }}
                className="flex-1 py-3.5 rounded-[18px] font-black text-[13px] uppercase tracking-wide bg-[#34C759] text-white shadow-[0_0_20px_rgba(52,199,89,0.4)] active:scale-95 transition-transform"
              >
                Yes, I did it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Remark Prompt Modal ── */}
      {remarkPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[var(--color-bg-primary)] p-6 rounded-[28px] w-full max-w-[320px] shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)]">
                <Quote className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-black text-[var(--color-text-primary)] tracking-tight">Add a Remark</h2>
            </div>
            <p className="text-[13px] font-medium text-[var(--color-text-secondary)]">
              How did it go? You can add a small note (optional).
            </p>
            
            <textarea
              value={remarkText}
              onChange={(e) => setRemarkText(e.target.value)}
              placeholder="e.g., I did leg day..."
              className="w-full resize-none rounded-xl bg-[var(--color-bg-secondary)] p-3 text-[14px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-blue)]"
              rows={3}
            />
            
            <div className="flex gap-2 w-full mt-2">
              <button
                onClick={() => setRemarkPrompt(null)}
                disabled={isSavingRemark}
                className="flex-1 py-3 rounded-[16px] font-bold text-[13px] bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition-colors disabled:opacity-50"
              >
                Skip
              </button>
              <button
                disabled={isSavingRemark || !remarkText.trim()}
                onClick={async () => {
                  setIsSavingRemark(true);
                  try {
                    await updateHabitRemark(remarkPrompt.habitId, remarkPrompt.dateStr, remarkText.trim());
                  } finally {
                    setIsSavingRemark(false);
                    setRemarkPrompt(null);
                  }
                }}
                className="flex-1 py-3 rounded-[16px] font-bold text-[13px] bg-[var(--color-accent-blue)] text-white hover:bg-[var(--color-accent-blue)]/90 transition-colors disabled:opacity-50"
              >
                {isSavingRemark ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

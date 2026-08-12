import { FitnessGuard } from "@/components/fitness/fitness-guard";
import { ChevronLeft, ChevronRight, Bell, Search, Bot, Plus, ArrowRight, Droplet, RefreshCw, Zap, TrendingUp, MoreHorizontal, Apple, Beef, Coffee, Salad } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function NutritionIndexPage() {
  const today = new Date().toLocaleDateString("en-US", { 
    weekday: 'short', month: 'short', day: 'numeric' 
  });

  return (
    <FitnessGuard>
      <div className="min-h-screen bg-[#0A1108] text-white">
        <div className="w-full max-w-md mx-auto px-5 pt-8 pb-32">
          
          {/* 1. Nutrition header */}
          <div className="flex items-center justify-between mb-6">
            <Link href="/fitness" className="w-10 h-10 flex items-center justify-center rounded-full bg-[#111A10] border border-white/5 text-white/70 hover:text-white hover:bg-white/5 transition-all">
              <ChevronLeft size={20} />
            </Link>
            
            <div className="text-center">
              <h1 className="text-base font-black tracking-widest text-white uppercase">Nutrition</h1>
              <p className="text-[11px] font-bold text-[#ADFF00] tracking-widest uppercase mt-1">{today}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 rounded-full bg-[#111A10] border border-white/5 flex items-center justify-center relative hover:bg-white/5 transition-all group">
                <Bell size={18} className="text-white/70 group-hover:text-white" />
                <div className="absolute top-3 right-3 w-1.5 h-1.5 bg-[#ADFF00] rounded-full" />
              </button>
              <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden bg-[#111A10]">
                {/* Fallback Avatar */}
                <div className="w-full h-full bg-gradient-to-br from-[#ADFF00]/20 to-[#ADFF00]/5 flex items-center justify-center">
                  <span className="text-[#ADFF00] font-bold text-sm">AK</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            
            {/* 2. Today's Nutrition card */}
            <div className="bg-[#111A10] border border-white/5 rounded-[24px] p-5 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#ADFF00]/5 blur-[40px] rounded-full pointer-events-none" />
              
              <div className="flex justify-between items-end mb-6 relative z-10">
                <div>
                  <p className="text-[11px] font-black tracking-widest text-[#ADFF00] uppercase mb-1">Calories Remaining</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white tracking-tighter">580</span>
                    <span className="text-sm font-bold text-white/50">kcal</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-white/60">1420 / 2000 consumed</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-3 w-full bg-black/40 rounded-full mb-6 overflow-hidden relative z-10 p-0.5">
                <div className="h-full bg-gradient-to-r from-[#ADFF00] to-[#88cc00] rounded-full relative" style={{ width: '71%' }}>
                  <div className="absolute inset-0 bg-white/20 w-full rounded-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)' }} />
                </div>
              </div>

              {/* Macros */}
              <div className="grid grid-cols-3 gap-3 relative z-10">
                <div className="bg-[#0A1108] rounded-2xl p-3 border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-white/60 uppercase tracking-wider">Protein</span>
                    <span className="text-[10px] font-bold text-[#ADFF00]">82/130g</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#ADFF00] rounded-full" style={{ width: '63%' }} />
                  </div>
                </div>
                <div className="bg-[#0A1108] rounded-2xl p-3 border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-white/60 uppercase tracking-wider">Carbs</span>
                    <span className="text-[10px] font-bold text-blue-400">165/220g</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-400 rounded-full" style={{ width: '75%' }} />
                  </div>
                </div>
                <div className="bg-[#0A1108] rounded-2xl p-3 border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-white/60 uppercase tracking-wider">Fat</span>
                    <span className="text-[10px] font-bold text-orange-400">42/65g</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-400 rounded-full" style={{ width: '64%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Daily Target card */}
            <div className="bg-[#111A10] border border-white/5 rounded-[24px] p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[11px] font-black tracking-widest text-white uppercase">Your Daily Targets</h3>
                <button className="text-[10px] font-black tracking-widest text-white/40 uppercase hover:text-[#ADFF00] transition-colors flex items-center gap-1">
                  Why these targets? <ChevronRight size={12} />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div className="flex flex-col items-center justify-center bg-black/30 rounded-xl py-3 border border-white/5">
                  <span className="text-[10px] text-white/50 font-bold uppercase mb-1">Cals</span>
                  <span className="text-sm font-black text-white">2000</span>
                </div>
                <div className="flex flex-col items-center justify-center bg-black/30 rounded-xl py-3 border border-white/5">
                  <span className="text-[10px] text-white/50 font-bold uppercase mb-1">Pro</span>
                  <span className="text-sm font-black text-[#ADFF00]">130g</span>
                </div>
                <div className="flex flex-col items-center justify-center bg-black/30 rounded-xl py-3 border border-white/5">
                  <span className="text-[10px] text-white/50 font-bold uppercase mb-1">Carb</span>
                  <span className="text-sm font-black text-blue-400">220g</span>
                </div>
                <div className="flex flex-col items-center justify-center bg-black/30 rounded-xl py-3 border border-white/5">
                  <span className="text-[10px] text-white/50 font-bold uppercase mb-1">Fat</span>
                  <span className="text-sm font-black text-orange-400">65g</span>
                </div>
              </div>
            </div>

            {/* 4. Today's Meals section */}
            <div className="mt-8 mb-4">
              <h2 className="text-[13px] font-black tracking-widest text-white uppercase px-1">Today&apos;s Meals</h2>
            </div>
            
            <div className="space-y-3">
              {/* Breakfast */}
              <div className="bg-[#111A10] border border-[#ADFF00]/20 rounded-[24px] p-5 shadow-[0_0_15px_rgba(173,255,0,0.03)]">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#ADFF00]/10 flex items-center justify-center text-[#ADFF00]">
                      <Coffee size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Breakfast</h3>
                      <p className="text-xs text-white/50 font-medium">Logged at 8:30 AM</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-white">450 <span className="text-[10px] text-white/50">kcal</span></p>
                    <p className="text-xs font-bold text-[#ADFF00]">35g Protein</p>
                  </div>
                </div>
                
                <div className="bg-black/30 rounded-xl p-3 border border-white/5 mb-4">
                  <ul className="text-[13px] font-medium text-white/80 space-y-2">
                    <li className="flex justify-between"><span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-white/20"/> Oatmeal with Berries</span><span className="text-white/40">250 kcal</span></li>
                    <li className="flex justify-between"><span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-white/20"/> Whey Protein Shake</span><span className="text-white/40">120 kcal</span></li>
                    <li className="flex justify-between"><span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-white/20"/> Black Coffee</span><span className="text-white/40">5 kcal</span></li>
                  </ul>
                </div>
                
                <div className="flex gap-2">
                  <button className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[11px] font-black tracking-widest uppercase text-white/70 transition-all flex justify-center items-center gap-2">
                    <RefreshCw size={14} /> Swap Meal
                  </button>
                  <button className="py-2.5 px-4 bg-[#ADFF00]/10 hover:bg-[#ADFF00]/20 border border-[#ADFF00]/20 rounded-xl text-[11px] font-black tracking-widest uppercase text-[#ADFF00] transition-all flex justify-center items-center">
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Lunch */}
              <div className="bg-[#111A10] border border-white/5 rounded-[24px] p-5 opacity-90">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60">
                      <Salad size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white/90">Lunch</h3>
                      <p className="text-xs text-white/50 font-medium">Planned</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-white/80">650 <span className="text-[10px] text-white/50">kcal</span></p>
                    <p className="text-xs font-bold text-white/50">40g Protein</p>
                  </div>
                </div>
                
                <div className="bg-black/30 rounded-xl p-3 border border-white/5 mb-4">
                  <ul className="text-[13px] font-medium text-white/60 space-y-2">
                    <li className="flex justify-between"><span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-white/10"/> Grilled Chicken Breast</span><span className="text-white/30">300 kcal</span></li>
                    <li className="flex justify-between"><span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-white/10"/> Quinoa Bowl</span><span className="text-white/30">250 kcal</span></li>
                  </ul>
                </div>
                
                <div className="flex gap-2">
                  <button className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[11px] font-black tracking-widest uppercase text-white/70 transition-all flex justify-center items-center gap-2">
                    <RefreshCw size={14} /> Swap Meal
                  </button>
                  <button className="flex-1 py-2.5 bg-[#ADFF00] hover:bg-[#ADFF00]/90 text-black rounded-xl text-[11px] font-black tracking-widest uppercase transition-all flex justify-center items-center gap-2">
                    <CheckCircleIcon /> Log Meal
                  </button>
                </div>
              </div>

              {/* Snack */}
              <div className="bg-[#111A10] border border-white/5 rounded-[24px] p-5 opacity-90">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60">
                      <Apple size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white/90">Snack</h3>
                      <p className="text-xs text-white/50 font-medium">Planned</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-white/80">320 <span className="text-[10px] text-white/50">kcal</span></p>
                    <p className="text-xs font-bold text-white/50">15g Protein</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[11px] font-black tracking-widest uppercase text-white/70 transition-all flex justify-center items-center gap-2">
                    <RefreshCw size={14} /> Swap Meal
                  </button>
                  <button className="flex-1 py-2.5 bg-[#ADFF00] hover:bg-[#ADFF00]/90 text-black rounded-xl text-[11px] font-black tracking-widest uppercase transition-all flex justify-center items-center gap-2">
                    <CheckCircleIcon /> Log Meal
                  </button>
                </div>
              </div>

              {/* Dinner */}
              <div className="bg-[#111A10] border border-white/5 rounded-[24px] p-5 opacity-90">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60">
                      <Beef size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white/90">Dinner</h3>
                      <p className="text-xs text-white/50 font-medium">Planned</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-white/80">600 <span className="text-[10px] text-white/50">kcal</span></p>
                    <p className="text-xs font-bold text-white/50">40g Protein</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[11px] font-black tracking-widest uppercase text-white/70 transition-all flex justify-center items-center gap-2">
                    <RefreshCw size={14} /> Swap Meal
                  </button>
                  <button className="flex-1 py-2.5 bg-[#ADFF00] hover:bg-[#ADFF00]/90 text-black rounded-xl text-[11px] font-black tracking-widest uppercase transition-all flex justify-center items-center gap-2">
                    <CheckCircleIcon /> Log Meal
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions Row */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              {/* 5. Protein Target */}
              <div className="bg-[#111A10] border border-white/5 rounded-[24px] p-5 flex flex-col justify-between">
                <div>
                  <h3 className="text-[10px] font-black tracking-widest text-[#ADFF00] uppercase mb-1">Protein Goal</h3>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-black text-white">82</span>
                    <span className="text-sm font-bold text-white/40 pb-1">/ 130g</span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="h-1.5 w-full bg-white/5 rounded-full mb-2">
                    <div className="h-full bg-[#ADFF00] rounded-full" style={{ width: '63%' }} />
                  </div>
                  <p className="text-[10px] font-bold text-white/50">48g remaining</p>
                </div>
              </div>

              {/* 6. Food Budget */}
              <div className="bg-[#111A10] border border-white/5 rounded-[24px] p-5 flex flex-col justify-between">
                <div>
                  <h3 className="text-[10px] font-black tracking-widest text-emerald-400 uppercase mb-1">Food Budget</h3>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-black text-white">₹72</span>
                    <span className="text-sm font-bold text-white/40 pb-1">/ 100</span>
                  </div>
                  <p className="text-[10px] font-bold text-white/40 mt-1">Today</p>
                </div>
                <div className="mt-2">
                  <p className="text-[10px] font-bold text-white/60">₹1850 / ₹2000 Monthly</p>
                </div>
              </div>
            </div>

            {/* 7. Hydration card */}
            <div className="bg-[#111A10] border border-white/5 rounded-[24px] p-5 mt-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/5 blur-[30px] rounded-full pointer-events-none" />
              <div className="flex justify-between items-center relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-cyan-400/10 flex items-center justify-center text-cyan-400 border border-cyan-400/20">
                    <Droplet size={24} />
                  </div>
                  <div>
                    <h3 className="text-[11px] font-black tracking-widest text-cyan-400 uppercase mb-1">Hydration</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-white">1.8</span>
                      <span className="text-sm font-bold text-white/50">/ 2.5L</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase text-white hover:bg-white/10 transition-colors">+ 250ml</button>
                  <button className="px-4 py-1.5 bg-cyan-400/10 border border-cyan-400/20 rounded-full text-[10px] font-black uppercase text-cyan-400 hover:bg-cyan-400/20 transition-colors">+ 500ml</button>
                </div>
              </div>
            </div>

            {/* 10. Today's Summary section */}
            <div className="mt-8 mb-4">
              <h2 className="text-[13px] font-black tracking-widest text-white uppercase px-1">Today&apos;s Summary</h2>
            </div>
            
            <div className="bg-[#111A10] border border-white/5 rounded-[24px] p-5 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40"><Zap size={14} /></div>
                <div>
                  <p className="text-[10px] text-white/50 uppercase font-bold">Calories</p>
                  <p className="text-sm font-black text-white">1420 / 2000</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#ADFF00]/10 flex items-center justify-center text-[#ADFF00]"><Apple size={14} /></div>
                <div>
                  <p className="text-[10px] text-white/50 uppercase font-bold">Protein</p>
                  <p className="text-sm font-black text-white">82 / 130g</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-cyan-400/10 flex items-center justify-center text-cyan-400"><Droplet size={14} /></div>
                <div>
                  <p className="text-[10px] text-white/50 uppercase font-bold">Water</p>
                  <p className="text-sm font-black text-white">1.8 / 2.5L</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40"><Apple size={14} /></div>
                <div>
                  <p className="text-[10px] text-white/50 uppercase font-bold">Meals</p>
                  <p className="text-sm font-black text-white">1 / 4 done</p>
                </div>
              </div>
            </div>

          </div>

          {/* Floating Action Buttons */}
          <div className="fixed bottom-24 right-5 flex flex-col gap-3 z-40">
            {/* 9. Ask AI FAB */}
            <button className="w-12 h-12 rounded-full bg-[#111A10] border border-white/10 flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
              <Bot size={20} className="text-white" />
            </button>
            {/* 8. Add Food FAB */}
            <button className="w-14 h-14 rounded-full bg-[#ADFF00] flex items-center justify-center shadow-[0_0_20px_rgba(173,255,0,0.3)] hover:scale-105 transition-transform">
              <Plus size={24} className="text-black" />
            </button>
          </div>

        </div>
      </div>
    </FitnessGuard>
  );
}

function CheckCircleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}

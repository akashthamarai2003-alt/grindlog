"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Brain, Send, Mic, Sparkles, Sprout, Target, LineChart,
  Flame, Plus, Check, RefreshCw, Loader2, Calendar, Clock,
  BookOpen, CheckCircle2, AlertCircle, HelpCircle, ArrowRight, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { TimePicker12h } from "@/components/ui/time-picker-12h";
import {
  generateHabitsAction,
  addHabitFromAIAction,
  generateWeeklyReportAction,
  getCoachResponseAction,
  generatePredictionsAction,
  generateMotivationAction,
  generateSuggestionsAction,
  generateScheduleBuilderAction,
  generateReflectionAction
} from "@/app/actions/ai";
import { createMessageTopUpOrder, verifyMessageTopUpPayment } from "@/app/actions/payment";
import Script from "next/script";
import { useKeyboard } from "@/hooks/use-keyboard";

type Tab =
  | "coach"
  | "generator"
  | "report"
  | "predictions"
  | "motivation"
  | "suggestions"
  | "schedule"
  | "reflection";

const TABS: { id: Tab; label: string; icon: any; color: string }[] = [
  { id: "coach", label: "AI Coach", icon: Brain, color: "from-[#007AFF] to-[#5856D6]" },
  { id: "generator", label: "Habit Gen", icon: Sprout, color: "from-[#34C759] to-[#28A745]" },
  { id: "report", label: "Weekly Report", icon: LineChart, color: "from-[#FF2D55] to-[#FF3B30]" },
  { id: "predictions", label: "Predictions", icon: Target, color: "from-[#5856D6] to-[#AF52DE]" },
  { id: "motivation", label: "Motivation", icon: Flame, color: "from-[#FF9500] to-[#FF3B30]" },
  { id: "suggestions", label: "Suggestions", icon: Sparkles, color: "from-[#00C7BE] to-[#32ADE6]" },
  { id: "schedule", label: "Schedule", icon: Calendar, color: "from-[#30B0C7] to-[#007AFF]" },
  { id: "reflection", label: "Reflection", icon: BookOpen, color: "from-[#FFD60A] to-[#FF9500]" },
];

export default function CoachPage() {
  const [activeTab, setActiveTab] = useState<Tab>("coach");
  const { isKeyboardOpen, viewportHeight } = useKeyboard();

  // 1. AI Coach Chat State
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([
    { role: "assistant", content: "Welcome to your AI Growth Lab! Ask me anything about your progress, habits, or design a custom schedule below." }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatLoading]);

  // Bulletproof visual viewport pinning for mobile keyboards
  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;
    
    const vv = window.visualViewport;
    const updatePosition = () => {
      if (containerRef.current) {
        // Stick strictly to the visual viewport, cancelling out any layout viewport panning
        containerRef.current.style.top = `${vv.offsetTop}px`;
        containerRef.current.style.height = `${vv.height}px`;
      }
    };

    vv.addEventListener("scroll", updatePosition);
    vv.addEventListener("resize", updatePosition);
    // Initial call
    updatePosition();

    return () => {
      vv.removeEventListener("scroll", updatePosition);
      vv.removeEventListener("resize", updatePosition);
    };
  }, []);

  // 2. AI Habit Generator State
  const [generatorGoal, setGeneratorGoal] = useState("");
  const [generatedHabits, setGeneratedHabits] = useState<any[]>([]);
  const [generatorLoading, setGeneratorLoading] = useState(false);
  const [addedHabits, setAddedHabits] = useState<Record<number, boolean>>({});

  // 3. AI Weekly Report State
  const [weeklyReport, setWeeklyReport] = useState<any>(null);
  const [reportLoading, setReportLoading] = useState(false);

  // 4. AI Predictions State
  const [predictions, setPredictions] = useState<any[]>([]);
  const [predictionsLoading, setPredictionsLoading] = useState(false);

  // 5. AI Motivation State
  const [motivation, setMotivation] = useState<any>(null);
  const [motivationLoading, setMotivationLoading] = useState(false);

  // 6. AI Suggestions State
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [addedSuggestions, setAddedSuggestions] = useState<Record<number, boolean>>({});

  // 7. AI Schedule Builder State
  const [wakeTime, setWakeTime] = useState("07:00");
  const [sleepTime, setSleepTime] = useState("23:00");
  const [scheduleFocus, setScheduleFocus] = useState("");
  const [generatedSchedule, setGeneratedSchedule] = useState<any[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  // 8. AI Reflection State
  const [reflectionInput, setReflectionInput] = useState("");
  const [reflectionResult, setReflectionResult] = useState<any | null>(null);
  const [reflectionLoading, setReflectionLoading] = useState(false);

  // Top Up Modal State
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpLoading, setTopUpLoading] = useState(false);

  const handleError = (error: string | undefined) => {
    if (error?.includes("limit reached")) {
      setShowTopUpModal(true);
    } else {
      toast.error(error || "An error occurred");
    }
  };

  const handleTopUp = async () => {
    setTopUpLoading(true);
    try {
      const orderRes = await createMessageTopUpOrder();
      if (!orderRes.success) {
        toast.error(orderRes.error || "Failed to initiate payment");
        setTopUpLoading(false);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderRes.amount,
        currency: orderRes.currency,
        name: "GrindLog",
        description: "10 Extra AI Messages",
        order_id: orderRes.orderId,
        handler: async function (response: any) {
          const verifyRes = await verifyMessageTopUpPayment(
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature
          );

          if (verifyRes.success) {
            toast.success("10 AI Messages added successfully!");
            setShowTopUpModal(false);
          } else {
            toast.error(verifyRes.error || "Payment verification failed");
          }
        },
        theme: { color: "#007AFF" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function () {
        toast.error("Payment failed. Please try again.");
      });
      rzp.open();
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
    setTopUpLoading(false);
  };

  // Action Helpers
  const handleSendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    
    // Dismiss keyboard on send
    if (chatInputRef.current) {
      chatInputRef.current.blur();
    }

    const userMsg = { role: "user", content: chatInput };
    const updatedHistory = [...chatMessages, userMsg];
    setChatMessages(updatedHistory);
    setChatInput("");
    setChatLoading(true);

    const res = await getCoachResponseAction(updatedHistory);
    if (res.success && res.content) {
      setChatMessages(prev => [...prev, { role: "assistant", content: res.content }]);
    } else {
      if (res.error?.includes("limit reached")) {
        setShowTopUpModal(true);
        // Remove the user's message since it didn't go through
        setChatMessages(chatMessages);
      } else {
        setChatMessages(prev => [...prev, { role: "assistant", content: res.error || "Sorry, I had trouble communicating with the server. Let's try again!" }]);
      }
    }
    setChatLoading(false);
  };

  const handleGenerateHabits = async () => {
    if (!generatorGoal.trim() || generatorLoading) return;
    setGeneratorLoading(true);
    setGeneratedHabits([]);
    setAddedHabits({});

    const res = await generateHabitsAction(generatorGoal);
    if (res.success && res.habits) {
      setGeneratedHabits(res.habits);
    } else if (res.error) {
      handleError(res.error);
    }
    setGeneratorLoading(false);
  };

  const handleAddAIHabit = async (habit: any, index: number, isSuggestion = false) => {
    const res = await addHabitFromAIAction(habit);
    if (res.success) {
      if (isSuggestion) {
        setAddedSuggestions(prev => ({ ...prev, [index]: true }));
      } else {
        setAddedHabits(prev => ({ ...prev, [index]: true }));
      }
      toast.success("Habit added!");
    } else {
      toast.error(res.error || "Failed to add habit");
    }
  };

  const handleGenerateReport = async () => {
    if (reportLoading) return;
    setReportLoading(true);
    const res = await generateWeeklyReportAction();
    if (res.success && res.report) {
      setWeeklyReport(res.report);
    } else if (res.error) {
      handleError(res.error);
    }
    setReportLoading(false);
  };

  const handleGeneratePredictions = async () => {
    if (predictionsLoading) return;
    setPredictionsLoading(true);
    const res = await generatePredictionsAction();
    if (res.success && res.predictions) {
      setPredictions(res.predictions);
    } else if (res.error) {
      handleError(res.error);
    }
    setPredictionsLoading(false);
  };

  const handleGenerateMotivation = async () => {
    if (motivationLoading) return;
    setMotivationLoading(true);
    const res = await generateMotivationAction();
    if (res.success && res.motivation) {
      setMotivation(res.motivation);
    } else if (res.error) {
      handleError(res.error);
    }
    setMotivationLoading(false);
  };

  const handleGenerateSuggestions = async () => {
    if (suggestionsLoading) return;
    setSuggestionsLoading(true);
    const res = await generateSuggestionsAction();
    if (res.success && res.suggestions) {
      setSuggestions(res.suggestions);
    } else if (res.error) {
      handleError(res.error);
    }
    setSuggestionsLoading(false);
  };

  const handleBuildSchedule = async () => {
    if (scheduleLoading) return;
    setScheduleLoading(true);
    const res = await generateScheduleBuilderAction(wakeTime, sleepTime, scheduleFocus);
    if (res.success && res.schedule) {
      setGeneratedSchedule(res.schedule);
    } else if (res.error) {
      handleError(res.error);
    }
    setScheduleLoading(false);
  };

  const handleAnalyzeReflection = async () => {
    if (!reflectionInput.trim() || reflectionLoading) return;
    setReflectionLoading(true);
    const res = await generateReflectionAction(reflectionInput);
    if (res.success && res.reflection) {
      setReflectionResult(res.reflection);
    } else if (res.error) {
      handleError(res.error);
    }
    setReflectionLoading(false);
  };

  return (
    <>
    <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
    <div 
      ref={containerRef}
      className="fixed inset-x-0 mx-auto w-full max-w-[430px] z-40 bg-[var(--color-bg-primary)] flex flex-col pt-4 safe-top overflow-hidden"
      style={{ height: '100dvh', top: 0 }}
    >
      {/* ── Header Fixed ── */}
      <div className="flex-shrink-0 px-4">
        <div className="flex items-center gap-3 border-b border-[var(--color-bg-tertiary)] pb-3.5 mb-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#007AFF] to-[#AF52DE] shadow-sm">
          <Brain className="h-5 w-5 text-white animate-breathe" />
        </div>
        <div>
          <h1 className="text-xl font-black text-[var(--color-text-primary)] tracking-tight">AI Lab</h1>
          <p className="text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-[#FF9500]" /> Groq Intelligence Hub
          </p>
        </div>
      </div>

        {/* ── Segmented Scrollable Tab Bar ── */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileTap={{ scale: 0.93 }}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black whitespace-nowrap transition-all duration-200 border",
                  isActive
                    ? "bg-gradient-to-r text-white shadow-sm border-transparent"
                    : "bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] border-[var(--color-bg-tertiary)]",
                  isActive && tab.color
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── Tab Content Views ── */}
      <div className="flex-1 overflow-hidden relative flex flex-col">
        <AnimatePresence mode="wait">
          {/* TAB 1: AI Coach */}
          {activeTab === "coach" && (
            <motion.div
              key="coach"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="flex flex-col h-full w-full"
            >
              {/* Chat Log */}
              <div className="flex-1 flex flex-col gap-3 overflow-y-auto px-4 pt-2 pb-6 scrollbar-none">
                {chatMessages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      "flex max-w-[85%] rounded-[20px] px-4 py-3 text-sm font-semibold leading-relaxed shadow-sm border",
                      msg.role === "user"
                        ? "self-end bg-[var(--color-accent-blue)] text-white border-transparent rounded-br-[4px]"
                        : "self-start bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] border-[var(--color-bg-tertiary)] rounded-bl-[4px]"
                    )}
                  >
                    {msg.content}
                  </motion.div>
                ))}
                {chatLoading && (
                  <div className="self-start bg-[var(--color-bg-secondary)] border border-[var(--color-bg-tertiary)] rounded-[20px] rounded-bl-[4px] px-4 py-3 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-[var(--color-text-tertiary)]" />
                    <span className="text-xs font-bold text-[var(--color-text-tertiary)]">Coach is thinking...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className={cn(
                "px-4 pt-3 bg-gradient-to-t from-[var(--color-bg-primary)] via-[var(--color-bg-primary)] to-transparent flex-shrink-0 transition-all duration-300",
                isKeyboardOpen ? "pb-4" : "pb-[114px]"
              )}>
                <div className="flex items-center gap-2 rounded-full bg-[var(--color-bg-secondary)] p-1.5 shadow-sm ring-1 ring-[var(--color-bg-tertiary)] max-w-[430px] mx-auto">
                  <button className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-tertiary)] transition-colors">
                    <Mic className="h-5 w-5" />
                  </button>
                  <input
                    ref={chatInputRef}
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                    onFocus={() => {
                      // Prevent browser from panning the layout
                      setTimeout(() => window.scrollTo(0, 0), 10);
                    }}
                    placeholder="Ask your AI coach..."
                    className="flex-1 bg-transparent px-2 text-sm font-semibold text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)]"
                  />
                  <button
                    onClick={handleSendChat}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent-blue)] text-white shadow-sm active:scale-90 transition-transform"
                  >
                    <Send className="h-4 w-4 ml-0.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: AI Habit Generator */}
          {activeTab === "generator" && (
            <motion.div
              key="generator"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex flex-col gap-4 overflow-y-auto px-4 pb-[130px] h-full scrollbar-none"
            >
              <div className="rounded-[24px] bg-[var(--color-bg-secondary)] p-5 border border-[var(--color-bg-tertiary)]">
                <h3 className="text-sm font-black text-[var(--color-text-primary)]">Goal-to-Habit Builder</h3>
                <p className="text-[11px] text-[var(--color-text-tertiary)] mt-1 font-bold">
                  Tell Groq what goal you want to achieve, and we'll engineer the perfect habits to get you there.
                </p>
                <div className="flex gap-2 mt-4">
                  <input
                    type="text"
                    value={generatorGoal}
                    onChange={e => setGeneratorGoal(e.target.value)}
                    placeholder="e.g., Run a marathon in 6 months"
                    className="flex-1 bg-[var(--color-bg-primary)] px-4 py-2.5 rounded-2xl border border-[var(--color-bg-tertiary)] text-xs font-bold outline-none"
                  />
                  <button
                    onClick={handleGenerateHabits}
                    disabled={generatorLoading}
                    className="bg-[#34C759] hover:bg-[#28A745] text-white text-xs font-black px-4 rounded-2xl active:scale-95 transition-transform flex items-center justify-center gap-1.5"
                  >
                    {generatorLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Gen"}
                  </button>
                </div>
              </div>

              {/* Generated Habit Results */}
              <div className="flex flex-col gap-3">
                {generatedHabits.map((habit, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="rounded-[20px] bg-[var(--color-bg-secondary)] p-4 border border-[var(--color-bg-tertiary)] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl border"
                        style={{ backgroundColor: `${habit.color}22`, borderColor: `${habit.color}44` }}
                      >
                        {habit.emoji}
                      </div>
                      <div>
                        <p className="text-xs font-black text-[var(--color-text-primary)]">{habit.name}</p>
                        <p className="text-[10px] font-bold text-[var(--color-text-tertiary)] mt-0.5">
                          Target: {habit.target_count} {habit.target_unit}
                        </p>
                        <p className="text-[9px] font-semibold text-[#007AFF] mt-1 italic max-w-[200px]">
                          {habit.description}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddAIHabit(habit, idx)}
                      disabled={addedHabits[idx]}
                      className={cn(
                        "h-8 w-8 rounded-[10px] flex items-center justify-center active:scale-90 transition-all",
                        addedHabits[idx] ? "bg-[#34C759]/20 text-[#34C759]" : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]"
                      )}
                    >
                      {addedHabits[idx] ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 3: Weekly Report */}
          {activeTab === "report" && (
            <motion.div
              key="report"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex flex-col gap-4 overflow-y-auto px-4 pb-[130px] h-full scrollbar-none"
            >
              <button
                onClick={handleGenerateReport}
                disabled={reportLoading}
                className="w-full bg-[#FF2D55] text-white text-xs font-black py-3 rounded-2xl active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                {reportLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Analyzing 7-day logs...
                  </>
                ) : (
                  <>
                    <LineChart className="h-4 w-4" /> Generate AI Weekly Performance Report
                  </>
                )}
              </button>

              {weeklyReport && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col gap-4"
                >
                  {/* Score circle card */}
                  <div className="rounded-[24px] bg-[var(--color-bg-secondary)] p-6 border border-[var(--color-bg-tertiary)] flex flex-col items-center gap-2 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-[#FF2D55]/10 text-[#FF2D55] text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-[12px]">
                      Verified Report
                    </div>
                    <div className="w-16 h-16 rounded-full border-4 border-[#FF2D55] flex items-center justify-center text-xl font-black text-[var(--color-text-primary)]">
                      {weeklyReport.score}%
                    </div>
                    <h3 className="text-sm font-black text-[var(--color-text-primary)] mt-1">Weekly Performance Score</h3>
                    <p className="text-[11px] font-semibold text-[var(--color-text-secondary)] max-w-xs mt-1">
                      {weeklyReport.summary}
                    </p>
                  </div>

                  {/* Highlights and suggestions */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-[20px] bg-[var(--color-bg-secondary)] p-4 border border-[var(--color-bg-tertiary)]">
                      <h4 className="text-[11px] font-black text-[#34C759] uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Highlights
                      </h4>
                      <ul className="text-[10px] font-semibold text-[var(--color-text-secondary)] mt-2 space-y-1.5 list-disc pl-3">
                        {weeklyReport.highlights.map((h: string, i: number) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-[20px] bg-[var(--color-bg-secondary)] p-4 border border-[var(--color-bg-tertiary)]">
                      <h4 className="text-[11px] font-black text-[#FF3B30] uppercase tracking-wider flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" /> Needs Work
                      </h4>
                      <ul className="text-[10px] font-semibold text-[var(--color-text-secondary)] mt-2 space-y-1.5 list-disc pl-3">
                        {weeklyReport.improvements.map((imp: string, i: number) => (
                          <li key={i}>{imp}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* TAB 4: Predictions */}
          {activeTab === "predictions" && (
            <motion.div
              key="predictions"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex flex-col gap-4 overflow-y-auto px-4 pb-[130px] h-full scrollbar-none"
            >
              <button
                onClick={handleGeneratePredictions}
                disabled={predictionsLoading}
                className="w-full bg-[#5856D6] text-white text-xs font-black py-3 rounded-2xl active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                {predictionsLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Run Probability Calculations...
                  </>
                ) : (
                  <>
                    <Target className="h-4 w-4" /> Compute Success Projections
                  </>
                )}
              </button>

              <div className="flex flex-col gap-3">
                {predictions.map((p, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-[20px] bg-[var(--color-bg-secondary)] p-4 border border-[var(--color-bg-tertiary)] flex flex-col gap-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-[var(--color-text-primary)]">{p.habitName}</span>
                      <span className={cn(
                        "text-[10px] font-black px-2.5 py-1 rounded-full",
                        p.probability > 75 ? "bg-[#34C759]/15 text-[#34C759]" :
                        p.probability > 40 ? "bg-[#FF9500]/15 text-[#FF9500]" :
                        "bg-[#FF3B30]/15 text-[#FF3B30]"
                      )}>
                        {p.probability}% Success Likelihood
                      </span>
                    </div>
                    {/* Prob track */}
                    <div className="h-2 w-full rounded-full bg-[var(--color-bg-tertiary)] overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${p.probability}%`,
                          backgroundColor: p.probability > 75 ? "#34C759" : p.probability > 40 ? "#FF9500" : "#FF3B30"
                        }}
                      />
                    </div>
                    <p className="text-[10px] font-semibold text-[var(--color-text-secondary)] italic leading-tight">
                      🤖 Prediction Insight: "{p.insight}"
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 5: Motivation */}
          {activeTab === "motivation" && (
            <motion.div
              key="motivation"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex flex-col gap-4 overflow-y-auto px-4 pb-[130px] h-full scrollbar-none"
            >
              <button
                onClick={handleGenerateMotivation}
                disabled={motivationLoading}
                className="w-full bg-[#FF9500] text-white text-xs font-black py-3 rounded-2xl active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                {motivationLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Sparking quotes...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" /> Fetch Dynamic Daily Motivation Spark
                  </>
                )}
              </button>

              {motivation && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-[24px] bg-gradient-to-br from-[#FF9500] to-[#FF3B30] p-6 text-white shadow-lg flex flex-col gap-4"
                >
                  <div>
                    <h3 className="text-xl font-black italic">"{motivation.quote}"</h3>
                    <p className="text-xs font-bold text-white/80 mt-1.5">— {motivation.author}</p>
                  </div>
                  <div className="h-px bg-white/20" />
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-white/15 px-2 py-0.5 rounded">Daily Challenge</span>
                    <p className="text-xs font-black mt-1.5 leading-relaxed">{motivation.action}</p>
                  </div>
                  <div className="h-px bg-white/20" />
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-white/15 px-2 py-0.5 rounded">Coach Focus</span>
                    <p className="text-[11px] font-semibold mt-1.5 leading-normal text-white/90">{motivation.focus}</p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* TAB 6: Suggestions */}
          {activeTab === "suggestions" && (
            <motion.div
              key="suggestions"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex flex-col gap-4 overflow-y-auto px-4 pb-[130px] h-full scrollbar-none"
            >
              <button
                onClick={handleGenerateSuggestions}
                disabled={suggestionsLoading}
                className="w-full bg-[#00C7BE] text-white text-xs font-black py-3 rounded-2xl active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                {suggestionsLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Suggesting balance habits...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" /> Recommend Lifestyle Suggestions
                  </>
                )}
              </button>

              <div className="flex flex-col gap-3">
                {suggestions.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-[20px] bg-[var(--color-bg-secondary)] p-4 border border-[var(--color-bg-tertiary)] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl border"
                        style={{ backgroundColor: `${item.color}22`, borderColor: `${item.color}44` }}
                      >
                        {item.emoji}
                      </div>
                      <div>
                        <p className="text-xs font-black text-[var(--color-text-primary)]">{item.name}</p>
                        <p className="text-[10px] font-bold text-[var(--color-text-tertiary)] mt-0.5">
                          {item.target_count} {item.target_unit}
                        </p>
                        <p className="text-[9px] font-semibold text-[#00C7BE] mt-1 max-w-[200px]">
                          Reason: {item.reason}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddAIHabit(item, idx, true)}
                      disabled={addedSuggestions[idx]}
                      className={cn(
                        "h-8 w-8 rounded-[10px] flex items-center justify-center active:scale-90 transition-all",
                        addedSuggestions[idx] ? "bg-[#34C759]/20 text-[#34C759]" : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]"
                      )}
                    >
                      {addedSuggestions[idx] ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 7: Schedule Builder */}
          {activeTab === "schedule" && (
            <motion.div
              key="schedule"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex flex-col gap-4 overflow-y-auto px-4 pb-[130px] h-full scrollbar-none"
            >
              <div className="rounded-[24px] bg-[var(--color-bg-secondary)] p-5 border border-[var(--color-bg-tertiary)] flex flex-col gap-3">
                <h3 className="text-sm font-black text-[var(--color-text-primary)]">Optimize Your Routine</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-[var(--color-text-tertiary)] uppercase tracking-wider">Wake Up</label>
                    <div className="bg-[var(--color-bg-primary)] px-3 py-2 rounded-xl border border-[var(--color-bg-tertiary)] flex items-center h-[38px]">
                      <TimePicker12h
                        value={wakeTime}
                        onChange={val => setWakeTime(val || "07:00")}
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-[var(--color-text-tertiary)] uppercase tracking-wider">Bedtime</label>
                    <div className="bg-[var(--color-bg-primary)] px-3 py-2 rounded-xl border border-[var(--color-bg-tertiary)] flex items-center h-[38px]">
                      <TimePicker12h
                        value={sleepTime}
                        onChange={val => setSleepTime(val || "23:00")}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-black text-[var(--color-text-tertiary)] uppercase tracking-wider">Core Daily Focus</label>
                  <input
                    type="text"
                    value={scheduleFocus}
                    onChange={e => setScheduleFocus(e.target.value)}
                    placeholder="e.g. Deep coding, stress reduction"
                    className="bg-[var(--color-bg-primary)] px-3 py-2.5 rounded-xl border border-[var(--color-bg-tertiary)] text-xs font-bold outline-none"
                  />
                </div>
                <button
                  onClick={handleBuildSchedule}
                  disabled={scheduleLoading}
                  className="w-full bg-[#30B0C7] text-white text-xs font-black py-2.5 rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-1.5"
                >
                  {scheduleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Synthesize Routine"}
                </button>
              </div>

              {/* Timeline Output */}
              <div className="relative border-l-2 border-[var(--color-bg-tertiary)] ml-4 pl-4 space-y-4">
                {generatedSchedule.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative flex items-center gap-3"
                  >
                    {/* Circle timeline anchor */}
                    <div className={cn(
                      "absolute -left-[23px] w-2.5 h-2.5 rounded-full border-2",
                      item.isHabit ? "bg-[#34C759] border-[#eafff0]" : "bg-[var(--color-text-tertiary)] border-[var(--color-bg-primary)]"
                    )} />
                    <span className="text-[10px] font-black text-[var(--color-text-tertiary)] min-w-[56px]">
                      {item.time}
                    </span>
                    <div className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold shadow-sm border",
                      item.isHabit
                        ? "bg-[#34C759]/10 text-[#248A3D] border-[#34C759]/20"
                        : "bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] border-[var(--color-bg-tertiary)]"
                    )}>
                      <span>{item.emoji}</span>
                      <span>{item.activity}</span>
                      {item.isHabit && <span className="text-[8px] font-black bg-[#34C759]/25 text-[#34C759] px-1 rounded uppercase">Habit</span>}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 8: Daily Reflection */}
          {activeTab === "reflection" && (
            <motion.div
              key="reflection"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex flex-col gap-4 overflow-y-auto px-4 pb-[130px] h-full scrollbar-none"
            >
              <div className="rounded-[24px] bg-[var(--color-bg-secondary)] p-5 border border-[var(--color-bg-tertiary)] flex flex-col gap-3">
                <h3 className="text-sm font-black text-[var(--color-text-primary)]">AI Cognitive Reframing</h3>
                <p className="text-[11px] text-[var(--color-text-tertiary)] font-bold">
                  Write down your daily reflection, concerns, or highlights. Groq will parse and deliver actionable reframing tasks.
                </p>
                <textarea
                  value={reflectionInput}
                  onChange={e => setReflectionInput(e.target.value)}
                  placeholder="How did today feel? What was on your mind?"
                  rows={4}
                  className="bg-[var(--color-bg-primary)] p-4 rounded-xl border border-[var(--color-bg-tertiary)] text-xs font-bold outline-none resize-none"
                />
                <button
                  onClick={handleAnalyzeReflection}
                  disabled={reflectionLoading || !reflectionInput.trim()}
                  className="w-full bg-[#FFD60A] text-[#111418] text-xs font-black py-2.5 rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-1.5"
                >
                  {reflectionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Analyze Reflection"}
                </button>
              </div>

              {reflectionResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col gap-4"
                >
                  {/* Analysis output */}
                  <div className="rounded-[20px] bg-[var(--color-bg-secondary)] p-4 border border-[var(--color-bg-tertiary)]">
                    <span className="text-[9px] font-black bg-[#FFD60A]/20 text-[#D09B00] px-2 py-0.5 rounded uppercase">Coach Insight</span>
                    <p className="text-xs font-semibold text-[var(--color-text-primary)] leading-relaxed mt-2.5">
                      {reflectionResult.summary}
                    </p>
                  </div>

                  <div className="rounded-[20px] bg-[var(--color-bg-secondary)] p-4 border border-[var(--color-bg-tertiary)] flex flex-col gap-2">
                    <h4 className="text-[11px] font-black text-[#5856D6] uppercase tracking-wider flex items-center gap-1">
                      <HelpCircle className="h-3.5 w-3.5" /> Psychological Insights
                    </h4>
                    <ul className="text-xs font-bold text-[var(--color-text-secondary)] space-y-2 mt-1">
                      {reflectionResult.insights.map((ins: string, i: number) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <ArrowRight className="h-3.5 w-3.5 text-[#5856D6] shrink-0 mt-0.5" />
                          <span>{ins}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-[20px] bg-[#34C759]/10 p-4 border border-[#34C759]/20">
                    <span className="text-[9px] font-black bg-[#34C759]/20 text-[#34C759] px-2 py-0.5 rounded uppercase">Action Task for Tomorrow</span>
                    <p className="text-xs font-black text-[#248A3D] mt-2.5 leading-relaxed">
                      💡 {reflectionResult.actionableTask}
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* Top Up Modal */}
      <AnimatePresence>
        {showTopUpModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowTopUpModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 p-4"
            >
              <div className="relative overflow-hidden rounded-3xl bg-[var(--color-bg-primary)] p-6 shadow-2xl border border-[var(--color-bg-tertiary)]">
                <button
                  onClick={() => setShowTopUpModal(false)}
                  className="absolute right-4 top-4 rounded-full bg-[var(--color-bg-secondary)] p-1.5 text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#007AFF]/20 to-[#AF52DE]/20">
                  <Brain className="h-7 w-7 text-[#007AFF]" />
                </div>

                <h3 className="mb-2 text-xl font-bold text-[var(--color-text-primary)]">
                  AI Limit Reached
                </h3>
                <p className="mb-6 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                  You&apos;ve used all your free AI messages for today. Don&apos;t want to wait until tomorrow? Top up instantly!
                </p>

                <div className="mb-6 rounded-2xl bg-[var(--color-bg-secondary)] p-4 border border-[var(--color-bg-tertiary)]">
                  <div className="flex items-center justify-between font-medium">
                    <span className="flex items-center gap-2 text-[var(--color-text-primary)]">
                      <Sparkles className="h-4 w-4 text-[#FF9500]" /> 10 AI Messages
                    </span>
                    <span className="font-bold text-[#34C759]">₹10</span>
                  </div>
                  <div className="mt-2 text-xs text-[var(--color-text-secondary)]">
                    Carries over and never expires until used.
                  </div>
                </div>

                <button
                  onClick={handleTopUp}
                  disabled={topUpLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#007AFF] to-[#5856D6] py-3.5 text-sm font-bold text-white shadow-lg transition-transform hover:scale-[0.98] active:scale-95 disabled:opacity-70 disabled:hover:scale-100"
                >
                  {topUpLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>Pay ₹10 Now</>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
    </>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import {
  ChevronLeft,
  Headphones,
  Send,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertCircle,
  CreditCard,
  Utensils,
  Dumbbell,
  Bug,
  HelpCircle,
  Mail,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { submitSupportMessage } from "@/app/actions/support";

interface SupportMessage {
  id: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

interface SupportClientProps {
  initialMessages: SupportMessage[];
  userEmail?: string;
  userName?: string;
}

const SUPPORT_CATEGORIES = [
  { id: "Billing", label: "Billing & Renewal", icon: CreditCard, prefix: "[Billing & Renewal] " },
  { id: "Workout", label: "Workout & Injury", icon: Dumbbell, prefix: "[Workout & Injury] " },
  { id: "Diet", label: "Diet & Nutrition", icon: Utensils, prefix: "[Diet & Nutrition] " },
  { id: "Bug", label: "App Bug / Glitch", icon: Bug, prefix: "[Bug Report] " },
  { id: "General", label: "General Query", icon: HelpCircle, prefix: "[General Query] " },
];

export function SupportClient({
  initialMessages = [],
  userEmail,
  userName,
}: SupportClientProps) {
  const [messages, setMessages] = useState<SupportMessage[]>(initialMessages);
  const [selectedCategory, setSelectedCategory] = useState<string>("Billing");
  const [subject, setSubject] = useState<string>("[Billing & Renewal] ");
  const [messageText, setMessageText] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleCategorySelect = (category: typeof SUPPORT_CATEGORIES[0]) => {
    setSelectedCategory(category.id);
    // Keep any custom user text if typed, but prepend clean category tag
    const cleanUserTitle = subject.replace(/^\[.*?\]\s*/, "");
    setSubject(`${category.prefix}${cleanUserTitle}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!subject.trim() || !messageText.trim()) {
      setError("Please provide both a subject and a description.");
      return;
    }

    if (messageText.trim().length < 10) {
      setError("Please describe your issue in a bit more detail (at least 10 characters).");
      return;
    }

    setSubmitting(true);

    try {
      const res = await submitSupportMessage(subject.trim(), messageText.trim());

      if (!res.success) {
        throw new Error(res.error || "Failed to send message. Please try again.");
      }

      setSuccess("Your message has been sent to our support desk! Our team will review and reply to your registered email.");

      // Optimistically add to messages list
      const newMessage: SupportMessage = {
        id: `temp_${Date.now()}`,
        subject: subject.trim(),
        message: messageText.trim(),
        status: "new",
        created_at: new Date().toISOString(),
      };
      setMessages([newMessage, ...messages]);

      // Reset fields
      setMessageText("");
      setSubject(`[${selectedCategory}] `);
    } catch (err: any) {
      console.error("Support submission error:", err);
      setError(err.message || "Something went wrong. Please try again or email us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060D06] text-white pb-24">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-[#060D06]/90 backdrop-blur-md border-b border-white/5 px-4 py-4">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <Link
            href="/profile"
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="text-center">
            <h1 className="text-base font-black tracking-wide text-white uppercase">
              Help & Support
            </h1>
            <p className="text-[10px] text-[#ADFF00] font-bold flex items-center justify-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ADFF00] animate-pulse" />
              Support Team Online
            </p>
          </div>
          <div className="w-9" />
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-6 space-y-6">
        {/* Support Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-[#1C1408] via-[#120E05] to-[#1C1408] p-5 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">How can we help you today?</h2>
              <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                Whether you have questions about your billing, need an exercise swapped, or encountered an issue, our coaches and support team are here for you.
              </p>
            </div>
          </div>
        </div>

        {/* Message Composer Card */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#111A10] border border-white/10 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#ADFF00]" />
              <span>Send a Message to Support</span>
            </h3>
            <span className="text-[10px] text-gray-400">Response within 2–4 hours</span>
          </div>

          {/* Quick Category Chips */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Choose Topic
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SUPPORT_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                const IconComponent = cat.icon;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(cat)}
                    className={`p-2.5 rounded-2xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#ADFF00] bg-[#ADFF00]/15 text-white shadow-[0_0_15px_rgba(173,255,0,0.15)]"
                        : "border-white/5 bg-[#081008] text-gray-400 hover:border-white/20 hover:text-gray-200"
                    }`}
                  >
                    <IconComponent className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-[#ADFF00]" : "text-gray-400"}`} />
                    <span className="text-xs font-bold truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3.5 rounded-2xl bg-[#ADFF00]/10 border border-[#ADFF00]/40 text-[#ADFF00] text-xs font-bold flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            {/* Subject Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                Subject
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of your question or issue"
                className="w-full px-4 py-3 bg-[#081008] border border-white/10 rounded-2xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#ADFF00] transition-colors font-medium"
              />
            </div>

            {/* Message Textarea */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                Message Details
              </label>
              <textarea
                required
                rows={4}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Tell us what you need help with. Include any details like workout date, payment transaction ID, or specific questions..."
                className="w-full px-4 py-3 bg-[#081008] border border-white/10 rounded-2xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#ADFF00] transition-colors leading-relaxed font-medium resize-none"
              />
            </div>

            {/* Sender Info Preview */}
            <div className="text-[11px] text-gray-400 flex items-center justify-between px-1">
              <span>Sending as: <strong className="text-gray-200">{userName || "Athlete"}</strong> ({userEmail})</span>
              <span>{messageText.length} chars</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-[#ADFF00] hover:bg-[#bbfb2e] text-black font-black uppercase tracking-wider text-xs rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(173,255,0,0.25)] transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Message...</span>
                </>
              ) : (
                <>
                  <span>Send to Support Desk</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Previous Support Messages / Ticket History */}
        <div className="p-5 rounded-3xl bg-[#0E160E] border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#ADFF00]" />
              <span>Your Previous Support Messages</span>
            </h3>
            <span className="text-[10px] text-gray-500">{messages.length} total</span>
          </div>

          {messages.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-500">
              You haven't submitted any support requests yet.
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((item) => {
                const isNew = item.status === "new";
                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-[#081008] border border-white/5 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="text-xs font-bold text-white leading-tight">
                        {item.subject}
                      </h4>
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 ${
                          isNew
                            ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                            : "bg-[#ADFF00]/15 text-[#ADFF00] border border-[#ADFF00]/30"
                        }`}
                      >
                        {isNew ? "Under Review" : "Resolved ✓"}
                      </span>
                    </div>

                    <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">
                      {item.message}
                    </p>

                    <div className="text-[10px] text-gray-500 pt-1 flex items-center justify-between border-t border-white/5">
                      <span>Submitted {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</span>
                      <span>Status: {isNew ? "Pending Admin Response" : "Closed"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Direct Email / Emergency Contact Card */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-400">
          <div className="flex items-center gap-2.5">
            <Mail className="w-4 h-4 text-[#ADFF00] shrink-0" />
            <div>
              <p className="text-white font-bold text-xs">Direct Email Support</p>
              <p className="text-[11px] text-gray-400">Prefer email? Reach us directly at <a href="mailto:grindlogapp6@gmail.com" className="text-[#ADFF00] underline">grindlogapp6@gmail.com</a></p>
            </div>
          </div>
          <span className="text-[10px] text-gray-500">Fast tracking for Pro athletes</span>
        </div>
      </div>
    </div>
  );
}

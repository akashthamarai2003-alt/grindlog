"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Send, Loader2, Info, Mail, Heart, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { springs } from "@/animations/springs";
import { submitSupportMessage } from "@/app/actions/support";
import { useUIStore } from "@/store/ui-store";

export default function SupportPage() {
  const { addToast } = useUIStore();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setIsSending(true);
    const res = await submitSupportMessage(subject, message);

    if (res.success) {
      addToast({ title: "Message Sent", description: "The admin will get back to you soon.", type: "success" });
      setSubject("");
      setMessage("");
      setIsSubmitted(true);
    } else {
      addToast({ title: "Error", description: res.error || "Failed to send message.", type: "error" });
    }
    setIsSending(false);
  };

  return (
    <div className="flex flex-col gap-6 px-5 pb-40 pt-4 safe-top">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springs.default}
        className="flex items-center gap-4"
      >
        <Link 
          href="/profile" 
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
          About & Support
        </h1>
      </motion.div>

      {/* About Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springs.default, delay: 0.1 }}
        className="rounded-[24px] bg-[var(--color-bg-secondary)] p-6 shadow-sm ring-1 ring-[var(--color-bg-tertiary)]/50"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-accent-green)]/15 text-[var(--color-accent-green)]">
            <Info className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-bold text-[var(--color-text-primary)]">About GrindLog</h2>
        </div>
        <p className="text-[15px] leading-relaxed text-[var(--color-text-secondary)]">
          GrindLog was built to help you track your habits, manage your daily quests, and level up your life through gamification. 
          We believe that small, consistent actions lead to massive results over time.
        </p>
        <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-[var(--color-text-tertiary)]">
          <span>Made with</span>
          <Heart className="h-4 w-4 text-red-500" fill="currentColor" />
        </div>
      </motion.div>

      {/* Contact Admin Form */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springs.default, delay: 0.2 }}
        className="rounded-[24px] bg-[var(--color-bg-secondary)] p-6 shadow-sm ring-1 ring-[var(--color-bg-tertiary)]/50"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#007AFF]/15 text-[#007AFF]">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Contact Admin</h2>
            <p className="text-xs font-semibold text-[var(--color-text-tertiary)]">Have a bug or feature request?</p>
          </div>
        </div>

        {isSubmitted ? (
          <div className="flex flex-col items-center justify-center py-10 text-center gap-4 animate-in fade-in zoom-in-95 duration-500">
            <div className="w-16 h-16 rounded-full bg-[#34C759]/10 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-[#34C759]" />
            </div>
            <h3 className="text-xl font-bold text-[var(--color-text-primary)] tracking-tight">Message Sent!</h3>
            <p className="text-[14px] text-[var(--color-text-secondary)] font-medium max-w-[250px] leading-relaxed">
              Thanks for reaching out. The admin has received your message and will get back to you soon.
            </p>
            <button
              onClick={() => setIsSubmitted(false)}
              className="mt-6 px-6 py-3.5 rounded-2xl bg-[var(--color-bg-primary)] ring-1 ring-[var(--color-bg-tertiary)] font-bold text-[14px] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-all active:scale-95"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-[var(--color-text-secondary)]">
                Subject
              </label>
              <input 
                type="text" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-2xl bg-[var(--color-bg-primary)] px-5 py-4 text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[#007AFF] transition-all font-medium placeholder:font-normal ring-1 ring-[var(--color-bg-tertiary)]"
                placeholder="e.g. Bug with payment"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-[var(--color-text-secondary)]">
                Message
              </label>
              <textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full resize-none rounded-2xl bg-[var(--color-bg-primary)] px-5 py-4 text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[#007AFF] transition-all font-medium placeholder:font-normal ring-1 ring-[var(--color-bg-tertiary)]"
                placeholder="How can we help you?"
                required
              />
            </div>

            <button 
              type="submit"
              disabled={isSending || !subject.trim() || !message.trim()}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#007AFF] py-4 font-bold text-white shadow-lg shadow-[#007AFF]/30 transition-all active:scale-[0.98] disabled:opacity-50 disabled:shadow-none disabled:active:scale-100"
            >
              {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              Send Message
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}

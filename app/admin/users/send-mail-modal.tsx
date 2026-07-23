"use client";

import { useState } from "react";
import { Mail, X, Send, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { sendUserEmailAdminAction } from "@/app/actions/admin-users";

interface SendMailModalProps {
  user: {
    id: string;
    display_name?: string;
    email?: string;
  };
  onClose: () => void;
}

export default function SendMailModal({ user, onClose }: SendMailModalProps) {
  const recipientEmail = user.email || "";
  const recipientName = user.display_name || user.email?.split("@")[0] || "User";

  const [subject, setSubject] = useState(`Update regarding your GrindLog account`);
  const [message, setMessage] = useState(`Hi ${recipientName},\n\nWe are reaching out to you regarding your GrindLog account.\n\nBest regards,\nGrindLog Support Team`);
  const [isSending, setIsSending] = useState(false);

  const handleSendEmail = async () => {
    if (!recipientEmail) {
      toast.error("User does not have a valid email address");
      return;
    }
    if (!subject.trim()) {
      toast.error("Please enter a subject line");
      return;
    }
    if (!message.trim()) {
      toast.error("Please enter a message body");
      return;
    }

    setIsSending(true);
    try {
      const res = await sendUserEmailAdminAction(recipientEmail, subject, message);
      if (res.success) {
        toast.success(`Email sent successfully to ${recipientEmail}!`);
        onClose();
      } else {
        toast.error(res.error || "Failed to send email");
      }
    } catch (err: any) {
      toast.error(err?.message || "An unexpected error occurred while sending email");
    } finally {
      setIsSending(false);
    }
  };

  const handleOpenMailto = () => {
    if (!recipientEmail) return;
    const mailtoUrl = `mailto:${encodeURIComponent(recipientEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    window.open(mailtoUrl, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Send Email to User</h3>
              <p className="text-xs text-gray-500">{recipientName} ({recipientEmail})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Preset Subject Templates */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Template:</span>
            <button
              type="button"
              onClick={() => {
                setSubject("Update regarding your GrindLog account");
                setMessage(`Hi ${recipientName},\n\nWe wanted to touch base regarding your GrindLog account status.\n\nBest regards,\nGrindLog Support`);
              }}
              className="text-[11px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors"
            >
              Account Update
            </button>
            <button
              type="button"
              onClick={() => {
                setSubject("GrindLog Subscription & Membership Inquiry");
                setMessage(`Hi ${recipientName},\n\nThank you for choosing GrindLog! We noticed a query regarding your membership subscription.\n\nBest regards,\nGrindLog Team`);
              }}
              className="text-[11px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors"
            >
              Subscription
            </button>
            <button
              type="button"
              onClick={() => {
                setSubject("Special Offer for GrindLog Pro");
                setMessage(`Hi ${recipientName},\n\nUnlock full access to AI Coach, Unlimited Habits, and Advanced Analytics with GrindLog Pro!\n\nBest regards,\nGrindLog Team`);
              }}
              className="text-[11px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors"
            >
              Pro Offer
            </button>
          </div>

          {/* Recipient Input (Read Only) */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">Recipient Email</label>
            <input
              type="email"
              value={recipientEmail}
              readOnly
              className="w-full px-3 py-2 text-xs font-medium bg-gray-100 border border-gray-200 rounded-xl text-gray-600 outline-none cursor-not-allowed"
            />
          </div>

          {/* Subject Line */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter subject line..."
              className="w-full px-3 py-2 text-xs font-medium bg-white border border-gray-300 rounded-xl text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Message Body */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">Message</label>
            <textarea
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your email message here..."
              className="w-full px-3 py-2 text-xs font-medium bg-white border border-gray-300 rounded-xl text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button
            type="button"
            onClick={handleOpenMailto}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-xl transition-all shadow-sm"
            title="Open in your default Mail app"
          >
            <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
            <span>Open in Mail App</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSendEmail}
              disabled={isSending}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl transition-all shadow-sm disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Email</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

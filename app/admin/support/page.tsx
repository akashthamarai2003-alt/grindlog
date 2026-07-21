"use client";

import { useEffect, useState } from "react";
import { fetchSupportMessages, updateMessageStatus } from "@/app/actions/admin-support";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Mail, CheckCircle, Clock } from "lucide-react";

export default function AdminSupportInbox() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    const res = await fetchSupportMessages();
    if (res.success) {
      setMessages(res.data);
    } else {
      setError(res.error || "Failed to load messages");
    }
    setLoading(false);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    const res = await updateMessageStatus(id, newStatus);
    if (res.success) {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, status: newStatus } : msg))
      );
    } else {
      alert("Failed to update status");
    }
    setUpdatingId(null);
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Support Inbox</h1>
        <p className="text-gray-500 mt-1">Manage and respond to user messages.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {messages.length === 0 ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <Mail className="w-12 h-12 text-gray-300 mb-4" />
            <p className="font-medium text-lg">No messages yet!</p>
            <p className="text-sm mt-1">You're all caught up.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {messages.map((msg) => (
              <div key={msg.id} className={`p-6 transition-colors ${msg.status === 'new' ? 'bg-blue-50/30' : 'bg-white'}`}>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        msg.status === 'new' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {msg.status === 'new' ? 'New' : 'Resolved'}
                      </span>
                      <h3 className="font-semibold text-gray-900 text-lg">{msg.subject}</h3>
                    </div>
                    <p className="text-sm text-gray-500">
                      From: <span className="font-medium text-gray-900">{msg.user_name}</span> ({msg.user_email})
                    </p>
                    <p className="text-xs text-gray-400">
                      ID: {msg.user_id} • {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  
                  <div className="shrink-0 flex gap-2">
                    {msg.status === 'new' ? (
                      <button
                        onClick={() => handleStatusChange(msg.id, 'resolved')}
                        disabled={updatingId === msg.id}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50 text-gray-700 disabled:opacity-50 transition-colors shadow-sm"
                      >
                        {updatingId === msg.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 text-green-600" />}
                        Mark Resolved
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStatusChange(msg.id, 'new')}
                        disabled={updatingId === msg.id}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50 text-gray-700 disabled:opacity-50 transition-colors shadow-sm"
                      >
                        {updatingId === msg.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4 text-blue-600" />}
                        Mark Unread
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-4 p-4 bg-gray-50 rounded-lg text-gray-800 whitespace-pre-wrap text-sm border border-gray-100">
                  {msg.message}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

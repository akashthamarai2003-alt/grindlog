"use client";

import { motion } from "framer-motion";
import { Play, Apple, Droplet, Camera } from "lucide-react";
import { useRouter } from "next/navigation";

export function QuickActions() {
  const router = useRouter();
  
  const actions = [
    { id: "workout", label: "Start Workout", icon: Play, color: "text-emerald-500", bg: "bg-emerald-50", route: "/fitness/workout" },
    { id: "meal", label: "Log Meal", icon: Apple, color: "text-orange-500", bg: "bg-orange-50" },
    { id: "water", label: "Log Water", icon: Droplet, color: "text-blue-500", bg: "bg-blue-50" },
    { id: "photo", label: "Add Photo", icon: Camera, color: "text-indigo-500", bg: "bg-indigo-50" },
  ];

  const handleAction = (route?: string) => {
    if (route) {
      router.push(route);
    } else {
      alert("Coming in the next phase!");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="w-full space-y-4"
    >
      <h3 className="text-lg font-bold text-gray-900 px-1">Quick Actions</h3>
      
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {actions.map((action) => (
          <button 
            key={action.id}
            onClick={() => handleAction(action.route)}
            className="w-full bg-white rounded-2xl p-4 flex items-center gap-3 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] border border-gray-50 active:scale-[0.98] transition-transform text-left"
          >
            <div className={`w-10 h-10 rounded-full ${action.bg} flex items-center justify-center shrink-0`}>
              <action.icon className={`w-5 h-5 ${action.color} fill-current/20`} />
            </div>
            <span className="text-sm font-bold text-gray-700 leading-tight">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

"use client";

import { motion, AnimatePresence } from "framer-motion";

export const REMINDER_TYPES = [
  { id: "Breakfast", icon: "🥣" },
  { id: "Mid-Morning", icon: "🍞" },
  { id: "Lunch", icon: "🍱" },
  { id: "Afternoon", icon: "🍏" },
  { id: "Dinner", icon: "🍛" },
  { id: "Bed Time", icon: "🛌" },
];

interface ReminderTypeSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: string) => void;
}

export function ReminderTypeSheet({ isOpen, onClose, onSelect }: ReminderTypeSheetProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-[#111A10] rounded-t-3xl border-t border-white/5 pb-8 overflow-hidden"
          >
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <button 
                onClick={onClose}
                className="text-gray-400 font-semibold text-sm hover:text-white"
              >
                Cancel
              </button>
              <h3 className="text-white font-bold text-sm">Choose Reminder Type</h3>
              <div className="w-11" /> {/* Spacer for centering */}
            </div>

            <div className="flex flex-col max-h-[60vh] overflow-y-auto pt-2">
              {REMINDER_TYPES.map((rt) => (
                <button
                  key={rt.id}
                  onClick={() => {
                    onSelect(rt.id);
                    onClose();
                  }}
                  className="flex items-center gap-3 px-6 py-4 hover:bg-white/5 transition-colors text-left"
                >
                  <span className="text-xl">{rt.icon}</span>
                  <span className="text-white font-bold text-[15px]">{rt.id}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

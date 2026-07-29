"use client";

import { useState } from "react";
import { Power } from "lucide-react";
import { toggleCouponStatusAction } from "@/app/actions/admin-coupons";

export default function ToggleCouponButton({ id, isActive }: { id: string, isActive: boolean }) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    await toggleCouponStatusAction(id, isActive);
    setLoading(false);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`p-2 rounded-lg transition-colors ${isActive ? "text-red-600 hover:bg-red-50" : "text-green-600 hover:bg-green-50"} disabled:opacity-50`}
      title={isActive ? "Disable Coupon" : "Enable Coupon"}
    >
      <Power className="w-4 h-4" />
    </button>
  );
}

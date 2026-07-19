"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { createCouponAction } from "@/app/actions/admin-coupons";

export default function ClientCouponForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [code, setCode] = useState("");

  const generateRandomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCode(result);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    const formData = new FormData(e.currentTarget);
    const res = await createCouponAction(formData);
    
    if (!res.success) {
      setError(res.error || "Failed to create coupon");
    } else {
      setCode("");
      (e.target as HTMLFormElement).reset();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
          {error}
        </div>
      )}
      
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">COUPON CODE</label>
        <div className="flex gap-2">
          <input 
            type="text" 
            name="code" 
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. EARLYBIRD"
            required
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-bold tracking-wider outline-none focus:border-green-500 uppercase"
          />
          <button 
            type="button"
            onClick={generateRandomCode}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center justify-center transition-colors"
            title="Generate Random"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">DISCOUNT %</label>
        <div className="relative">
          <input 
            type="number" 
            name="discount" 
            defaultValue={100}
            min={1}
            max={100}
            required
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-500 pl-8"
          />
          <span className="absolute left-3 top-2.5 text-gray-400 font-bold text-sm">%</span>
        </div>
      </div>
      
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">MAX USES</label>
        <input 
          type="number" 
          name="max_uses" 
          defaultValue={100}
          min={1}
          required
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-500"
        />
      </div>
      
      <button 
        type="submit" 
        disabled={loading}
        className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-sm transition-colors disabled:opacity-50"
      >
        {loading ? "Generating..." : "Create Coupon"}
      </button>
    </form>
  );
}

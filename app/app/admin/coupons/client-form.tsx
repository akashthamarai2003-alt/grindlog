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
        <label className="block text-xs font-bold text-gray-900 mb-1">COUPON CODE</label>
        <div className="flex gap-2">
          <input 
            type="text" 
            name="code" 
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. EARLYBIRD"
            required
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-black tracking-wider outline-none focus:border-green-500 uppercase bg-white text-gray-900 placeholder:text-gray-400 shadow-2xs"
          />
          <button 
            type="button"
            onClick={generateRandomCode}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg flex items-center justify-center transition-colors cursor-pointer border border-gray-200"
            title="Generate Random"
          >
            <Sparkles className="w-4 h-4 text-green-600" />
          </button>
        </div>
      </div>
      
      <div>
        <label className="block text-xs font-bold text-gray-900 mb-1">DISCOUNT %</label>
        <div className="relative">
          <input 
            type="number" 
            name="discount" 
            defaultValue={100}
            min={1}
            max={100}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-black outline-none focus:border-green-500 pl-8 bg-white text-gray-900 placeholder:text-gray-400 shadow-2xs"
          />
          <span className="absolute left-3 top-2.5 text-gray-500 font-black text-sm">%</span>
        </div>
      </div>
      
      <div>
        <label className="block text-xs font-bold text-gray-900 mb-1">MAX USES</label>
        <input 
          type="number" 
          name="max_uses" 
          defaultValue={100}
          min={1}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-black outline-none focus:border-green-500 bg-white text-gray-900 placeholder:text-gray-400 shadow-2xs"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-900 mb-1">APPLICABLE TIER (MONTHLY PLAN)</label>
        <input type="hidden" name="allowed_plan" value="monthly" />
        <select
          name="allowed_level"
          defaultValue="any"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-bold outline-none focus:border-green-500 bg-white text-gray-900 cursor-pointer shadow-2xs"
        >
          <option value="any" className="bg-white text-gray-900 font-semibold">Any Tier (Both Core & Pro)</option>
          <option value="core" className="bg-white text-gray-900 font-semibold">Core Tier Only</option>
          <option value="pro" className="bg-white text-gray-900 font-semibold">Pro Tier Only</option>
        </select>
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

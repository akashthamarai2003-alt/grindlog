'use client';

import { useState, useMemo } from 'react';
import { ShoppingCart, Edit2, CheckCircle, Plus, Minus, Trash2, Info } from 'lucide-react';

export default function GroceryTab({ planData, setPlanData, profile }: { planData: any, setPlanData: any, profile: any }) {
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>('');
  
  const usesProvidedCoreMeals = ["PG", "Hostel", "Home", "Office/Canteen"].includes(profile?.food_environment);
  const planLabel = usesProvidedCoreMeals ? "Monthly Add-ons" : "Monthly Grocery Plan";
  const planExplanation = usesProvidedCoreMeals
    ? `Only add-ons are counted. Your ${profile?.food_environment} core meals stay separate.`
    : "Adjust a quantity or local price and your total updates instantly.";

  // Older cached plans may not have a valid grocery array. Keep the page
  // usable and offer generation instead of throwing during render.
  const groceryList = Array.isArray(planData?.nutrition?.grocery_list)
    ? planData.nutrition.grocery_list.filter((item: unknown) => item && typeof item === 'object')
    : [];

  // Budget Parsing
  const budgetStr = profile?.nutrition_budget || "";
  const budgetLimit = useMemo(() => {
    if (!budgetStr || budgetStr.includes("+")) return 0;
    const values = budgetStr.match(/\d[\d,]*/g)?.map((value: string) => Number(value.replace(/,/g, ""))) ?? [];
    return values.length ? Math.max(...values) : 0;
  }, [budgetStr]);

  // Calculate totals
  const totalCost = useMemo(() => {
    return groceryList.reduce((acc: number, item: any) => acc + (item.estimated_price || 0), 0);
  }, [groceryList]);

  const remainingBudget = budgetLimit > 0 ? budgetLimit - totalCost : null;
  const isOverBudget = remainingBudget !== null && remainingBudget < 0;
  const budgetLabel = budgetLimit > 0
    ? `Up to ₹${budgetLimit.toLocaleString()} / month`
    : budgetStr || 'Not specified';

  // Group by category
  const groupedItems = useMemo(() => {
    const groups: Record<string, any[]> = {};
    groceryList.forEach((item: any) => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [groceryList]);

  const handleUpdateItem = (index: number, updates: any) => {
    const newList = [...groceryList];
    newList[index] = { ...newList[index], ...updates };
    setPlanData({
      ...planData,
      nutrition: { ...planData.nutrition, grocery_list: newList }
    });
  };

  const handleRemoveItem = (index: number) => {
    const newList = [...groceryList];
    newList.splice(index, 1);
    setPlanData({
      ...planData,
      nutrition: { ...planData.nutrition, grocery_list: newList }
    });
  };

  const handleSavePrice = (index: number) => {
    const num = parseFloat(tempPrice);
    if (!isNaN(num)) {
      handleUpdateItem(index, { estimated_price: num });
    }
    setEditingPriceId(null);
  };

  if (groceryList.length === 0) {
    return (
      <div className="px-6 py-12 animate-in fade-in flex flex-col items-center justify-center text-center">
        <ShoppingCart size={48} className="text-gray-500 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">No {usesProvidedCoreMeals ? "Add-ons" : "Grocery Items"} Needed</h3>
        <p className="text-gray-400 max-w-xs">This plan does not require any extra monthly food purchases.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      
      {/* Budget Summary */}
      <div className="bg-[#121E12] border border-[#1A2619] rounded-3xl p-5 relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-1 h-full ${isOverBudget ? 'bg-red-500' : 'bg-[#ADFF00]'}`} />
        <div className="mb-5 flex items-start justify-between gap-3 pl-2">
          <div>
            <h3 className="text-xs font-extrabold text-[#ADFF00] tracking-wider uppercase">{planLabel}</h3>
            <p className="mt-1 text-xs leading-relaxed text-gray-500">{planExplanation}</p>
          </div>
          <ShoppingCart size={20} className="shrink-0 text-[#ADFF00]" />
        </div>
        
        <div className="flex justify-between items-end pl-2">
          <div>
            <p className="text-sm text-gray-500 mb-1">Estimated Cost</p>
            <p className="text-3xl font-black text-white">₹{totalCost.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 mb-1">{usesProvidedCoreMeals ? "Add-on budget" : "Budget"}</p>
            <p className="text-xs text-gray-500 mb-1">{budgetLabel}</p>
            {remainingBudget !== null ? (
              <p className={`font-bold ${isOverBudget ? 'text-red-500' : 'text-[#ADFF00]'}`}>
                {isOverBudget ? (
                  <span className="flex items-center gap-1 justify-end"><Info size={14}/> ₹{Math.abs(remainingBudget).toLocaleString()} over budget</span>
                ) : (
                  <span>✓ ₹{remainingBudget.toLocaleString()} unspent</span>
                )}
              </p>
            ) : (
              <p className="text-gray-400 font-bold">--</p>
            )}
          </div>
        </div>

      </div>

      {/* Categories */}
      {Object.entries(groupedItems).map(([category, items]) => (
        <div key={category}>
          <h4 className="text-xs font-bold text-[#ADFF00] tracking-widest uppercase mb-3 flex items-center gap-2">
            <div className="h-px bg-[#1A2619] flex-1" />
            {category}
            <div className="h-px bg-[#1A2619] flex-1" />
          </h4>
          
          <div className="space-y-3">
            {items.map((item, localIdx) => {
              const globalIdx = groceryList.findIndex((g: any) => g.name === item.name);
              return (
                <div key={localIdx} className="bg-[#121E12] border border-[#1A2619] rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex-1 pr-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <h5 className="font-bold text-gray-100">{item.name}</h5>
                      {item.is_optional && (
                        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-bold text-gray-400 uppercase">Optional</span>
                      )}
                    </div>
                    {item.reason && <p className="mt-1 text-xs leading-relaxed text-gray-500">{item.reason}</p>}
                    
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center bg-[#1A2619] rounded-lg p-1">
                        <button 
                          onClick={() => {
                            const newQty = Math.max(1, item.monthly_quantity - 1);
                            if (newQty === item.monthly_quantity) return;
                            const unitPrice = item.monthly_quantity > 0 ? (item.estimated_price || 0) / item.monthly_quantity : 0;
                            handleUpdateItem(globalIdx, { 
                              monthly_quantity: newQty, 
                              estimated_price: Math.round(unitPrice * newQty) 
                            });
                          }} 
                          className="p-1 text-gray-400 hover:text-white"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-xs font-bold min-w-[4rem] whitespace-nowrap px-1 text-center">
                          {item.monthly_quantity} <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{item.unit}</span>
                        </span>
                        <button 
                          onClick={() => {
                            const newQty = item.monthly_quantity + 1;
                            const unitPrice = item.monthly_quantity > 0 ? (item.estimated_price || 0) / item.monthly_quantity : 0;
                            handleUpdateItem(globalIdx, { 
                              monthly_quantity: newQty, 
                              estimated_price: Math.round(unitPrice * newQty) 
                            });
                          }} 
                          className="p-1 text-gray-400 hover:text-white"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {editingPriceId === item.name ? (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm">₹</span>
                        <input 
                          type="number" 
                          value={tempPrice}
                          onChange={e => setTempPrice(e.target.value)}
                          className="w-16 bg-black border border-[#1A2619] rounded-md px-2 py-1 text-sm text-white"
                          autoFocus
                          onBlur={() => handleSavePrice(globalIdx)}
                          onKeyDown={e => e.key === 'Enter' && handleSavePrice(globalIdx)}
                        />
                        <button onClick={() => handleSavePrice(globalIdx)} className="text-[#ADFF00]"><CheckCircle size={16} /></button>
                      </div>
                    ) : (
                      <button type="button" aria-label={`Edit price for ${item.name}`} className="flex items-center gap-2 group" onClick={() => { setEditingPriceId(item.name); setTempPrice(item.estimated_price?.toString() || ''); }}>
                        <span className="font-black text-gray-300">₹{item.estimated_price || 0}</span>
                        <Edit2 size={12} className="text-gray-500 transition-colors group-hover:text-[#ADFF00]" />
                      </button>
                    )}
                    
                    <button onClick={() => handleRemoveItem(globalIdx)} className="text-gray-600 hover:text-red-500 transition-colors p-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

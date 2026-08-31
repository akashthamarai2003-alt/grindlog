'use client';

import { useState, useMemo } from 'react';
import { ShoppingCart, Edit2, CheckCircle, Plus, Minus, Trash2, RefreshCw, Wand2, Info } from 'lucide-react';
import { toast } from 'sonner';

export default function GroceryTab({ planData, setPlanData, profile }: { planData: any, setPlanData: any, profile: any }) {
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>('');
  
  const [generating, setGenerating] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
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

  const generateGrocery = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/fitness-ai/generate-grocery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentNutritionPlan: planData.nutrition })
      });
      const data = await res.json();
      if (data.success) {
        setPlanData({
          ...planData,
          nutrition: { ...planData.nutrition, grocery_list: data.data.grocery_list }
        });
        toast.success("Grocery plan generated!");
      } else {
        toast.error(data.error || "Failed to generate grocery plan");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setGenerating(false);
    }
  };

  const optimizeBudget = async () => {
    if (!budgetLimit) return toast.error("No budget set in profile.");
    setOptimizing(true);
    try {
      const res = await fetch('/api/fitness-ai/generate-grocery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          currentNutritionPlan: planData.nutrition,
          optimizeBudgetMode: true,
          currentTotalCost: totalCost 
        })
      });
      const data = await res.json();
      if (data.success) {
        setPlanData({
          ...planData,
          nutrition: { ...planData.nutrition, grocery_list: data.data.grocery_list }
        });
        toast.success("Budget optimized!");
      } else {
        toast.error(data.error || "Failed to optimize budget");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setOptimizing(false);
    }
  };

  if (groceryList.length === 0) {
    return (
      <div className="px-6 py-12 animate-in fade-in flex flex-col items-center justify-center text-center">
        <ShoppingCart size={48} className="text-gray-500 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">No {usesProvidedCoreMeals ? "Add-on" : "Grocery"} Plan Yet</h3>
        <p className="text-gray-400 mb-6 max-w-xs">Your {usesProvidedCoreMeals ? "protein add-ons" : "grocery list"} haven't been generated yet.</p>
        <button 
          onClick={generateGrocery} 
          disabled={generating}
          className="bg-[#ADFF00] text-black font-bold py-3 px-6 rounded-full flex items-center gap-2 hover:bg-[#9BE600] disabled:opacity-70 transition-all"
        >
          {generating ? <RefreshCw className="animate-spin" size={18} /> : <Wand2 size={18} />}
          {generating ? 'Creating your grocery plan...' : 'Generate Grocery Plan'}
        </button>
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
            <p className="text-sm text-gray-500 mb-1">{usesProvidedCoreMeals ? "Add-on budget" : "Budget"} ({budgetStr || 'N/A'})</p>
            {remainingBudget !== null ? (
              <p className={`font-bold ${isOverBudget ? 'text-red-500' : 'text-[#ADFF00]'}`}>
                {isOverBudget ? (
                  <span className="flex items-center gap-1 justify-end"><Info size={14}/> ₹{Math.abs(remainingBudget).toLocaleString()} over budget</span>
                ) : (
                  <span>✓ ₹{remainingBudget.toLocaleString()} remaining</span>
                )}
              </p>
            ) : (
              <p className="text-gray-400 font-bold">--</p>
            )}
          </div>
        </div>

        {isOverBudget && (
          <button 
            onClick={optimizeBudget}
            disabled={optimizing}
            className="w-full mt-4 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl py-2.5 text-sm font-bold flex items-center justify-center gap-2"
          >
            {optimizing ? <RefreshCw className="animate-spin" size={16} /> : <Wand2 size={16} />}
            {optimizing ? 'Optimizing...' : 'Optimize Budget with AI'}
          </button>
        )}
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

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-[#1A2619]">
        <button 
          onClick={generateGrocery}
          disabled={generating}
          className="flex-1 bg-[#1A2619] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#233322]"
        >
          {generating ? <RefreshCw className="animate-spin" size={18} /> : <RefreshCw size={18} />}
          Regenerate
        </button>
      </div>

    </div>
  );
}

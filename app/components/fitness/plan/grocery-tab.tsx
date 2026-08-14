'use client';

import { useState, useMemo } from 'react';
import { ShoppingCart, Edit2, CheckCircle, Plus, Minus, Trash2, RefreshCw, Wand2, Info } from 'lucide-react';
import { toast } from 'sonner';

export default function GroceryTab({ planData, setPlanData, profile }: { planData: any, setPlanData: any, profile: any }) {
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>('');
  
  const [generating, setGenerating] = useState(false);
  const [optimizing, setOptimizing] = useState(false);

  const groceryList = planData?.nutrition?.grocery_list || [];

  // Budget Parsing
  const budgetStr = profile?.nutrition_budget || "";
  let budgetLimit = 0;
  if (budgetStr.includes("–")) {
    const parts = budgetStr.split("–");
    budgetLimit = parseInt(parts[1].replace(/[^0-9]/g, '')) || 0;
  } else if (budgetStr.includes("+")) {
    budgetLimit = parseInt(budgetStr.replace(/[^0-9]/g, '')) || 0;
  } else if (budgetStr.includes("0-")) {
    budgetLimit = parseInt(budgetStr.replace(/[^0-9]/g, '')) || 0;
  } else {
    budgetLimit = parseInt(budgetStr.replace(/[^0-9]/g, '')) || 0;
  }

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
        body: JSON.stringify({ profile, currentNutritionPlan: planData.nutrition })
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
      // In a real implementation we would call a specific optimize endpoint, but for now we can use modulate
      const prompt = `My estimated grocery cost is ₹${totalCost}, but my budget is ₹${budgetLimit}. Please suggest lower-cost alternative ingredients while maintaining protein adequacy and my dietary preferences. Modify my grocery_list accordingly.`;
      
      const res = await fetch('/api/fitness-ai/modulate-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPlan: planData, prompt })
      });
      const data = await res.json();
      if (data.success) {
        setPlanData(data.data);
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
        <h3 className="text-xl font-bold text-white mb-2">No Grocery Plan Yet</h3>
        <p className="text-gray-400 mb-6 max-w-xs">Your grocery plan hasn't been generated yet.</p>
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
    <div className="px-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      
      {/* Budget Summary */}
      <div className="bg-[#121E12] border border-[#1A2619] rounded-2xl p-5 relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-1 h-full ${isOverBudget ? 'bg-red-500' : 'bg-[#ADFF00]'}`} />
        <h3 className="text-sm font-bold text-gray-400 tracking-wider uppercase mb-4 pl-2">Monthly Grocery Plan</h3>
        
        <div className="flex justify-between items-end pl-2">
          <div>
            <p className="text-sm text-gray-500 mb-1">Estimated Cost</p>
            <p className="text-3xl font-black text-white">₹{totalCost.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 mb-1">Budget ({budgetStr || 'N/A'})</p>
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
                <div key={localIdx} className="bg-[#121E12] border border-[#1A2619] rounded-xl p-4 flex items-center justify-between">
                  <div className="flex-1 pr-4">
                    <h5 className="font-bold text-gray-200">{item.name}</h5>
                    
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center bg-[#1A2619] rounded-lg p-1">
                        <button onClick={() => handleUpdateItem(globalIdx, { monthly_quantity: Math.max(0, item.monthly_quantity - 1) })} className="p-1 text-gray-400 hover:text-white"><Minus size={14} /></button>
                        <span className="text-xs font-bold min-w-[3rem] whitespace-nowrap px-1 text-center">{item.monthly_quantity} {item.unit}</span>
                        <button onClick={() => handleUpdateItem(globalIdx, { monthly_quantity: item.monthly_quantity + 1 })} className="p-1 text-gray-400 hover:text-white"><Plus size={14} /></button>
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
                      <div className="flex items-center gap-2 group cursor-pointer" onClick={() => { setEditingPriceId(item.name); setTempPrice(item.estimated_price?.toString() || ''); }}>
                        <span className="font-black text-gray-300">₹{item.estimated_price || 0}</span>
                        <Edit2 size={12} className="text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
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

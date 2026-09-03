'use client';

import { useMemo, useState } from 'react';
import {
  Brain,
  CheckCircle,
  Edit2,
  Info,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
} from 'lucide-react';

type GroceryItem = {
  name?: string;
  monthly_quantity?: number;
  unit?: string;
  estimated_price?: number;
  category?: string;
  is_optional?: boolean;
  reason?: string;
  protein_grams_per_serving?: number;
  carbs_grams_per_serving?: number;
  fat_grams_per_serving?: number;
  calories_per_serving?: number;
  food_serving_size?: string;
  nutrition_source?: string;
};

const PROVIDED_CORE_ENVIRONMENTS = ['PG', 'Hostel', 'Home', 'Office/Canteen'];

function formatMoney(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

function formatQuantity(quantity: number): string {
  const rounded = Math.round(quantity * 10) / 10;
  return String(rounded);
}

function getBudgetReference(value: unknown): { amount: number | null; isOpenEnded: boolean } {
  const raw = typeof value === 'string' ? value.trim() : '';
  const amounts = raw.replace(/,/g, '').match(/\d+/g)?.map(Number).filter(Number.isFinite) ?? [];
  return {
    amount: amounts.length ? Math.max(...amounts) : null,
    isOpenEnded: raw.includes('+'),
  };
}

function isCoreMeal(mealName: unknown): boolean {
  return typeof mealName === 'string' && /breakfast|lunch|dinner/i.test(mealName);
}

function foodKey(value: unknown): string {
  const name = String(value || '').toLowerCase();
  if (/soy|soya/.test(name) && /chunk/.test(name)) return 'soy chunks';
  if (/chickpea|chana/.test(name)) return 'chickpeas';
  if (/kidney bean|rajma/.test(name)) return 'kidney beans';
  if (/peanut/.test(name)) return 'peanuts';
  if (/oat/.test(name)) return 'oats';
  if (/mixed vegetable/.test(name)) return 'mixed vegetables';
  if (/banana/.test(name)) return 'banana';
  if (/apple/.test(name)) return 'apple';
  return name.replace(/[^a-z0-9]+/g, ' ').trim();
}

function isReferencedByDailyMeals(itemName: unknown, mealItems: string[]): boolean {
  const key = foodKey(itemName);
  return Boolean(key) && mealItems.some((mealItem) => {
    const mealKey = foodKey(mealItem);
    return mealKey.includes(key) || key.includes(mealKey);
  });
}

function dailyQuantityLabel(item: GroceryItem): string | null {
  const quantity = Number(item.monthly_quantity);
  if (!Number.isFinite(quantity) || quantity <= 0) return null;

  const unit = String(item.unit || '').trim().toLowerCase();
  const name = String(item.name || 'item').trim().toLowerCase();

  if (unit === 'pieces' || unit === 'piece') return `${formatQuantity(quantity / 30)} ${name} / day`;
  if (unit === 'liters' || unit === 'liter' || unit === 'l') return `${formatQuantity((quantity * 1000) / 30)} ml / day`;
  if (unit === 'kg' || unit === 'kilograms' || unit === 'kilogram') return `${formatQuantity((quantity * 1000) / 30)} g / day`;
  if (unit === 'grams' || unit === 'gram' || unit === 'g') return `${formatQuantity(quantity / 30)} g / day`;
  return `${formatQuantity(quantity / 30)} ${unit || 'serving'} / day`;
}

function monthlyQuantityLabel(item: GroceryItem): string {
  const quantity = Number(item.monthly_quantity);
  const shownQuantity = Number.isFinite(quantity) && quantity > 0 ? formatQuantity(quantity) : '--';
  const unit = String(item.unit || 'units').trim().toLowerCase();
  const name = String(item.name || 'item').trim().toLowerCase();
  return unit === 'pieces' || unit === 'piece'
    ? `${shownQuantity} ${name} / month`
    : `${shownQuantity} ${unit} / month`;
}

export default function GroceryTab({
  planData,
  setPlanData,
  profile,
}: {
  planData: any;
  setPlanData: any;
  profile: any;
}) {
  const [editingPriceId, setEditingPriceId] = useState<number | null>(null);
  const [tempPrice, setTempPrice] = useState<string>('');

  const usesProvidedCoreMeals = PROVIDED_CORE_ENVIRONMENTS.includes(profile?.food_environment);
  const foodEnvironment = typeof profile?.food_environment === 'string' ? profile.food_environment : 'saved';
  const foodType = typeof profile?.food_type === 'string'
    ? profile.food_type
    : typeof profile?.diet_preference === 'string'
      ? profile.diet_preference
      : null;
  const groceryList: GroceryItem[] = Array.isArray(planData?.nutrition?.grocery_list)
    ? planData.nutrition.grocery_list.filter((item: unknown): item is GroceryItem => Boolean(item) && typeof item === 'object')
    : [];

  const budgetStr = typeof profile?.nutrition_budget === 'string' ? profile.nutrition_budget : '';
  const budget = useMemo(() => getBudgetReference(budgetStr), [budgetStr]);
  const totalCost = useMemo(
    () => groceryList.reduce((total, item) => total + (Number(item.estimated_price) || 0), 0),
    [groceryList],
  );
  const remainingBudget = budget.amount === null ? null : budget.amount - totalCost;
  const isOverBudget = !budget.isOpenEnded && remainingBudget !== null && remainingBudget < 0;
  const targetFloor = budget.amount === null ? null : Math.ceil(budget.amount * 0.8);
  const targetCeiling = budget.amount === null ? null : Math.floor(budget.amount * 0.95);
  const usagePercent = budget.amount && budget.amount > 0 ? Math.min((totalCost / budget.amount) * 100, 100) : 0;
  const selectedFoodsCount = Array.isArray(profile?.available_foods)
    ? profile.available_foods.filter((food: unknown) => typeof food === 'string' && food.trim()).length
    : 0;

  const groupedItems = useMemo(() => {
    const groups: Record<string, Array<{ item: GroceryItem; index: number }>> = {};
    groceryList.forEach((item, index) => {
      const category = String(item.category || 'Other');
      if (!groups[category]) groups[category] = [];
      groups[category].push({ item, index });
    });
    return Object.entries(groups);
  }, [groceryList]);

  const mealFoodNames = useMemo(() => {
    if (!Array.isArray(planData?.nutrition?.meals)) return [];
    return planData.nutrition.meals.flatMap((meal: any) =>
      Array.isArray(meal?.items)
        ? meal.items.filter((item: unknown): item is string => typeof item === 'string')
        : [],
    );
  }, [planData?.nutrition?.meals]);

  const rotationCost = useMemo(
    () => groceryList.reduce(
      (total, item) => isReferencedByDailyMeals(item.name, mealFoodNames)
        ? total
        : total + (Number(item.estimated_price) || 0),
      0,
    ),
    [groceryList, mealFoodNames],
  );

  const coveredCoreMeals = useMemo(() => {
    if (!usesProvidedCoreMeals || !Array.isArray(planData?.nutrition?.meals)) return [];
    return planData.nutrition.meals
      .map((meal: any) => String(meal?.meal_name || '').trim())
      .filter(isCoreMeal);
  }, [planData?.nutrition?.meals, usesProvidedCoreMeals]);

  const handleUpdateItem = (index: number, updates: Partial<GroceryItem>) => {
    const newList = [...groceryList];
    newList[index] = { ...newList[index], ...updates };
    setPlanData({ ...planData, nutrition: { ...planData.nutrition, grocery_list: newList } });
  };

  const handleRemoveItem = (index: number) => {
    const newList = [...groceryList];
    newList.splice(index, 1);
    setPlanData({ ...planData, nutrition: { ...planData.nutrition, grocery_list: newList } });
  };

  const handleSavePrice = (index: number) => {
    const price = Number(tempPrice);
    if (Number.isFinite(price) && price >= 0) handleUpdateItem(index, { estimated_price: price });
    setEditingPriceId(null);
  };

  if (groceryList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-12 text-center animate-in fade-in">
        <ShoppingCart size={48} className="mb-4 text-gray-500" />
        <h3 className="mb-2 text-xl font-bold text-white">No {usesProvidedCoreMeals ? 'Add-ons' : 'Grocery Items'} Needed</h3>
        <p className="max-w-xs text-sm leading-relaxed text-gray-400">Luna did not add purchases outside the meals already covered by your saved routine.</p>
      </div>
    );
  }

  const budgetTargetText = budget.amount === null
    ? 'No budget selected'
    : budget.isOpenEnded
      ? `${formatMoney(budget.amount)}+ baseline`
      : formatMoney(budget.amount);
  const budgetStatus = isOverBudget
    ? `${formatMoney(Math.abs(remainingBudget || 0))} over budget`
    : remainingBudget === null
      ? 'Budget not specified'
      : totalCost < (targetFloor || 0) && selectedFoodsCount !== 1 && selectedFoodsCount !== 2
        ? `${formatMoney(Math.max(0, (targetFloor || 0) - totalCost))} to the useful spend range`
        : budget.isOpenEnded
          ? `${formatMoney(Math.max(0, remainingBudget))} to the selected baseline`
          : `${formatMoney(Math.max(0, remainingBudget))} remaining`;

  return (
    <div className="mx-auto max-w-md space-y-6 px-6 pb-28 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="overflow-hidden rounded-3xl border border-[#ADFF00]/20 bg-[linear-gradient(145deg,rgba(173,255,0,0.10),rgba(18,30,18,1)_45%)] p-5">
        <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#ADFF00]"><Brain size={14} /> Generated by Luna AI</div>
        <h3 className="mt-3 text-xl font-black text-white">Your grocery add-ons</h3>
        <p className="mt-1 text-sm leading-relaxed text-gray-400">
          {usesProvidedCoreMeals ? `Only food to buy outside your ${foodEnvironment} meals.` : 'A 30-day shopping list built from the foods and budget you saved.'}
        </p>
      </section>

      <section className="relative overflow-hidden rounded-3xl border border-[#1A2619] bg-[#121E12] p-5">
        <div className={`absolute inset-y-0 left-0 w-1 ${isOverBudget ? 'bg-red-500' : 'bg-[#ADFF00]'}`} />
        <div className="flex items-start justify-between gap-4 pl-2">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#ADFF00]">Monthly grocery budget</p>
            <p className="mt-1 text-xs leading-relaxed text-gray-500">Estimated 30-day add-ons, including practical rotation foods for variety.</p>
          </div>
          <ShoppingCart size={20} className="shrink-0 text-[#ADFF00]" />
        </div>

        <div className="mt-5 pl-2">
          <p className="text-3xl font-black text-white">{formatMoney(totalCost)} <span className="text-base font-bold text-gray-500">/ {budgetTargetText}</span></p>
          {budget.amount !== null && (
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/30">
              <div className={`h-full rounded-full transition-all ${isOverBudget ? 'bg-red-500' : 'bg-[#ADFF00]'}`} style={{ width: `${usagePercent}%` }} />
            </div>
          )}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/5 pt-4 pl-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Estimated</p>
            <p className="mt-1 text-lg font-black text-white">{formatMoney(totalCost)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{isOverBudget ? 'Over budget' : 'Budget status'}</p>
            <p className={`mt-1 text-sm font-extrabold ${isOverBudget ? 'text-red-400' : 'text-[#ADFF00]'}`}>{isOverBudget && <Info size={14} className="mr-1 inline-block align-[-2px]" />}{budgetStatus}</p>
          </div>
        </div>

        {targetFloor !== null && targetCeiling !== null && !isOverBudget && (
          <p className="mt-3 pl-2 text-[11px] leading-relaxed text-gray-500">Luna&apos;s useful spend range: {formatMoney(targetFloor)}–{formatMoney(targetCeiling)} for this selected budget.</p>
        )}
        {rotationCost > 0 && (
          <p className="mt-2 pl-2 text-[11px] leading-relaxed text-gray-500">Includes {formatMoney(rotationCost)} of rotation foods that can be used across the month, not necessarily every day.</p>
        )}
      </section>

      <section>
        <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#ADFF00]">Your add-ons</p>
        <div className="mt-4 space-y-6">
          {groupedItems.map(([category, entries]) => (
            <div key={category}>
              <h4 className="mb-3 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#ADFF00]"><span className="h-px flex-1 bg-[#1A2619]" />{category}<span className="h-px flex-1 bg-[#1A2619]" /></h4>
              <div className="space-y-3">
                {entries.map(({ item, index }) => {
                  const price = Number(item.estimated_price) || 0;
                  const quantity = Number(item.monthly_quantity) || 0;
                  const dailyLabel = dailyQuantityLabel(item);
                  const isRotation = !isReferencedByDailyMeals(item.name, mealFoodNames);
                  const protein = Number(item.protein_grams_per_serving);
                  const hasProtein = Number.isFinite(protein) && protein >= 0;

                  return (
                    <article key={`${item.name || 'item'}-${index}`} className="rounded-2xl border border-[#1A2619] bg-[#121E12] p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h5 className="text-base font-black text-white">{item.name || 'Food item'}</h5>
                            {item.is_optional && <span className="rounded-full border border-white/10 bg-black/20 px-2 py-0.5 text-[9px] font-bold uppercase text-gray-400">Optional</span>}
                            {isRotation && !item.is_optional && <span className="rounded-full border border-[#ADFF00]/20 bg-[#ADFF00]/5 px-2 py-0.5 text-[9px] font-bold uppercase text-[#ADFF00]">Rotation</span>}
                          </div>
                          {dailyLabel && <p className="mt-2 text-sm font-bold text-gray-300">{dailyLabel}</p>}
                          <p className="mt-1 text-xs font-medium text-gray-500">{monthlyQuantityLabel(item)}</p>
                          <p className="mt-2 text-xs font-bold text-[#ADFF00]">
                            Protein: {hasProtein ? `${formatQuantity(protein)} g` : 'Not available'}
                            {hasProtein && item.food_serving_size ? ` / ${item.food_serving_size}` : hasProtein ? ' / listed serving' : ' in verified library'}
                          </p>
                          {hasProtein && item.nutrition_source && <p className="mt-1 text-[10px] text-gray-500">{item.nutrition_source}; check the package label for brand differences.</p>}
                        </div>

                        <div className="shrink-0 text-right">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Estimated</p>
                          {editingPriceId === index ? (
                            <div className="mt-1 flex items-center justify-end gap-1">
                              <span className="text-sm text-gray-400">₹</span>
                              <input type="number" min="0" value={tempPrice} onChange={(event) => setTempPrice(event.target.value)} onBlur={() => handleSavePrice(index)} onKeyDown={(event) => event.key === 'Enter' && handleSavePrice(index)} className="w-16 rounded-md border border-[#1A2619] bg-black px-2 py-1 text-sm font-bold text-white outline-none focus:border-[#ADFF00]" autoFocus />
                              <button type="button" aria-label={`Save price for ${item.name || 'item'}`} onClick={() => handleSavePrice(index)} className="p-1 text-[#ADFF00]"><CheckCircle size={15} /></button>
                            </div>
                          ) : (
                            <button type="button" aria-label={`Edit price for ${item.name || 'item'}`} onClick={() => { setEditingPriceId(index); setTempPrice(String(price)); }} className="mt-1 inline-flex items-center gap-1 text-lg font-black text-white transition-colors hover:text-[#ADFF00]">{formatMoney(price)} <Edit2 size={12} className="text-gray-500" /></button>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/5 pt-3">
                        <div className="flex items-center rounded-lg bg-black/25 p-1">
                          <button type="button" aria-label={`Decrease ${item.name || 'item'} quantity`} onClick={() => {
                            const nextQuantity = Math.max(1, quantity - 1);
                            if (nextQuantity === quantity) return;
                            const unitPrice = quantity > 0 ? price / quantity : 0;
                            handleUpdateItem(index, { monthly_quantity: nextQuantity, estimated_price: Math.round(unitPrice * nextQuantity) });
                          }} className="p-1 text-gray-400 transition-colors hover:text-white"><Minus size={14} /></button>
                          <span className="min-w-[5.4rem] px-2 text-center text-[11px] font-extrabold text-gray-200">{formatQuantity(quantity)} {String(item.unit || 'units').toUpperCase()}</span>
                          <button type="button" aria-label={`Increase ${item.name || 'item'} quantity`} onClick={() => {
                            const nextQuantity = quantity + 1;
                            const unitPrice = quantity > 0 ? price / quantity : 0;
                            handleUpdateItem(index, { monthly_quantity: nextQuantity, estimated_price: Math.round(unitPrice * nextQuantity) });
                          }} className="p-1 text-gray-400 transition-colors hover:text-white"><Plus size={14} /></button>
                        </div>
                        <button type="button" aria-label={`Remove ${item.name || 'item'}`} onClick={() => handleRemoveItem(index)} className="p-1 text-gray-600 transition-colors hover:text-red-400"><Trash2 size={15} /></button>
                      </div>

                      {item.reason && <p className="mt-3 text-xs leading-relaxed text-gray-400">{item.reason}</p>}
                    </article>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-[#ADFF00]/20 bg-[#121E12] p-5">
        <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#ADFF00]"><Brain size={14} /> Why these add-ons?</div>
        <p className="mt-3 text-sm leading-relaxed text-gray-300">Luna selected items that match the food details you saved and fill the gaps outside your regular meals.</p>
        <ul className="mt-4 space-y-2 text-xs leading-relaxed text-gray-400">
          {foodType && <li>• Compatible with your {foodType.toLowerCase()} food preference</li>}
          {selectedFoodsCount > 0 && <li>• Chosen from your saved available-food list</li>}
          {usesProvidedCoreMeals && <li>• Practical to keep alongside {foodEnvironment} meals</li>}
          <li>• Quantities and prices cover a 30-day plan</li>
        </ul>
      </section>

      {coveredCoreMeals.length > 0 && (
        <section className="rounded-3xl border border-[#1A2619] bg-[#121E12] p-5">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#ADFF00]">Already covered</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {coveredCoreMeals.map((mealName: string) => <span key={mealName} className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs font-bold text-gray-300">{mealName}</span>)}
            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs font-bold text-gray-300">{foodEnvironment} staples</span>
          </div>
        </section>
      )}

      <p className={`px-2 text-center text-xs font-semibold ${isOverBudget ? 'text-red-400' : 'text-gray-500'}`}>Estimated monthly add-ons: {formatMoney(totalCost)}{budgetStr ? ` · Selected budget: ${budgetStr}` : ''}</p>
    </div>
  );
}

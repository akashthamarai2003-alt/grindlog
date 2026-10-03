export interface LogFoodRequest {
  food_id?: string;
  meal_type: string;
  quantity: number;
  custom_food?: any;
}

const memoryNutritionCache: Record<string, any> = {};

export const nutritionClientCache = {
  get(date?: string, userId?: string): any {
    if (!date && typeof window !== "undefined") {
      date = new Intl.DateTimeFormat("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date());
    }
    // Never expose a date-only cache entry without verifying its owner.
    if (!date || !userId) return null;

    if (memoryNutritionCache[date]) {
      return memoryNutritionCache[date]?.user_id === userId ? memoryNutritionCache[date] : null;
    }

    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem(`grindlog_nutrition_${date}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.user_id === userId) {
            memoryNutritionCache[date] = parsed;
            return parsed;
          }
        }
      } catch {}
    }
    return null;
  },

  set(date: string, data: any) {
    if (!date || !data?.user_id) return;
    const existing = memoryNutritionCache[date];
    let toStore = data;
    // Only consider merging if both belong to the exact same user
    const sameUser = !existing || data.user_id === existing.user_id;
    if (data._freshFromDb) {
      toStore = data;
    } else if (existing && sameUser) {
      const existingCount = existing?.logged_foods?.length || 0;
      const newCount = data?.logged_foods?.length || 0;
      const existingCals = Number(existing?.consumed?.calories) || 0;
      const newCals = Number(data?.consumed?.calories) || 0;
      if (((existingCount > 0 && newCount === 0) || (existingCals > 0 && newCals === 0)) && !data._isExplicitClear) {
        toStore = {
          ...existing,
          ...data,
          consumed: existing.consumed,
          logged_foods: existing.logged_foods,
        };
      }
    }

    memoryNutritionCache[date] = toStore;
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(`grindlog_nutrition_${date}`, JSON.stringify(toStore));
      } catch {}
    }
  },

  clear(date?: string) {
    if (date) {
      delete memoryNutritionCache[date];
      if (typeof window !== "undefined") {
        try {
          sessionStorage.removeItem(`grindlog_nutrition_${date}`);
        } catch {}
      }
    } else {
      Object.keys(memoryNutritionCache).forEach((k) => delete memoryNutritionCache[k]);
      if (typeof window !== "undefined") {
        try {
          for (let i = sessionStorage.length - 1; i >= 0; i--) {
            const k = sessionStorage.key(i);
            if (k && k.startsWith("grindlog_nutrition_")) {
              sessionStorage.removeItem(k);
            }
          }
        } catch {}
      }
    }
  },

  notifyUpdated() {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("grindlog_meals_updated"));
      try {
        localStorage.setItem("grindlog_meals_last_updated", String(Date.now()));
      } catch {}
    }
  }
};

export const nutritionApi = {
  async getToday(date?: string, forceRefresh = false) {
    const url = `/api/nutrition/today?t=${Date.now()}${date ? `&date=${encodeURIComponent(date)}` : ''}${forceRefresh ? '&fresh=1' : ''}`;
    const res = await fetch(url);
    const json = await res.json();
    if (!res.ok) throw json.error;
    if (json.data) {
      const targetDate = json.data.date || date || (typeof window !== "undefined" ? new Intl.DateTimeFormat("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date()) : "");
      if (targetDate) {
        nutritionClientCache.set(targetDate, json.data);
      }
    }
    return json.data;
  },

  async setTargets(payload?: any) {
    const res = await fetch('/api/nutrition/targets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload || {})
    });
    const json = await res.json();
    if (!res.ok) throw json.error;
    return json.data;
  },

  async logFood(payload: LogFoodRequest) {
    const res = await fetch('/api/nutrition/log-food', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) throw json.error;
    return json.data;
  },

  async logFoods(items: LogFoodRequest[]) {
    const res = await fetch('/api/nutrition/log-food', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    });
    const json = await res.json();
    if (!res.ok) throw json.error;
    return json.data;
  },

  async deleteFood(id: string) {
    const res = await fetch(`/api/nutrition/log-food/${id}`, {
      method: 'DELETE'
    });
    const json = await res.json();
    if (!res.ok) throw json.error;
    return json;
  },

  async deleteMeal(mealType: string, date?: string) {
    const url = `/api/nutrition/log-food?meal_type=${encodeURIComponent(mealType)}${date ? `&date=${encodeURIComponent(date)}` : ''}`;
    const res = await fetch(url, {
      method: 'DELETE'
    });
    const json = await res.json();
    if (!res.ok) throw json.error;
    return json;
  },

  async logWater(amount_ml: number) {
    const res = await fetch('/api/nutrition/water', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount_ml })
    });
    const json = await res.json();
    if (!res.ok) throw json.error;
    return json.data;
  },

  async removeWater(amount_ml: number = 250) {
    const res = await fetch(`/api/nutrition/water?amount=${amount_ml}`, {
      method: 'DELETE'
    });
    const json = await res.json();
    if (!res.ok) throw json.error;
    return json.data;
  },

  async resetWater() {
    const res = await fetch('/api/nutrition/water?reset=true', {
      method: 'DELETE'
    });
    const json = await res.json();
    if (!res.ok) throw json.error;
    return json.data;
  },

  async getWaterHistory() {
    const res = await fetch(`/api/nutrition/water/history?t=${Date.now()}`);
    const json = await res.json();
    if (!res.ok) throw json.error;
    return json.data;
  },

  async getSwapOptions(mealType: string, date?: string, forceV2?: boolean) {
    const params = new URLSearchParams({
      meal_type: mealType,
      t: String(Date.now()),
    });
    if (date) params.append('date', date);
    if (forceV2) params.append('v2', 'true');
    const res = await fetch(`/api/nutrition/swap-meal?${params.toString()}`);
    const json = await res.json();
    if (!res.ok) throw json.error;
    return json.data;
  },

  async swapMeal(mealType: string, selectedOption?: any, date?: string, forceV2?: boolean) {
    const res = await fetch('/api/nutrition/swap-meal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        meal_type: mealType,
        selected_option: selectedOption,
        date,
        v2: forceV2,
      })
    });
    const json = await res.json();
    if (!res.ok) throw json.error;
    return json;
  },

  async searchFoods(query: string, category?: string, diet?: string) {
    const params = new URLSearchParams();
    if (query) params.append('search', query);
    if (category && category !== 'All') params.append('category', category);
    if (diet) params.append('diet', diet);
    const res = await fetch(`/api/nutrition/foods?${params.toString()}`);
    const json = await res.json();
    if (!res.ok) throw json.error;
    return json.data;
  },

  async getPlanEligibility(forceV2?: boolean) {
    const url = `/api/nutrition/generate-plan${forceV2 ? '?v2=true' : ''}`;
    const res = await fetch(url);
    const json = await res.json();
    if (!res.ok) throw json.error;
    return json.data;
  },

  async generatePlan(options?: { v2?: boolean; start_date?: string }) {
    const url = `/api/nutrition/generate-plan${options?.v2 ? '?v2=true' : ''}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options || {})
    });
    const json = await res.json();
    if (!res.ok) throw json.error;
    return json.data;
  },

  async getAdaptiveDay(date?: string) {
    const url = `/api/nutrition/adaptive-day${date ? `?date=${encodeURIComponent(date)}` : ''}`;
    const res = await fetch(url);
    const json = await res.json();
    if (!res.ok) throw json.error;
    return json.data;
  }
};

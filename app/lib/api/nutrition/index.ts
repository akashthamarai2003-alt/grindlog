export interface LogFoodRequest {
  food_id?: string;
  meal_type: string;
  quantity: number;
  custom_food?: any;
}

export const nutritionApi = {
  async getToday(date?: string) {
    const url = `/api/nutrition/today?t=${Date.now()}${date ? `&date=${encodeURIComponent(date)}` : ''}`;
    const res = await fetch(url);
    const json = await res.json();
    if (!res.ok) throw json.error;
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

  async deleteFood(id: string) {
    const res = await fetch(`/api/nutrition/log-food/${id}`, {
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

  async getWaterHistory() {
    const res = await fetch(`/api/nutrition/water/history?t=${Date.now()}`);
    const json = await res.json();
    if (!res.ok) throw json.error;
    return json.data;
  },

  async getSwapOptions(mealType: string) {
    const res = await fetch(`/api/nutrition/swap-meal?meal_type=${encodeURIComponent(mealType)}&t=${Date.now()}`);
    const json = await res.json();
    if (!res.ok) throw json.error;
    return json.data;
  },

  async swapMeal(mealType: string, selectedOption?: any, date?: string) {
    const res = await fetch('/api/nutrition/swap-meal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        meal_type: mealType,
        selected_option: selectedOption,
        date
      })
    });
    const json = await res.json();
    if (!res.ok) throw json.error;
    return json;
  },

  async searchFoods(query: string, category?: string) {
    const params = new URLSearchParams();
    if (query) params.append('search', query);
    if (category && category !== 'All') params.append('category', category);
    const res = await fetch(`/api/nutrition/foods?${params.toString()}`);
    const json = await res.json();
    if (!res.ok) throw json.error;
    return json.data;
  },

  async generatePlan() {
    const res = await fetch('/api/nutrition/generate-plan', {
      method: 'POST'
    });
    const json = await res.json();
    if (!res.ok) throw json.error;
    return json.data;
  }
};

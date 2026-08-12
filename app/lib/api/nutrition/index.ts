export interface LogFoodRequest {
  food_id: string;
  meal_type: string;
  quantity: number;
}

export const nutritionApi = {
  async getToday() {
    const res = await fetch('/api/nutrition/today');
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

  async searchFoods(query: string) {
    const res = await fetch(`/api/nutrition/foods?search=${encodeURIComponent(query)}`);
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

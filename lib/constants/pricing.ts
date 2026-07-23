export interface PlanPriceItem {
  price: number;
  originalPrice?: number | null;
}

export interface PlanPricingConfig {
  monthly: {
    core: PlanPriceItem;
    pro: PlanPriceItem;
  };
  six_months: {
    core: PlanPriceItem;
    pro: PlanPriceItem;
  };
  lifetime: {
    core: PlanPriceItem;
    pro: PlanPriceItem;
  };
}

export const DEFAULT_PRICING: PlanPricingConfig = {
  monthly: {
    core: { price: 49, originalPrice: 99 },
    pro: { price: 69, originalPrice: 149 },
  },
  six_months: {
    core: { price: 199, originalPrice: 294 },
    pro: { price: 249, originalPrice: 399 },
  },
  lifetime: {
    core: { price: 599, originalPrice: 999 },
    pro: { price: 799, originalPrice: 1499 },
  },
};

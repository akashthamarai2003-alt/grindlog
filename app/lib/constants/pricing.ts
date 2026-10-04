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
  spinDiscountPercentage?: number;
}

export const DEFAULT_PRICING: PlanPricingConfig = {
  monthly: {
    core: { price: 19, originalPrice: 59 },
    pro: { price: 59, originalPrice: 199 },
  },
  six_months: {
    core: { price: 199, originalPrice: 294 },
    pro: { price: 249, originalPrice: 399 },
  },
  lifetime: {
    core: { price: 599, originalPrice: 999 },
    pro: { price: 799, originalPrice: 1499 },
  },
  spinDiscountPercentage: 70,
};

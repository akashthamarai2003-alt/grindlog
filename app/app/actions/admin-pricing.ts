"use server";

import { createAdminClient } from "@/lib/services/supabase/admin";
import { revalidatePath, unstable_noStore } from "next/cache";
import { DEFAULT_PRICING, PlanPricingConfig, PlanPriceItem } from "@/lib/constants/pricing";

export async function getPlanPricesAction(appType: 'grindlog' | 'fitness' = 'grindlog'): Promise<PlanPricingConfig> {
  unstable_noStore();
  try {
    const supabase = createAdminClient();
    const configId = appType === 'fitness' ? 'fitness_pricing_config' : 'pricing_config';
    
    const { data, error } = await supabase
      .from("plan_pricing")
      .select("prices")
      .eq("id", configId)
      .single();

    if (error || !data || !data.prices) {
      return DEFAULT_PRICING;
    }

    const spinDiscountPercentage = typeof data.prices.spinDiscountPercentage === "number" 
      ? data.prices.spinDiscountPercentage 
      : 50;

    // Helper to calculate fallback if one of originalPrice or price is missing
    const resolveTier = (item: any, defaultItem: PlanPriceItem): PlanPriceItem => {
      let price = item?.price;
      let originalPrice = item?.originalPrice;

      if (price == null && originalPrice != null) {
        price = Math.max(1, Math.round(originalPrice * (1 - spinDiscountPercentage / 100)));
      } else if (originalPrice == null && price != null) {
        const factor = Math.max(0.1, 1 - spinDiscountPercentage / 100);
        originalPrice = Math.round(price / factor);
      }

      return {
        price: price ?? defaultItem.price,
        originalPrice: originalPrice ?? defaultItem.originalPrice,
      };
    };

    // Merge with defaults to ensure all keys exist safely
    return {
      monthly: {
        core: resolveTier(data.prices.monthly?.core, DEFAULT_PRICING.monthly.core),
        pro: resolveTier(data.prices.monthly?.pro, DEFAULT_PRICING.monthly.pro),
      },
      six_months: {
        core: {
          price: data.prices.six_months?.core?.price ?? DEFAULT_PRICING.six_months.core.price,
          originalPrice: data.prices.six_months?.core?.originalPrice ?? DEFAULT_PRICING.six_months.core.originalPrice,
        },
        pro: {
          price: data.prices.six_months?.pro?.price ?? DEFAULT_PRICING.six_months.pro.price,
          originalPrice: data.prices.six_months?.pro?.originalPrice ?? DEFAULT_PRICING.six_months.pro.originalPrice,
        },
      },
      lifetime: {
        core: {
          price: data.prices.lifetime?.core?.price ?? DEFAULT_PRICING.lifetime.core.price,
          originalPrice: data.prices.lifetime?.core?.originalPrice ?? DEFAULT_PRICING.lifetime.core.originalPrice,
        },
        pro: {
          price: data.prices.lifetime?.pro?.price ?? DEFAULT_PRICING.lifetime.pro.price,
          originalPrice: data.prices.lifetime?.pro?.originalPrice ?? DEFAULT_PRICING.lifetime.pro.originalPrice,
        },
      },
      spinDiscountPercentage,
    };
  } catch (err) {
    console.error("getPlanPricesAction error:", err);
    return DEFAULT_PRICING;
  }
}

export async function updatePlanPricesAction(newPricing: PlanPricingConfig, appType: 'grindlog' | 'fitness' = 'grindlog') {
  try {
    const supabase = createAdminClient();
    const configId = appType === 'fitness' ? 'fitness_pricing_config' : 'pricing_config';

    const { error } = await supabase.from("plan_pricing").upsert({
      id: configId,
      prices: newPricing,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error("updatePlanPricesAction error:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/payment");
    revalidatePath("/admin/pricing");
    revalidatePath("/payment");
    return { success: true };
  } catch (err: any) {
    console.error("updatePlanPricesAction exception:", err);
    return { success: false, error: err?.message || "Failed to save plan prices" };
  }
}

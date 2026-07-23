"use server";

import { createAdminClient } from "@/lib/services/supabase/admin";
import { revalidatePath } from "next/cache";

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

export async function getPlanPricesAction(): Promise<PlanPricingConfig> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("plan_pricing")
      .select("prices")
      .eq("id", "pricing_config")
      .single();

    if (error || !data || !data.prices) {
      return DEFAULT_PRICING;
    }

    // Merge with defaults to ensure all keys exist safely
    return {
      monthly: {
        core: {
          price: data.prices.monthly?.core?.price ?? DEFAULT_PRICING.monthly.core.price,
          originalPrice: data.prices.monthly?.core?.originalPrice ?? DEFAULT_PRICING.monthly.core.originalPrice,
        },
        pro: {
          price: data.prices.monthly?.pro?.price ?? DEFAULT_PRICING.monthly.pro.price,
          originalPrice: data.prices.monthly?.pro?.originalPrice ?? DEFAULT_PRICING.monthly.pro.originalPrice,
        },
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
    };
  } catch (err) {
    console.error("getPlanPricesAction error:", err);
    return DEFAULT_PRICING;
  }
}

export async function updatePlanPricesAction(newPricing: PlanPricingConfig) {
  try {
    const supabase = createAdminClient();

    const { error } = await supabase.from("plan_pricing").upsert({
      id: "pricing_config",
      prices: newPricing,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error("updatePlanPricesAction error:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/payment");
    revalidatePath("/admin/pricing");
    return { success: true };
  } catch (err: any) {
    console.error("updatePlanPricesAction exception:", err);
    return { success: false, error: err?.message || "Failed to save plan prices" };
  }
}

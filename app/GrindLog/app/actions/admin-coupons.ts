"use server";

import { createAdminClient } from "@/lib/services/supabase/admin";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function createCouponAction(formData: FormData) {
  try {
    const cookieStore = await cookies();
    const adminAuth = cookieStore.get("admin_auth");
    if (adminAuth?.value !== (process.env.ADMIN_PASSWORD || "admin")) {
      return { success: false, error: "Unauthorized" };
    }
    const code = formData.get("code") as string;
    const discountStr = formData.get("discount") as string;
    const maxUsesStr = formData.get("max_uses") as string;
    const allowedPlanStr = formData.get("allowed_plan") as string;
    const allowedLevelStr = formData.get("allowed_level") as string;
    
    if (!code || !discountStr || !maxUsesStr) {
      return { success: false, error: "All fields are required" };
    }
    
    let allowed_plan = allowedPlanStr === "any" ? null : allowedPlanStr;
    let allowed_level = allowedLevelStr === "any" ? null : allowedLevelStr;
    
    const discount_percentage = parseInt(discountStr, 10);
    const max_uses = parseInt(maxUsesStr, 10);
    
    if (discount_percentage < 1 || discount_percentage > 100) {
      return { success: false, error: "Discount must be between 1 and 100" };
    }
    
    if (max_uses < 1) {
      return { success: false, error: "Max uses must be at least 1" };
    }
    
    const supabase = createAdminClient();
    
    const { error } = await supabase.from("coupons").insert({
      code: code.toUpperCase().trim(),
      discount_percentage,
      max_uses,
      allowed_plan,
      allowed_level,
    });
    
    if (error) {
      if (error.code === '23505') { // unique violation
        return { success: false, error: "A coupon with this code already exists" };
      }
      return { success: false, error: error.message };
    }
    
    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "An unexpected error occurred" };
  }
}

export async function toggleCouponStatusAction(id: string, currentStatus: boolean) {
  try {
    const cookieStore = await cookies();
    const adminAuth = cookieStore.get("admin_auth");
    if (adminAuth?.value !== (process.env.ADMIN_PASSWORD || "admin")) {
      return { success: false, error: "Unauthorized" };
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from("coupons")
      .update({ is_active: !currentStatus })
      .eq("id", id);
      
    if (error) return { success: false, error: error.message };
    
    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

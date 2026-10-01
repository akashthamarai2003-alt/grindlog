import { getPlanPricesAction } from "@/app/actions/admin-pricing";
import PricingClientForm from "./client-form";

export const revalidate = 0;

export default async function AdminPricingPage() {
  const fitnessPricing = await getPlanPricesAction("fitness");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Plan & Offer Pricing</h1>
        <p className="text-gray-500 text-xs mt-1">
          Customize subscription prices, offer amounts, and strikethrough original prices for Core and Pro tiers.
        </p>
      </div>

      <PricingClientForm initialPricing={fitnessPricing} />
    </div>
  );
}

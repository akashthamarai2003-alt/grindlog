import { getPlanPricesAction } from "@/app/actions/admin-pricing";
import PricingClientForm from "./client-form";

export const revalidate = 0;

export default async function AdminPricingPage() {
  const pricing = await getPlanPricesAction();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Plan & Offer Pricing</h1>
        <p className="text-gray-500 text-xs mt-1">
          Customize subscription prices, offer amounts, and strikethrough original prices for your users.
        </p>
      </div>

      <PricingClientForm initialPricing={pricing} />
    </div>
  );
}

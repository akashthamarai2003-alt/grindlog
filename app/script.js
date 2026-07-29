const fs = require('fs');

const premiumPath = 'app/premium/page.tsx';
const paymentPath = 'app/payment/page.tsx';

let content = fs.readFileSync(premiumPath, 'utf-8');

// 1. Rename component
content = content.replace('export default function PremiumPage', 'export default function PaymentPage');

// 2. Add processMockPayment import
content = content.replace('import { cn } from "@/lib/utils";', 'import { cn } from "@/lib/utils";\nimport { processMockPayment } from "@/app/actions/payment";');

// 3. Update plans
const newPlans = `const plans = [
  {
    id: "monthly",
    name: "Monthly",
    emoji: "??",
    price: "?49",
    period: "/month",
    originalPrice: null,
    badge: null,
  },
  {
    id: "six_months",
    name: "6 Months",
    emoji: "??",
    price: "?199",
    period: "/6 months",
    originalPrice: "?294",
    badge: "? Most Popular",
    savings: "Save 32%",
  },
  {
    id: "lifetime",
    name: "Lifetime",
    emoji: "??",
    price: "?599",
    period: "one-time",
    originalPrice: null,
    badge: "?? Best Value",
    savings: null,
  },
];`;

content = content.replace(/const plans = \[[\s\S]*?\];/, newPlans);

// 4. Update state and handler
const newLogic = `  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "six_months" | "lifetime">("six_months");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleContinue = async () => {
    setIsProcessing(true);
    const result = await processMockPayment(selectedPlan);
    if (result.success) {
      router.push("/dashboard");
    } else {
      setIsProcessing(false);
      alert("Payment failed: " + result.error);
    }
  };`;

content = content.replace(/  const router = useRouter\(\);\n  const \[selectedPlan, setSelectedPlan\] = useState\("annual"\);/, newLogic);

// 5. Update CTA Button
const oldCtaRegex = /<motion\.button\s+whileTap=\{\{ scale: 0\.96 \}\}\s+className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-\[var\(--color-accent-green\)\] text-base font-semibold text-white shadow-lg shadow-\[var\(--color-accent-green\)\]\/25"\s*>[\s\S]*?<\/motion\.button>/;

const newCta = `<motion.button
        whileTap={{ scale: 0.96 }}
        disabled={isProcessing}
        onClick={handleContinue}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-accent-green)] text-base font-semibold text-white shadow-lg shadow-[var(--color-accent-green)]/25 disabled:opacity-80 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <>
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Processing...
          </>
        ) : (
          <>
            <Crown className="h-5 w-5" />
            Continue with {plans.find(p => p.id === selectedPlan)?.name}
          </>
        )}
      </motion.button>`;

content = content.replace(oldCtaRegex, newCta);

fs.writeFileSync(paymentPath, content, 'utf-8');
console.log('Successfully updated payment page!');

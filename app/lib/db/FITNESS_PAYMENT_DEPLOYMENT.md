# Fitness payment settlement rollout

1. Apply `fitness_payment_settlement.sql` to the target Supabase database before deploying the application. It adds a receipt ledger, paid-amount columns, and a service-role-only settlement transaction. No migration has been applied by this task.
2. Deploy the application. Both Razorpay webhook URLs call the same settlement implementation. Configure the Razorpay webhook signing secret and subscribe to payment.captured.
3. In Razorpay test mode, verify Core and Pro renewal; expired and active membership; callback before webhook and webhook before callback; repeat both deliveries; checkout cancellation; failed payment; delayed webhook; reload/UPI return. A payment must produce exactly one receipt and one expiry extension. Confirm an unrelated account or different order cannot activate access.
4. Confirm Billing shows the new expiry and actual amount paid. Historical rows without a recorded amount intentionally show Amount unavailable.

Membership renewal adds one calendar month after the later of payment time and existing expiry. Saved workouts and nutrition plans are not replaced. Do not promise exactly 30 days.

The migration and test-mode scenarios still require database/provider access. A TypeScript check does not validate the transaction against the deployed database.

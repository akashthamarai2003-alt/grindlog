-- Stage only. Deployed anonymous probes reached all three authentication guards.
-- Revoking PUBLIC alone does not remove a separate grant to anon.
-- Verify effective permissions afterward in case other role memberships grant access.
-- Apply only to these verified signatures; preserve their deployed function bodies.
-- This transaction is idempotent and changes no user or catalog rows.
BEGIN;

REVOKE EXECUTE ON FUNCTION public.persist_v2_meal_plan_atomic(UUID, JSONB, JSONB)
    FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.execute_v2_meal_swap_atomic(UUID, DATE, TEXT, TIMESTAMPTZ, TIMESTAMPTZ, JSONB)
    FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.log_v2_planned_meal_atomic(UUID, DATE, TEXT, JSONB)
    FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.persist_v2_meal_plan_atomic(UUID, JSONB, JSONB)
    TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.execute_v2_meal_swap_atomic(UUID, DATE, TEXT, TIMESTAMPTZ, TIMESTAMPTZ, JSONB)
    TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.log_v2_planned_meal_atomic(UUID, DATE, TEXT, JSONB)
    TO authenticated, service_role;

COMMIT;

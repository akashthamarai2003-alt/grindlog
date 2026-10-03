-- Stage only. Apply after comparing the deployed policies in pg_policies.
-- The existing OR policies allow a row with two different owners to pass when
-- either reference belongs to the caller. All populated references must agree.
-- Legacy meal_plan_items with only meal_plan_id remain accessible to their owner.
BEGIN;

ALTER POLICY "Users can manage their own planned meals" ON public.planned_meals
  USING (
    user_id = auth.uid()
    AND meal_plan_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.meal_plans mp
      WHERE mp.id = planned_meals.meal_plan_id
        AND mp.user_id = auth.uid()
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    AND meal_plan_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.meal_plans mp
      WHERE mp.id = planned_meals.meal_plan_id
        AND mp.user_id = auth.uid()
    )
  );

ALTER POLICY "Users can manage their own meal plan items" ON public.meal_plan_items
  USING (
    (meal_plan_id IS NOT NULL OR planned_meal_id IS NOT NULL)
    AND (
      meal_plan_id IS NULL OR EXISTS (
        SELECT 1 FROM public.meal_plans mp
        WHERE mp.id = meal_plan_items.meal_plan_id
          AND mp.user_id = auth.uid()
      )
    )
    AND (
      planned_meal_id IS NULL OR EXISTS (
        SELECT 1 FROM public.planned_meals pm
        JOIN public.meal_plans mp ON mp.id = pm.meal_plan_id
        WHERE pm.id = meal_plan_items.planned_meal_id
          AND pm.user_id = auth.uid()
          AND mp.user_id = auth.uid()
          AND (
            meal_plan_items.meal_plan_id IS NULL
            OR meal_plan_items.meal_plan_id = pm.meal_plan_id
          )
      )
    )
  )
  WITH CHECK (
    (meal_plan_id IS NOT NULL OR planned_meal_id IS NOT NULL)
    AND (
      meal_plan_id IS NULL OR EXISTS (
        SELECT 1 FROM public.meal_plans mp
        WHERE mp.id = meal_plan_items.meal_plan_id
          AND mp.user_id = auth.uid()
      )
    )
    AND (
      planned_meal_id IS NULL OR EXISTS (
        SELECT 1 FROM public.planned_meals pm
        JOIN public.meal_plans mp ON mp.id = pm.meal_plan_id
        WHERE pm.id = meal_plan_items.planned_meal_id
          AND pm.user_id = auth.uid()
          AND mp.user_id = auth.uid()
          AND (
            meal_plan_items.meal_plan_id IS NULL
            OR meal_plan_items.meal_plan_id = pm.meal_plan_id
          )
      )
    )
  );

-- Existing food_logs remain readable by their user. For writes, a linked
-- planned meal must also belong to that same authenticated user.
ALTER POLICY "Users can manage their own food logs" ON public.food_logs
  WITH CHECK (
    user_id = auth.uid()
    AND (
      planned_meal_id IS NULL OR EXISTS (
        SELECT 1 FROM public.planned_meals pm
        JOIN public.meal_plans mp ON mp.id = pm.meal_plan_id
        WHERE pm.id = food_logs.planned_meal_id
          AND pm.user_id = auth.uid()
          AND mp.user_id = auth.uid()
      )
    )
  );

COMMIT;

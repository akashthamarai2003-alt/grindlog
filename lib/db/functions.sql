-- ============================================
-- GrindLog — Database Functions
-- Run this in Supabase SQL Editor after migration.sql
-- ============================================

-- Add XP to user and auto-level-up
CREATE OR REPLACE FUNCTION add_xp(xp_amount INTEGER)
RETURNS VOID AS $$
DECLARE
  current_xp INTEGER;
  current_level INTEGER;
  xp_for_next INTEGER;
BEGIN
  SELECT xp, level INTO current_xp, current_level
  FROM profiles WHERE id = auth.uid();

  current_xp := current_xp + xp_amount;

  -- Calculate level: XP_needed = 100 * level * (1 + level * 0.15)
  LOOP
    xp_for_next := FLOOR(100 * current_level * (1 + current_level * 0.15));
    IF current_xp >= xp_for_next THEN
      current_xp := current_xp - xp_for_next;
      current_level := current_level + 1;
    ELSE
      EXIT;
    END IF;
  END LOOP;

  UPDATE profiles
  SET xp = current_xp, level = current_level, updated_at = NOW()
  WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Water the tree (increment water count and update tree stage)
CREATE OR REPLACE FUNCTION water_tree()
RETURNS VOID AS $$
DECLARE
  water_count INTEGER;
  leaf_count INTEGER;
  butterfly_count INTEGER;
  bird_count INTEGER;
  flower_count INTEGER;
  new_stage INTEGER;
BEGIN
  -- Get current tree stats
  SELECT tree_water_count, tree_leaves_count, tree_butterflies_count,
         tree_birds_count, tree_flowers_count
  INTO water_count, leaf_count, butterfly_count, bird_count, flower_count
  FROM profiles WHERE id = auth.uid();

  water_count := water_count + 1;

  -- Calculate derived counts
  leaf_count := FLOOR(water_count / 7);
  butterfly_count := FLOOR(water_count / 21);
  bird_count := FLOOR(water_count / 30);
  flower_count := FLOOR(water_count / 60);

  -- Determine tree stage
  IF water_count >= 365 THEN new_stage := 7;
  ELSIF water_count >= 100 THEN new_stage := 6;
  ELSIF water_count >= 60 THEN new_stage := 5;
  ELSIF water_count >= 30 THEN new_stage := 4;
  ELSIF water_count >= 14 THEN new_stage := 3;
  ELSIF water_count >= 7 THEN new_stage := 2;
  ELSIF water_count >= 3 THEN new_stage := 1;
  ELSE new_stage := 0;
  END IF;

  UPDATE profiles
  SET tree_water_count = water_count,
      tree_leaves_count = leaf_count,
      tree_butterflies_count = butterfly_count,
      tree_birds_count = bird_count,
      tree_flowers_count = flower_count,
      tree_stage = new_stage,
      updated_at = NOW()
  WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Calculate streak for a given habit and date
CREATE OR REPLACE FUNCTION calculate_streak(habit_uuid UUID, target_date DATE)
RETURNS INTEGER AS $$
DECLARE
  streak INTEGER := 0;
  check_date DATE := target_date;
  log_status TEXT;
BEGIN
  LOOP
    SELECT status INTO log_status
    FROM habit_logs
    WHERE habit_id = habit_uuid AND date = check_date;

    IF log_status = 'completed' THEN
      streak := streak + 1;
      check_date := check_date - 1;
    ELSE
      EXIT;
    END IF;
  END LOOP;

  RETURN streak;
END;
$$ LANGUAGE plpgsql STABLE;

-- Get all habit logs for a date range
CREATE OR REPLACE FUNCTION get_habits_in_range(
  start_date DATE,
  end_date DATE
)
RETURNS TABLE (
  habit_id UUID,
  date DATE,
  status TEXT,
  habit_name TEXT,
  habit_emoji TEXT,
  category TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT hl.habit_id, hl.date, hl.status, h.name, h.emoji, h.category
  FROM habit_logs hl
  JOIN habits h ON h.id = hl.habit_id
  WHERE hl.user_id = auth.uid()
    AND hl.date BETWEEN start_date AND end_date
  ORDER BY hl.date, h.sort_order;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Get user stats summary
CREATE OR REPLACE FUNCTION get_user_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_completions', COALESCE(SUM(h.total_completions), 0),
    'total_habits', COALESCE(COUNT(h.id) FILTER (WHERE h.is_active), 0),
    'best_streak', COALESCE(MAX(h.longest_streak), 0),
    'avg_completion_rate', COALESCE(AVG(h.completion_rate), 0)
  ) INTO result
  FROM habits h
  WHERE h.user_id = auth.uid() AND h.is_active = TRUE;

  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

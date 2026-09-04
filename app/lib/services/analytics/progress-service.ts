import { createServerSupabase } from "@/lib/services/supabase/server";
import { 
  AggregatedProgressPayload, 
  AnalyticsPeriod,
  TransformationMetrics,
  ConsistencyMetrics,
  WeightPoint,
  BodyMeasurement,
  BodyPhotoScan,
  WorkoutAnalytics,
  NutritionAnalytics,
  ActivityAnalytics,
  RecoveryAnalytics,
  AIProgressReview,
  Achievement
} from "@/types/fitness/analytics";

export class ProgressAnalyticsService {
  
  static async getAggregatedProgress(userId: string, period: AnalyticsPeriod = '30D', referenceDate?: Date): Promise<AggregatedProgressPayload> {
    const supabase = await createServerSupabase();

    const now = referenceDate || new Date();
    const startDate = new Date(now.getTime());
    switch (period) {
      case '7D': startDate.setDate(now.getDate() - 7); break;
      case '30D': startDate.setDate(now.getDate() - 30); break;
      case '3M': startDate.setMonth(now.getMonth() - 3); break;
      case '6M': startDate.setMonth(now.getMonth() - 6); break;
      case 'ALL': startDate.setFullYear(2000); break;
    }
    const startDateStr = startDate.toISOString();
    const nowStr = now.toISOString();

    // --- PARALLEL DATA FETCHING ---
    const [
      { data: fitProfile },
      { data: bodyScansData },
      { data: scansFront },
      { data: bodyMeasurementsData },
      { data: workoutsData },
      { data: nutritionTarget },
      { data: dailySummariesData },
      { data: activityLogsData },
      { data: sleepLogsData },
      { data: latestReview },
      { data: userAchievementsData },
      { data: bodyMetricsData },
      { data: activePlanData }
    ] = await Promise.all([
      supabase.from('fitness_os_profiles').select('created_at, target_weight, weight, weight_trend_baseline, baseline_calories, initial_protein_target, goal_physique_image, target_physique').eq('user_id', userId).maybeSingle(),
      supabase.from('fitness_os_body_scans').select('*').eq('user_id', userId).order('scan_date', { ascending: true }).order('created_at', { ascending: true }),
      supabase.from('fitness_os_scans').select('*').eq('user_id', userId).eq('pose', 'front').order('date', { ascending: false }).limit(2),
      supabase.from('fitness_os_body_metrics').select('waist, chest, hip, neck, left_arm, right_arm, left_thigh, right_thigh, recorded_at').eq('user_id', userId).or('waist.not.is.null,chest.not.is.null,hip.not.is.null,neck.not.is.null,left_arm.not.is.null,right_arm.not.is.null,left_thigh.not.is.null,right_thigh.not.is.null').order('recorded_at', { ascending: true }),
      supabase.from('fitness_os_workouts').select(`
        id,
        user_id,
        workout_date,
        name,
        status,
        started_at,
        completed_at,
        duration_minutes,
        fitness_os_exercises (
          id,
          name,
          target_sets,
          target_reps,
          fitness_os_sets (
            id,
            set_number,
            target_reps,
            actual_reps,
            weight_kg,
            completed
          )
        )
      `).eq('user_id', userId).gte('workout_date', startDateStr.split('T')[0]),
      supabase.from('nutrition_targets').select('*').eq('user_id', userId).order('effective_date', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('nutrition_daily_summary').select('*').eq('user_id', userId).gte('date', startDateStr.split('T')[0]),
      supabase.from('fitness_os_activity_logs').select('*').eq('user_id', userId).gte('activity_date', startDateStr.split('T')[0]),
      supabase.from('fitness_os_sleep_logs').select('*').eq('user_id', userId).gte('sleep_date', startDateStr.split('T')[0]),
      supabase.from('fitness_os_ai_insights').select('*').eq('user_id', userId).order('generated_at', { ascending: false }).limit(5),
      supabase.from('fitness_os_user_achievements').select('*, achievement:achievement_id(title, description, icon)').eq('user_id', userId),
      supabase.from('fitness_os_body_metrics').select('weight, recorded_at').eq('user_id', userId).not('weight', 'is', null).gte('recorded_at', startDateStr).order('recorded_at', { ascending: true }),
      supabase.from('fitness_os_workout_plans').select('plan_data').eq('user_id', userId).eq('status', 'active').maybeSingle()
    ]);

    const workouts = workoutsData || [];
    const dailySummaries = dailySummariesData || [];
    const activityLogs = activityLogsData || [];
    const sleepLogs = sleepLogsData || [];
    const userAchievements = userAchievementsData || [];
    const activePlan = activePlanData;

    // 1. Profile Data Processing
    const profileStartWeight = fitProfile?.weight_trend_baseline || fitProfile?.weight || 0;
    const currentWeight = fitProfile?.weight || 0;
    const targetWeight = fitProfile?.target_weight || 0;

    let progressPercentage = 0;
    let totalChange = 0;
    let remainingChange = 0;

    if (profileStartWeight > 0 && targetWeight > 0 && currentWeight > 0) {
      const isWeightLoss = profileStartWeight > targetWeight;
      const isBulking = targetWeight > profileStartWeight;

      if (isWeightLoss) {
        const totalDistance = profileStartWeight - targetWeight;
        const lost = profileStartWeight - currentWeight;
        // Clean round to 1 decimal place to eliminate JS floating point bugs (e.g. 0.29999999999999716 -> 0.3)
        totalChange = Math.round(lost * 10) / 10;
        // Remaining weight left to lose to reach target from current weight
        const remainingToLose = Math.max(0, currentWeight - targetWeight);
        remainingChange = Math.round(remainingToLose * 10) / 10;

        if (totalDistance > 0) {
          progressPercentage = Math.max(0, Math.min(100, (lost / totalDistance) * 100));
        }
      } else if (isBulking) {
        const totalDistance = targetWeight - profileStartWeight;
        const gained = currentWeight - profileStartWeight;
        totalChange = Math.round(gained * 10) / 10;
        // Remaining weight left to gain to reach target from current weight
        const remainingToGain = Math.max(0, targetWeight - currentWeight);
        remainingChange = Math.round(remainingToGain * 10) / 10;

        if (totalDistance > 0) {
          progressPercentage = Math.max(0, Math.min(100, (gained / totalDistance) * 100));
        }
      } else {
        totalChange = Math.round(Math.abs(currentWeight - profileStartWeight) * 10) / 10;
        remainingChange = 0;
        progressPercentage = 100;
      }
    }

    const userCreatedAt = fitProfile?.created_at ? new Date(fitProfile.created_at) : startDate;
    const effectiveStart = userCreatedAt > startDate ? userCreatedAt : startDate;
    const elapsedDays = Math.max(1, Math.floor((now.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    const transformation: TransformationMetrics = {
      startingWeight: profileStartWeight,
      currentWeight,
      targetWeight,
      totalChange: Math.abs(totalChange),
      remainingChange: Math.abs(remainingChange),
      completionPercentage: Math.round(progressPercentage),
      transformationDay: elapsedDays,
      streak: 0
    };

    // 2. Weight History (Integrated with real fitness_os_body_metrics logs)
    const weightMap = new Map<string, number>();

    // Include baseline starting weight at user join date
    if (fitProfile?.created_at && profileStartWeight > 0) {
      const joinDateStr = new Date(fitProfile.created_at).toISOString().split('T')[0];
      weightMap.set(joinDateStr, Math.round(profileStartWeight * 100) / 100);
    }

    // Populate all user logs from fitness_os_body_metrics
    if (bodyMetricsData && bodyMetricsData.length > 0) {
      for (const m of bodyMetricsData) {
        if (m.weight && m.recorded_at) {
          const dateStr = new Date(m.recorded_at).toISOString().split('T')[0];
          weightMap.set(dateStr, Math.round(Number(m.weight) * 100) / 100);
        }
      }
    }

    // Ensure current weight is included if available
    const todayStr = now.toISOString().split('T')[0];
    if (currentWeight > 0 && !weightMap.has(todayStr)) {
      weightMap.set(todayStr, Math.round(currentWeight * 100) / 100);
    }

    // Convert to sorted array
    let weightHistory: WeightPoint[] = Array.from(weightMap.entries())
      .map(([date, weight]) => ({ date, weight }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Fallback: If only 1 point exists, ensure start baseline is plotted
    if (weightHistory.length === 1 && profileStartWeight > 0) {
      const singlePoint = weightHistory[0];
      const startPointDate = fitProfile?.created_at 
        ? new Date(fitProfile.created_at).toISOString().split('T')[0]
        : startDateStr.split('T')[0];
      
      if (startPointDate < singlePoint.date) {
        weightHistory.unshift({
          date: startPointDate,
          weight: Math.round(profileStartWeight * 100) / 100
        });
      }
    }

    // 3. Body Measurements & Scans
    const measurements: BodyMeasurement[] = [];
    const bodyMeasurements = bodyMeasurementsData || [];

    if (bodyMeasurements.length > 0) {
      const partsConfig = [
        { id: 'waist', name: 'Waist', key: 'waist' as const, minRealistic: 35, maxRealistic: 250 },
        { id: 'chest', name: 'Chest', key: 'chest' as const, minRealistic: 40, maxRealistic: 250 },
        { id: 'hip', name: 'Hips', key: 'hip' as const, minRealistic: 40, maxRealistic: 250 },
        { id: 'neck', name: 'Neck', key: 'neck' as const, minRealistic: 15, maxRealistic: 80 },
        { id: 'left_arm', name: 'Left Arm', key: 'left_arm' as const, minRealistic: 12, maxRealistic: 90 },
        { id: 'right_arm', name: 'Right Arm', key: 'right_arm' as const, minRealistic: 12, maxRealistic: 90 },
        { id: 'left_thigh', name: 'Left Thigh', key: 'left_thigh' as const, minRealistic: 20, maxRealistic: 140 },
        { id: 'right_thigh', name: 'Right Thigh', key: 'right_thigh' as const, minRealistic: 20, maxRealistic: 140 },
      ];

      for (const part of partsConfig) {
        // Collect realistic entries
        const entries = bodyMeasurements
          .map(row => {
            const val = row[part.key];
            return val !== null && val !== undefined ? Number(val) : null;
          })
          .filter((v): v is number => v !== null && !isNaN(v) && v >= part.minRealistic && v <= part.maxRealistic);

        if (entries.length > 0) {
          const startValue = Math.round(entries[0] * 10) / 10;
          const currentValue = Math.round(entries[entries.length - 1] * 10) / 10;
          const change = entries.length > 1
            ? Math.round((currentValue - startValue) * 10) / 10
            : 0;

          measurements.push({
            id: part.id,
            name: part.name,
            startValue,
            currentValue,
            change,
            unit: 'cm'
          });
        }
      }
    }

    // 3. Body Scans
    let firstScan: BodyPhotoScan | null = null;
    let latestScan: BodyPhotoScan | null = null;

    if (bodyScansData && bodyScansData.length > 0) {
      const mapScan = (row: any): BodyPhotoScan => {
        const analysis = (row.ai_analysis_ref as any) || {};
        return {
          id: row.id,
          date: row.scan_date,
          frontUrl: row.front_image_url || null,
          leftUrl: analysis.left_image_url || row.side_image_url || null,
          rightUrl: analysis.right_image_url || row.side_image_url || null,
          backUrl: row.back_image_url || null,
        };
      };

      firstScan = mapScan(bodyScansData[0]);
      latestScan = mapScan(bodyScansData[bodyScansData.length - 1]);
    } else if (scansFront && scansFront.length > 0) {
      firstScan = {
        id: (scansFront[scansFront.length - 1] as any).id || '1',
        frontUrl: (scansFront[scansFront.length - 1] as any).image_url,
        leftUrl: null,
        rightUrl: null,
        backUrl: null,
        date: (scansFront[scansFront.length - 1] as any).date
      };
      latestScan = {
        id: (scansFront[0] as any).id || '2',
        frontUrl: (scansFront[0] as any).image_url,
        leftUrl: null,
        rightUrl: null,
        backUrl: null,
        date: (scansFront[0] as any).date
      };
    }

    const userGoalUrl = (bodyScansData as any[])?.find((s: any) => s.goal_image_url)?.goal_image_url 
      || (fitProfile as any)?.goal_physique_image 
      || null;

    const scans = {
      first: firstScan,
      latest: latestScan,
      goalUrl: userGoalUrl,
      shouldPromptForScan: !latestScan || (new Date().getTime() - new Date(latestScan.date).getTime()) > (14 * 24 * 60 * 60 * 1000)
    };

    // 4. Workout Analytics
    const userBodyweight = fitProfile?.weight || fitProfile?.weight_trend_baseline || 70;

    const processedWorkouts = workouts.map((w: any) => {
      let workoutSets = 0;
      let workoutReps = 0;
      let workoutVolumeKg = 0;

      const exercises = w.fitness_os_exercises || [];
      const isWorkoutCompleted = w.status === 'completed';

      for (const ex of exercises) {
        const sets = ex.fitness_os_sets || [];
        const completedSets = sets.filter((s: any) => s.completed);

        // If sets were explicitly marked completed, credit those.
        // If workout was completed as a whole, credit planned sets.
        const setsToCount = completedSets.length > 0 
          ? completedSets 
          : (isWorkoutCompleted ? sets : []);

        const isBW = /pull[\s-]?up|chin[\s-]?up|push[\s-]?up|dip|plank|crunch|hanging|sit[\s-]?up|bodyweight/i.test(ex.name);

        for (const s of setsToCount) {
          workoutSets++;
          
          let reps = s.actual_reps;
          if (!reps && s.target_reps) {
            reps = typeof s.target_reps === 'number'
              ? s.target_reps
              : parseInt(String(s.target_reps).split('-')[0], 10) || 10;
          }
          if (!reps && ex.target_reps) {
            reps = typeof ex.target_reps === 'number'
              ? ex.target_reps
              : parseInt(String(ex.target_reps).split('-')[0], 10) || 10;
          }
          reps = reps || 10;
          workoutReps += reps;

          let weight = Number(s.weight_kg) || 0;
          if (weight === 0 && isBW) {
            weight = userBodyweight;
          }
          workoutVolumeKg += weight * reps;
        }

        // Fallback: If workout is completed, but no set records exist in DB for this exercise
        if (isWorkoutCompleted && sets.length === 0) {
          const fallbackSets = ex.target_sets || 3;
          let fallbackReps = 10;
          if (ex.target_reps) {
            fallbackReps = typeof ex.target_reps === 'number'
              ? ex.target_reps
              : parseInt(String(ex.target_reps).split('-')[0], 10) || 10;
          }
          workoutSets += fallbackSets;
          workoutReps += fallbackSets * fallbackReps;
          if (isBW) {
            workoutVolumeKg += fallbackSets * fallbackReps * userBodyweight;
          }
        }
      }

      return {
        ...w,
        total_sets: workoutSets,
        total_reps: workoutReps,
        total_volume_kg: Math.round(workoutVolumeKg)
      };
    });

    const totalWorkouts = processedWorkouts.length;
    const completedWorkouts = processedWorkouts.filter((w: any) => w.status === 'completed');
    const totalTrainingTimeMinutes = completedWorkouts.reduce((acc: number, w: any) => {
      const dur = w.duration_minutes || (w.total_sets ? Math.max(20, Math.round(w.total_sets * 3)) : 45);
      return acc + dur;
    }, 0);
    const totalSets = completedWorkouts.reduce((acc: number, w: any) => acc + (w.total_sets || 0), 0);
    const totalReps = completedWorkouts.reduce((acc: number, w: any) => acc + (w.total_reps || 0), 0);
    const trainingVolumeKg = completedWorkouts.reduce((acc: number, w: any) => acc + (w.total_volume_kg || 0), 0);

    const weeklyChartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime());
      d.setDate(d.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dayNum = String(d.getDate()).padStart(2, '0');
      const ds = `${y}-${m}-${dayNum}`;

      const ws = processedWorkouts.filter((w: any) => {
        const wDate = (w.workout_date || '').split('T')[0];
        const cDate = (w.completed_at || '').split('T')[0];
        return wDate === ds || cDate === ds;
      });

      const dayVolume = ws.reduce((acc: number, w: any) => acc + (w.total_volume_kg || 0), 0);
      const isCompleted = ws.some((w: any) => w.status === 'completed');
      const dayShort = d.toLocaleDateString('en-US', { weekday: 'short' });

      weeklyChartData.push({
        day: dayShort,
        fullDay: dayShort,
        date: ds,
        volume: dayVolume,
        completed: isCompleted
      });
    }

    // Calculate personal records
    const exerciseMaxWeight = new Map<string, number>();
    for (const w of processedWorkouts) {
      if (w.status !== 'completed') continue;
      for (const ex of (w.fitness_os_exercises || [])) {
        for (const s of (ex.fitness_os_sets || [])) {
          if (s.completed && s.weight_kg && s.weight_kg > 0) {
            const current = exerciseMaxWeight.get(ex.name) || 0;
            if (s.weight_kg > current) {
              exerciseMaxWeight.set(ex.name, s.weight_kg);
            }
          }
        }
      }
    }
    const personalRecords = exerciseMaxWeight.size;

    const workoutAnalytics: WorkoutAnalytics = {
      totalWorkouts,
      completedWorkouts: completedWorkouts.length,
      completionRate: totalWorkouts > 0 ? (completedWorkouts.length / totalWorkouts) * 100 : 0,
      totalTrainingTimeMinutes: Math.round(totalTrainingTimeMinutes),
      totalSets,
      totalReps,
      trainingVolumeKg,
      personalRecords,
      weeklyChart: weeklyChartData
    };

    // Calculate current workout streak
    const completedWorkoutDates = new Set<string>(
      completedWorkouts
        .map((w: any) => (w.completed_at || w.workout_date || '').split('T')[0])
        .filter(Boolean)
    );
    let calcStreak = 0;
    const checkD = new Date(now.getTime());
    const todayYMD = `${checkD.getFullYear()}-${String(checkD.getMonth() + 1).padStart(2, '0')}-${String(checkD.getDate()).padStart(2, '0')}`;
    while (true) {
      const ymd = `${checkD.getFullYear()}-${String(checkD.getMonth() + 1).padStart(2, '0')}-${String(checkD.getDate()).padStart(2, '0')}`;
      if (completedWorkoutDates.has(ymd)) {
        calcStreak++;
        checkD.setDate(checkD.getDate() - 1);
      } else if (ymd === todayYMD) {
        checkD.setDate(checkD.getDate() - 1);
      } else {
        break;
      }
    }
    transformation.streak = calcStreak;

    // 5. Nutrition & Water Logs
    const targetCalories = nutritionTarget?.calories || fitProfile?.baseline_calories || 2000;
    const targetProtein = nutritionTarget?.protein || fitProfile?.initial_protein_target || 130;
    const targetCarbs = nutritionTarget?.carbs || 246;
    const targetFat = nutritionTarget?.fat || 61;
    const targetWater = nutritionTarget?.water_ml || 3000;

    // Index daily summaries by date string (YYYY-MM-DD)
    const summaryByDate = new Map<string, any>();
    for (const s of dailySummaries) {
      const d = (s.date || '').split('T')[0];
      if (d) summaryByDate.set(d, s);
    }

    const todaySummary = summaryByDate.get(todayYMD);
    const todayCalories = todaySummary ? (todaySummary.calories || 0) : 0;
    const todayProtein = todaySummary ? Math.round(Number(todaySummary.protein) * 10) / 10 : 0;
    const todayCarbs = todaySummary ? Math.round(Number(todaySummary.carbs) * 10) / 10 : 0;
    const todayFat = todaySummary ? Math.round(Number(todaySummary.fat) * 10) / 10 : 0;

    // Build standard 7-day rolling calendar chart (Mon-Sun ending today)
    const calorieChart = [];
    const proteinChart = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime());
      d.setDate(d.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dayNum = String(d.getDate()).padStart(2, '0');
      const ds = `${y}-${m}-${dayNum}`;

      const s = summaryByDate.get(ds);
      const cals = s ? (s.calories || 0) : 0;
      const pro = s ? Math.round(Number(s.protein) * 10) / 10 : 0;
      const dayShort = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayInitial = dayShort.charAt(0);
      const isToday = ds === todayYMD;

      calorieChart.push({
        day: dayInitial,
        fullDay: dayShort,
        date: ds,
        calories: cals,
        target: targetCalories,
        isToday,
        logged: cals > 0,
      });

      proteinChart.push({
        day: dayInitial,
        fullDay: dayShort,
        date: ds,
        protein: pro,
        target: targetProtein,
        isToday,
        logged: pro > 0,
      });
    }

    // Calculate real active daily averages (excluding empty days with 0 intake)
    const loggedSummaries = dailySummaries.filter((m: any) => (m.calories || 0) > 0);
    const loggedDaysCount = loggedSummaries.length;
    const totalCals = loggedSummaries.reduce((acc: number, m: any) => acc + (m.calories || 0), 0);
    const totalPro = loggedSummaries.reduce((acc: number, m: any) => acc + (Number(m.protein) || 0), 0);
    const totalNutScore = dailySummaries.reduce((acc: number, m: any) => acc + (Number(m.nutrition_score) || 0), 0);
    const totalWater = dailySummaries.reduce((acc: number, m: any) => acc + (Number(m.water_ml) || 0), 0);

    const averageCalories = loggedDaysCount > 0 ? Math.round(totalCals / loggedDaysCount) : todayCalories;
    const averageProtein = loggedDaysCount > 0 ? Math.round(totalPro / loggedDaysCount) : todayProtein;

    const nutrition: NutritionAnalytics = {
      averageCalories,
      calorieTarget: targetCalories,
      averageProtein,
      proteinTarget: targetProtein,
      nutritionConsistency: dailySummaries.length > 0 ? Math.round(totalNutScore / dailySummaries.length) : 0,
      calorieChart,
      proteinChart,
      todayCalories,
      todayProtein,
      todayCarbs,
      carbsTarget: targetCarbs,
      todayFat,
      fatTarget: targetFat,
    };

    const averageWater = dailySummaries.length > 0 ? Math.round(totalWater / dailySummaries.length) : 0;

    // 6. Activity & Sleep
    const planLifestyle = activePlan?.plan_data?.lifestyle;
    const userStepTarget = Number(planLifestyle?.daily_steps_target) > 0 ? Number(planLifestyle.daily_steps_target) : 8000;
    const userSleepTarget = Number(planLifestyle?.sleep_target_hours) > 0 ? Number(planLifestyle.sleep_target_hours) : 8;

    // Index activity logs by date
    const activityByDate = new Map<string, any>();
    for (const a of activityLogs) {
      const d = (a.activity_date || '').split('T')[0];
      if (d) activityByDate.set(d, a);
    }
    const todayActivity = activityByDate.get(todayYMD);
    const todaySteps = todayActivity ? (todayActivity.steps || 0) : 0;

    const totalSteps = activityLogs.reduce((acc: number, a: any) => acc + (a.steps || 0), 0);
    const totalActiveMins = activityLogs.reduce((acc: number, a: any) => acc + (a.active_minutes || 0), 0);
    const totalDistance = activityLogs.reduce((acc: number, a: any) => acc + (Number(a.distance_km) || 0), 0);

    const stepsChart = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime());
      d.setDate(d.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dayNum = String(d.getDate()).padStart(2, '0');
      const ds = `${y}-${m}-${dayNum}`;

      const log = activityByDate.get(ds);
      const stepsVal = log ? (log.steps || 0) : 0;
      const dayShort = d.toLocaleDateString('en-US', { weekday: 'short' });
      const isToday = ds === todayYMD;

      stepsChart.push({
        day: dayShort.charAt(0),
        fullDay: dayShort,
        date: ds,
        steps: stepsVal,
        target: userStepTarget,
        isToday,
        logged: stepsVal > 0,
      });
    }

    const loggedActivities = activityLogs.filter((a: any) => (a.steps || 0) > 0);
    const averageDailySteps = loggedActivities.length > 0
      ? Math.round(totalSteps / loggedActivities.length)
      : todaySteps;

    const activity: ActivityAnalytics = {
      todaySteps,
      averageDailySteps,
      stepTarget: userStepTarget,
      averageActiveMinutes: loggedActivities.length > 0 ? Math.round(totalActiveMins / loggedActivities.length) : 0,
      weeklyDistanceKm: totalDistance,
      stepsChart,
    };

    // Index sleep logs by date
    const sleepByDate = new Map<string, any>();
    for (const s of sleepLogs) {
      const d = (s.sleep_date || '').split('T')[0];
      if (d) sleepByDate.set(d, s);
    }
    const todaySleep = sleepByDate.get(todayYMD);
    const todaySleepHours = todaySleep ? Number(todaySleep.duration_hours) || 0 : 0;
    const todaySleepQuality = todaySleep ? (todaySleep.quality_score || 0) * 10 : 0;

    const totalSleep = sleepLogs.reduce((acc: number, s: any) => acc + (Number(s.duration_hours) || 0), 0);
    const totalQuality = sleepLogs.reduce((acc: number, s: any) => acc + (s.quality_score || 0), 0);

    const sleepChart = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime());
      d.setDate(d.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dayNum = String(d.getDate()).padStart(2, '0');
      const ds = `${y}-${m}-${dayNum}`;

      const log = sleepByDate.get(ds);
      const hoursVal = log ? Number(log.duration_hours) || 0 : 0;
      const qualityVal = log ? (log.quality_score || 0) * 10 : 0;
      const dayShort = d.toLocaleDateString('en-US', { weekday: 'short' });
      const isToday = ds === todayYMD;

      sleepChart.push({
        day: dayShort.charAt(0),
        fullDay: dayShort,
        date: ds,
        hours: hoursVal,
        quality: qualityVal,
        target: userSleepTarget,
        isToday,
        logged: hoursVal > 0,
      });
    }

    const loggedSleeps = sleepLogs.filter((s: any) => (Number(s.duration_hours) || 0) > 0);
    const averageSleepHours = loggedSleeps.length > 0
      ? Number((totalSleep / loggedSleeps.length).toFixed(1))
      : todaySleepHours;
    const averageSleepQuality = loggedSleeps.length > 0
      ? Math.round((totalQuality / loggedSleeps.length) * 10)
      : todaySleepQuality;

    // Calculate rest days in current 7-day rolling window
    let workoutsInRollingWeek = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(now.getTime());
      d.setDate(d.getDate() - i);
      const ymd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (completedWorkoutDates.has(ymd)) {
        workoutsInRollingWeek++;
      }
    }
    const restDays = Math.max(0, 7 - workoutsInRollingWeek);

    const recovery: RecoveryAnalytics = {
      todaySleepHours,
      todaySleepQuality,
      averageSleepHours,
      sleepTargetHours: userSleepTarget,
      averageSleepQuality,
      restDays,
      sleepChart,
    };

    // 7. Consistency Aggregation
    const consistency: ConsistencyMetrics = {
      workout: workoutAnalytics.completionRate,
      nutrition: nutrition.nutritionConsistency,
      protein: nutrition.averageProtein >= nutrition.proteinTarget ? 100 : (nutrition.averageProtein / nutrition.proteinTarget) * 100,
      water: averageWater >= targetWater ? 100 : (averageWater / targetWater) * 100,
      steps: (todaySteps > 0 || activity.averageDailySteps > 0)
        ? Math.min(100, (Math.max(todaySteps, activity.averageDailySteps) / activity.stepTarget) * 100)
        : 0,
      sleep: (todaySleepHours > 0 || recovery.averageSleepHours > 0)
        ? Math.min(100, (Math.max(todaySleepHours, recovery.averageSleepHours) / recovery.sleepTargetHours) * 100)
        : 0,
      overallScore: 0
    };
    consistency.overallScore = (consistency.workout + consistency.nutrition + consistency.protein + consistency.water + consistency.steps + consistency.sleep) / 6;

    // 8. AI Review
    let aiReview: AIProgressReview | null = null;
    const insightsList = Array.isArray(latestReview)
      ? latestReview
      : (latestReview ? [latestReview] : []);
    const topReview = insightsList[0] || null;

    if (topReview) {
      const todayInsightsCount = insightsList.filter((row: any) => {
        if (!row.generated_at) return false;
        return new Date(row.generated_at).toISOString().split('T')[0] === todayStr;
      }).length;

      const remainingToday = Math.max(0, 3 - todayInsightsCount);

      aiReview = {
        summary: topReview.summary,
        strengths: topReview.strengths || [],
        weaknesses: topReview.weaknesses || [],
        recommendations: topReview.recommendations || [],
        generatedAt: topReview.generated_at,
        canGenerateToday: remainingToday > 0,
        dailyQuotaRemaining: remainingToday,
        dailyQuotaTotal: 3,
        dailyUsedCount: todayInsightsCount,
      };
    }

    // 9. Achievements
    const achievements: Achievement[] = userAchievements.map((ua: any) => ({
      id: ua.achievement_id,
      title: ua.achievement?.title || 'Achievement',
      description: ua.achievement?.description || '',
      icon: ua.achievement?.icon || '??',
      unlocked: !!ua.unlocked_at,
      progress: ua.progress,
      target: 100
    }));

    // 10. Smart Prompt Logic
    let shouldPromptForScan = false;
    const isConsistent = consistency.overallScore > 70; // Highly consistent
    
    let daysSinceLastScan = 999;
    if (scans.latest?.date) {
      const lastScanDate = new Date(scans.latest.date);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - lastScanDate.getTime());
      daysSinceLastScan = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    if (isConsistent && daysSinceLastScan >= 14) {
      shouldPromptForScan = true;
    }
    scans.shouldPromptForScan = shouldPromptForScan;

    return {
      period,
      transformation,
      consistency,
      weightHistory,
      measurements,
      scans,
      workout: workoutAnalytics,
      nutrition,
      activity,
      recovery,
      aiReview,
      achievements
    };
  }
}

import { createServerSupabase } from "@/lib/services/supabase/server";
import { 
  AggregatedProgressPayload, 
  AnalyticsPeriod,
  TransformationMetrics,
  ConsistencyMetrics,
  WeightPoint,
  BodyMeasurement,
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

    // 1. Profile Data
    const { data: fitProfile } = await supabase
      .from('fitness_os_profiles')
      .select('created_at, target_weight, weight, weight_trend_baseline')
      .eq('user_id', userId)
      .maybeSingle();

    const { differenceInCalendarDays } = require("date-fns");
    const createdDate = fitProfile?.created_at ? new Date(fitProfile.created_at) : new Date();
    const transformationDay = Math.max(1, differenceInCalendarDays(now, createdDate) + 1);
    
    // 2. Fetch Body Metrics
    let bodyMetrics: any[] = [];
    try {
      const { data } = await supabase
        .from('fitness_os_body_metrics')
        .select('*')
        .eq('user_id', userId)
        .order('recorded_at', { ascending: true });
      if (data) bodyMetrics = data;
    } catch(e) {}

    const periodBodyMetrics = bodyMetrics.filter(m => new Date(m.recorded_at) >= startDate && new Date(m.recorded_at) <= now);

    // Calculate start and current weights properly
    let startW = fitProfile?.weight_trend_baseline || (bodyMetrics.length > 0 ? bodyMetrics[0].weight : fitProfile?.weight) || null;
    let currW = bodyMetrics.length > 0 ? bodyMetrics[bodyMetrics.length - 1].weight : (fitProfile?.weight || null);
    const targetW = fitProfile?.target_weight || null;

    let totalChange = 0;
    let remainingChange = 0;
    let completionPercentage = 0;

    if (startW && currW && targetW) {
      const totalGoal = Math.abs(startW - targetW);
      if (totalGoal > 0) {
        const isBulking = targetW > startW;
        let progressMade = isBulking ? (currW - startW) : (startW - currW);
        progressMade = Math.max(0, progressMade); // Floor at 0 if moving wrong direction
        
        const remaining = isBulking ? (targetW - currW) : (currW - targetW);
        
        totalChange = Number(progressMade.toFixed(1));
        remainingChange = Number(Math.max(0, remaining).toFixed(1));
        completionPercentage = Math.min(100, Math.max(0, (progressMade / totalGoal) * 100));
      } else {
        totalChange = 0;
        remainingChange = 0;
        completionPercentage = 100; // Goal is already equal to start
      }
    }

    // 1.5 Calculate True Streak
    let trueStreak = 0;
    try {
      const d = new Date();
      d.setDate(d.getDate() - 100);
      const lookbackDateStr = d.toISOString().split('T')[0];

      const [workoutRes, nutritionRes, activityRes] = await Promise.all([
        supabase.from('fitness_os_workout_sessions').select('start_time').eq('user_id', userId).eq('status', 'completed').gte('start_time', lookbackDateStr),
        supabase.from('nutrition_daily_summary').select('date').eq('user_id', userId).gte('date', lookbackDateStr),
        supabase.from('fitness_os_activity_logs').select('activity_date').eq('user_id', userId).gte('activity_date', lookbackDateStr)
      ]);

      const activeDates = new Set<string>();
      if (workoutRes.data) workoutRes.data.forEach((w: any) => activeDates.add(w.start_time.split('T')[0]));
      if (nutritionRes.data) nutritionRes.data.forEach((n: any) => activeDates.add(n.date));
      if (activityRes.data) activityRes.data.forEach((a: any) => activeDates.add(a.activity_date));

      const todayStr = new Date().toISOString().split('T')[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      let currentDate = yesterday;
      
      if (activeDates.has(todayStr)) {
        trueStreak = 1;
      }
      
      while (true) {
        const dateStr = currentDate.toISOString().split('T')[0];
        if (activeDates.has(dateStr)) {
          trueStreak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }
    } catch(e) {
      console.error("Error calculating streak", e);
    }

    const transformation: TransformationMetrics = {
      startingWeight: startW,
      currentWeight: currW,
      targetWeight: targetW,
      totalChange,
      remainingChange,
      completionPercentage,
      transformationDay,
      streak: trueStreak,
    };

    const weightHistory: WeightPoint[] = periodBodyMetrics
      .filter(m => m.weight)
      .map((log: any) => ({
        date: log.recorded_at.split('T')[0],
        weight: Number(log.weight)
      }));

    // Generate Measurement Deltas
    const getMeasurement = (field: string, name: string): BodyMeasurement | null => {
      const valid = bodyMetrics.filter(m => m[field] != null);
      if (valid.length === 0) return null;
      const first = Number(valid[0][field]);
      const latest = Number(valid[valid.length - 1][field]);
      return {
        id: field,
        name,
        startValue: first,
        currentValue: latest,
        change: Number((latest - first).toFixed(2)),
        unit: 'cm'
      };
    };

    const rawMeasurements = [
      getMeasurement('waist', 'Waist'),
      getMeasurement('chest', 'Chest'),
      getMeasurement('hip', 'Hip'),
      getMeasurement('neck', 'Neck'),
      getMeasurement('left_arm', 'Left Arm'),
      getMeasurement('right_arm', 'Right Arm'),
      getMeasurement('left_thigh', 'Left Thigh'),
      getMeasurement('right_thigh', 'Right Thigh'),
    ];
    const measurements: BodyMeasurement[] = rawMeasurements.filter(Boolean) as BodyMeasurement[];

    // 3. Body Scans
    let scansData: any[] = [];
    try {
      const { data } = await supabase
        .from('fitness_os_body_scans')
        .select('*')
        .eq('user_id', userId)
        .order('scan_date', { ascending: true });
      if (data) scansData = data;
    } catch(e) {}

    const scans: { first: any | null; latest: any | null; shouldPromptForScan?: boolean } = {
      first: scansData.length > 0 ? {
        id: scansData[0].id,
        frontUrl: scansData[0].front_image_url,
        sideUrl: scansData[0].side_image_url,
        backUrl: scansData[0].back_image_url,
        date: scansData[0].scan_date
      } : null,
      latest: scansData.length > 0 ? {
        id: scansData[scansData.length - 1].id,
        frontUrl: scansData[scansData.length - 1].front_image_url,
        sideUrl: scansData[scansData.length - 1].side_image_url,
        backUrl: scansData[scansData.length - 1].back_image_url,
        date: scansData[scansData.length - 1].scan_date
      } : null
    };

    // 4. Workouts & Exercises
    let workoutSessions: any[] = [];
    try {
      const { data } = await supabase
        .from('fitness_os_workout_sessions')
        .select('*')
        .eq('user_id', userId)
        .gte('start_time', startDateStr)
        .lte('start_time', nowStr);
      if (data) workoutSessions = data;
    } catch(e) {}

    const completedWorkouts = workoutSessions.filter(w => w.status === 'completed');
    const totalWorkouts = workoutSessions.length;
    let totalTrainingTimeMinutes = completedWorkouts.reduce((acc, w) => acc + (w.duration_seconds ? w.duration_seconds / 60 : 45), 0);
    
    // In a real optimized system, we'd do a sum/aggregate query, but fetching logs for the period is okay if scoped
    let exerciseLogs: any[] = [];
    try {
      const { data } = await supabase
        .from('fitness_os_exercise_logs')
        .select('weight, reps, completed')
        .eq('user_id', userId)
        .gte('created_at', startDateStr);
      if (data) exerciseLogs = data;
    } catch(e) {}

    const completedSets = exerciseLogs.filter(e => e.completed);
    const totalSets = completedSets.length;
    const totalReps = completedSets.reduce((acc, e) => acc + (e.reps || 0), 0);
    const trainingVolumeKg = completedSets.reduce((acc, e) => acc + ((e.reps || 0) * (e.weight || 0)), 0);

    const workoutAnalytics: WorkoutAnalytics = {
      totalWorkouts,
      completedWorkouts: completedWorkouts.length,
      completionRate: totalWorkouts > 0 ? (completedWorkouts.length / totalWorkouts) * 100 : 0,
      totalTrainingTimeMinutes: Math.round(totalTrainingTimeMinutes),
      totalSets,
      totalReps,
      trainingVolumeKg,
      personalRecords: 0, // Placeholder
      weeklyChart: [] // Placeholder for chart data grouping
    };

    // 4.5 Fetch Nutrition Target
    let nutritionTarget: any = null;
    try {
      const { data } = await supabase.from('nutrition_targets').select('*').eq('user_id', userId).order('effective_date', { ascending: false }).limit(1).maybeSingle();
      if (data) nutritionTarget = data;
    } catch(e) {}
    
    // Check fitness_os_profiles if target not found
    let profileTargetCals = null;
    let profileTargetPro = null;
    if (!nutritionTarget) {
      try {
        const { data: profile } = await supabase.from('fitness_os_profiles').select('baseline_calories, initial_protein_target').eq('user_id', userId).maybeSingle();
        if (profile) {
          profileTargetCals = profile.baseline_calories;
          profileTargetPro = profile.initial_protein_target;
        }
      } catch(e) {}
    }

    const targetCalories = nutritionTarget?.calories || profileTargetCals || 2000;
    const targetProtein = nutritionTarget?.protein || profileTargetPro || 130;
    const targetWater = nutritionTarget?.water_ml || 3000;

    // 5. Nutrition & Water Logs (from nutrition_daily_summary)
    let dailySummaries: any[] = [];
    try {
      const { data } = await supabase
        .from('nutrition_daily_summary')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDateStr.split('T')[0]);
      if (data) dailySummaries = data;
    } catch(e) {}

    const nutritionDays = dailySummaries.length;
    const totalCals = dailySummaries.reduce((acc, m) => acc + (m.calories || 0), 0);
    const totalPro = dailySummaries.reduce((acc, m) => acc + (Number(m.protein) || 0), 0);
    const totalWater = dailySummaries.reduce((acc, m) => acc + (Number(m.water_ml) || 0), 0);
    const totalNutScore = dailySummaries.reduce((acc, m) => acc + (Number(m.nutrition_score) || 0), 0);

    const calorieChart = dailySummaries.map((m: any) => ({
      day: new Date(m.date).toLocaleDateString('en-US', { weekday: 'short' }).charAt(0),
      calories: m.calories || 0,
      target: targetCalories
    })).slice(-7); // Last 7 days for the chart

    const proteinChart = dailySummaries.map((m: any) => ({
      day: new Date(m.date).toLocaleDateString('en-US', { weekday: 'short' }).charAt(0),
      protein: m.protein || 0,
      target: targetProtein
    })).slice(-7);

    const nutrition: NutritionAnalytics = {
      averageCalories: nutritionDays > 0 ? Math.round(totalCals / nutritionDays) : 0,
      calorieTarget: targetCalories,
      averageProtein: nutritionDays > 0 ? Math.round(totalPro / nutritionDays) : 0,
      proteinTarget: targetProtein,
      nutritionConsistency: nutritionDays > 0 ? Math.round(totalNutScore / nutritionDays) : 0,
      calorieChart,
      proteinChart
    };
    
    const averageWater = nutritionDays > 0 ? Math.round(totalWater / nutritionDays) : 0;

    // 6. Activity & Sleep
    let activityLogs: any[] = [];
    try {
      const { data } = await supabase.from('fitness_os_activity_logs').select('*').eq('user_id', userId).gte('activity_date', startDateStr.split('T')[0]);
      if (data) activityLogs = data;
    } catch(e) {}

    let sleepLogs: any[] = [];
    try {
      const { data } = await supabase.from('fitness_os_sleep_logs').select('*').eq('user_id', userId).gte('sleep_date', startDateStr.split('T')[0]);
      if (data) sleepLogs = data;
    } catch(e) {}

    const totalSteps = activityLogs.reduce((acc, a) => acc + (a.steps || 0), 0);
    const totalActiveMins = activityLogs.reduce((acc, a) => acc + (a.active_minutes || 0), 0);
    const totalDistance = activityLogs.reduce((acc, a) => acc + (Number(a.distance_km) || 0), 0);

    const activity: ActivityAnalytics = {
      averageDailySteps: activityLogs.length > 0 ? Math.round(totalSteps / activityLogs.length) : 0,
      stepTarget: 10000,
      averageActiveMinutes: activityLogs.length > 0 ? Math.round(totalActiveMins / activityLogs.length) : 0,
      weeklyDistanceKm: totalDistance,
      stepsChart: []
    };

    const totalSleep = sleepLogs.reduce((acc, s) => acc + (Number(s.duration_hours) || 0), 0);
    const totalQuality = sleepLogs.reduce((acc, s) => acc + (s.quality_score || 0), 0);

    const recovery: RecoveryAnalytics = {
      averageSleepHours: sleepLogs.length > 0 ? Number((totalSleep / sleepLogs.length).toFixed(1)) : 0,
      sleepTargetHours: 8,
      averageSleepQuality: sleepLogs.length > 0 ? Math.round(totalQuality / sleepLogs.length * 10) : 0, // Scale out of 10 to 100
      restDays: 0 // Logic: days without workouts
    };

    // 7. Consistency Aggregation
    const consistency: ConsistencyMetrics = {
      workout: workoutAnalytics.completionRate,
      nutrition: nutrition.nutritionConsistency,
      protein: nutrition.averageProtein >= nutrition.proteinTarget ? 100 : (nutrition.averageProtein / nutrition.proteinTarget) * 100,
      water: averageWater >= targetWater ? 100 : (averageWater / targetWater) * 100,
      steps: activity.averageDailySteps >= activity.stepTarget ? 100 : (activity.averageDailySteps / activity.stepTarget) * 100,
      sleep: recovery.averageSleepHours >= recovery.sleepTargetHours ? 100 : (recovery.averageSleepHours / recovery.sleepTargetHours) * 100,
      overallScore: 0
    };
    consistency.overallScore = (consistency.workout + consistency.nutrition + consistency.protein + consistency.water + consistency.steps + consistency.sleep) / 6;

    // 8. AI Review Cache
    let aiReview: AIProgressReview | null = null;
    try {
      const { data: latestReview } = await supabase
        .from('fitness_os_ai_insights')
        .select('*')
        .eq('user_id', userId)
        .order('generated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestReview) {
        aiReview = {
          summary: latestReview.summary,
          strengths: latestReview.strengths || [],
          weaknesses: latestReview.weaknesses || [],
          recommendations: latestReview.recommendations || [],
          generatedAt: latestReview.generated_at
        };
      }
    } catch (e) {}

    // 9. User Achievements
    let userAchievements: any[] = [];
    try {
      const { data } = await supabase
        .from('fitness_os_user_achievements')
        .select('*, achievement:achievement_id(title, description, icon)')
        .eq('user_id', userId);
      if (data) userAchievements = data;
    } catch(e) {}

    const achievements: Achievement[] = userAchievements.map(ua => ({
      id: ua.achievement_id,
      title: ua.achievement?.title || 'Achievement',
      description: ua.achievement?.description || '',
      icon: ua.achievement?.icon || '🏆',
      unlocked: !!ua.unlocked_at,
      progress: ua.progress,
      target: 100 // placeholder
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

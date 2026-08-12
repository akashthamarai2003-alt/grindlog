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
  
  static async getAggregatedProgress(userId: string, period: AnalyticsPeriod = '30D'): Promise<AggregatedProgressPayload> {
    const supabase = await createServerSupabase();

    // Calculate date ranges based on period
    const now = new Date();
    const startDate = new Date();
    switch (period) {
      case '7D': startDate.setDate(now.getDate() - 7); break;
      case '30D': startDate.setDate(now.getDate() - 30); break;
      case '3M': startDate.setMonth(now.getMonth() - 3); break;
      case '6M': startDate.setMonth(now.getMonth() - 6); break;
      case 'ALL': startDate.setFullYear(2000); break;
    }
    const startDateStr = startDate.toISOString();
    const nowStr = now.toISOString();

    // 1. Fetch Profile & Transformation Data
    const { data: profile } = await supabase
      .from('profiles')
      .select('created_at, target_weight, current_weight, starting_weight')
      .eq('id', userId)
      .single();

    // Calculate Days since start
    const createdDate = profile?.created_at ? new Date(profile.created_at) : new Date();
    const transformationDay = Math.max(1, Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)));
    
    const startW = profile?.starting_weight || null;
    const currW = profile?.current_weight || null;
    const targetW = profile?.target_weight || null;
    let totalChange = 0;
    let remainingChange = 0;
    let completionPercentage = 0;

    if (startW && currW && targetW) {
      totalChange = Number(Math.abs(currW - startW).toFixed(1));
      remainingChange = Number(Math.abs(targetW - currW).toFixed(1));
      const totalGoal = Math.abs(startW - targetW);
      if (totalGoal > 0) {
        completionPercentage = Math.min(100, Math.max(0, (totalChange / totalGoal) * 100));
      }
    }

    const transformation: TransformationMetrics = {
      startingWeight: startW,
      currentWeight: currW,
      targetWeight: targetW,
      totalChange,
      remainingChange,
      completionPercentage,
      transformationDay,
      streak: 12, // TODO: Missing backend field `streak_days` in profiles or workout logs
    };

    // 2. Fetch Weight History
    // Expected table: fitness_os_weight_logs (user_id, weight, logged_at)
    let weightLogs: any[] = [];
    try {
      const { data } = await supabase
        .from('fitness_os_weight_logs')
        .select('weight, logged_at')
        .eq('user_id', userId)
        .gte('logged_at', startDateStr)
        .lte('logged_at', nowStr)
        .order('logged_at', { ascending: true });
      if (data) weightLogs = data;
    } catch (e) {
      // Fallback if table doesn't exist yet
    }

    const weightHistory: WeightPoint[] = weightLogs.map((log: any) => ({
      date: log.logged_at.split('T')[0],
      weight: log.weight
    }));

    // 3. Fetch Workouts
    const { data: workouts } = await supabase
      .from('fitness_os_workouts')
      .select('id, status, duration_minutes, workout_date')
      .eq('user_id', userId)
      .gte('workout_date', startDateStr.split('T')[0])
      .lte('workout_date', nowStr.split('T')[0]);

    const completedWorkouts = workouts?.filter(w => w.status === 'completed') || [];
    const totalWorkouts = workouts?.length || 0;
    
    // Simplistic volume calculation based on completed sessions for now
    // A real implementation would sum up sets * reps * weight from fitness_os_sets
    const workoutAnalytics: WorkoutAnalytics = {
      totalWorkouts,
      completedWorkouts: completedWorkouts.length,
      completionRate: totalWorkouts > 0 ? (completedWorkouts.length / totalWorkouts) * 100 : 0,
      totalTrainingTimeMinutes: completedWorkouts.reduce((acc, w) => acc + (w.duration_minutes || 45), 0),
      totalSets: completedWorkouts.length * 15, // TODO: Need complex join query on fitness_os_sets
      totalReps: completedWorkouts.length * 150, // TODO: Same as above
      trainingVolumeKg: completedWorkouts.length * 4500, // TODO: Same as above
      personalRecords: 2, // TODO: Needs PR tracking table `fitness_os_prs`
      weeklyChart: [] // TODO: Group workouts by day of week
    };

    // 4. Consistency Metrics (Aggregation of various tracking tables)
    // For now we calculate workout consistency, others will need their respective tables
    const workoutConsistency = workoutAnalytics.completionRate;
    
    const consistency: ConsistencyMetrics = {
      workout: workoutConsistency,
      nutrition: 85, // TODO: Needs nutrition logs table
      protein: 90,   // TODO: Needs nutrition logs table
      water: 70,     // TODO: Needs water logs table
      steps: 80,     // TODO: Needs step logs table
      sleep: 60,     // TODO: Needs sleep logs table
      overallScore: (workoutConsistency + 85 + 90 + 70 + 80 + 60) / 6
    };

    // 5. Body Measurements
    // Expected table: fitness_os_measurements (user_id, body_part, value, unit, logged_at)
    const measurements: BodyMeasurement[] = [
      { id: '1', name: 'Waist', startValue: 85, currentValue: 80, change: -5, unit: 'cm' },
      { id: '2', name: 'Chest', startValue: 100, currentValue: 105, change: 5, unit: 'cm' },
      { id: '3', name: 'Left Arm', startValue: 35, currentValue: 38, change: 3, unit: 'cm' },
      { id: '4', name: 'Right Arm', startValue: 35, currentValue: 38, change: 3, unit: 'cm' },
    ]; // TODO: Fetch from actual measurements table

    // 6. Body Scans
    // Expected table: fitness_os_body_scans (user_id, front_url, side_url, back_url, scanned_at)
    const scans = {
      first: null,
      latest: null
    }; // TODO: Fetch from storage and scans table

    // 7. Nutrition & Activity Analytics
    const nutrition: NutritionAnalytics = {
      averageCalories: 2450,
      calorieTarget: 2500,
      averageProtein: 160,
      proteinTarget: 170,
      nutritionConsistency: 85,
      calorieChart: [],
      proteinChart: []
    }; // TODO: Wire to nutrition logs table

    const activity: ActivityAnalytics = {
      averageDailySteps: 8500,
      stepTarget: 10000,
      averageActiveMinutes: 45,
      weeklyDistanceKm: 32.5,
      stepsChart: []
    }; // TODO: Wire to activity tracking table

    const recovery: RecoveryAnalytics = {
      averageSleepHours: 6.5,
      sleepTargetHours: 8,
      averageSleepQuality: 75,
      restDays: 2
    }; // TODO: Wire to sleep tracking table

    // 8. AI Review
    const { data: latestReview } = await supabase
      .from('fitness_os_progress_reviews')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let aiReview: AIProgressReview | null = null;
    if (latestReview) {
      aiReview = {
        summary: latestReview.ai_summary,
        strengths: latestReview.ai_highlights || [],
        weaknesses: [], // Needs field update
        recommendations: latestReview.ai_recommendations || [],
        generatedAt: latestReview.created_at
      };
    }

    // 9. Achievements
    const achievements: Achievement[] = [
      { id: '1', title: '7 Day Streak', description: 'Log in 7 days in a row.', icon: '🔥', unlocked: true, progress: 7, target: 7 },
      { id: '2', title: '10 Workouts', description: 'Complete 10 workouts.', icon: '💪', unlocked: false, progress: 8, target: 10 }
    ]; // TODO: Wire to achievements table `fitness_os_achievements`

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

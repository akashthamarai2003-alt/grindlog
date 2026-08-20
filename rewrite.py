import re

with open('app/lib/services/analytics/progress-service.ts', 'r', encoding='utf-8') as f:
    code = f.read()

# We want to replace the sequential calls with Promise.all
# Instead of doing complex regex, I will just output the entire file content updated.
# But it's 400 lines. Let's just output the whole new file content directly in python.

new_code = code

# Remove the individual try/catch blocks and replace with one big Promise.all block
start_marker = "// 1. Profile Data"
end_marker = "// 10. Smart Prompt Logic"

if start_marker in new_code and end_marker in new_code:
    head = new_code[:new_code.find(start_marker)]
    tail = new_code[new_code.find(end_marker):]
    
    promise_block = '''// --- PARALLEL DATA FETCHING ---
    const [
      { data: fitProfile },
      { data: scansFront },
      { data: scansMeasurements },
      { data: workoutsData },
      { data: nutritionTarget },
      { data: dailySummariesData },
      { data: activityLogsData },
      { data: sleepLogsData },
      { data: latestReview },
      { data: userAchievementsData }
    ] = await Promise.all([
      supabase.from('fitness_os_profiles').select('created_at, target_weight, weight, weight_trend_baseline, baseline_calories, initial_protein_target').eq('user_id', userId).maybeSingle(),
      supabase.from('fitness_os_scans').select('*').eq('user_id', userId).eq('pose', 'front').order('date', { ascending: false }).limit(2),
      supabase.from('fitness_os_scans').select('*').eq('user_id', userId).not('chest', 'is', null).order('date', { ascending: false }).limit(2),
      supabase.from('fitness_os_workouts').select('*').eq('user_id', userId).gte('workout_date', startDateStr.split('T')[0]),
      supabase.from('nutrition_targets').select('*').eq('user_id', userId).order('effective_date', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('nutrition_daily_summary').select('*').eq('user_id', userId).gte('date', startDateStr.split('T')[0]),
      supabase.from('fitness_os_activity_logs').select('*').eq('user_id', userId).gte('activity_date', startDateStr.split('T')[0]),
      supabase.from('fitness_os_sleep_logs').select('*').eq('user_id', userId).gte('sleep_date', startDateStr.split('T')[0]),
      supabase.from('fitness_os_ai_insights').select('*').eq('user_id', userId).order('generated_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('fitness_os_user_achievements').select('*, achievement:achievement_id(title, description, icon)').eq('user_id', userId)
    ]);

    const workouts = workoutsData || [];
    const dailySummaries = dailySummariesData || [];
    const activityLogs = activityLogsData || [];
    const sleepLogs = sleepLogsData || [];
    const userAchievements = userAchievementsData || [];

    // 1. Profile Data Processing
    const profileStartWeight = fitProfile?.weight_trend_baseline || fitProfile?.weight || 0;
    const currentWeight = fitProfile?.weight || 0;
    const targetWeight = fitProfile?.target_weight || 0;

    let progressPercentage = 0;
    if (profileStartWeight > 0 && targetWeight > 0) {
      const totalToLose = profileStartWeight - targetWeight;
      const amountLost = profileStartWeight - currentWeight;
      if (totalToLose > 0) {
        progressPercentage = Math.max(0, Math.min(100, (amountLost / totalToLose) * 100));
      } else if (totalToLose < 0) {
        const totalToGain = targetWeight - profileStartWeight;
        const amountGained = currentWeight - profileStartWeight;
        progressPercentage = Math.max(0, Math.min(100, (amountGained / totalToGain) * 100));
      }
    }

    const transformation: TransformationMetrics = {
      startWeight: profileStartWeight,
      currentWeight,
      targetWeight,
      progressPercentage: Math.round(progressPercentage)
    };

    // 2. Weight History
    const weightHistory: WeightPoint[] = [];
    if (fitProfile?.created_at) {
      weightHistory.push({
        date: new Date(fitProfile.created_at).toISOString().split('T')[0],
        weight: profileStartWeight
      });
    }
    weightHistory.push({
      date: new Date().toISOString().split('T')[0],
      weight: currentWeight
    });

    // 3. Body Measurements & Scans
    const measurements: BodyMeasurement[] = [];
    if (scansMeasurements && scansMeasurements.length > 0) {
      const latest = scansMeasurements[0];
      const previous = scansMeasurements.length > 1 ? scansMeasurements[1] : null;

      if (latest.chest) measurements.push({ part: 'Chest', currentCm: latest.chest, previousCm: previous?.chest || undefined });
      if (latest.waist) measurements.push({ part: 'Waist', currentCm: latest.waist, previousCm: previous?.waist || undefined });
      if (latest.hips) measurements.push({ part: 'Hips', currentCm: latest.hips, previousCm: previous?.hips || undefined });
      if (latest.thighs) measurements.push({ part: 'Thighs', currentCm: latest.thighs, previousCm: previous?.thighs || undefined });
      if (latest.arms) measurements.push({ part: 'Arms', currentCm: latest.arms, previousCm: previous?.arms || undefined });
    }

    const scans = {
      latest: scansFront && scansFront.length > 0 ? {
        frontUrl: scansFront[0].image_url,
        sideUrl: undefined,
        backUrl: undefined,
        date: scansFront[0].date
      } : undefined,
      previous: scansFront && scansFront.length > 1 ? {
        frontUrl: scansFront[1].image_url,
        sideUrl: undefined,
        backUrl: undefined,
        date: scansFront[1].date
      } : undefined,
      shouldPromptForScan: false
    };

    // 4. Workout Analytics
    const totalWorkouts = workouts.length;
    const completedWorkouts = workouts.filter((w: any) => w.status === 'completed');
    const totalTrainingTimeMinutes = completedWorkouts.reduce((acc: number, w: any) => acc + (w.duration_minutes || 0), 0);
    const totalSets = completedWorkouts.reduce((acc: number, w: any) => acc + (w.total_sets || 0), 0);
    const totalReps = completedWorkouts.reduce((acc: number, w: any) => acc + (w.total_reps || 0), 0);
    const trainingVolumeKg = completedWorkouts.reduce((acc: number, w: any) => acc + (w.total_volume_kg || 0), 0);

    const weeklyChartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime());
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      const ws = workouts.filter((w: any) => w.workout_date === ds);
      weeklyChartData.push({
        day: d.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0),
        duration: ws.reduce((acc: number, w: any) => acc + (w.duration_minutes || 0), 0)
      });
    }

    const workoutAnalytics: WorkoutAnalytics = {
      totalWorkouts,
      completedWorkouts: completedWorkouts.length,
      completionRate: totalWorkouts > 0 ? (completedWorkouts.length / totalWorkouts) * 100 : 0,
      totalTrainingTimeMinutes: Math.round(totalTrainingTimeMinutes),
      totalSets,
      totalReps,
      trainingVolumeKg,
      personalRecords: 0,
      weeklyChart: weeklyChartData
    };

    // 5. Nutrition & Water Logs
    const targetCalories = nutritionTarget?.calories || fitProfile?.baseline_calories || 2000;
    const targetProtein = nutritionTarget?.protein || fitProfile?.initial_protein_target || 130;
    const targetWater = nutritionTarget?.water_ml || 3000;

    const nutritionDays = dailySummaries.length;
    const totalCals = dailySummaries.reduce((acc: number, m: any) => acc + (m.calories || 0), 0);
    const totalPro = dailySummaries.reduce((acc: number, m: any) => acc + (Number(m.protein) || 0), 0);
    const totalWater = dailySummaries.reduce((acc: number, m: any) => acc + (Number(m.water_ml) || 0), 0);
    const totalNutScore = dailySummaries.reduce((acc: number, m: any) => acc + (Number(m.nutrition_score) || 0), 0);

    const calorieChart = dailySummaries.map((m: any) => ({
      day: new Date(m.date).toLocaleDateString('en-US', { weekday: 'short' }).charAt(0),
      calories: m.calories || 0,
      target: targetCalories
    })).slice(-7);

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
    const totalSteps = activityLogs.reduce((acc: number, a: any) => acc + (a.steps || 0), 0);
    const totalActiveMins = activityLogs.reduce((acc: number, a: any) => acc + (a.active_minutes || 0), 0);
    const totalDistance = activityLogs.reduce((acc: number, a: any) => acc + (Number(a.distance_km) || 0), 0);

    const activity: ActivityAnalytics = {
      averageDailySteps: activityLogs.length > 0 ? Math.round(totalSteps / activityLogs.length) : 0,
      stepTarget: 10000,
      averageActiveMinutes: activityLogs.length > 0 ? Math.round(totalActiveMins / activityLogs.length) : 0,
      weeklyDistanceKm: totalDistance,
      stepsChart: []
    };

    const totalSleep = sleepLogs.reduce((acc: number, s: any) => acc + (Number(s.duration_hours) || 0), 0);
    const totalQuality = sleepLogs.reduce((acc: number, s: any) => acc + (s.quality_score || 0), 0);

    const recovery: RecoveryAnalytics = {
      averageSleepHours: sleepLogs.length > 0 ? Number((totalSleep / sleepLogs.length).toFixed(1)) : 0,
      sleepTargetHours: 8,
      averageSleepQuality: sleepLogs.length > 0 ? Math.round(totalQuality / sleepLogs.length * 10) : 0,
      restDays: 0
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

    // 8. AI Review
    let aiReview: AIProgressReview | null = null;
    if (latestReview) {
      aiReview = {
        summary: latestReview.summary,
        strengths: latestReview.strengths || [],
        weaknesses: latestReview.weaknesses || [],
        recommendations: latestReview.recommendations || [],
        generatedAt: latestReview.generated_at
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

    '''
    
    with open('app/lib/services/analytics/progress-service.ts', 'w', encoding='utf-8') as f:
        f.write(head + promise_block + tail)
    print("Done rewriting")
else:
    print("Failed to find markers")

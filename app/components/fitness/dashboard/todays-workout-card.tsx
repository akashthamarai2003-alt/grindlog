"use client";

import {
  Activity,
  ArrowRight,
  CalendarDays,
  Clock,
  Dumbbell,
  Footprints,
  Lock,
  Play,
  Wind,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { useInstantNav } from "../navigation-context";
import styles from "./dashboard.module.css";

interface TodaysWorkoutCardProps {
  workout?: any;
  targetDateStr?: string;
  isFree?: boolean;
  onFreeClick?: () => void;
}

export function TodaysWorkoutCard({
  workout,
  targetDateStr,
  isFree = false,
  onFreeClick,
}: TodaysWorkoutCardProps) {
  const { setNavigatingTo } = useInstantNav();
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const cardDateStr = workout?.workout_date || targetDateStr || todayStr;
  const isFuture = cardDateStr > todayStr;
  const isPast = cardDateStr < todayStr;
  const title = workout?.name || "Workout";
  const isRestDay = title.toLowerCase().includes("rest");

  if (!workout || isRestDay) {
    return (
      <section
        className={`${styles.card} ${styles.recovery}`}
        aria-labelledby="recovery-title"
      >
        <div className={styles.recoveryArt} aria-hidden="true">
          {isFuture && !isRestDay ? (
            <CalendarDays size={27} strokeWidth={1.5} />
          ) : (
            <Wind size={29} strokeWidth={1.5} />
          )}
        </div>
        <p className={styles.eyebrow}>
          {isFuture
            ? "Plan ahead"
            : isPast
              ? "Your schedule"
              : "A little room to recharge"}
        </p>
        <h2 id="recovery-title" className={styles.recoveryTitle}>
          {isFuture && !isRestDay ? "No workout scheduled" : "Recovery builds strength"}
        </h2>
        <p className={styles.description}>
          {isFuture && !isRestDay
            ? "There’s no training session planned for this date."
            : isPast
              ? "No training session was scheduled for this date."
              : "Take a breath. Give yourself a little time to rest, reset, and come back ready."}
        </p>
        {(!isFuture || isRestDay) && (
          <>
            <div className={styles.recoveryHints}>
              <span>
                <Clock size={13} aria-hidden="true" />
                10 minutes
              </span>
              <span>
                <Footprints size={13} aria-hidden="true" />
                Easy movement
              </span>
            </div>
            <details className={styles.routine}>
              <summary>
                View recovery routine <ArrowRight size={14} aria-hidden="true" />
              </summary>
              <ol>
                <li>
                  <strong>2 minutes:</strong> Settle into a comfortable position and
                  breathe slowly.
                </li>
                <li>
                  <strong>5 minutes:</strong> Take an easy walk at a comfortable pace.
                </li>
                <li>
                  <strong>3 minutes:</strong> Gently stretch your shoulders and legs
                  within a comfortable range.
                </li>
              </ol>
            </details>
          </>
        )}
      </section>
    );
  }

  const exercises = workout.fitness_os_exercises || [];
  const completedCount = exercises.filter(
    (exercise: any) =>
      exercise.fitness_os_sets?.length > 0 &&
      exercise.fitness_os_sets.every((set: any) => set.completed),
  ).length;
  const isCompleted = workout.status === "completed";
  const completion = (completedCount / Math.max(1, exercises.length)) * 100;

  return (
    <section className={styles.card} aria-labelledby="workout-title">
      <div className={styles.headingLabel}>
        <span className={styles.headingIcon}>
          <Dumbbell size={16} aria-hidden="true" />
        </span>
        <h2 id="workout-title" className={styles.eyebrow}>
          {isFuture ? "Upcoming workout" : isPast ? "Your workout" : "Today's workout"}
        </h2>
      </div>
      <h3 className={styles.workoutTitle}>{title}</h3>
      <div className={styles.workoutMeta}>
        <span>
          <Activity size={14} aria-hidden="true" />
          {exercises.length} exercises
        </span>
        {workout.duration_minutes && (
          <span>
            <Clock size={14} aria-hidden="true" />
            {workout.duration_minutes} min
          </span>
        )}
      </div>
      <div
        className={styles.progressTrack}
        role="progressbar"
        aria-label="Workout completion"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(completion)}
      >
        <div className={styles.progressFill} style={{ width: `${completion}%` }} />
      </div>
      <div className={styles.progressCopy}>
        <span>Session progress</span>
        <strong>
          {completedCount} / {exercises.length}
        </strong>
      </div>
      {isFree ? (
        <button type="button" onClick={onFreeClick} className={styles.primaryAction}>
          <Lock size={16} aria-hidden="true" />
          Unlock your workout
        </button>
      ) : isCompleted ? (
        <Link
          href={`/workout/${workout.id}/summary`}
          prefetch
          className={styles.primaryAction}
        >
          View summary <ArrowRight size={16} aria-hidden="true" />
        </Link>
      ) : isFuture ? (
        <button type="button" disabled className={styles.primaryAction}>
          <Clock size={16} aria-hidden="true" />
          Scheduled
        </button>
      ) : (
        <Link
          href="/workout"
          prefetch
          className={styles.primaryAction}
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "instant" });
            setNavigatingTo("/workout");
          }}
        >
          <Play size={16} aria-hidden="true" />
          Start workout
        </Link>
      )}
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";
import { format, addDays, startOfWeek, parseISO } from "date-fns";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import styles from "./dashboard.module.css";

interface HorizontalCalendarProps {
  weekWorkouts?: Array<{
    id: string;
    workout_date: string;
    status: string;
    name?: string;
  }>;
  targetDateStr?: string;
}

export function HorizontalCalendar({
  weekWorkouts = [],
  targetDateStr,
}: HorizontalCalendarProps) {
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date");
  const [pendingDate, setPendingDate] = useState<string | null>(null);
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const activeDateStr = dateParam || targetDateStr || todayStr;
  const activeDate = parseISO(activeDateStr);

  useEffect(() => {
    setPendingDate(null);
  }, [dateParam]);

  const weekStart = startOfWeek(activeDate, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekEnd = days[6];
  const sameMonth = format(weekStart, "yyyy-MM") === format(weekEnd, "yyyy-MM");
  const monthHeader = sameMonth
    ? format(weekStart, "MMMM yyyy")
    : `${format(weekStart, "MMM")} – ${format(weekEnd, "MMM yyyy")}`;
  const workoutMap = new Map<string, { status: string; name?: string }>();
  weekWorkouts.forEach((workout) => {
    if (
      workout.workout_date &&
      workoutMap.get(workout.workout_date)?.status !== "completed"
    ) {
      workoutMap.set(workout.workout_date, workout);
    }
  });

  return (
    <section
      className={`${styles.card} ${styles.calendar}`}
      aria-label="Weekly workout calendar"
    >
      <div className={styles.cardHeading}>
        <div className={styles.headingLabel}>
          <span className={styles.headingIcon}>
            <CalendarIcon size={14} aria-hidden="true" />
          </span>
          <h2 className={styles.calendarTitle}>{monthHeader}</h2>
        </div>
        {activeDateStr === todayStr ? (
          <span className={styles.calendarToday}>This week</span>
        ) : (
          <Link
            href="/"
            scroll={false}
            prefetch
            className={`${styles.calendarToday} ${styles.todayLink}`}
          >
            Today
          </Link>
        )}
      </div>
      <div className={styles.week}>
        {days.map((date) => {
          const dateString = format(date, "yyyy-MM-dd");
          const isActive = dateString === activeDateStr;
          const isToday = dateString === todayStr;
          const workout = workoutMap.get(dateString);
          const isCompleted = workout?.status === "completed";
          return (
            <Link
              key={dateString}
              href={`/?date=${dateString}`}
              scroll={false}
              prefetch
              onClick={() => {
                if (!isActive) setPendingDate(dateString);
              }}
              className={`${styles.day} ${isActive ? styles.dayActive : ""} ${isToday ? styles.dayToday : ""}`}
              aria-current={isActive ? "date" : undefined}
              aria-label={`${format(date, "EEEE, MMMM d")}${isToday ? ", today" : ""}${workout ? (isCompleted ? ", workout completed" : ", workout scheduled") : ""}`}
              aria-busy={pendingDate === dateString}
            >
              <span className={styles.dayName}>{format(date, "EEE")}</span>
              <span className={styles.dayNumber}>
                {pendingDate === dateString ? (
                  <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                ) : (
                  format(date, "d")
                )}
              </span>
              <span className={styles.dayStatus} aria-hidden="true">
                {workout && (
                  <span
                    className={isCompleted ? styles.completedDot : styles.scheduledDot}
                  />
                )}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

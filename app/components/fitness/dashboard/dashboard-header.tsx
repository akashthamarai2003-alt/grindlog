"use client";

import { Bell, Bot } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getUnreadNotificationsCountAction } from "@/app/actions/fitness-notifications";
import { ThemeToggleButton } from "../theme-toggle-button";
import styles from "./dashboard.module.css";

interface DashboardHeaderProps {
  name: string;
  dayNumber: number;
  avatarUrl?: string;
}

export function DashboardHeader({ name, dayNumber, avatarUrl }: DashboardHeaderProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    getUnreadNotificationsCountAction()
      .then(setUnreadCount)
      .catch(() => {});
  }, []);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <header className={styles.header}>
      <div className={styles.identity}>
        <Link
          href="/profile"
          prefetch
          className={styles.avatar}
          aria-label="View your profile"
        >
          <img
            src={
              avatarUrl ||
              `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(name)}&backgroundColor=eaf7ef`
            }
            alt=""
            width={46}
            height={46}
          />
        </Link>
        <div className={styles.nameBlock}>
          <p suppressHydrationWarning className={styles.greeting}>
            {greeting} <span aria-hidden="true">👋</span>
          </p>
          <h1 className={styles.name} title={name}>
            {name}
          </h1>
        </div>
      </div>
      <div className={styles.headerActions}>
        <ThemeToggleButton className={styles.iconButton} />
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("open_fitness_chatbot"))}
          className={`${styles.iconButton} ${styles.coachButton}`}
          aria-label="Open AI fitness coach"
          title="AI fitness coach"
        >
          <Bot size={17} aria-hidden="true" />
        </button>
        <Link
          href="/notifications"
          prefetch
          className={styles.iconButton}
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        >
          <Bell size={17} aria-hidden="true" />
          {unreadCount > 0 && (
            <span className={styles.notificationCount} aria-hidden="true">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>
      </div>
      <p className={styles.journey}>
        <strong>Day {dayNumber}</strong> of your transformation
      </p>
    </header>
  );
}

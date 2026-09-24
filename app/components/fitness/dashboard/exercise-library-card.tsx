"use client";

import { BookOpen, ChevronRight } from "lucide-react";
import Link from "next/link";
import styles from "./dashboard.module.css";

export function ExerciseLibraryCard() {
  return (
    <Link href="/exercises" prefetch className={`${styles.card} ${styles.library}`}>
      <span className={styles.libraryIcon}>
        <BookOpen size={19} aria-hidden="true" />
      </span>
      <div>
        <h2 className={styles.libraryTitle}>Find your next movement</h2>
        <p className={styles.libraryCopy}>Explore the exercise library</p>
      </div>
      <ChevronRight size={17} className={styles.libraryArrow} aria-hidden="true" />
    </Link>
  );
}

"use client";

import { Home, Dumbbell, Utensils, User, TrendingUp } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useInstantNav } from "../navigation-context";
import styles from "./dashboard.module.css";

export function BottomNav({ isPro = false }: { isPro?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const { navigatingTo, setNavigatingTo } = useInstantNav();

  const navItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Dumbbell, label: "Workout", href: "/workout" },
    { icon: Utensils, label: "Meals", href: "/nutrition", proOnly: true },
    { icon: TrendingUp, label: "Progress", href: "/progress", proOnly: true },
    { icon: User, label: "Profile", href: "/profile" },
  ];

  // Eagerly prefetch static routes into router cache on mount
  useEffect(() => {
    navItems.forEach((item) => {
      try {
        router.prefetch(item.href);
      } catch {
        // ignore prefetch errors
      }
    });
  }, [router]);

  return (
    <div className={styles.navBackdrop}>
      <nav className={styles.nav} aria-label="Main navigation">
        {navItems.map((item) => {
          const isCurrentRoute =
            pathname === item.href ||
            (item.href === "/nutrition" && pathname === "/grocery");
          const isActive = navigatingTo ? navigatingTo === item.href : isCurrentRoute;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              onClick={(e) => {
                if (pathname === item.href) {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  return;
                }
                // Instant 0ms visual switch & scroll to top
                window.scrollTo({ top: 0, behavior: "instant" });
                setNavigatingTo(item.href);
              }}
              onTouchStart={() => {
                try {
                  router.prefetch(item.href);
                } catch {}
              }}
              onPointerDown={() => {
                try {
                  router.prefetch(item.href);
                } catch {}
              }}
              className={`${styles.navItem} ${isActive ? styles.navActive : ""}`}
              aria-current={isCurrentRoute ? "page" : undefined}
            >
              <div className={styles.navIcon}>
                <Icon size={19} strokeWidth={isActive ? 2.3 : 1.8} aria-hidden="true" />
                {item.proOnly && !isPro && <span className={styles.proBadge}>PRO</span>}
              </div>

              <span className={styles.navLabel}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

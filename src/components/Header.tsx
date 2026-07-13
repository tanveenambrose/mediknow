'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Header.module.css';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className={`${styles.header} glass-panel`}>
      <div className={`${styles.container} container`}>
        <Link href="/" className={styles.logoContainer}>
          <div className={styles.logoIcon}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
          </div>
          <span className={styles.logoText}>
            Medi<span className={styles.logoAccent}>know</span>
          </span>
        </Link>

        <nav className={styles.nav}>
          <Link
            href="/"
            className={`${styles.navLink} ${pathname === '/' ? styles.active : ''}`}
          >
            Find Medicines
          </Link>
          <Link
            href="/symptoms"
            className={`${styles.navLink} ${pathname === '/symptoms' ? styles.active : ''}`}
          >
            Symptom Checker
          </Link>
          <Link
            href="/ai-assistant"
            className={`${styles.navLink} ${pathname === '/ai-assistant' ? styles.active : ''} ${styles.aiBtn}`}
          >
            <span className={styles.aiDot}></span>
            AI Assistant
          </Link>
        </nav>

        <div className={styles.metaBadge}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
          Clinical Verification
        </div>
      </div>
    </header>
  );
}

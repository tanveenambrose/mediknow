import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`${styles.container} container`}>
        <div className={styles.topSection}>
          <div className={styles.brandCol}>
            <div className={styles.logo}>
              <div className={styles.logoIcon}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
              </div>
              <span className={styles.logoText}>
                Medi<span className={styles.logoAccent}>know</span>
              </span>
            </div>
            <p className={styles.brandDesc}>
              Providing trustworthy, accessible medical information. Empanelling clarity in healthcare decisions.
            </p>
          </div>

          <div className={styles.linksCol}>
            <h4 className={styles.colTitle}>Platform</h4>
            <ul className={styles.linksList}>
              <li>
                <Link href="/">Find Medicines</Link>
              </li>
              <li>
                <Link href="/symptoms">Symptom Checker</Link>
              </li>
              <li>
                <Link href="/ai-assistant">AI Assistant</Link>
              </li>
            </ul>
          </div>

          <div className={styles.linksCol}>
            <h4 className={styles.colTitle}>Resources</h4>
            <ul className={styles.linksList}>
              <li>
                <a href="#">Safety Guidelines</a>
              </li>
              <li>
                <a href="#">Privacy Policy</a>
              </li>
              <li>
                <a href="#">Terms of Service</a>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.disclaimerBox}>
          <div className={styles.disclaimerHeader}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" x2="12" y1="8" y2="12" />
              <line x1="12" x2="12.01" y1="16" y2="16" />
            </svg>
            <span>Important Medical Disclaimer</span>
          </div>
          <p className={styles.disclaimerText}>
            Mediknow is an educational and informational platform. The medical information, drug search results, symptom checker recommendations, and AI Assistant suggestions provided here are for general informational purposes only and are <strong>not a substitute for professional medical advice, diagnosis, or treatment</strong>. Never disregard professional medical advice or delay seeking it because of something you have read or generated on this website. In case of a medical emergency, immediately contact your doctor or local emergency services.
          </p>
        </div>

        <div className={styles.bottomSection}>
          <p className={styles.copyright}>
            &copy; {new Date().getFullYear()} Mediknow. All rights reserved. Developed for high-trust clinical browsing.
          </p>
        </div>
      </div>
    </footer>
  );
}

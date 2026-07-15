'use client';

import { useState } from 'react';
import { ApiLogEntry } from '@/hooks/useApiMonitor';
import styles from './ApiMonitor.module.css';

interface ApiMonitorProps {
  logs: ApiLogEntry[];
  onClear: () => void;
}

function SourceIcon({ source }: { source: ApiLogEntry['source'] }) {
  const color = source === 'medidata' ? '#006a4e' : source === 'openfda' ? '#0284c7' : '#94a3b8';
  const label = source === 'medidata' ? 'MD' : source === 'openfda' ? 'FDA' : 'LOC';
  return (
    <span className={styles.sourceIcon} style={{ backgroundColor: color, color: '#fff' }}>
      {label}
    </span>
  );
}

function TypeIndicator({ type }: { type: ApiLogEntry['type'] }) {
  const map: Record<ApiLogEntry['type'], { icon: string; className: string }> = {
    request: { icon: '→', className: styles.typeRequest },
    success: { icon: '✓', className: styles.typeSuccess },
    error: { icon: '✗', className: styles.typeError },
    fallback: { icon: '⚠', className: styles.typeFallback },
    cache: { icon: '○', className: styles.typeCache },
  };
  const { icon, className } = map[type];
  return <span className={`${styles.typeIndicator} ${className}`}>{icon}</span>;
}

export default function ApiMonitor({ logs, onClear }: ApiMonitorProps) {
  const [collapsed, setCollapsed] = useState(false);

  const errorCount = logs.filter(l => l.type === 'error').length;
  const fallbackCount = logs.filter(l => l.type === 'fallback').length;

  return (
    <div className={`${styles.monitor} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.header} onClick={() => setCollapsed(c => !c)}>
        <div className={styles.headerLeft}>
          <span className={styles.headerIcon}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </span>
          <span className={styles.headerTitle}>API Monitor</span>
          <span className={styles.logCount}>{logs.length}</span>
          {errorCount > 0 && <span className={styles.errorBadge}>{errorCount} err</span>}
          {fallbackCount > 0 && <span className={styles.fallbackBadge}>{fallbackCount} fallback</span>}
        </div>
        <div className={styles.headerRight}>
          {logs.length > 0 && (
            <button className={styles.clearBtn} onClick={(e) => { e.stopPropagation(); onClear(); }} title="Clear logs">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" x2="6" y1="6" y2="18" /><line x1="6" x2="18" y1="6" y2="18" />
              </svg>
            </button>
          )}
          <span className={styles.collapseIcon}>{collapsed ? '+' : '−'}</span>
        </div>
      </div>

      {!collapsed && (
        <div className={styles.logList}>
          {logs.length === 0 ? (
            <div className={styles.empty}>No API calls yet. Search or apply filters to trigger requests.</div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className={styles.logEntry}>
                <div className={styles.logTop}>
                  <SourceIcon source={log.source} />
                  <TypeIndicator type={log.type} />
                  <span className={styles.logTime}>
                    {log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  <span className={styles.logMessage}>{log.message}</span>
                </div>
                {log.details && <div className={styles.logDetails}>{log.details}</div>}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useCallback, useRef } from 'react';

export interface ApiLogEntry {
  id: string;
  timestamp: Date;
  source: 'local' | 'openfda' | 'medidata';
  type: 'request' | 'success' | 'error' | 'fallback' | 'cache';
  message: string;
  details?: string;
}

export function useApiMonitor() {
  const [logs, setLogs] = useState<ApiLogEntry[]>([]);
  const idCounter = useRef(0);

  const addLog = useCallback((entry: Omit<ApiLogEntry, 'id' | 'timestamp'>) => {
    const id = `log-${++idCounter.current}`;
    const fullEntry: ApiLogEntry = { ...entry, id, timestamp: new Date() };
    setLogs(prev => [fullEntry, ...prev].slice(0, 100));
    const time = fullEntry.timestamp.toLocaleTimeString();
    const icon = entry.type === 'error' ? '✗' : entry.type === 'success' ? '✓' : entry.type === 'request' ? '→' : entry.type === 'fallback' ? '⚠' : '○';
    console.log(`[API ${icon}] [${entry.source}] ${entry.message}${entry.details ? ` | ${entry.details}` : ''}`);
  }, []);

  const clearLogs = useCallback(() => setLogs([]), []);

  return { logs, addLog, clearLogs };
}

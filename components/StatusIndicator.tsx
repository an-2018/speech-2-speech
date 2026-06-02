'use client';

import { TranslationStatus } from '@/lib/types';
import styles from './StatusIndicator.module.css';

interface StatusIndicatorProps {
  status: TranslationStatus;
  errorMessage: string | null;
}

const statusLabels: Record<TranslationStatus, string> = {
  idle: 'Ready',
  connecting: 'Connecting...',
  translating: 'Translating',
  error: 'Error',
  closed: 'Closed',
};

export function StatusIndicator({ status, errorMessage }: StatusIndicatorProps) {
  return (
    <div className={styles.container}>
      <span className={`${styles.badge} ${styles[status]}`}>
        {status === 'error' ? 'Error' : statusLabels[status]}
      </span>
      {errorMessage && (
        <p className={styles.error}>{errorMessage}</p>
      )}
    </div>
  );
}
'use client';

import styles from './MicButton.module.css';

interface MicButtonProps {
  isActive: boolean;
  isConnecting: boolean;
  onPressStart: () => void;
  onPressEnd: () => void;
}

export function MicButton({ isActive, isConnecting, onPressStart, onPressEnd }: MicButtonProps) {
  return (
    <button
      className={`${styles.button} ${isActive ? styles.active : ''} ${isConnecting ? styles.connecting : ''}`}
      onMouseDown={onPressStart}
      onMouseUp={onPressEnd}
      onMouseLeave={onPressEnd}
      onTouchStart={onPressStart}
      onTouchEnd={onPressEnd}
      onTouchCancel={onPressEnd}
      disabled={isConnecting}
      aria-label={isActive ? 'Release to stop' : 'Hold to speak'}
    >
      <svg
        className={styles.icon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    </button>
  );
}
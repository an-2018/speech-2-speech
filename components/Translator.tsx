'use client';

import { useState } from 'react';
import { MicButton } from './MicButton';
import { StatusIndicator } from './StatusIndicator';
import { useTranslation } from './useTranslation';
import { SOURCE_LANGUAGES, SourceLanguage, TARGET_LANGUAGES, TargetLanguage } from '@/lib/types';
import styles from './Translator.module.css';

export function Translator() {
  const [sourceLanguage, setSourceLanguage] = useState<SourceLanguage>('en');
  const [targetLanguage, setTargetLanguage] = useState<TargetLanguage>('pt');

  const { state, start, stop, isActive, isStopping } = useTranslation({
    targetLanguage,
    sourceLanguage,
  });

  const handlePressStart = () => {
    if (isStopping || state.status === 'connecting') return;
    start();
  };

  const handlePressEnd = () => {
    stop();
  };

  const isConnecting = state.status === 'connecting';
  const sourceLanguageLabel = SOURCE_LANGUAGES.find(l => l.value === sourceLanguage)?.label || 'English';
  const targetLanguageLabel = TARGET_LANGUAGES.find(l => l.value === targetLanguage)?.label || 'Portuguese';

  const getHintText = () => {
    if (isStopping) return 'Ending session...';
    if (state.status === 'idle') return 'Hold to speak';
    if (state.status === 'connecting') return 'Connecting...';
    if (state.status === 'translating') return 'Release to send';
    if (state.status === 'error') return 'Hold to retry';
    return '';
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Voice Translator</h1>
        <p className={styles.subtitle}>Translate speech in real-time</p>
      </div>

      <div className={styles.languageSelector}>
        <span className={styles.selectorLabel}>Source:</span>
        <select
          className={styles.select}
          value={sourceLanguage}
          onChange={(e) => setSourceLanguage(e.target.value as SourceLanguage)}
          disabled={isActive || isConnecting}
        >
          {SOURCE_LANGUAGES.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>

        <span className={styles.selectorLabel} style={{ marginLeft: '1rem' }}>Target:</span>
        <select
          className={styles.select}
          value={targetLanguage}
          onChange={(e) => setTargetLanguage(e.target.value as TargetLanguage)}
          disabled={isActive || isConnecting}
        >
          {TARGET_LANGUAGES.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      <StatusIndicator status={state.status} errorMessage={state.errorMessage} />

      <MicButton
        isActive={isActive}
        isConnecting={isConnecting}
        onPressStart={handlePressStart}
        onPressEnd={handlePressEnd}
      />

      <p className={styles.hint}>{getHintText()}</p>

      <div className={styles.transcripts}>
        <div className={styles.transcriptBox}>
          <span className={styles.transcriptLabel}>{sourceLanguageLabel} (source)</span>
          <p className={styles.transcriptText}>
            {state.sourceTranscript || '...'}
          </p>
        </div>
        <div className={styles.transcriptBox}>
          <span className={styles.transcriptLabel}>{targetLanguageLabel} (output)</span>
          <p className={styles.transcriptText}>
            {state.targetTranscript || '...'}
          </p>
        </div>
      </div>
    </div>
  );
}
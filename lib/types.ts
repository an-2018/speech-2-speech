export type TranslationStatus =
  | 'idle'
  | 'connecting'
  | 'translating'
  | 'error'
  | 'closed';

export type SourceLanguage = 'en' | 'fa';

export const SOURCE_LANGUAGES: { value: SourceLanguage; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'fa', label: 'Persian (Farsi)' },
];

export interface TranslationState {
  status: TranslationStatus;
  errorMessage: string | null;
  sourceTranscript: string;
  targetTranscript: string;
}

export type TranslationStateChange = (state: TranslationState) => void;
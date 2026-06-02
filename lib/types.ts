export type TranslationStatus =
  | 'idle'
  | 'connecting'
  | 'translating'
  | 'error'
  | 'closed';

export type SourceLanguage = 'en' | 'fa' | 'pt';

export const SOURCE_LANGUAGES: { value: SourceLanguage; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'fa', label: 'Persian (Farsi)' },
  { value: 'pt', label: 'Portuguese' },
];

export type TargetLanguage = 'en' | 'pt' | 'de';

export const TARGET_LANGUAGES: { value: TargetLanguage; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'de', label: 'German' },
];

export interface TranslationState {
  status: TranslationStatus;
  errorMessage: string | null;
  sourceTranscript: string;
  targetTranscript: string;
}

export type TranslationStateChange = (state: TranslationState) => void;
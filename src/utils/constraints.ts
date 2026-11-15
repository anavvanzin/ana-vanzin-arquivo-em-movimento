export const WORKSPACE_CONSTRAINTS = {
  ID_REGEX: /^[a-zA-Z0-9_-]+$/,
  MAX_ID_LEN: 128,
  MAX_DISPLAY_NAME_LEN: 120,
  MAX_TITLE_LEN: 300,
  MAX_FOOTER_LEN: 600,
  MAX_BLOCK_LABEL_LEN: 160,
  MAX_BLOCK_TEXT_LEN: 1500,
  MAX_PHILOLOGY_LEN: 1000,
  MAX_PRESENTER_NOTE_LEN: 3000,
  MAX_QUERY_TITLE_LEN: 300,
  MAX_SYNTHESIS_LEN: 8000,
  MAX_SOURCES_SUMMARY_LEN: 3000,
  MAX_ATELIER_TITLE_LEN: 240,
  MAX_ATELIER_PROMPT_LEN: 2000,
  MAX_ATELIER_SPEC_LEN: 240,
} as const;

export function sanitizeBoundedString(val: string | undefined, maxLen: number): string {
  if (!val) return '';
  return val.slice(0, maxLen);
}

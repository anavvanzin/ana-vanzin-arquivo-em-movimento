import {
  driveFetch,
  DriveFileItem,
  listDriveFiles,
} from './googleDrive';
import { DeckId, LangCode, SlideItem } from '../types';

export interface GoogleDocParagraph {
  headingLevel?: string;
  text: string;
}

export interface GoogleDocDetail {
  documentId: string;
  title: string;
  revisionId?: string;
  bodyText: string;
  paragraphs: GoogleDocParagraph[];
  webViewLink: string;
  previewUrl: string;
}

/**
 * Extracts a Google Docs document ID from full URLs, embed URLs, or raw IDs.
 * Examples:
 * - https://docs.google.com/document/d/1s...xyz/edit
 * - https://docs.google.com/document/d/1s...xyz/preview
 * - 1s...xyz
 */
export function parseGoogleDocId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();

  // Pattern: docs.google.com/document/d/{id}
  const matchDirect = trimmed.match(/\/document\/(?:u\/\d+\/)?d\/([a-zA-Z0-9_-]{10,})/i);
  if (matchDirect && matchDirect[1]) {
    return matchDirect[1];
  }

  // Pattern: URL query param id={id}
  const matchParam = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{10,})/i);
  if (matchParam && matchParam[1]) {
    return matchParam[1];
  }

  // Pattern: Raw alphanumeric ID
  if (/^[a-zA-Z0-9_-]{15,}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Lists user's Google Docs from Google Drive.
 */
export async function listUserGoogleDocs(
  searchQuery?: string,
  pageSize = 30
): Promise<DriveFileItem[]> {
  const result = await listDriveFiles({
    category: 'docs',
    searchQuery,
    pageSize,
  });
  // Filter specifically for Google Docs files
  return result.files.filter(
    (f) =>
      f.mimeType === 'application/vnd.google-apps.document' ||
      f.mimeType === 'text/plain' ||
      f.mimeType === 'text/markdown' ||
      f.mimeType === 'application/pdf'
  );
}

function parseDocStructuralElements(elements?: any[]): {
  bodyText: string;
  paragraphs: GoogleDocParagraph[];
} {
  if (!Array.isArray(elements)) {
    return { bodyText: '', paragraphs: [] };
  }

  const paragraphs: GoogleDocParagraph[] = [];
  const fullTextLines: string[] = [];

  for (const el of elements) {
    if (el.paragraph?.elements) {
      const pText = el.paragraph.elements
        .map((pEl: any) => pEl.textRun?.content || '')
        .join('');

      const cleanText = pText.trim();
      if (cleanText) {
        paragraphs.push({
          headingLevel: el.paragraph.paragraphStyle?.namedStyleType,
          text: cleanText,
        });
        fullTextLines.push(cleanText);
      }
    }
  }

  return {
    bodyText: fullTextLines.join('\n\n'),
    paragraphs,
  };
}

/**
 * Fetches Google Doc content using the Google Docs API v1.
 */
export async function fetchGoogleDoc(documentId: string): Promise<GoogleDocDetail> {
  const cleanId = parseGoogleDocId(documentId) || documentId;
  const res = await driveFetch(`https://docs.googleapis.com/v1/documents/${encodeURIComponent(cleanId)}`);
  const data = await res.json();

  const { bodyText, paragraphs } = parseDocStructuralElements(data.body?.content);

  return {
    documentId: cleanId,
    title: data.title || 'Documento Google Docs',
    revisionId: data.revisionId,
    bodyText,
    paragraphs,
    webViewLink: `https://docs.google.com/document/d/${cleanId}/edit`,
    previewUrl: `https://docs.google.com/document/d/${cleanId}/preview`,
  };
}

/**
 * Creates a new Google Doc in the user's Google Drive.
 */
export async function createGoogleDoc(title: string): Promise<{
  documentId: string;
  webViewLink: string;
}> {
  const res = await driveFetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  const data = await res.json();
  return {
    documentId: data.documentId,
    webViewLink: `https://docs.google.com/document/d/${data.documentId}/edit`,
  };
}

/**
 * Inserts text content into an existing Google Doc via batchUpdate.
 */
export async function appendTextToGoogleDoc(
  documentId: string,
  text: string,
  locationIndex = 1
): Promise<void> {
  const cleanId = parseGoogleDocId(documentId) || documentId;
  await driveFetch(`https://docs.googleapis.com/v1/documents/${encodeURIComponent(cleanId)}:batchUpdate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [
        {
          insertText: {
            location: { index: locationIndex },
            text,
          },
        },
      ],
    }),
  });
}

/**
 * Exports a full doctoral deck into a formatted Google Doc.
 */
export async function exportResearchDeckToGoogleDoc(options: {
  deckId: DeckId;
  deckTitle: string;
  lang: LangCode;
  slides: SlideItem[];
  getPresenterNote?: (deck: DeckId, index: number) => string;
}): Promise<{ documentId: string; webViewLink: string; slideCount: number }> {
  const docTitle = `ICONOCRACIA — ${options.deckTitle} [${options.lang.toUpperCase()}]`;
  const created = await createGoogleDoc(docTitle);

  // Construct structured text content
  const lines: string[] = [];
  lines.push(`ICONOCRACIA · PPGD / UFSC · ANA VITÓRIA VANZIN MENDES`);
  lines.push(`${options.deckTitle.toUpperCase()} — EDIÇÃO ${options.lang.toUpperCase()}`);
  lines.push(`Documento acadêmico exportado em ${new Date().toLocaleDateString('pt-BR')}`);
  lines.push('------------------------------------------------------------\n');

  options.slides.forEach((slide, idx) => {
    const num = String(idx + 1).padStart(2, '0');
    lines.push(`\n[ SLIDE ${num} ] ${slide.title.replace(/\n/g, ' ')}`);

    slide.blocks.forEach((b) => {
      if (b.label) {
        lines.push(`• [${b.label.toUpperCase()}]: ${b.text}`);
      } else {
        lines.push(`• ${b.text}`);
      }
    });

    if (slide.footer) {
      lines.push(`  (Nota metodológica: ${slide.footer})`);
    }

    if (options.getPresenterNote) {
      const note = options.getPresenterNote(options.deckId, idx);
      if (note) {
        lines.push(`  [Roteiro oral]: ${note}`);
      }
    }
  });

  const fullText = lines.join('\n') + '\n';

  try {
    await appendTextToGoogleDoc(created.documentId, fullText, 1);
  } catch (err) {
    console.warn('Google Doc batchUpdate notice:', err);
  }

  return {
    documentId: created.documentId,
    webViewLink: created.webViewLink,
    slideCount: options.slides.length,
  };
}

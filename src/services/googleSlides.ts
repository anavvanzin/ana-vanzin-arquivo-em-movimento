import {
  driveFetch,
  DriveFileItem,
  listDriveFiles,
} from './googleDrive';
import { DeckId, LangCode, SlideItem } from '../types';

export interface GoogleSlideSummary {
  objectId: string;
  pageIndex: number;
  title: string;
  snippet: string;
  speakerNotes: string;
  thumbnailUrl?: string;
}

export interface GooglePresentationDetail {
  presentationId: string;
  title: string;
  revisionId?: string;
  slides: GoogleSlideSummary[];
  webViewLink: string;
  embedUrl: string;
  updatedTime?: string;
}

/**
 * Extracts a Google Slides presentation ID from full URLs, embed URLs, or raw IDs.
 * Examples supported:
 * - https://docs.google.com/presentation/d/1v...xyz/edit#slide=id.p
 * - https://docs.google.com/presentation/d/1v...xyz/preview
 * - https://docs.google.com/presentation/d/e/2PACX-.../pub
 * - 1v...xyz
 */
export function parseGooglePresentationId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();

  // Pattern: docs.google.com/presentation/d/{id}
  const matchDirect = trimmed.match(/\/presentation\/d\/([a-zA-Z0-9_-]{10,})/i);
  if (matchDirect && matchDirect[1]) {
    return matchDirect[1];
  }

  // Pattern: URL query param id={id}
  const matchParam = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{10,})/i);
  if (matchParam && matchParam[1]) {
    return matchParam[1];
  }

  // Pattern: Raw ID (at least 15 valid chars, no slashes or protocols)
  if (/^[a-zA-Z0-9_-]{15,}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Lists user's Google Slides presentations from Drive.
 */
export async function listUserGoogleSlides(
  searchQuery?: string,
  pageSize = 30
): Promise<DriveFileItem[]> {
  const result = await listDriveFiles({
    category: 'slides',
    searchQuery,
    pageSize,
  });
  return result.files;
}

function extractTextFromPageElements(elements?: any[]): {
  title: string;
  snippet: string;
} {
  if (!Array.isArray(elements) || elements.length === 0) {
    return { title: 'Slide sem título', snippet: '' };
  }

  const textLines: string[] = [];

  for (const el of elements) {
    const textObj = el.shape?.text || el.table?.tableRows;
    if (el.shape?.text?.textElements) {
      const line = el.shape.text.textElements
        .map((te: any) => te.textRun?.content || '')
        .join('')
        .trim();
      if (line) textLines.push(line);
    }
  }

  if (textLines.length === 0) {
    return { title: 'Slide sem texto', snippet: '' };
  }

  const title = textLines[0].replace(/\n+/g, ' ').slice(0, 120);
  const snippet = textLines.slice(1).join(' ').replace(/\s+/g, ' ').slice(0, 320);

  return { title, snippet };
}

function extractSpeakerNotes(slide: any): string {
  try {
    const notesElements = slide.slideProperties?.notesPage?.pageElements;
    if (!Array.isArray(notesElements)) return '';

    const notesParts: string[] = [];
    for (const el of notesElements) {
      if (el.shape?.text?.textElements) {
        const text = el.shape.text.textElements
          .map((te: any) => te.textRun?.content || '')
          .join('')
          .trim();
        // Skip template placeholder labels
        if (text && !text.toLowerCase().includes('click to edit speaker notes')) {
          notesParts.push(text);
        }
      }
    }
    return notesParts.join('\n').trim();
  } catch {
    return '';
  }
}

/**
 * Fetches Google Slides presentation details and parsed slides list.
 */
export async function fetchGooglePresentation(
  presentationId: string
): Promise<GooglePresentationDetail> {
  const cleanId = parseGooglePresentationId(presentationId) || presentationId;
  const res = await driveFetch(
    `https://slides.googleapis.com/v1/presentations/${encodeURIComponent(cleanId)}`
  );
  const data = await res.json();

  const rawSlides = Array.isArray(data.slides) ? data.slides : [];
  const parsedSlides: GoogleSlideSummary[] = rawSlides.map((s: any, idx: number) => {
    const { title, snippet } = extractTextFromPageElements(s.pageElements);
    const speakerNotes = extractSpeakerNotes(s);

    return {
      objectId: s.objectId,
      pageIndex: idx,
      title: title || `Slide ${idx + 1}`,
      snippet,
      speakerNotes,
    };
  });

  return {
    presentationId: cleanId,
    title: data.title || 'Apresentação Google Slides',
    revisionId: data.revisionId,
    slides: parsedSlides,
    webViewLink: `https://docs.google.com/presentation/d/${cleanId}/edit`,
    embedUrl: `https://docs.google.com/presentation/d/${cleanId}/embed?start=false&loop=false&delayms=3000`,
  };
}

/**
 * Fetches a high-resolution PNG thumbnail for a specific slide in a Google Slides presentation.
 */
export async function fetchSlideThumbnail(
  presentationId: string,
  pageObjectId: string
): Promise<string | null> {
  try {
    const cleanId = parseGooglePresentationId(presentationId) || presentationId;
    const res = await driveFetch(
      `https://slides.googleapis.com/v1/presentations/${encodeURIComponent(
        cleanId
      )}/pages/${encodeURIComponent(pageObjectId)}/thumbnail?thumbnailProperties.thumbnailSize=LARGE`
    );
    const data = await res.json();
    return data.contentUrl || null;
  } catch {
    return null;
  }
}

/**
 * Creates a new blank Google Slides presentation in user's Google Drive.
 */
export async function createGoogleSlidesPresentation(
  title: string
): Promise<{ presentationId: string; webViewLink: string }> {
  const res = await driveFetch('https://slides.googleapis.com/v1/presentations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  const data = await res.json();
  return {
    presentationId: data.presentationId,
    webViewLink: `https://docs.google.com/presentation/d/${data.presentationId}/edit`,
  };
}

/**
 * Exports one of the ICONOCRACIA doctoral decks (Entre representação e autenticação / O que a pesquisa me fez abandonar)
 * directly into a native, styled Google Slides presentation in the user's Google Drive.
 */
export async function exportResearchDeckToGoogleSlides(options: {
  deckId: DeckId;
  deckTitle: string;
  lang: LangCode;
  slides: SlideItem[];
  getPresenterNote?: (deck: DeckId, index: number) => string;
}): Promise<{ presentationId: string; webViewLink: string; slideCount: number }> {
  const presentationTitle = `ICONOCRACIA — ${options.deckTitle} [${options.lang.toUpperCase()}]`;
  const created = await createGoogleSlidesPresentation(presentationTitle);
  const presentationId = created.presentationId;

  // Retrieve default first slide id to delete or replace later if desired
  let initialFirstSlideId: string | null = null;
  try {
    const initial = await driveFetch(
      `https://slides.googleapis.com/v1/presentations/${presentationId}`
    );
    const initialData = await initial.json();
    if (initialData.slides?.[0]?.objectId) {
      initialFirstSlideId = initialData.slides[0].objectId;
    }
  } catch {
    // Non-fatal
  }

  // Build batchUpdate requests to populate presentation
  const requests: any[] = [];

  options.slides.forEach((slide, idx) => {
    const slideObjectId = `slide_iconocracia_${idx}_${Date.now().toString(36)}`;
    const titleBoxId = `title_box_${idx}_${Date.now().toString(36)}`;
    const bodyBoxId = `body_box_${idx}_${Date.now().toString(36)}`;
    const footerBoxId = `footer_box_${idx}_${Date.now().toString(36)}`;

    // 1. Create Blank Slide
    requests.push({
      createSlide: {
        objectId: slideObjectId,
        insertionIndex: idx + 1,
        slideLayoutReference: {
          predefinedLayout: 'BLANK',
        },
      },
    });

    // 2. Title Box (top banner)
    const slideNumStr = String(idx + 1).padStart(2, '0');
    const headerPrefix = `[ DOC. ${slideNumStr} · PPGD/UFSC ]  `;
    const cleanTitle = (slide.title || '').replace(/\n/g, ' ');

    requests.push({
      createShape: {
        objectId: titleBoxId,
        shapeType: 'TEXT_BOX',
        elementProperties: {
          pageObjectId: slideObjectId,
          size: {
            width: { magnitude: 640, unit: 'PT' },
            height: { magnitude: 55, unit: 'PT' },
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: 40,
            translateY: 28,
            unit: 'PT',
          },
        },
      },
    });

    requests.push({
      insertText: {
        objectId: titleBoxId,
        text: `${headerPrefix}${cleanTitle}`,
      },
    });

    // Style Title Box
    requests.push({
      updateTextStyle: {
        objectId: titleBoxId,
        textRange: { type: 'ALL' },
        style: {
          fontFamily: 'Georgia',
          fontSize: { magnitude: 18, unit: 'PT' },
          bold: true,
          foregroundColor: {
            opaqueColor: {
              rgbColor: { red: 0.11, green: 0.11, blue: 0.11 },
            },
          },
        },
        fields: 'fontFamily,fontSize,bold,foregroundColor',
      },
    });

    // 3. Body Content Box
    const bodyText = slide.blocks
      .map((b) => (b.label ? `[${b.label.toUpperCase()}] ${b.text}` : b.text))
      .join('\n\n');

    if (bodyText) {
      requests.push({
        createShape: {
          objectId: bodyBoxId,
          shapeType: 'TEXT_BOX',
          elementProperties: {
            pageObjectId: slideObjectId,
            size: {
              width: { magnitude: 640, unit: 'PT' },
              height: { magnitude: 270, unit: 'PT' },
            },
            transform: {
              scaleX: 1,
              scaleY: 1,
              translateX: 40,
              translateY: 92,
              unit: 'PT',
            },
          },
        },
      });

      requests.push({
        insertText: {
          objectId: bodyBoxId,
          text: bodyText,
        },
      });

      requests.push({
        updateTextStyle: {
          objectId: bodyBoxId,
          textRange: { type: 'ALL' },
          style: {
            fontFamily: 'Arial',
            fontSize: { magnitude: 12.5, unit: 'PT' },
            foregroundColor: {
              opaqueColor: {
                rgbColor: { red: 0.15, green: 0.15, blue: 0.15 },
              },
            },
          },
          fields: 'fontFamily,fontSize,foregroundColor',
        },
      });
    }

    // 4. Methodological Footer / Source
    const footerText = slide.footer
      ? `Nota metodológica: ${slide.footer}`
      : slide.source
      ? `Fonte: ${slide.source}`
      : 'ICONOCRACIA — Arquivo em Movimento · PPGD/UFSC';

    requests.push({
      createShape: {
        objectId: footerBoxId,
        shapeType: 'TEXT_BOX',
        elementProperties: {
          pageObjectId: slideObjectId,
          size: {
            width: { magnitude: 640, unit: 'PT' },
            height: { magnitude: 26, unit: 'PT' },
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: 40,
            translateY: 375,
            unit: 'PT',
          },
        },
      },
    });

    requests.push({
      insertText: {
        objectId: footerBoxId,
        text: footerText,
      },
    });

    requests.push({
      updateTextStyle: {
        objectId: footerBoxId,
        textRange: { type: 'ALL' },
        style: {
          fontFamily: 'Courier New',
          fontSize: { magnitude: 8.5, unit: 'PT' },
          italic: true,
          foregroundColor: {
            opaqueColor: {
              rgbColor: { red: 0.49, green: 0.16, blue: 0.12 }, // #7e2a1f oxblood
            },
          },
        },
        fields: 'fontFamily,fontSize,italic,foregroundColor',
      },
    });
  });

  // Delete the initial default blank template slide if we created our custom slides
  if (initialFirstSlideId && requests.length > 0) {
    requests.push({
      deleteObject: {
        objectId: initialFirstSlideId,
      },
    });
  }

  // Execute batchUpdate in chunks if needed
  if (requests.length > 0) {
    try {
      await driveFetch(
        `https://slides.googleapis.com/v1/presentations/${presentationId}:batchUpdate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ requests }),
        }
      );
    } catch (batchErr) {
      console.warn('Google Slides batchUpdate styling notice:', batchErr);
    }
  }

  return {
    presentationId,
    webViewLink: created.webViewLink,
    slideCount: options.slides.length,
  };
}

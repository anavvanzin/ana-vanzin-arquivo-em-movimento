import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import rawBundle from '../data/canonicalBundle.json';
import { getDefaultPresenterNote } from '../data/atlasCatalog';
import {
  AtlasAxis,
  CanonicalBundle,
  DeckId,
  LangCode,
  ReviewStatus,
  SlideBlock,
  SlideItem,
  SlideOverride,
} from '../types';
import { sanitizeBoundedString, WORKSPACE_CONSTRAINTS } from '../utils/constraints';

const STORAGE_KEY = 'iconocracia_authorial_store_v1';
const NOTES_STORAGE_KEY = 'iconocracia_research_notes_v1';
const ATELIER_STORAGE_KEY = 'iconocracia_atelier_records_v1';

const canonicalBundle = rawBundle as unknown as CanonicalBundle;

type OverridesMap = Record<string, SlideOverride>;

export interface SavedResearchNote {
  id: string;
  queryTitle: string;
  synthesis: string;
  sourcesSummary: string;
  deck: DeckId;
  status: 'active' | 'archived';
  updatedAtIso: string;
}

export interface SavedAtelierRecord {
  id: string;
  kind: 'image_plate' | 'spatial_view';
  title: string;
  promptOrSummary: string;
  axis: AtlasAxis;
  specSummary: string;
  status: 'active' | 'archived';
  updatedAtIso: string;
}

function makeSlideKey(deck: DeckId, lang: LangCode, index: number): string {
  return `${deck}:${lang}:${index}`;
}

export function useArchiveStore() {
  const [overrides, setOverrides] = useState<OverridesMap>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as OverridesMap) : {};
    } catch {
      return {};
    }
  });

  const [savedResearchNotes, setSavedResearchNotes] = useState<SavedResearchNote[]>(() => {
    try {
      const raw = localStorage.getItem(NOTES_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as SavedResearchNote[]) : [];
    } catch {
      return [];
    }
  });

  const [savedAtelierRecords, setSavedAtelierRecords] = useState<SavedAtelierRecord[]>(() => {
    try {
      const raw = localStorage.getItem(ATELIER_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as SavedAtelierRecord[]) : [];
    } catch {
      return [];
    }
  });

  const latestOverridesRef = useRef<OverridesMap>(overrides);
  latestOverridesRef.current = overrides;

  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
    } catch {
      // Ignore browser localStorage quota errors
    }
  }, [overrides]);

  useEffect(() => {
    try {
      localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(savedResearchNotes));
    } catch {
      // Ignore browser localStorage quota errors
    }
  }, [savedResearchNotes]);

  useEffect(() => {
    try {
      localStorage.setItem(ATELIER_STORAGE_KEY, JSON.stringify(savedAtelierRecords));
    } catch {
      // Ignore browser localStorage quota errors
    }
  }, [savedAtelierRecords]);

  const getCanonicalSlides = useCallback((deck: DeckId, lang: LangCode): SlideItem[] => {
    const raw = canonicalBundle.decks[deck][lang] || canonicalBundle.decks[deck].pt;
    if (deck === 'representacao') {
      return raw.map((s, idx) => ({
        ...s,
        slideImage: s.slideImage || `/slides/slide-${String(idx + 1).padStart(2, '0')}.png`,
      }));
    }
    return raw;
  }, []);

  const getMergedSlides = useCallback(
    (deck: DeckId, lang: LangCode): SlideItem[] => {
      const base = getCanonicalSlides(deck, lang);
      return base.map((slide, idx) => {
        const ov = overrides[makeSlideKey(deck, lang, idx)];
        const defaultImage =
          deck === 'representacao' ? `/slides/slide-${String(idx + 1).padStart(2, '0')}.png` : undefined;
        if (!ov) {
          return {
            ...slide,
            slideImage: slide.slideImage || defaultImage,
          };
        }
        return {
          ...slide,
          title: ov.title !== undefined ? ov.title : slide.title,
          blocks: ov.blocks !== undefined ? ov.blocks : slide.blocks,
          footer: ov.footer !== undefined ? ov.footer : slide.footer,
          slideImage: slide.slideImage || defaultImage,
        };
      });
    },
    [getCanonicalSlides, overrides]
  );

  const getSlideOverride = useCallback(
    (deck: DeckId, lang: LangCode, index: number): SlideOverride => {
      return overrides[makeSlideKey(deck, lang, index)] || {};
    },
    [overrides]
  );

  const isSlideModified = useCallback(
    (deck: DeckId, lang: LangCode, index: number): boolean => {
      const base = getCanonicalSlides(deck, lang)[index];
      const ov = overrides[makeSlideKey(deck, lang, index)];
      if (!base || !ov) return false;
      if (ov.title !== undefined && ov.title !== base.title) return true;
      if (ov.footer !== undefined && ov.footer !== base.footer) return true;
      if (ov.blocks !== undefined && JSON.stringify(ov.blocks) !== JSON.stringify(base.blocks)) {
        return true;
      }
      return false;
    },
    [getCanonicalSlides, overrides]
  );

  const updateSlideTranslation = useCallback(
    (
      deck: DeckId,
      lang: LangCode,
      index: number,
      patch: {
        title?: string;
        blocks?: SlideBlock[];
        footer?: string;
        status?: ReviewStatus;
        philologicalNote?: string;
      }
    ) => {
      const key = makeSlideKey(deck, lang, index);
      setOverrides((prev) => {
        const next = {
          ...prev,
          [key]: {
            ...prev[key],
            ...patch,
            updatedAt: new Date().toISOString(),
          },
        };
        latestOverridesRef.current = next;
        return next;
      });
    },
    []
  );

  const resetSlideToCanonical = useCallback((deck: DeckId, lang: LangCode, index: number) => {
    const key = makeSlideKey(deck, lang, index);
    setOverrides((prev) => {
      const current = prev[key];
      if (!current) return prev;
      const next = { ...prev };
      const preservedPresenter = current.presenterNote;
      if (preservedPresenter) {
        next[key] = { presenterNote: preservedPresenter };
      } else {
        delete next[key];
      }
      latestOverridesRef.current = next;
      return next;
    });
  }, []);

  const getPresenterNote = useCallback(
    (deck: DeckId, index: number, lang: LangCode = 'pt'): string => {
      const langKey = makeSlideKey(deck, lang, index);
      const customLang = overrides[langKey]?.presenterNote;
      if (customLang !== undefined) return customLang;
      if (lang !== 'pt') {
        const localizedDefault = getDefaultPresenterNote(deck, index, lang);
        if (localizedDefault) return localizedDefault;
      }
      const ptKey = makeSlideKey(deck, 'pt', index);
      const customPt = overrides[ptKey]?.presenterNote;
      if (customPt !== undefined) return customPt;
      return getDefaultPresenterNote(deck, index, lang);
    },
    [overrides]
  );

  const setPresenterNote = useCallback(
    (deck: DeckId, index: number, note: string, lang: LangCode = 'pt') => {
      const key = makeSlideKey(deck, lang, index);
      const bounded = sanitizeBoundedString(note, WORKSPACE_CONSTRAINTS.MAX_PRESENTER_NOTE_LEN);
      setOverrides((prev) => {
        const next = {
          ...prev,
          [key]: {
            ...prev[key],
            presenterNote: bounded,
            updatedAt: new Date().toISOString(),
          },
        };
        latestOverridesRef.current = next;
        return next;
      });
    },
    []
  );

  const saveResearchNote = useCallback(
    async (
      queryTitle: string,
      synthesis: string,
      sources: { title: string; uri: string }[],
      deck: DeckId = 'representacao'
    ): Promise<string> => {
      const noteId = `note_${Date.now()}`;
      const boundedTitle =
        sanitizeBoundedString(queryTitle.trim(), WORKSPACE_CONSTRAINTS.MAX_QUERY_TITLE_LEN) ||
        'Consulta documental';
      const boundedSynthesis =
        sanitizeBoundedString(synthesis.trim(), WORKSPACE_CONSTRAINTS.MAX_SYNTHESIS_LEN) ||
        'Sem síntese.';
      const formattedSources = sanitizeBoundedString(
        sources.map((s) => `${s.title} — ${s.uri}`).join('\n'),
        WORKSPACE_CONSTRAINTS.MAX_SOURCES_SUMMARY_LEN
      );

      const newNote: SavedResearchNote = {
        id: noteId,
        queryTitle: boundedTitle,
        synthesis: boundedSynthesis,
        sourcesSummary: formattedSources,
        deck: deck === 'trajeto' ? 'trajeto' : 'representacao',
        status: 'active',
        updatedAtIso: new Date().toISOString(),
      };
      setSavedResearchNotes((prev) => [newNote, ...prev]);
      return noteId;
    },
    []
  );

  const deleteResearchNote = useCallback(async (noteId: string): Promise<void> => {
    setSavedResearchNotes((prev) => prev.filter((n) => n.id !== noteId));
  }, []);

  const saveAtelierRecord = useCallback(
    async (input: {
      kind: 'image_plate' | 'spatial_view';
      title: string;
      promptOrSummary: string;
      axis: AtlasAxis;
      specSummary: string;
    }): Promise<string> => {
      const prefix = input.kind === 'spatial_view' ? 'spatial' : 'plate';
      const recordId = `${prefix}_${Date.now()}`;

      const boundedTitle =
        sanitizeBoundedString(input.title.trim(), WORKSPACE_CONSTRAINTS.MAX_ATELIER_TITLE_LEN) ||
        'Registro curatorial';
      const boundedPrompt =
        sanitizeBoundedString(
          input.promptOrSummary.trim(),
          WORKSPACE_CONSTRAINTS.MAX_ATELIER_PROMPT_LEN
        ) || 'Sem descrição.';
      const boundedSpec = sanitizeBoundedString(
        input.specSummary.trim(),
        WORKSPACE_CONSTRAINTS.MAX_ATELIER_SPEC_LEN
      );
      const validAxis: AtlasAxis =
        input.axis === 'imperio' || input.axis === 'republica' ? input.axis : 'venda';

      const newRec: SavedAtelierRecord = {
        id: recordId,
        kind: input.kind === 'spatial_view' ? 'spatial_view' : 'image_plate',
        title: boundedTitle,
        promptOrSummary: boundedPrompt,
        axis: validAxis,
        specSummary: boundedSpec,
        status: 'active',
        updatedAtIso: new Date().toISOString(),
      };
      setSavedAtelierRecords((prev) => [newRec, ...prev]);
      return recordId;
    },
    []
  );

  const deleteAtelierRecord = useCallback(async (recordId: string): Promise<void> => {
    setSavedAtelierRecords((prev) => prev.filter((r) => r.id !== recordId));
  }, []);

  const getDeckReviewStats = useCallback(
    (deck: DeckId, lang: LangCode) => {
      const total = getCanonicalSlides(deck, lang).length;
      let approved = 0;
      let modified = 0;
      for (let i = 0; i < total; i++) {
        const ov = overrides[makeSlideKey(deck, lang, i)];
        if (ov?.status === 'approved') approved++;
        if (isSlideModified(deck, lang, i)) modified++;
      }
      return { total, approved, modified };
    },
    [getCanonicalSlides, isSlideModified, overrides]
  );

  const exportDeckJson = useCallback(
    (deck: DeckId, lang: LangCode) => {
      const merged = getMergedSlides(deck, lang);
      const blob = new Blob([JSON.stringify(merged, null, 2)], {
        type: 'application/json;charset=utf-8',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${deck}-${lang}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    },
    [getMergedSlides]
  );

  const exportFullWorkspace = useCallback(() => {
    const payload = {
      project: 'ICONOCRACIA',
      exportedAt: new Date().toISOString(),
      overrides,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `iconocracia-revisoes-autorais.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [overrides]);

  const importWorkspaceJson = useCallback(
    (
      jsonText: string,
      targetDeck?: DeckId,
      targetLang?: LangCode
    ): { ok: boolean; message: string } => {
      try {
        const parsed = JSON.parse(jsonText);
        if (parsed && typeof parsed === 'object' && parsed.overrides) {
          setOverrides((prev) => ({ ...prev, ...(parsed.overrides as OverridesMap) }));
          return { ok: true, message: 'Pacote completo de revisões autorais importado.' };
        }
        if (Array.isArray(parsed) && targetDeck && targetLang) {
          const base = getCanonicalSlides(targetDeck, targetLang);
          setOverrides((prev) => {
            const next = { ...prev };
            parsed.forEach((item: SlideItem, idx: number) => {
              if (idx < base.length && item && typeof item.title === 'string') {
                const key = makeSlideKey(targetDeck, targetLang, idx);
                next[key] = {
                  ...next[key],
                  title: item.title,
                  blocks: Array.isArray(item.blocks) ? item.blocks : base[idx].blocks,
                  footer: typeof item.footer === 'string' ? item.footer : base[idx].footer,
                  updatedAt: new Date().toISOString(),
                };
              }
            });
            latestOverridesRef.current = next;
            return next;
          });
          return {
            ok: true,
            message: `Arquivo ${targetDeck}-${targetLang}.json importado na edição ativa.`,
          };
        }
        return { ok: false, message: 'Formato JSON não reconhecido para este dossiê.' };
      } catch {
        return { ok: false, message: 'Erro ao ler o arquivo JSON selecionado.' };
      }
    },
    [getCanonicalSlides]
  );

  const uiByLang = useMemo(() => canonicalBundle.ui, []);
  const editorialByLang = useMemo(() => canonicalBundle.editorial, []);

  return {
    uiByLang,
    editorialByLang,
    savedResearchNotes,
    savedAtelierRecords,
    saveResearchNote,
    deleteResearchNote,
    saveAtelierRecord,
    deleteAtelierRecord,
    getCanonicalSlides,
    getMergedSlides,
    getSlideOverride,
    isSlideModified,
    updateSlideTranslation,
    resetSlideToCanonical,
    getPresenterNote,
    setPresenterNote,
    getDeckReviewStats,
    exportDeckJson,
    exportFullWorkspace,
    importWorkspaceJson,
  };
}

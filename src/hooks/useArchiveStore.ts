import { useCallback, useEffect, useMemo, useState } from 'react';
import rawBundle from '../data/canonicalBundle.json';
import { DEFAULT_PRESENTER_NOTES } from '../data/atlasCatalog';
import {
  CanonicalBundle,
  DeckId,
  LangCode,
  ReviewStatus,
  SlideBlock,
  SlideItem,
  SlideOverride,
} from '../types';

const STORAGE_KEY = 'iconocracia_authorial_store_v1';

const canonicalBundle = rawBundle as unknown as CanonicalBundle;

type OverridesMap = Record<string, SlideOverride>;

function makeSlideKey(deck: DeckId, lang: LangCode, index: number): string {
  return `${deck}:${lang}:${index}`;
}

function makeNoteKey(deck: DeckId, index: number): string {
  return `${deck}:${index}`;
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

  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
    } catch {
      // Ignore storage quota errors
    }
  }, [overrides]);

  const getCanonicalSlides = useCallback((deck: DeckId, lang: LangCode): SlideItem[] => {
    return canonicalBundle.decks[deck][lang] || canonicalBundle.decks[deck].pt;
  }, []);

  const getMergedSlides = useCallback(
    (deck: DeckId, lang: LangCode): SlideItem[] => {
      const base = getCanonicalSlides(deck, lang);
      return base.map((slide, idx) => {
        const ov = overrides[makeSlideKey(deck, lang, idx)];
        if (!ov) return slide;
        return {
          ...slide,
          title: ov.title !== undefined ? ov.title : slide.title,
          blocks: ov.blocks !== undefined ? ov.blocks : slide.blocks,
          footer: ov.footer !== undefined ? ov.footer : slide.footer,
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
      setOverrides((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          ...patch,
          updatedAt: new Date().toISOString(),
        },
      }));
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
      return next;
    });
  }, []);

  const getPresenterNote = useCallback(
    (deck: DeckId, index: number): string => {
      const key = makeSlideKey(deck, 'pt', index);
      const custom = overrides[key]?.presenterNote;
      if (custom !== undefined) return custom;
      return DEFAULT_PRESENTER_NOTES[makeNoteKey(deck, index)] || '';
    },
    [overrides]
  );

  const setPresenterNote = useCallback((deck: DeckId, index: number, note: string) => {
    const key = makeSlideKey(deck, 'pt', index);
    setOverrides((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        presenterNote: note,
        updatedAt: new Date().toISOString(),
      },
    }));
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
    (jsonText: string, targetDeck?: DeckId, targetLang?: LangCode): { ok: boolean; message: string } => {
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

  const buildDeckExportJson = useCallback(
    (deck: DeckId, lang: LangCode): string => {
      const merged = getMergedSlides(deck, lang);
      return JSON.stringify(merged, null, 2);
    },
    [getMergedSlides]
  );

  const buildWorkspaceBackupJson = useCallback((): string => {
    const payload = {
      project: 'ICONOCRACIA',
      exportedAt: new Date().toISOString(),
      overrides,
    };
    return JSON.stringify(payload, null, 2);
  }, [overrides]);

  const uiByLang = useMemo(() => canonicalBundle.ui, []);
  const editorialByLang = useMemo(() => canonicalBundle.editorial, []);

  return {
    uiByLang,
    editorialByLang,
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
    buildDeckExportJson,
    buildWorkspaceBackupJson,
    importWorkspaceJson,
  };
}

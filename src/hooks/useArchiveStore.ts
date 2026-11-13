import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import rawBundle from '../data/canonicalBundle.json';
import { getDefaultPresenterNote } from '../data/atlasCatalog';
import {
  auth,
  db,
  ensureUserWorkspaceDocument,
  handleFirestoreError,
  makeFirestoreRevisionId,
  OperationType,
  sanitizeBoundedString,
  signInWithFirebaseGoogle,
  WORKSPACE_CONSTRAINTS,
} from '../firebase';
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

export interface SavedResearchNote {
  id: string;
  queryTitle: string;
  synthesis: string;
  sourcesSummary: string;
  deck: DeckId;
  status: 'active' | 'archived';
  updatedAtIso: string;
}

function makeSlideKey(deck: DeckId, lang: LangCode, index: number): string {
  return `${deck}:${lang}:${index}`;
}

function serializeOverrideForFirestore(
  uid: string,
  deck: DeckId,
  lang: LangCode,
  slideIndex: number,
  ov: SlideOverride,
  includeImmutableFields: boolean
): Record<string, unknown> {
  const safeIdx = Math.max(0, Math.min(13, Math.floor(slideIndex)));
  const blocks = Array.isArray(ov.blocks) ? ov.blocks.slice(0, 4) : undefined;
  const blockCount = blocks ? blocks.length : 0;

  const payload: Record<string, unknown> = {
    reviewStatus: ov.status === 'approved' ? 'approved' : 'pending',
    blockCount,
    title: sanitizeBoundedString(ov.title ?? '', WORKSPACE_CONSTRAINTS.MAX_TITLE_LEN),
    footer: sanitizeBoundedString(ov.footer ?? '', WORKSPACE_CONSTRAINTS.MAX_FOOTER_LEN),
    b0Label: sanitizeBoundedString(blocks?.[0]?.label, WORKSPACE_CONSTRAINTS.MAX_BLOCK_LABEL_LEN),
    b0Text: sanitizeBoundedString(blocks?.[0]?.text, WORKSPACE_CONSTRAINTS.MAX_BLOCK_TEXT_LEN),
    b1Label: sanitizeBoundedString(blocks?.[1]?.label, WORKSPACE_CONSTRAINTS.MAX_BLOCK_LABEL_LEN),
    b1Text: sanitizeBoundedString(blocks?.[1]?.text, WORKSPACE_CONSTRAINTS.MAX_BLOCK_TEXT_LEN),
    b2Label: sanitizeBoundedString(blocks?.[2]?.label, WORKSPACE_CONSTRAINTS.MAX_BLOCK_LABEL_LEN),
    b2Text: sanitizeBoundedString(blocks?.[2]?.text, WORKSPACE_CONSTRAINTS.MAX_BLOCK_TEXT_LEN),
    b3Label: sanitizeBoundedString(blocks?.[3]?.label, WORKSPACE_CONSTRAINTS.MAX_BLOCK_LABEL_LEN),
    b3Text: sanitizeBoundedString(blocks?.[3]?.text, WORKSPACE_CONSTRAINTS.MAX_BLOCK_TEXT_LEN),
    philologicalNote: sanitizeBoundedString(
      ov.philologicalNote,
      WORKSPACE_CONSTRAINTS.MAX_PHILOLOGY_LEN
    ),
    presenterNote: sanitizeBoundedString(
      ov.presenterNote,
      WORKSPACE_CONSTRAINTS.MAX_PRESENTER_NOTE_LEN
    ),
    updatedAt: serverTimestamp(),
  };

  if (includeImmutableFields) {
    payload.ownerId = uid;
    payload.deck = deck;
    payload.lang = lang;
    payload.slideIndex = safeIdx;
    payload.createdAt = serverTimestamp();
  }

  return payload;
}

function deserializeFirestoreRevision(
  data: Record<string, unknown>,
  canonicalSlide?: SlideItem
): SlideOverride {
  const ov: SlideOverride = {};

  if (data.reviewStatus === 'approved' || data.reviewStatus === 'locked') {
    ov.status = 'approved';
  } else if (data.reviewStatus === 'pending') {
    ov.status = 'pending';
  }

  if (typeof data.title === 'string' && data.title.length > 0) {
    if (!canonicalSlide || data.title !== canonicalSlide.title) {
      ov.title = data.title;
    }
  }

  if (typeof data.footer === 'string' && data.footer.length > 0) {
    if (!canonicalSlide || data.footer !== canonicalSlide.footer) {
      ov.footer = data.footer;
    }
  }

  const blockCount = typeof data.blockCount === 'number' ? data.blockCount : 0;
  if (blockCount > 0 && blockCount <= 4) {
    const reconstructed: SlideBlock[] = [];
    for (let i = 0; i < blockCount; i++) {
      const label = typeof data[`b${i}Label`] === 'string' ? (data[`b${i}Label`] as string) : '';
      const text = typeof data[`b${i}Text`] === 'string' ? (data[`b${i}Text`] as string) : '';
      reconstructed.push({ label, text });
    }
    ov.blocks = reconstructed;
  }

  if (typeof data.philologicalNote === 'string' && data.philologicalNote.length > 0) {
    ov.philologicalNote = data.philologicalNote;
  }

  if (typeof data.presenterNote === 'string' && data.presenterNote.length > 0) {
    ov.presenterNote = data.presenterNote;
  }

  if (data.updatedAt instanceof Timestamp) {
    ov.updatedAt = data.updatedAt.toDate().toISOString();
  }

  return ov;
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

  const [firebaseUser, setFirebaseUser] = useState<User | null>(() => auth.currentUser);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [workspaceReady, setWorkspaceReady] = useState<boolean>(false);
  const [savedResearchNotes, setSavedResearchNotes] = useState<SavedResearchNote[]>([]);

  const existingRevisionIdsRef = useRef<Set<string>>(new Set());
  const debounceTimersRef = useRef<Record<string, number>>({});
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

  // 1. Track Firebase Auth & Bootstrap User Workspace Root (/users/{uid})
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      setIsAuthReady(true);
      if (user && user.emailVerified) {
        try {
          const ok = await ensureUserWorkspaceDocument(user, 'representacao', 'pt');
          setWorkspaceReady(ok);
        } catch (err) {
          console.error('Failed to bootstrap Firestore workspace:', err);
          setWorkspaceReady(false);
        }
      } else {
        setWorkspaceReady(false);
        existingRevisionIdsRef.current.clear();
        setSavedResearchNotes([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const getCanonicalSlides = useCallback((deck: DeckId, lang: LangCode): SlideItem[] => {
    return canonicalBundle.decks[deck][lang] || canonicalBundle.decks[deck].pt;
  }, []);

  // 2. Real-Time Firestore Listeners (Only attached when Auth + Workspace are ready)
  useEffect(() => {
    if (!isAuthReady || !firebaseUser || !workspaceReady) {
      return;
    }

    const uid = firebaseUser.uid;
    const revisionsPath = `users/${uid}/slideRevisions`;
    const revisionsQuery = query(
      collection(db, 'users', uid, 'slideRevisions'),
      where('ownerId', '==', uid)
    );

    const unsubRevisions = onSnapshot(
      revisionsQuery,
      (snapshot) => {
        const nextExisting = new Set<string>();
        const remoteMap: OverridesMap = {};

        snapshot.forEach((docSnap) => {
          nextExisting.add(docSnap.id);
          const d = docSnap.data() as Record<string, unknown>;
          const deck = d.deck as DeckId;
          const lang = d.lang as LangCode;
          const slideIndex = typeof d.slideIndex === 'number' ? d.slideIndex : 0;
          if (
            (deck === 'representacao' || deck === 'trajeto') &&
            ['pt', 'en', 'fr', 'it', 'nl'].includes(lang)
          ) {
            const canonical = getCanonicalSlides(deck, lang)[slideIndex];
            remoteMap[makeSlideKey(deck, lang, slideIndex)] = deserializeFirestoreRevision(
              d,
              canonical
            );
          }
        });

        existingRevisionIdsRef.current = nextExisting;
        if (Object.keys(remoteMap).length > 0) {
          setOverrides((prev) => ({ ...prev, ...remoteMap }));
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, revisionsPath);
      }
    );

    const notesPath = `users/${uid}/researchNotes`;
    const notesQuery = query(
      collection(db, 'users', uid, 'researchNotes'),
      where('ownerId', '==', uid)
    );

    const unsubNotes = onSnapshot(
      notesQuery,
      (snapshot) => {
        const loaded: SavedResearchNote[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data() as Record<string, unknown>;
          const updatedAtIso =
            d.updatedAt instanceof Timestamp
              ? d.updatedAt.toDate().toISOString()
              : new Date().toISOString();
          loaded.push({
            id: docSnap.id,
            queryTitle: typeof d.queryTitle === 'string' ? d.queryTitle : '',
            synthesis: typeof d.synthesis === 'string' ? d.synthesis : '',
            sourcesSummary: typeof d.sourcesSummary === 'string' ? d.sourcesSummary : '',
            deck: d.deck === 'trajeto' ? 'trajeto' : 'representacao',
            status: d.status === 'archived' ? 'archived' : 'active',
            updatedAtIso,
          });
        });
        loaded.sort((a, b) => b.updatedAtIso.localeCompare(a.updatedAtIso));
        setSavedResearchNotes(loaded);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, notesPath);
      }
    );

    return () => {
      unsubRevisions();
      unsubNotes();
    };
  }, [firebaseUser, getCanonicalSlides, isAuthReady, workspaceReady]);

  const scheduleCloudSlideSync = useCallback(
    (deck: DeckId, lang: LangCode, index: number) => {
      if (!firebaseUser || !workspaceReady || !firebaseUser.emailVerified) return;
      const uid = firebaseUser.uid;
      const revId = makeFirestoreRevisionId(deck, lang, index);

      if (debounceTimersRef.current[revId]) {
        window.clearTimeout(debounceTimersRef.current[revId]);
      }

      debounceTimersRef.current[revId] = window.setTimeout(async () => {
        delete debounceTimersRef.current[revId];
        const currentOv = latestOverridesRef.current[makeSlideKey(deck, lang, index)];
        if (!currentOv) return;

        const docPath = `users/${uid}/slideRevisions/${revId}`;
        const docRef = doc(db, 'users', uid, 'slideRevisions', revId);
        const alreadyExists = existingRevisionIdsRef.current.has(revId);

        if (alreadyExists) {
          const updatePayload = serializeOverrideForFirestore(
            uid,
            deck,
            lang,
            index,
            currentOv,
            false
          );
          try {
            await updateDoc(docRef, updatePayload);
          } catch (error) {
            handleFirestoreError(error, OperationType.UPDATE, docPath);
          }
        } else {
          const createPayload = serializeOverrideForFirestore(
            uid,
            deck,
            lang,
            index,
            currentOv,
            true
          );
          try {
            await setDoc(docRef, createPayload);
            existingRevisionIdsRef.current.add(revId);
          } catch (error) {
            handleFirestoreError(error, OperationType.CREATE, docPath);
          }
        }
      }, 450);
    },
    [firebaseUser, workspaceReady]
  );

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
      scheduleCloudSlideSync(deck, lang, index);
    },
    [scheduleCloudSlideSync]
  );

  const resetSlideToCanonical = useCallback(
    (deck: DeckId, lang: LangCode, index: number) => {
      const key = makeSlideKey(deck, lang, index);
      const revId = makeFirestoreRevisionId(deck, lang, index);
      let hadPreservedPresenter = false;

      setOverrides((prev) => {
        const current = prev[key];
        if (!current) return prev;
        const next = { ...prev };
        const preservedPresenter = current.presenterNote;
        if (preservedPresenter) {
          hadPreservedPresenter = true;
          next[key] = { presenterNote: preservedPresenter };
        } else {
          delete next[key];
        }
        latestOverridesRef.current = next;
        return next;
      });

      if (hadPreservedPresenter) {
        scheduleCloudSlideSync(deck, lang, index);
      } else if (
        firebaseUser &&
        workspaceReady &&
        firebaseUser.emailVerified &&
        existingRevisionIdsRef.current.has(revId)
      ) {
        const uid = firebaseUser.uid;
        const docPath = `users/${uid}/slideRevisions/${revId}`;
        void (async () => {
          try {
            await deleteDoc(doc(db, 'users', uid, 'slideRevisions', revId));
            existingRevisionIdsRef.current.delete(revId);
          } catch (error) {
            handleFirestoreError(error, OperationType.DELETE, docPath);
          }
        })();
      }
    },
    [firebaseUser, scheduleCloudSlideSync, workspaceReady]
  );

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
      scheduleCloudSlideSync(deck, lang, index);
    },
    [scheduleCloudSlideSync]
  );

  // Firestore ResearchNote Actions (/users/{uid}/researchNotes/{noteId})
  const saveResearchNoteToFirestore = useCallback(
    async (
      queryTitle: string,
      synthesis: string,
      sources: { title: string; uri: string }[],
      deck: DeckId = 'representacao'
    ): Promise<string> => {
      if (!firebaseUser || !workspaceReady || !firebaseUser.emailVerified) {
        throw new Error('Conecte sua conta Google verificada para arquivar fichas no Firestore.');
      }
      const uid = firebaseUser.uid;
      const noteId = `note_${Date.now()}`;
      const docPath = `users/${uid}/researchNotes/${noteId}`;

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

      try {
        await setDoc(doc(db, 'users', uid, 'researchNotes', noteId), {
          ownerId: uid,
          queryTitle: boundedTitle,
          synthesis: boundedSynthesis,
          sourcesSummary: formattedSources,
          deck: deck === 'trajeto' ? 'trajeto' : 'representacao',
          status: 'active',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        return noteId;
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, docPath);
      }
    },
    [firebaseUser, workspaceReady]
  );

  const deleteResearchNoteFromFirestore = useCallback(
    async (noteId: string): Promise<void> => {
      if (!firebaseUser || !workspaceReady || !WORKSPACE_CONSTRAINTS.ID_REGEX.test(noteId)) return;
      const uid = firebaseUser.uid;
      const docPath = `users/${uid}/researchNotes/${noteId}`;
      try {
        await deleteDoc(doc(db, 'users', uid, 'researchNotes', noteId));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, docPath);
      }
    },
    [firebaseUser, workspaceReady]
  );

  const signInCloudSync = useCallback(async (): Promise<User> => {
    const user = await signInWithFirebaseGoogle();
    if (user.emailVerified) {
      const ok = await ensureUserWorkspaceDocument(user, 'representacao', 'pt');
      setWorkspaceReady(ok);
    }
    return user;
  }, []);

  const signOutCloudSync = useCallback(async (): Promise<void> => {
    await signOut(auth);
    setWorkspaceReady(false);
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
    firebaseUser,
    isAuthReady,
    cloudSyncActive: Boolean(firebaseUser && workspaceReady && firebaseUser.emailVerified),
    savedResearchNotes,
    signInCloudSync,
    signOutCloudSync,
    saveResearchNoteToFirestore,
    deleteResearchNoteFromFirestore,
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

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { User } from 'firebase/auth';
import { CheckCircle2, Cloud, Database, FileText, LogOut, Menu, Presentation, X } from 'lucide-react';
import { AtlasGallery, AtlasSectionTab } from './components/AtlasGallery';
import { Cabinet3DScene } from './components/Cabinet3DScene';
import { DriveWorkspace } from './components/DriveWorkspace';
import { EditorialApparatus } from './components/EditorialApparatus';
import { GoogleDocsWorkspace } from './components/GoogleDocsWorkspace';
import { GoogleSlidesWorkspace } from './components/GoogleSlidesWorkspace';
import { HomePortal } from './components/HomePortal';
import { LightboxModal } from './components/LightboxModal';
import { PresenterStage } from './components/PresenterStage';
import { buildGroundedNoteHtml } from './components/ResearchGroundingPanel';
import { SlideReader } from './components/SlideReader';
import { TranslationStudio } from './components/TranslationStudio';
import { LANGUAGES } from './data/atlasCatalog';
import { PORTAL_COPY } from './data/portalCopy';
import { useArchiveStore } from './hooks/useArchiveStore';
import {
  findDriveFolderByName,
  googleSignIn,
  initAuth,
  logout,
  subscribeDriveAuth,
  uploadTextOrDocToDrive,
} from './services/googleDrive';
import { AtlasEntry, DeckId, LangCode, ViewMode } from './types';

interface RouteState {
  view: ViewMode;
  deck: DeckId;
  lang: LangCode;
  slideIndex: number;
  atlasSection?: AtlasSectionTab;
  googleSlidesId?: string | null;
  googleDocId?: string | null;
}

const VALID_LANGS: LangCode[] = ['pt', 'en', 'fr', 'it', 'nl'];
const VALID_DECKS: DeckId[] = ['representacao', 'trajeto'];

function parseRouteFromLocation(): RouteState {
  const hash = window.location.hash.replace(/^#/, '');
  const pathname = window.location.pathname;

  if (hash.startsWith('/')) {
    const parts = hash.split('/').filter(Boolean);
    if (parts[0] === 'gabinete-3d') {
      const l = VALID_LANGS.includes(parts[1] as LangCode) ? (parts[1] as LangCode) : 'pt';
      return { view: 'cabinet3d', deck: 'representacao', lang: l, slideIndex: 0 };
    }
    if (parts[0] === 'atlas') {
      const sec: AtlasSectionTab = parts[1] === 'atelier' ? 'atelier' : 'catalog';
      return {
        view: 'atlas',
        deck: 'representacao',
        lang: 'pt',
        slideIndex: 0,
        atlasSection: sec,
      };
    }
    if (parts[0] === 'drive') {
      const l = VALID_LANGS.includes(parts[1] as LangCode) ? (parts[1] as LangCode) : 'pt';
      return { view: 'drive', deck: 'representacao', lang: l, slideIndex: 0 };
    }
    if (parts[0] === 'slides') {
      const presId = parts[1] || null;
      return {
        view: 'slides',
        deck: 'representacao',
        lang: 'pt',
        slideIndex: 0,
        googleSlidesId: presId,
      };
    }
    if (parts[0] === 'docs') {
      const docId = parts[1] || null;
      return {
        view: 'docs',
        deck: 'representacao',
        lang: 'pt',
        slideIndex: 0,
        googleDocId: docId,
      };
    }
    if (parts[0] === 'studio') {
      const d = VALID_DECKS.includes(parts[1] as DeckId) ? (parts[1] as DeckId) : 'representacao';
      const l = VALID_LANGS.includes(parts[2] as LangCode) ? (parts[2] as LangCode) : 'pt';
      const s = Math.max(0, (Number((parts[3] || '').replace(/\D/g, '')) || 1) - 1);
      return { view: 'studio', deck: d, lang: l, slideIndex: s };
    }
    if (parts[0] === 'fontes') {
      const l = VALID_LANGS.includes(parts[1] as LangCode) ? (parts[1] as LangCode) : 'pt';
      return { view: 'apparatus', deck: 'representacao', lang: l, slideIndex: 0 };
    }
    if (parts[0] === 'apresentar') {
      const d = VALID_DECKS.includes(parts[1] as DeckId) ? (parts[1] as DeckId) : 'representacao';
      const l = VALID_LANGS.includes(parts[2] as LangCode) ? (parts[2] as LangCode) : 'pt';
      const s = Math.max(0, (Number((parts[3] || '').replace(/\D/g, '')) || 1) - 1);
      return { view: 'presenter', deck: d, lang: l, slideIndex: s };
    }
    if (VALID_DECKS.includes(parts[0] as DeckId)) {
      const d = parts[0] as DeckId;
      const l = VALID_LANGS.includes(parts[1] as LangCode) ? (parts[1] as LangCode) : 'pt';
      const s = Math.max(0, (Number((parts[2] || '').replace(/\D/g, '')) || 1) - 1);
      return { view: 'reader', deck: d, lang: l, slideIndex: s };
    }
  }

  const pathParts = pathname.split('/').filter(Boolean);
  if (
    pathParts.length >= 2 &&
    VALID_DECKS.includes(pathParts[0] as DeckId) &&
    VALID_LANGS.includes(pathParts[1] as LangCode)
  ) {
    const slideMatch = hash.match(/slide-(\d+)/);
    const s = Math.max(0, (Number(slideMatch?.[1]) || 1) - 1);
    return {
      view: 'reader',
      deck: pathParts[0] as DeckId,
      lang: pathParts[1] as LangCode,
      slideIndex: s,
    };
  }

  return { view: 'home', deck: 'representacao', lang: 'pt', slideIndex: 0 };
}

function buildHashUrl(state: RouteState): string {
  const slideTag = `slide-${String(state.slideIndex + 1).padStart(2, '0')}`;
  switch (state.view) {
    case 'home':
      return '#/';
    case 'atlas':
      return state.atlasSection === 'atelier' ? '#/atlas/atelier' : '#/atlas';
    case 'cabinet3d':
      return `#/gabinete-3d/${state.lang}`;
    case 'apparatus':
      return `#/fontes/${state.lang}`;
    case 'drive':
      return `#/drive/${state.lang}`;
    case 'slides':
      return state.googleSlidesId ? `#/slides/${state.googleSlidesId}` : '#/slides';
    case 'docs':
      return state.googleDocId ? `#/docs/${state.googleDocId}` : '#/docs';
    case 'studio':
      return `#/studio/${state.deck}/${state.lang}/${slideTag}`;
    case 'presenter':
      return `#/apresentar/${state.deck}/${state.lang}/${slideTag}`;
    case 'reader':
      return `#/${state.deck}/${state.lang}/${slideTag}`;
  }
}

export default function App() {
  const store = useArchiveStore();
  const [route, setRoute] = useState<RouteState>(() => parseRouteFromLocation());
  const [lightboxState, setLightboxState] = useState<{
    entry: AtlasEntry | null;
    compareId: string | null;
  }>({ entry: null, compareId: null });
  const [notice, setNotice] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [driveUser, setDriveUser] = useState<User | null>(null);
  const [needsDriveAuth, setNeedsDriveAuth] = useState<boolean>(true);
  const [isSigningInDrive, setIsSigningInDrive] = useState<boolean>(false);
  const [isSigningInCloud, setIsSigningInCloud] = useState<boolean>(false);
  const noticeTimer = useRef<number | null>(null);

  const notify = useCallback((msg: string) => {
    setNotice(msg);
    if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(''), 3800);
  }, []);

  useEffect(() => {
    const unsubInit = initAuth(
      (u) => {
        setDriveUser(u);
        setNeedsDriveAuth(false);
      },
      () => {
        setDriveUser(null);
        setNeedsDriveAuth(true);
      }
    );
    const unsubStore = subscribeDriveAuth(({ user, needsAuth }) => {
      setDriveUser(user);
      setNeedsDriveAuth(needsAuth);
    });
    return () => {
      unsubInit();
      unsubStore();
    };
  }, []);

  const handleCloudSignIn = useCallback(async () => {
    setIsSigningInCloud(true);
    try {
      const user = await store.signInCloudSync();
      if (user) {
        notify(`Sincronização Firestore conectada (${user.email || 'Google'}).`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Autenticação Google cancelada.';
      notify(msg);
    } finally {
      setIsSigningInCloud(false);
    }
  }, [notify, store]);

  const handleCloudSignOut = useCallback(async () => {
    await store.signOutCloudSync();
    setDriveUser(null);
    setNeedsDriveAuth(true);
    notify('Sessão Firebase encerrada.');
  }, [notify, store]);

  const handleDriveSignIn = useCallback(async () => {
    setIsSigningInDrive(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setDriveUser(res.user);
        setNeedsDriveAuth(false);
        notify('Google Drive conectado ao dossiê ICONOCRACIA.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Autenticação cancelada ou indisponível.';
      notify(msg);
    } finally {
      setIsSigningInDrive(false);
    }
  }, [notify]);

  const handleDriveSignOut = useCallback(async () => {
    await logout();
    setDriveUser(null);
    setNeedsDriveAuth(true);
    notify('Sessão do Google Drive encerrada.');
  }, [notify]);

  const handleSaveGroundedNoteFromApparatus = useCallback(
    async (
      queryTitle: string,
      synthesis: string,
      sources: { title: string; uri: string }[]
    ) => {
      const folder = await findDriveFolderByName('ICONOCRACIA — Dossiê Doutoral');
      const shortTitle = queryTitle.slice(0, 58).trim();
      const html = buildGroundedNoteHtml(queryTitle, synthesis, sources);
      const saved = await uploadTextOrDocToDrive({
        name: `Ficha Documental — ${shortTitle}`,
        content: html,
        contentMimeType: 'text/html',
        targetDriveMimeType: 'application/vnd.google-apps.document',
        parentId: folder?.id || null,
        description: 'Ficha de verificação documental fundamentada no Google Search — ICONOCRACIA',
      });
      notify(`Ficha "${saved.name}" salva no Google Drive.`);
    },
    [notify]
  );

  const handleSaveGroundedNoteToFirestore = useCallback(
    async (
      queryTitle: string,
      synthesis: string,
      sources: { title: string; uri: string }[]
    ) => {
      await store.saveResearchNoteToFirestore(queryTitle, synthesis, sources, route.deck);
      notify('Ficha documental arquivada no Firestore.');
    },
    [notify, route.deck, store]
  );

  const navigateState = useCallback((next: RouteState) => {
    setRoute(next);
    setMobileMenuOpen(false);
    const targetHash = buildHashUrl(next);
    if (window.location.hash !== targetHash) {
      window.history.pushState(null, '', targetHash);
    }
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  useEffect(() => {
    const onHashOrPop = () => {
      setRoute(parseRouteFromLocation());
    };
    window.addEventListener('hashchange', onHashOrPop);
    window.addEventListener('popstate', onHashOrPop);
    return () => {
      window.removeEventListener('hashchange', onHashOrPop);
      window.removeEventListener('popstate', onHashOrPop);
    };
  }, []);

  const activeUi = store.uiByLang[route.lang] || store.uiByLang.pt;
  const activeEditorial = store.editorialByLang[route.lang] || store.editorialByLang.pt;
  const activeSlides = store.getMergedSlides(route.deck, route.lang);
  const copy = PORTAL_COPY[route.lang] || PORTAL_COPY.pt;

  useEffect(() => {
    document.documentElement.lang = route.lang === 'pt' ? 'pt-BR' : route.lang;
    if (route.view === 'reader' || route.view === 'presenter') {
      const s = activeSlides[route.slideIndex];
      if (s) {
        document.title = `${s.title.replace(/\n/g, ' ')} — ICONOCRACIA`;
        return;
      }
    }
    document.title = 'ICONOCRACIA — Ana Vitória Vanzin Mendes';
  }, [activeSlides, route.lang, route.slideIndex, route.view]);

  const currentOverride = store.getSlideOverride(route.deck, route.lang, route.slideIndex);
  const currentModified = store.isSlideModified(route.deck, route.lang, route.slideIndex);
  const isPresenter = route.view === 'presenter';
  const isFullBleed3D = route.view === 'cabinet3d';

  return (
    <div className="min-h-screen flex flex-col text-[#1c1c1c]">
      {/* Skip to Main Content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#7e2a1f] focus:text-[#f2efeb] font-mono text-xs uppercase tracking-wider"
      >
        {activeUi.skip}
      </a>

      {/* Variation 8 Unified Structural Shell: 80px Vertical Left Rail + Content Column */}
      <div className="flex-1 flex min-w-0">
        {!isPresenter && !isFullBleed3D && (
          <aside
            aria-label="Filiação institucional"
            className="no-print hidden lg:flex w-20 shrink-0 border-r-[1.5px] border-[#1c1c1c] items-center justify-center py-8"
          >
            <span className="sticky top-1/2 -translate-y-1/2 [writing-mode:vertical-rl] font-mono text-[11px] tracking-[0.5em] uppercase text-[#1c1c1c]/60 whitespace-nowrap select-none">
              {copy.railTitle}
            </span>
          </aside>
        )}

        <div className="flex-1 flex flex-col min-w-0">
          {/* Strict 3-Zone Top Bar Contract (Hidden in Print & Full-Bleed 3D Scene) */}
          {!isFullBleed3D && (
            <header className="no-print border-b-[1.5px] border-[#1c1c1c] bg-[#f2efeb]/90 backdrop-blur-[4px]">
            <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-8 px-6 lg:px-10 py-4">
              {/* Zone 1: Single Text Wordmark */}
              <a
                href="#/"
                onClick={(e) => {
                  e.preventDefault();
                  navigateState({ ...route, view: 'home' });
                }}
                className="font-serif text-xl sm:text-2xl font-medium tracking-[0.06em] uppercase text-[#1c1c1c] whitespace-nowrap shrink-0"
              >
                ICONOCRACIA
              </a>

              {/* Zone 2: 5 Concise Single-Line Navigation Links */}
              <nav
                aria-label="Navegação principal"
                className="hidden md:flex items-center gap-6 lg:gap-8 font-mono text-[11px] uppercase tracking-[0.12em] text-[#1c1c1c]/70"
              >
                <button
                  type="button"
                  onClick={() => navigateState({ ...route, view: 'home' })}
                  className={`py-1 border-b transition-colors whitespace-nowrap shrink-0 ${
                    route.view === 'home' || route.view === 'reader'
                      ? 'border-[#7e2a1f] text-[#7e2a1f] font-bold'
                      : 'border-transparent hover:text-[#1c1c1c]'
                  }`}
                >
                  {copy.navPresentations}
                </button>

                <button
                  type="button"
                  onClick={() => navigateState({ ...route, view: 'atlas' })}
                  className={`py-1 border-b transition-colors whitespace-nowrap shrink-0 ${
                    route.view === 'atlas'
                      ? 'border-[#7e2a1f] text-[#7e2a1f] font-bold'
                      : 'border-transparent hover:text-[#1c1c1c]'
                  }`}
                >
                  {copy.navAtlas}
                </button>

                <button
                  type="button"
                  onClick={() => navigateState({ ...route, view: 'studio' })}
                  className={`py-1 border-b transition-colors whitespace-nowrap shrink-0 ${
                    route.view === 'studio'
                      ? 'border-[#7e2a1f] text-[#7e2a1f] font-bold'
                      : 'border-transparent hover:text-[#1c1c1c]'
                  }`}
                >
                  {copy.navTranslations}
                </button>

                <button
                  type="button"
                  onClick={() => navigateState({ ...route, view: 'apparatus' })}
                  className={`py-1 border-b transition-colors whitespace-nowrap shrink-0 ${
                    route.view === 'apparatus'
                      ? 'border-[#7e2a1f] text-[#7e2a1f] font-bold'
                      : 'border-transparent hover:text-[#1c1c1c]'
                  }`}
                >
                  {copy.navSources}
                </button>

                <button
                  type="button"
                  onClick={() => navigateState({ ...route, view: 'slides' })}
                  className={`py-1 border-b transition-colors whitespace-nowrap shrink-0 ${
                    route.view === 'slides'
                      ? 'border-[#7e2a1f] text-[#7e2a1f] font-bold'
                      : 'border-transparent hover:text-[#1c1c1c]'
                  }`}
                >
                  {copy.navSlides}
                </button>

                <button
                  type="button"
                  onClick={() => navigateState({ ...route, view: 'docs' })}
                  className={`py-1 border-b transition-colors whitespace-nowrap shrink-0 ${
                    route.view === 'docs'
                      ? 'border-[#7e2a1f] text-[#7e2a1f] font-bold'
                      : 'border-transparent hover:text-[#1c1c1c]'
                  }`}
                >
                  {copy.navDocs}
                </button>

                <button
                  type="button"
                  onClick={() => navigateState({ ...route, view: 'drive' })}
                  className={`py-1 border-b transition-colors whitespace-nowrap shrink-0 ${
                    route.view === 'drive'
                      ? 'border-[#7e2a1f] text-[#7e2a1f] font-bold'
                      : 'border-transparent hover:text-[#1c1c1c]'
                  }`}
                >
                  {copy.navDrive}
                </button>
              </nav>

              {/* Zone 3: 1 Primary Action + Mobile Menu Toggle */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    navigateState({
                      ...route,
                      view: route.view === 'presenter' ? 'reader' : 'presenter',
                    })
                  }
                  className="px-4 py-2 font-mono text-[11px] uppercase tracking-[0.1em] border border-[#1c1c1c] text-[#1c1c1c] hover:bg-[#1c1c1c] hover:text-[#f2efeb] transition-colors whitespace-nowrap shrink-0"
                >
                  {route.view === 'presenter' ? copy.backToReaderCta : copy.presenterCta}
                </button>

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen((v) => !v)}
                  className="md:hidden p-2 border border-[#1c1c1c] text-[#1c1c1c] hover:bg-[#1c1c1c] hover:text-[#f2efeb] transition-colors"
                  aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
                  aria-expanded={mobileMenuOpen}
                >
                  {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Collapsible Mobile Nav */}
            {mobileMenuOpen && (
              <nav
                aria-label="Navegação móvel"
                className="md:hidden px-6 py-4 border-t border-[#1c1c1c]/15 bg-white/55 backdrop-blur-[5px] flex flex-col gap-3 font-mono text-xs uppercase tracking-[0.1em]"
              >
                <button
                  type="button"
                  onClick={() => navigateState({ ...route, view: 'home' })}
                  className="text-left py-1 font-bold text-[#1c1c1c]"
                >
                  {copy.navPresentations}
                </button>
                <button
                  type="button"
                  onClick={() => navigateState({ ...route, view: 'slides' })}
                  className="text-left py-1 text-[#1c1c1c]/80"
                >
                  {copy.navSlides}
                </button>
                <button
                  type="button"
                  onClick={() => navigateState({ ...route, view: 'docs' })}
                  className="text-left py-1 text-[#1c1c1c]/80"
                >
                  {copy.navDocs}
                </button>
                <button
                  type="button"
                  onClick={() => navigateState({ ...route, view: 'atlas' })}
                  className="text-left py-1 text-[#1c1c1c]/80"
                >
                  {copy.navAtlas}
                </button>
                <button
                  type="button"
                  onClick={() => navigateState({ ...route, view: 'studio' })}
                  className="text-left py-1 text-[#1c1c1c]/80"
                >
                  {copy.navTranslations}
                </button>
                <button
                  type="button"
                  onClick={() => navigateState({ ...route, view: 'apparatus' })}
                  className="text-left py-1 text-[#1c1c1c]/80"
                >
                  {copy.navSources}
                </button>
                <button
                  type="button"
                  onClick={() => navigateState({ ...route, view: 'drive' })}
                  className="text-left py-1 text-[#1c1c1c]/80"
                >
                  {copy.navDrive}
                </button>
              </nav>
            )}
          </header>
          )}

          {/* Fixed Light Paper Utility Strip (Languages + Firestore Cloud Sync + Drive) */}
          {!isPresenter && !isFullBleed3D && (
            <div className="no-print border-b border-[#1c1c1c]/15 bg-white/35 backdrop-blur-[3px]">
              <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-2 flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] text-[#1c1c1c]/70">
                <div className="flex items-center gap-2">
                  <span className="uppercase tracking-[0.12em]">{copy.langBarLabel}</span>
                  {LANGUAGES.map((l, i) => (
                    <span key={l.code} className="inline-flex items-center">
                      {i > 0 && (
                        <span aria-hidden="true" className="mx-1.5 text-[#1c1c1c]/25">
                          ·
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => navigateState({ ...route, lang: l.code })}
                        className={`uppercase tracking-wider transition-colors whitespace-nowrap shrink-0 ${
                          route.lang === l.code
                            ? 'text-[#7e2a1f] font-bold underline underline-offset-4'
                            : 'hover:text-[#1c1c1c]'
                        }`}
                      >
                        {l.label}
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  {/* Firestore Cloud Sync Auth Toggle */}
                  {store.cloudSyncActive && store.firebaseUser ? (
                    <div className="inline-flex items-center gap-2 text-[#14532d]">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate max-w-[180px]">
                        Firestore: {store.firebaseUser.displayName || 'ativo'}
                      </span>
                      <button
                        type="button"
                        onClick={handleCloudSignOut}
                        title="Encerrar sincronização Firebase"
                        className="inline-flex items-center gap-1 text-[#1c1c1c]/65 hover:text-[#7e2a1f] transition-colors whitespace-nowrap shrink-0"
                      >
                        <LogOut className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={isSigningInCloud}
                      onClick={handleCloudSignIn}
                      className="inline-flex items-center gap-1.5 hover:text-[#7e2a1f] transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
                    >
                      <Database className="w-3.5 h-3.5" />
                      <span>
                        {isSigningInCloud ? 'Autenticando...' : 'Sincronizar Firebase'}
                      </span>
                    </button>
                  )}

                  <span aria-hidden="true" className="text-[#1c1c1c]/25">
                    ·
                  </span>

                  <button
                    type="button"
                    onClick={() => navigateState({ ...route, view: 'drive' })}
                    className="inline-flex items-center gap-1.5 hover:text-[#7e2a1f] transition-colors whitespace-nowrap shrink-0"
                  >
                    <Cloud className="w-3.5 h-3.5" />
                    <span>
                      {needsDriveAuth
                        ? copy.connectDriveLabel
                        : `Drive: ${driveUser?.email || copy.driveConnectedFallback}`}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main Content View */}
          <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
            {route.view === 'home' && (
              <HomePortal
                lang={route.lang}
                ui={activeUi}
                editorial={activeEditorial}
                getReviewStats={store.getDeckReviewStats}
                onChangeLang={(nextLang) => navigateState({ ...route, lang: nextLang })}
                onOpenDeck={(deck, lang, slideIndex = 0) =>
                  navigateState({ view: 'reader', deck, lang, slideIndex })
                }
                onOpenPresenter={(deck, lang) =>
                  navigateState({ view: 'presenter', deck, lang, slideIndex: 0 })
                }
                onOpenAtlasEntry={(entry, compareWithId) =>
                  setLightboxState({ entry, compareId: compareWithId || null })
                }
                onNavigateView={(view, atlasSection) =>
                  navigateState({ ...route, view, atlasSection })
                }
                onNotify={notify}
              />
            )}

            {route.view === 'reader' && (
              <SlideReader
                deck={route.deck}
                lang={route.lang}
                slideIndex={route.slideIndex}
                slides={activeSlides}
                ui={activeUi}
                slideStatus={currentOverride.status}
                isModified={currentModified}
                onChangeSlide={(idx) => navigateState({ ...route, slideIndex: idx })}
                onChangeLang={(nextLang) => navigateState({ ...route, lang: nextLang })}
                onChangeDeck={(nextDeck) =>
                  navigateState({ ...route, deck: nextDeck, slideIndex: 0 })
                }
                onOpenLightbox={(entry, compareWithId) =>
                  setLightboxState({ entry, compareId: compareWithId || null })
                }
                onOpenPresenter={() => navigateState({ ...route, view: 'presenter' })}
                onOpenStudioForSlide={() => navigateState({ ...route, view: 'studio' })}
                onOpenSources={() => navigateState({ ...route, view: 'apparatus' })}
                onOpenGoogleSlides={() => navigateState({ ...route, view: 'slides' })}
                onOpenGoogleDocs={() => navigateState({ ...route, view: 'docs' })}
                onNotify={notify}
              />
            )}

            {route.view === 'presenter' && (
              <PresenterStage
                deck={route.deck}
                lang={route.lang}
                slideIndex={route.slideIndex}
                slides={activeSlides}
                ui={activeUi}
                presenterNote={store.getPresenterNote(route.deck, route.slideIndex, route.lang)}
                onSavePresenterNote={(note) =>
                  store.setPresenterNote(route.deck, route.slideIndex, note, route.lang)
                }
                onChangeSlide={(idx) => navigateState({ ...route, slideIndex: idx })}
                onChangeLang={(nextLang) => navigateState({ ...route, lang: nextLang })}
                onOpenLightbox={(entry, compareWithId) =>
                  setLightboxState({ entry, compareId: compareWithId || null })
                }
                onOpenGoogleSlides={() => navigateState({ ...route, view: 'slides' })}
                onExit={() => navigateState({ ...route, view: 'reader' })}
              />
            )}

            {route.view === 'slides' && (
              <GoogleSlidesWorkspace
                lang={route.lang}
                ui={activeUi}
                user={driveUser}
                needsAuth={needsDriveAuth}
                isSigningIn={isSigningInDrive}
                initialPresentationId={route.googleSlidesId}
                onSignIn={handleDriveSignIn}
                onSignOut={handleDriveSignOut}
                getMergedSlides={store.getMergedSlides}
                getPresenterNote={(deck, idx) => store.getPresenterNote(deck, idx, route.lang)}
                onOpenDeckInReader={(deck, lang, slideIndex = 0) =>
                  navigateState({ view: 'reader', deck, lang, slideIndex })
                }
                onNotify={notify}
              />
            )}

            {route.view === 'docs' && (
              <GoogleDocsWorkspace
                lang={route.lang}
                ui={activeUi}
                user={driveUser}
                needsAuth={needsDriveAuth}
                isSigningIn={isSigningInDrive}
                initialDocId={route.googleDocId}
                onSignIn={handleDriveSignIn}
                onSignOut={handleDriveSignOut}
                getMergedSlides={store.getMergedSlides}
                getPresenterNote={(deck, idx) => store.getPresenterNote(deck, idx, route.lang)}
                onNotify={notify}
              />
            )}

            {route.view === 'atlas' && (
              <AtlasGallery
                lang={route.lang}
                initialSection={route.atlasSection || 'catalog'}
                canSaveToFirestore={store.cloudSyncActive}
                canSaveToDrive={!needsDriveAuth}
                savedAtelierRecords={store.savedAtelierRecords}
                onSaveAtelierRecord={store.saveAtelierRecordToFirestore}
                onDeleteAtelierRecord={store.deleteAtelierRecordFromFirestore}
                onSignInCloud={handleCloudSignIn}
                onOpenDriveView={() => navigateState({ ...route, view: 'drive' })}
                onOpenCabinet3D={() => navigateState({ ...route, view: 'cabinet3d' })}
                onChangeSection={(sec) =>
                  navigateState({ ...route, view: 'atlas', atlasSection: sec })
                }
                onOpenLightbox={(entry, compareWithId) =>
                  setLightboxState({ entry, compareId: compareWithId || null })
                }
                onJumpToSlide={(deck, slideIndex) =>
                  navigateState({ view: 'reader', deck, lang: route.lang, slideIndex })
                }
                onNotify={notify}
              />
            )}

            {route.view === 'cabinet3d' && (
              <Cabinet3DScene
                canSaveToFirestore={store.cloudSyncActive}
                savedSpatialRecords={store.savedAtelierRecords}
                onSaveSpatialRecord={store.saveAtelierRecordToFirestore}
                onSignInCloud={handleCloudSignIn}
                onOpenLightbox={(entry) => setLightboxState({ entry, compareId: null })}
                onJumpToSlide={(deck, slideIndex) =>
                  navigateState({ view: 'reader', deck, lang: route.lang, slideIndex })
                }
                onExitCabinet={() =>
                  navigateState({ ...route, view: 'atlas', atlasSection: 'catalog' })
                }
                onNotify={notify}
              />
            )}

            {route.view === 'studio' && (
              <TranslationStudio
                initialDeck={route.deck}
                initialLang={route.lang}
                initialSlideIndex={route.slideIndex}
                ui={activeUi}
                cloudSyncActive={store.cloudSyncActive}
                onSignInCloud={handleCloudSignIn}
                getMergedSlides={store.getMergedSlides}
                getSlideOverride={store.getSlideOverride}
                isSlideModified={store.isSlideModified}
                getDeckReviewStats={store.getDeckReviewStats}
                onUpdateSlide={store.updateSlideTranslation}
                onResetSlide={store.resetSlideToCanonical}
                onExportDeck={store.exportDeckJson}
                onExportAll={store.exportFullWorkspace}
                onImportJson={store.importWorkspaceJson}
                onOpenInReader={(deck, lang, slideIndex) =>
                  navigateState({ view: 'reader', deck, lang, slideIndex })
                }
                onOpenDriveWorkspace={() => navigateState({ ...route, view: 'drive' })}
                onNotify={notify}
              />
            )}

            {route.view === 'apparatus' && (
              <EditorialApparatus
                lang={route.lang}
                editorial={activeEditorial}
                ui={activeUi}
                canSaveToDrive={!needsDriveAuth}
                canSaveToFirestore={store.cloudSyncActive}
                savedFirestoreNotes={store.savedResearchNotes}
                onSaveNoteToDrive={handleSaveGroundedNoteFromApparatus}
                onSaveNoteToFirestore={handleSaveGroundedNoteToFirestore}
                onDeleteFirestoreNote={store.deleteResearchNoteFromFirestore}
                onSignInCloud={handleCloudSignIn}
                onOpenDriveView={() => navigateState({ ...route, view: 'drive' })}
                onNotify={notify}
                onChangeLang={(nextLang) => navigateState({ ...route, lang: nextLang })}
              />
            )}

            {route.view === 'drive' && (
              <DriveWorkspace
                lang={route.lang}
                ui={activeUi}
                user={driveUser}
                needsAuth={needsDriveAuth}
                isSigningIn={isSigningInDrive}
                onSignIn={handleDriveSignIn}
                onSignOut={handleDriveSignOut}
                getMergedSlides={store.getMergedSlides}
                getPresenterNote={(deck, idx) => store.getPresenterNote(deck, idx, route.lang)}
                buildDeckExportJson={store.buildDeckExportJson}
                buildWorkspaceBackupJson={store.buildWorkspaceBackupJson}
                onImportJson={store.importWorkspaceJson}
                onOpenPresentation={(presentationId) =>
                  navigateState({ ...route, view: 'slides', googleSlidesId: presentationId })
                }
                onOpenGoogleSlidesView={() => navigateState({ ...route, view: 'slides' })}
                onOpenDoc={(docId) =>
                  navigateState({ ...route, view: 'docs', googleDocId: docId })
                }
                onOpenGoogleDocsView={() => navigateState({ ...route, view: 'docs' })}
                onNotify={notify}
              />
            )}
          </main>
        </div>
      </div>

      {/* Variation 8 Full-Span Footer Bar (Hidden in Presenter Stage, Full-Bleed 3D & Print) */}
      {!isPresenter && !isFullBleed3D && (
        <footer className="no-print border-t-[1.5px] border-[#1c1c1c] bg-[#f2efeb] py-4 px-6 lg:px-10 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.12em] text-[#1c1c1c]">
          <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span>PPGD · UFSC · 2026</span>
              <span aria-hidden="true" className="text-[#1c1c1c]/30">
                /
              </span>
              <button
                type="button"
                onClick={() => navigateState({ ...route, view: 'apparatus' })}
                className="hover:text-[#7e2a1f] hover:underline whitespace-nowrap"
              >
                {activeUi.sources}
              </button>
              <span aria-hidden="true" className="text-[#1c1c1c]/30">
                /
              </span>
              <button
                type="button"
                onClick={() => navigateState({ ...route, view: 'studio' })}
                className="hover:text-[#7e2a1f] hover:underline whitespace-nowrap"
              >
                {copy.footerStudio}
              </button>
            </div>

            <span className="border border-[#7e2a1f] text-[#7e2a1f] px-2.5 py-0.5 rounded-[4px] whitespace-nowrap shrink-0">
              {copy.footerStamp}
            </span>

            <span className="text-[#1c1c1c]/80">ICONOCRACIA © VANZIN MENDES</span>
          </div>
        </footer>
      )}

      {/* High-Resolution Iconographic Light Table Modal */}
      <LightboxModal
        entry={lightboxState.entry}
        initialCompareId={lightboxState.compareId}
        onClose={() => setLightboxState({ entry: null, compareId: null })}
        onSelectEntry={(nextEntry) =>
          setLightboxState((prev) => ({ ...prev, entry: nextEntry }))
        }
        onJumpToSlide={(deck, slideIndex) =>
          navigateState({ view: 'reader', deck, lang: route.lang, slideIndex })
        }
      />

      {/* Accessible Toast Notification */}
      <div
        role="status"
        aria-live="polite"
        className={`no-print fixed bottom-5 right-5 z-50 transition-all duration-150 ${
          notice
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
      >
        {notice && (
          <div className="px-4 py-2.5 bg-[#1c1c1c] text-[#f2efeb] font-mono text-xs border border-[#1c1c1c]">
            {notice}
          </div>
        )}
      </div>
    </div>
  );
}

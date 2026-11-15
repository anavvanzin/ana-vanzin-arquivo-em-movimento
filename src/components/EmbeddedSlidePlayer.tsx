import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Expand,
  ExternalLink,
  FileText,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Presentation,
} from 'lucide-react';
import { getAtlasForSlide, LANGUAGES } from '../data/atlasCatalog';
import { PORTAL_COPY } from '../data/portalCopy';
import { AtlasEntry, DeckId, LangCode, SlideItem, UIStrings } from '../types';
import { ArchivalPlateImage } from './ArchivalPlateImage';

interface EmbeddedSlidePlayerProps {
  lang: LangCode;
  ui: UIStrings;
  initialDeck?: DeckId;
  initialSlideIndex?: number;
  getMergedSlides: (deck: DeckId, lang: LangCode) => SlideItem[];
  getPresenterNote: (deck: DeckId, index: number, lang: LangCode) => string;
  onChangeLang: (lang: LangCode) => void;
  onOpenInReader: (deck: DeckId, lang: LangCode, slideIndex: number) => void;
  onOpenPresenter: (deck: DeckId, lang: LangCode, slideIndex: number) => void;
  onOpenLightbox: (entry: AtlasEntry, compareWithId?: string) => void;
}

const PLAYER_LABELS: Record<
  LangCode,
  {
    kicker: string;
    heading: string;
    play: string;
    pause: string;
    fullscreen: string;
    exitFullscreen: string;
    notesBtn: string;
    visualMode: string;
    textMode: string;
    readerBtn: string;
    presenterBtn: string;
    scriptHeading: string;
    platesHeading: string;
    shortcutsHint: string;
    deck01Label: string;
    deck02Label: string;
  }
> = {
  pt: {
    kicker: 'PROJEÇÃO INTEGRADA · DOSSIÊ ICONOCRACIA',
    heading: 'Player interativo das apresentações',
    play: 'Reproduzir',
    pause: 'Pausar',
    fullscreen: 'Tela cheia',
    exitFullscreen: 'Sair da tela cheia',
    notesBtn: 'Roteiro & Texto',
    visualMode: 'Lâmina',
    textMode: 'Texto',
    readerBtn: 'Leitor detalhado',
    presenterBtn: 'Palco',
    scriptHeading: 'Roteiro de tribuna',
    platesHeading: 'Pranchas vinculadas',
    shortcutsHint: 'Atalhos no player: ← / → navegar · F tela cheia · N roteiro',
    deck01Label: '01. Representação & Autenticação (13)',
    deck02Label: '02. Trajetória da Tese (14)',
  },
  en: {
    kicker: 'EMBEDDED PROJECTION · ICONOCRACIA DOSSIER',
    heading: 'Interactive slide player',
    play: 'Play',
    pause: 'Pause',
    fullscreen: 'Fullscreen',
    exitFullscreen: 'Exit fullscreen',
    notesBtn: 'Script & Text',
    visualMode: 'Slide',
    textMode: 'Text',
    readerBtn: 'Detailed reader',
    presenterBtn: 'Presenter',
    scriptHeading: 'Lectern script',
    platesHeading: 'Linked plates',
    shortcutsHint: 'Player shortcuts: ← / → navigate · F fullscreen · N script',
    deck01Label: '01. Representation & Authentication (13)',
    deck02Label: '02. Thesis Trajectory (14)',
  },
  fr: {
    kicker: 'PROJECTION INTÉGRÉE · DOSSIER ICONOCRACIA',
    heading: 'Lecteur interactif des présentations',
    play: 'Lecture',
    pause: 'Pause',
    fullscreen: 'Plein écran',
    exitFullscreen: 'Quitter le plein écran',
    notesBtn: 'Texte & Notes',
    visualMode: 'Diapo',
    textMode: 'Texte',
    readerBtn: 'Lecteur détaillé',
    presenterBtn: 'Présentateur',
    scriptHeading: 'Notes de conférence',
    platesHeading: 'Planches liées',
    shortcutsHint: 'Raccourcis : ← / → naviguer · F plein écran · N notes',
    deck01Label: '01. Représentation & Authentification (13)',
    deck02Label: '02. Parcours de Thèse (14)',
  },
  it: {
    kicker: 'PROIEZIONE INTEGRATA · DOSSIER ICONOCRACIA',
    heading: 'Lettore interattivo delle presentazioni',
    play: 'Riproduci',
    pause: 'Pausa',
    fullscreen: 'Schermo intero',
    exitFullscreen: 'Esci da schermo intero',
    notesBtn: 'Testo & Note',
    visualMode: 'Diapo',
    textMode: 'Testo',
    readerBtn: 'Lettore dettagliato',
    presenterBtn: 'Relatrice',
    scriptHeading: 'Traccia orale',
    platesHeading: 'Tavole collegate',
    shortcutsHint: 'Scorciatoie: ← / → naviga · F schermo intero · N note',
    deck01Label: '01. Rappresentazione & Autenticazione (13)',
    deck02Label: '02. Percorso della Tesi (14)',
  },
  nl: {
    kicker: 'INGEBOUWDE PROJECTIE · DOSSIER ICONOCRACIA',
    heading: 'Interactieve diaspeler',
    play: 'Afspelen',
    pause: 'Pauzeren',
    fullscreen: 'Volledig scherm',
    exitFullscreen: 'Volledig scherm sluiten',
    notesBtn: 'Tekst & Notities',
    visualMode: 'Dia',
    textMode: 'Tekst',
    readerBtn: 'Gedetailleerde lezer',
    presenterBtn: 'Spreker',
    scriptHeading: 'Spreektekst',
    platesHeading: 'Gekoppelde platen',
    shortcutsHint: 'Sneltoetsen: ← / → navigeren · F volledig scherm · N notities',
    deck01Label: '01. Representatie & Authenticatie (13)',
    deck02Label: '02. Traject van het Proefschrift (14)',
  },
};

export function EmbeddedSlidePlayer({
  lang,
  ui,
  initialDeck = 'representacao',
  initialSlideIndex = 0,
  getMergedSlides,
  getPresenterNote,
  onChangeLang,
  onOpenInReader,
  onOpenPresenter,
  onOpenLightbox,
}: EmbeddedSlidePlayerProps) {
  const [activeDeck, setActiveDeck] = useState<DeckId>(initialDeck);
  const [slideIndex, setSlideIndex] = useState<number>(initialSlideIndex);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [autoplaySec, setAutoplaySec] = useState<number>(8);
  const [showNotes, setShowNotes] = useState<boolean>(false);
  const [stageMode, setStageMode] = useState<'visual' | 'text'>('visual');
  const [isExpandedOverlay, setIsExpandedOverlay] = useState<boolean>(false);
  const [isNativeFullscreen, setIsNativeFullscreen] = useState<boolean>(false);

  const playerShellRef = useRef<HTMLDivElement | null>(null);

  const slides = getMergedSlides(activeDeck, lang);
  const safeIndex = Math.max(0, Math.min(slides.length - 1, slideIndex));
  const current = slides[safeIndex];
  const linkedAtlas = getAtlasForSlide(activeDeck, safeIndex);
  const speakerNote = getPresenterNote(activeDeck, safeIndex, lang);
  const labels = PLAYER_LABELS[lang] || PLAYER_LABELS.pt;
  const copy = PORTAL_COPY[lang] || PORTAL_COPY.pt;

  const isFullscreenActive = isNativeFullscreen || isExpandedOverlay;
  const hasVisualSlideImage = Boolean(current?.slideImage);
  const showVisualFrame = hasVisualSlideImage && stageMode === 'visual';

  const handleSelectDeck = useCallback((nextDeck: DeckId) => {
    setActiveDeck(nextDeck);
    setSlideIndex(0);
    setIsPlaying(false);
    setStageMode('visual');
  }, []);

  const goPrev = useCallback(() => {
    setSlideIndex((idx) => (idx > 0 ? idx - 1 : idx));
  }, []);

  const goNext = useCallback(() => {
    setSlideIndex((idx) => (idx < slides.length - 1 ? idx + 1 : idx));
  }, [slides.length]);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => {
      setSlideIndex((idx) => {
        if (idx >= slides.length - 1) {
          return 0;
        }
        return idx + 1;
      });
    }, autoplaySec * 1000);
    return () => window.clearInterval(timer);
  }, [autoplaySec, isPlaying, slides.length]);

  useEffect(() => {
    const onFsChange = () => {
      const active = Boolean(document.fullscreenElement);
      setIsNativeFullscreen(active);
      if (!active) {
        setIsExpandedOverlay(false);
      }
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (isFullscreenActive) {
      setIsExpandedOverlay(false);
      if (document.fullscreenElement) {
        try {
          await document.exitFullscreen();
        } catch {
          // Ignore exit error
        }
      }
      return;
    }

    setIsExpandedOverlay(true);
    const el = playerShellRef.current;
    if (el && typeof el.requestFullscreen === 'function') {
      try {
        await el.requestFullscreen();
      } catch {
        // Iframe or browser restriction: fixed overlay fallback stays active
      }
    }
  }, [isFullscreenActive]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable)
      ) {
        return;
      }

      const shellHasFocus =
        isFullscreenActive ||
        Boolean(playerShellRef.current && target && playerShellRef.current.contains(target));

      if (!shellHasFocus) return;

      if (e.key === 'Escape' && isExpandedOverlay && !document.fullscreenElement) {
        e.preventDefault();
        setIsExpandedOverlay(false);
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        setIsPlaying(false);
        goNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        setIsPlaying(false);
        goPrev();
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        void toggleFullscreen();
      } else if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setShowNotes((v) => !v);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [goNext, goPrev, isExpandedOverlay, isFullscreenActive, toggleFullscreen]);

  if (!current) return null;

  const progressPct = ((safeIndex + 1) / slides.length) * 100;
  const isTwoCol =
    current.blocks.length === 2 && current.blocks.every((b) => Boolean(b.label.trim()));
  const isFourGrid =
    current.blocks.length === 4 && current.blocks.every((b) => Boolean(b.label.trim()));

  return (
    <section
      id="slide-player"
      aria-label={labels.heading}
      className="border-b-[1.5px] border-[#1c1c1c] dark:border-[#f2efeb]/30 bg-[#ebe6df]/75 dark:bg-[#121212] px-4 sm:px-8 lg:px-12 py-8 lg:py-10"
    >
      <div
        ref={playerShellRef}
        tabIndex={-1}
        className={
          isFullscreenActive
            ? 'fixed inset-0 z-50 bg-[#121212] text-[#f2efeb] flex flex-col justify-between p-4 sm:p-6 overflow-y-auto focus:outline-none'
            : 'max-w-[1360px] mx-auto bg-[#f2efeb] dark:bg-[#161616] border-[1.5px] border-[#1c1c1c] dark:border-[#f2efeb]/45 shadow-[6px_6px_0px_0px_#1c1c1c] dark:shadow-[6px_6px_0px_0px_rgba(242,239,235,0.2)] focus:outline-none'
        }
      >
        {/* Top Player Header Bar: Deck Switcher + Language + Slide Counter */}
        <div
          className={`px-4 sm:px-6 py-3.5 border-b flex flex-wrap items-center justify-between gap-3 ${
            isFullscreenActive
              ? 'border-[#f2efeb]/20 bg-[#181818]'
              : 'border-[#1c1c1c] dark:border-[#f2efeb]/25 bg-white/75 dark:bg-[#1b1b1b]'
          }`}
        >
          <div className="flex flex-wrap items-center gap-3">
            <div className="space-y-0.5 mr-2">
              <p
                className={`font-mono text-[10px] uppercase tracking-[0.18em] font-bold ${
                  isFullscreenActive ? 'text-[#e5988b]' : 'text-[#7e2a1f] dark:text-[#e5988b]'
                }`}
              >
                {labels.kicker}
              </p>
              <h2
                className={`font-serif text-xl sm:text-2xl font-medium leading-tight ${
                  isFullscreenActive ? 'text-[#f2efeb]' : 'text-[#1c1c1c] dark:text-[#f2efeb]'
                }`}
              >
                {labels.heading}
              </h2>
            </div>

            {/* Deck Switcher */}
            <div
              role="group"
              aria-label="Selecionar apresentação"
              className={`flex items-center border ${
                isFullscreenActive
                  ? 'border-[#f2efeb]/30 bg-[#121212]'
                  : 'border-[#1c1c1c] dark:border-[#f2efeb]/40 bg-[#f2efeb] dark:bg-[#121212]'
              }`}
            >
              <button
                type="button"
                onClick={() => handleSelectDeck('representacao')}
                className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] transition-colors whitespace-nowrap shrink-0 ${
                  activeDeck === 'representacao'
                    ? isFullscreenActive
                      ? 'bg-[#7e2a1f] text-[#f2efeb] font-bold'
                      : 'bg-[#1c1c1c] dark:bg-[#f2efeb] text-[#f2efeb] dark:text-[#0d0d0d] font-bold'
                    : isFullscreenActive
                    ? 'text-[#f2efeb]/70 hover:text-[#f2efeb]'
                    : 'text-[#1c1c1c]/75 dark:text-[#f2efeb]/75 hover:text-[#1c1c1c] dark:hover:text-[#f2efeb]'
                }`}
              >
                {labels.deck01Label}
              </button>
              <button
                type="button"
                onClick={() => handleSelectDeck('trajeto')}
                className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] border-l transition-colors whitespace-nowrap shrink-0 ${
                  isFullscreenActive ? 'border-[#f2efeb]/30' : 'border-[#1c1c1c] dark:border-[#f2efeb]/40'
                } ${
                  activeDeck === 'trajeto'
                    ? isFullscreenActive
                      ? 'bg-[#7e2a1f] text-[#f2efeb] font-bold'
                      : 'bg-[#1c1c1c] dark:bg-[#f2efeb] text-[#f2efeb] dark:text-[#0d0d0d] font-bold'
                    : isFullscreenActive
                    ? 'text-[#f2efeb]/70 hover:text-[#f2efeb]'
                    : 'text-[#1c1c1c]/75 dark:text-[#f2efeb]/75 hover:text-[#1c1c1c] dark:hover:text-[#f2efeb]'
                }`}
              >
                {labels.deck02Label}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* 5-Language Selector */}
            <div
              role="group"
              aria-label={ui.lang}
              className={`flex items-center border p-0.5 ${
                isFullscreenActive
                  ? 'border-[#f2efeb]/25 bg-[#121212]'
                  : 'border-[#1c1c1c]/40 dark:border-[#f2efeb]/30 bg-white dark:bg-[#121212]'
              }`}
            >
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => onChangeLang(l.code)}
                  title={l.nativeLabel}
                  className={`px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider transition-colors whitespace-nowrap shrink-0 ${
                    l.code === lang
                      ? 'bg-[#7e2a1f] text-[#f2efeb] font-bold'
                      : isFullscreenActive
                      ? 'text-[#f2efeb]/70 hover:text-[#f2efeb]'
                      : 'text-[#1c1c1c]/70 dark:text-[#f2efeb]/75 hover:text-[#1c1c1c] dark:hover:text-[#f2efeb]'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            <span
              className={`font-mono text-xs font-bold tabular-nums px-2.5 py-1 border ${
                isFullscreenActive
                  ? 'border-[#f2efeb]/25 bg-[#121212] text-[#e5988b]'
                  : 'border-[#1c1c1c]/25 dark:border-[#f2efeb]/30 bg-[#f2efeb] dark:bg-[#121212] text-[#7e2a1f] dark:text-[#e5988b]'
              }`}
            >
              {String(safeIndex + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Continuous Progress Bar */}
        <div
          role="progressbar"
          aria-label={ui.toc}
          aria-valuemin={1}
          aria-valuemax={slides.length}
          aria-valuenow={safeIndex + 1}
          className={`w-full h-[3px] ${isFullscreenActive ? 'bg-[#2a2a2a]' : 'bg-[#1c1c1c]/15 dark:bg-[#f2efeb]/15'}`}
        >
          <div
            className="h-full bg-[#7e2a1f] dark:bg-[#e5988b] transition-transform duration-200 origin-left"
            style={{ transform: `scaleX(${progressPct / 100})` }}
          />
        </div>

        {/* Main Player Stage + Optional Side Script/Notes Rail */}
        <div
          className={`grid grid-cols-1 ${
            showNotes ? 'lg:grid-cols-12' : ''
          } gap-0 flex-1 items-stretch`}
        >
          {/* 16:9 Slide Viewport */}
          <div
            className={`${
              showNotes ? 'lg:col-span-8' : ''
            } p-4 sm:p-6 bg-[#141414] flex items-center justify-center`}
          >
            <div className="relative group w-full max-w-5xl aspect-[16/9] bg-[#0e0e0e] border border-[#f2efeb]/20 overflow-hidden shadow-2xl flex items-center justify-center">
              {showVisualFrame && current.slideImage ? (
                <img
                  src={current.slideImage}
                  alt={current.title.replace(/\n/g, ' ')}
                  className="w-full h-full object-contain select-none"
                  loading="eager"
                />
              ) : (
                /* 16:9 Typographic Slide Stage (for DOC. 02 Trajetória & Text Mode) */
                <div className="w-full h-full bg-[#181818] text-[#f2efeb] p-5 sm:p-8 lg:p-10 flex flex-col justify-between overflow-y-auto">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3 border-b border-[#f2efeb]/15 pb-2.5 font-mono text-[10px] uppercase tracking-[0.16em]">
                      <span className="text-[#e5988b] font-bold">
                        {activeDeck === 'trajeto'
                          ? `DOC. 02 · ${ui.trajeto}`
                          : `DOC. 01 · ${ui.representacao}`}
                      </span>
                      <span className="tabular-nums text-[#f2efeb]/65">
                        {lang.toUpperCase()} · {String(safeIndex + 1).padStart(2, '0')} /{' '}
                        {String(slides.length).padStart(2, '0')}
                      </span>
                    </div>

                    <h3 className="font-serif font-light text-xl sm:text-3xl lg:text-[2.25rem] leading-[1.12] text-[#f2efeb] whitespace-pre-line">
                      {current.title}
                    </h3>

                    <div
                      className={
                        isTwoCol || isFourGrid
                          ? 'grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1'
                          : 'space-y-3 pt-1 max-w-3xl'
                      }
                    >
                      {current.blocks.map((block, bIdx) => (
                        <div
                          key={bIdx}
                          className="p-3 bg-[#121212] border border-[#f2efeb]/15 space-y-1"
                        >
                          {block.label && (
                            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#e5988b]">
                              {block.label}
                            </p>
                          )}
                          <p className="text-xs sm:text-sm leading-relaxed text-[#f2efeb]/90 whitespace-pre-line">
                            {block.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {current.footer && (
                    <div className="pt-3 mt-4 border-t border-[#f2efeb]/15 flex items-center justify-between gap-4">
                      <p className="font-serif italic text-xs sm:text-sm text-[#f2efeb]/70">
                        {current.footer}
                      </p>
                      {current.source && /^https:\/\//.test(current.source) && (
                        <a
                          href={current.source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-[#e5988b] hover:underline shrink-0"
                        >
                          <span>{ui.source}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Floating Prev / Next Arrows */}
              <button
                type="button"
                disabled={safeIndex === 0}
                onClick={() => {
                  setIsPlaying(false);
                  goPrev();
                }}
                aria-label={ui.previous}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-[#1c1c1c]/85 hover:bg-[#7e2a1f] text-[#f2efeb] border border-[#f2efeb]/25 disabled:opacity-0 disabled:pointer-events-none opacity-80 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 transition-opacity"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                disabled={safeIndex >= slides.length - 1}
                onClick={() => {
                  setIsPlaying(false);
                  goNext();
                }}
                aria-label={ui.next}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-[#1c1c1c]/85 hover:bg-[#7e2a1f] text-[#f2efeb] border border-[#f2efeb]/25 disabled:opacity-0 disabled:pointer-events-none opacity-80 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 transition-opacity"
              >
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Corner Caption Tag */}
              <div className="absolute bottom-3 left-3 bg-[#1c1c1c]/90 text-[#f2efeb] px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest border border-[#f2efeb]/20 pointer-events-none">
                {activeDeck === 'representacao' ? 'DOC. 01' : 'DOC. 02'} · SLIDE{' '}
                {String(safeIndex + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
              </div>
            </div>
          </div>

          {/* Toggleable Script, Text & Linked Plates Sidebar */}
          {showNotes && (
            <aside
              className={`lg:col-span-4 border-t lg:border-t-0 lg:border-l p-5 flex flex-col justify-between gap-4 max-h-[540px] overflow-y-auto ${
                isFullscreenActive
                  ? 'border-[#f2efeb]/20 bg-[#1a1a1a] text-[#f2efeb]'
                  : 'border-[#1c1c1c] dark:border-[#f2efeb]/25 bg-white/85 dark:bg-[#1a1a1a] text-[#1c1c1c] dark:text-[#f2efeb]'
              }`}
            >
              <div className="space-y-4">
                <div
                  className={`pb-3 border-b ${
                    isFullscreenActive ? 'border-[#f2efeb]/15' : 'border-[#1c1c1c]/15 dark:border-[#f2efeb]/15'
                  }`}
                >
                  <p
                    className={`font-mono text-[10px] uppercase tracking-[0.14em] ${
                      isFullscreenActive ? 'text-[#e5988b]' : 'text-[#7e2a1f] dark:text-[#e5988b]'
                    }`}
                  >
                    SLIDE {String(safeIndex + 1).padStart(2, '0')} · {lang.toUpperCase()}
                  </p>
                  <h3 className="font-serif text-xl font-medium leading-snug mt-1 whitespace-pre-line">
                    {current.title}
                  </h3>
                </div>

                {/* Structured Blocks */}
                <div className="space-y-2.5">
                  {current.blocks.map((b, idx) => (
                    <div
                      key={idx}
                      className={`p-3 border space-y-1 ${
                        isFullscreenActive
                          ? 'bg-[#121212] border-[#f2efeb]/15'
                          : 'bg-[#f2efeb]/80 dark:bg-[#121212] border-[#1c1c1c]/15 dark:border-[#f2efeb]/15'
                      }`}
                    >
                      {b.label && (
                        <p
                          className={`font-mono text-[9px] uppercase tracking-wider ${
                            isFullscreenActive ? 'text-[#e5988b]' : 'text-[#7e2a1f] dark:text-[#e5988b]'
                          }`}
                        >
                          {b.label}
                        </p>
                      )}
                      <p className="text-xs leading-relaxed opacity-90 whitespace-pre-line">
                        {b.text}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Lectern Script */}
                {speakerNote && (
                  <div
                    className={`pt-3 border-t space-y-1.5 ${
                      isFullscreenActive ? 'border-[#f2efeb]/15' : 'border-[#1c1c1c]/15 dark:border-[#f2efeb]/15'
                    }`}
                  >
                    <p
                      className={`font-mono text-[10px] uppercase tracking-[0.14em] ${
                        isFullscreenActive ? 'text-[#e5988b]' : 'text-[#7e2a1f] dark:text-[#e5988b]'
                      }`}
                    >
                      {labels.scriptHeading}
                    </p>
                    <p className="text-xs leading-relaxed opacity-85 whitespace-pre-line">
                      {speakerNote}
                    </p>
                  </div>
                )}

                {/* Linked Atlas Plates */}
                {linkedAtlas.length > 0 && (
                  <div
                    className={`pt-3 border-t space-y-2 ${
                      isFullscreenActive ? 'border-[#f2efeb]/15' : 'border-[#1c1c1c]/15 dark:border-[#f2efeb]/15'
                    }`}
                  >
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] opacity-70">
                      {labels.platesHeading} ({linkedAtlas.length})
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {linkedAtlas.map((plate) => (
                        <button
                          key={plate.id}
                          type="button"
                          onClick={() => onOpenLightbox(plate)}
                          className={`group text-left border overflow-hidden transition-colors ${
                            isFullscreenActive
                              ? 'border-[#f2efeb]/25 hover:border-[#e5988b] bg-[#121212]'
                              : 'border-[#1c1c1c]/25 dark:border-[#f2efeb]/25 hover:border-[#1c1c1c] dark:hover:border-[#e5988b] bg-white dark:bg-[#121212]'
                          }`}
                        >
                          <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#e7e2da] dark:bg-[#0e0e0e]">
                            <ArchivalPlateImage
                              src={plate.imageSrc}
                              alt={plate.imageAlt}
                              accessionCode={plate.accessionCode}
                              title={plate.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <span className="absolute bottom-1 right-1 p-1 bg-[#1c1c1c] text-[#f2efeb]">
                              <Expand className="w-2.5 h-2.5" />
                            </span>
                          </div>
                          <p className="p-1.5 font-mono text-[9px] truncate">
                            {plate.year} · {plate.title}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {current.footer && (
                <p className="pt-2 border-t border-current/15 font-serif italic text-xs opacity-75">
                  {current.footer}
                </p>
              )}
            </aside>
          )}
        </div>

        {/* Bottom Transport, Slide Scrubber & Mode Controls */}
        <div
          className={`px-4 sm:px-6 py-3.5 border-t space-y-3 ${
            isFullscreenActive
              ? 'border-[#f2efeb]/20 bg-[#181818]'
              : 'border-[#1c1c1c] dark:border-[#f2efeb]/25 bg-white/75 dark:bg-[#1b1b1b]'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Transport Controls: Prev, Play/Pause, Autoplay Interval, Next */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  goPrev();
                }}
                disabled={safeIndex === 0}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] border transition-colors whitespace-nowrap shrink-0 disabled:opacity-35 disabled:pointer-events-none ${
                  isFullscreenActive
                    ? 'border-[#f2efeb]/35 text-[#f2efeb] hover:bg-[#f2efeb] hover:text-[#1c1c1c]'
                    : 'border-[#1c1c1c] dark:border-[#f2efeb]/50 text-[#1c1c1c] dark:text-[#f2efeb] hover:bg-[#1c1c1c] hover:text-[#f2efeb] dark:hover:bg-[#f2efeb] dark:hover:text-[#0d0d0d]'
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{ui.previous}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] border transition-colors whitespace-nowrap shrink-0 ${
                  isPlaying
                    ? 'bg-[#7e2a1f] border-[#7e2a1f] text-[#f2efeb]'
                    : isFullscreenActive
                    ? 'border-[#f2efeb]/35 bg-[#242424] text-[#f2efeb] hover:border-[#e5988b]'
                    : 'border-[#1c1c1c] dark:border-[#f2efeb]/50 bg-[#f2efeb] dark:bg-[#242424] text-[#1c1c1c] dark:text-[#f2efeb] hover:bg-[#1c1c1c] hover:text-[#f2efeb] dark:hover:border-[#e5988b]'
                }`}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? labels.pause : labels.play}</span>
              </button>

              <select
                value={autoplaySec}
                onChange={(e) => setAutoplaySec(Number(e.target.value))}
                aria-label="Intervalo de reprodução automática"
                className={`px-2 py-1.5 font-mono text-[10px] border focus:outline-none ${
                  isFullscreenActive
                    ? 'bg-[#121212] border-[#f2efeb]/25 text-[#f2efeb]'
                    : 'bg-[#f2efeb] dark:bg-[#121212] border-[#1c1c1c]/40 dark:border-[#f2efeb]/30 text-[#1c1c1c] dark:text-[#f2efeb]'
                }`}
              >
                <option value={6}>6s</option>
                <option value={8}>8s</option>
                <option value={12}>12s</option>
                <option value={20}>20s</option>
              </select>

              <button
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  goNext();
                }}
                disabled={safeIndex >= slides.length - 1}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] border transition-colors whitespace-nowrap shrink-0 disabled:opacity-35 disabled:pointer-events-none ${
                  isFullscreenActive
                    ? 'bg-[#f2efeb] border-[#f2efeb] text-[#1c1c1c] hover:bg-[#7e2a1f] hover:border-[#7e2a1f] hover:text-[#f2efeb]'
                    : 'bg-[#1c1c1c] dark:bg-[#f2efeb] border-[#1c1c1c] dark:border-[#f2efeb] text-[#f2efeb] dark:text-[#0d0d0d] hover:bg-[#7e2a1f] hover:border-[#7e2a1f] dark:hover:bg-[#e5988b] dark:hover:border-[#e5988b]'
                }`}
              >
                <span>{ui.next}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Right Controls: Visual/Text switch (for DOC. 01), Notes, Reader, Presenter, Fullscreen */}
            <div className="flex flex-wrap items-center gap-2">
              {hasVisualSlideImage && (
                <div
                  role="group"
                  aria-label="Modo do quadro"
                  className={`flex items-center border p-0.5 font-mono text-[10px] uppercase tracking-wider ${
                    isFullscreenActive
                      ? 'border-[#f2efeb]/25 bg-[#121212]'
                      : 'border-[#1c1c1c]/40 dark:border-[#f2efeb]/30 bg-[#f2efeb] dark:bg-[#121212]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setStageMode('visual')}
                    className={`px-2 py-1 transition-colors whitespace-nowrap shrink-0 ${
                      stageMode === 'visual'
                        ? isFullscreenActive
                          ? 'bg-[#f2efeb] text-[#1c1c1c] font-bold'
                          : 'bg-[#1c1c1c] dark:bg-[#f2efeb] text-[#f2efeb] dark:text-[#0d0d0d] font-bold'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    {labels.visualMode}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStageMode('text')}
                    className={`px-2 py-1 transition-colors whitespace-nowrap shrink-0 ${
                      stageMode === 'text'
                        ? isFullscreenActive
                          ? 'bg-[#f2efeb] text-[#1c1c1c] font-bold'
                          : 'bg-[#1c1c1c] dark:bg-[#f2efeb] text-[#f2efeb] dark:text-[#0d0d0d] font-bold'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    {labels.textMode}
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowNotes((v) => !v)}
                aria-pressed={showNotes}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] border transition-colors whitespace-nowrap shrink-0 ${
                  showNotes
                    ? 'bg-[#7e2a1f] border-[#7e2a1f] text-[#f2efeb]'
                    : isFullscreenActive
                    ? 'border-[#f2efeb]/30 text-[#f2efeb]/85 hover:border-[#f2efeb]'
                    : 'border-[#1c1c1c]/45 dark:border-[#f2efeb]/35 text-[#1c1c1c] dark:text-[#f2efeb] hover:border-[#1c1c1c] dark:hover:border-[#f2efeb]'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{labels.notesBtn}</span>
              </button>

              {!isFullscreenActive && (
                <>
                  <button
                    type="button"
                    onClick={() => onOpenInReader(activeDeck, lang, safeIndex)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] border border-[#1c1c1c]/45 dark:border-[#f2efeb]/35 text-[#1c1c1c] dark:text-[#f2efeb] hover:bg-[#1c1c1c] hover:text-[#f2efeb] dark:hover:bg-[#f2efeb] dark:hover:text-[#0d0d0d] transition-colors whitespace-nowrap shrink-0"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{labels.readerBtn}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenPresenter(activeDeck, lang, safeIndex)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] border border-[#1c1c1c]/45 dark:border-[#f2efeb]/35 text-[#1c1c1c] dark:text-[#f2efeb] hover:bg-[#1c1c1c] hover:text-[#f2efeb] dark:hover:bg-[#f2efeb] dark:hover:text-[#0d0d0d] transition-colors whitespace-nowrap shrink-0"
                  >
                    <Presentation className="w-3.5 h-3.5" />
                    <span>{labels.presenterBtn}</span>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => void toggleFullscreen()}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] border transition-colors whitespace-nowrap shrink-0 ${
                  isFullscreenActive
                    ? 'bg-[#7e2a1f] border-[#7e2a1f] text-[#f2efeb]'
                    : 'border-[#1c1c1c] dark:border-[#f2efeb] bg-[#1c1c1c] dark:bg-[#f2efeb] text-[#f2efeb] dark:text-[#0d0d0d] hover:bg-[#7e2a1f] hover:border-[#7e2a1f] dark:hover:bg-[#e5988b] dark:hover:border-[#e5988b]'
                }`}
              >
                {isFullscreenActive ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5" />
                    <span>{labels.exitFullscreen}</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>{labels.fullscreen}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Direct Slide Scrubber Strip (01..13 / 01..14) + Active Slide Title */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-current/12">
            <div
              role="tablist"
              aria-label={copy.deck01Short}
              className="flex flex-wrap items-center gap-1"
            >
              {slides.map((s, idx) => {
                const active = idx === safeIndex;
                return (
                  <button
                    key={idx}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => {
                      setIsPlaying(false);
                      setSlideIndex(idx);
                    }}
                    title={s.title.replace(/\n/g, ' ')}
                    className={`w-7 h-7 font-mono text-[10px] tabular-nums border transition-colors ${
                      active
                        ? 'bg-[#7e2a1f] border-[#7e2a1f] text-[#f2efeb] font-bold'
                        : isFullscreenActive
                        ? 'border-[#f2efeb]/20 text-[#f2efeb]/65 hover:border-[#f2efeb]/60 hover:text-[#f2efeb]'
                        : 'border-[#1c1c1c]/25 dark:border-[#f2efeb]/25 bg-white/70 dark:bg-[#121212] text-[#1c1c1c]/75 dark:text-[#f2efeb]/75 hover:border-[#1c1c1c] dark:hover:border-[#f2efeb] hover:text-[#1c1c1c] dark:hover:text-[#f2efeb]'
                    }`}
                  >
                    {String(idx + 1).padStart(2, '0')}
                  </button>
                );
              })}
            </div>

            <p className="font-serif italic text-xs sm:text-sm opacity-75 truncate max-w-md">
              {current.title.replace(/\n/g, ' ')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

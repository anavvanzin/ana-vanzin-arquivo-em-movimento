import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Columns2,
  Expand,
  ExternalLink,
  FileText,
  Link2,
  List,
  Maximize2,
  PenLine,
  Presentation,
  Printer,
} from 'lucide-react';
import { getAtlasForSlide, LANGUAGES } from '../data/atlasCatalog';
import { PORTAL_COPY } from '../data/portalCopy';
import { AtlasEntry, DeckId, LangCode, ReviewStatus, SlideItem, UIStrings } from '../types';
import { ArchivalPlateImage } from './ArchivalPlateImage';

interface SlideReaderProps {
  deck: DeckId;
  lang: LangCode;
  slideIndex: number;
  slides: SlideItem[];
  ui: UIStrings;
  slideStatus?: ReviewStatus;
  isModified: boolean;
  onChangeSlide: (index: number) => void;
  onChangeLang: (lang: LangCode) => void;
  onChangeDeck: (deck: DeckId) => void;
  onOpenLightbox: (entry: AtlasEntry, compareWithId?: string) => void;
  onOpenPresenter: () => void;
  onOpenStudioForSlide: () => void;
  onOpenSources: () => void;
  onOpenGoogleSlides?: () => void;
  onOpenGoogleDocs?: () => void;
  onNotify: (msg: string) => void;
}

export function SlideReader({
  deck,
  lang,
  slideIndex,
  slides,
  ui,
  slideStatus,
  isModified,
  onChangeSlide,
  onChangeLang,
  onChangeDeck,
  onOpenLightbox,
  onOpenPresenter,
  onOpenStudioForSlide,
  onOpenSources,
  onOpenGoogleSlides,
  onOpenGoogleDocs,
  onNotify,
}: SlideReaderProps) {
  const [tocOpen, setTocOpen] = useState(false);

  const safeIndex = Math.max(0, Math.min(slides.length - 1, slideIndex));
  const current = slides[safeIndex];
  const linkedAtlas = getAtlasForSlide(deck, safeIndex);
  const copy = PORTAL_COPY[lang] || PORTAL_COPY.pt;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable)
      ) {
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        if (safeIndex < slides.length - 1) onChangeSlide(safeIndex + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        if (safeIndex > 0) onChangeSlide(safeIndex - 1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        onChangeSlide(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        onChangeSlide(slides.length - 1);
      } else if (e.key.toLowerCase() === 't') {
        e.preventDefault();
        setTocOpen((prev) => !prev);
      } else if (e.key.toLowerCase() === 'p') {
        e.preventDefault();
        onOpenPresenter();
      } else if (e.key.toLowerCase() === 'z' && linkedAtlas.length > 0) {
        e.preventDefault();
        onOpenLightbox(
          linkedAtlas[0],
          linkedAtlas.length > 1 ? linkedAtlas[1].id : undefined
        );
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [linkedAtlas, onChangeSlide, onOpenLightbox, onOpenPresenter, safeIndex, slides.length]);

  if (!current) return null;

  const isTwoColumnComparison =
    current.blocks.length === 2 && current.blocks.every((b) => Boolean(b.label.trim()));
  const isFourFunctionsGrid =
    current.blocks.length === 4 && current.blocks.every((b) => Boolean(b.label.trim()));

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      onNotify(ui.copied);
    } catch {
      onNotify(ui.copyError);
    }
  };

  const handleToggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      onNotify(ui.fullscreenError);
    }
  };

  const progressPct = ((safeIndex + 1) / slides.length) * 100;

  return (
    <div>
      {/* Interactive Reader View (Hidden on Print) */}
      <div className="no-print max-w-[1360px] mx-auto px-6 sm:px-10 py-8 lg:py-10 space-y-8">
        {/* Workspace Utility Sub-bar */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div
                role="group"
                aria-label="Alternar dossiê"
                className="flex items-center border border-[#1c1c1c] bg-white/50"
              >
                <button
                  type="button"
                  onClick={() => onChangeDeck('representacao')}
                  className={`px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors whitespace-nowrap shrink-0 ${
                    deck === 'representacao'
                      ? 'bg-[#1c1c1c] text-[#f2efeb]'
                      : 'text-[#1c1c1c]/75 hover:text-[#1c1c1c]'
                  }`}
                >
                  {copy.deck01Short}
                </button>
                <button
                  type="button"
                  onClick={() => onChangeDeck('trajeto')}
                  className={`px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.1em] border-l border-[#1c1c1c] transition-colors whitespace-nowrap shrink-0 ${
                    deck === 'trajeto'
                      ? 'bg-[#1c1c1c] text-[#f2efeb]'
                      : 'text-[#1c1c1c]/75 hover:text-[#1c1c1c]'
                  }`}
                >
                  {copy.deck02Short}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setTocOpen((v) => !v)}
                aria-expanded={tocOpen}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.1em] border border-[#1c1c1c] text-[#1c1c1c] hover:bg-[#1c1c1c] hover:text-[#f2efeb] transition-colors whitespace-nowrap shrink-0"
              >
                <List className="w-3.5 h-3.5" />
                <span>{ui.toc}</span>
              </button>
            </div>

            {/* 5-Language Synced Selector */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#1c1c1c]/60 hidden sm:inline">
                {ui.lang}:
              </span>
              <div
                role="navigation"
                aria-label={ui.lang}
                className="flex items-center border border-[#1c1c1c]/40 bg-white/50 p-0.5"
              >
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => onChangeLang(l.code)}
                    title={l.nativeLabel}
                    aria-current={l.code === lang ? 'true' : undefined}
                    className={`px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors whitespace-nowrap shrink-0 ${
                      l.code === lang
                        ? 'bg-[#7e2a1f] text-[#f2efeb] font-bold'
                        : 'text-[#1c1c1c]/70 hover:text-[#1c1c1c]'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2px Continuous Reading Depth Rail */}
          <div
            role="progressbar"
            aria-label={ui.toc}
            aria-valuemin={1}
            aria-valuemax={slides.length}
            aria-valuenow={safeIndex + 1}
            className="w-full h-[2px] bg-[#1c1c1c]/15 overflow-hidden"
          >
            <div
              className="h-full bg-[#7e2a1f] transition-transform duration-150 origin-left"
              style={{ transform: `scaleX(${progressPct / 100})` }}
            />
          </div>
        </div>

        {/* Collapsible Table of Contents Drawer */}
        {tocOpen && (
          <nav
            aria-label={ui.toc}
            className="p-6 bg-white/75 backdrop-blur-[4px] border-[1.5px] border-[#1c1c1c]"
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1c1c1c]/15">
              <h2 className="font-serif text-2xl font-medium text-[#1c1c1c]">
                {ui.toc} — {deck === 'trajeto' ? ui.trajeto : ui.representacao}
              </h2>
              <button
                type="button"
                onClick={() => setTocOpen(false)}
                className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#7e2a1f] hover:underline"
              >
                {ui.close}
              </button>
            </div>
            <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
              {slides.map((s, idx) => {
                const active = idx === safeIndex;
                return (
                  <li key={idx}>
                    <button
                      type="button"
                      onClick={() => {
                        onChangeSlide(idx);
                        setTocOpen(false);
                      }}
                      className={`w-full flex items-baseline gap-2.5 py-1.5 px-2.5 text-left text-xs border transition-colors ${
                        active
                          ? 'bg-[#1c1c1c] text-[#f2efeb] border-[#1c1c1c] font-medium'
                          : 'border-transparent text-[#1c1c1c]/80 hover:border-[#1c1c1c]/30 hover:bg-white'
                      }`}
                    >
                      <span className="font-mono text-[10px] tabular-nums opacity-75 shrink-0">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="truncate">{s.title.replace(/\n/g, ' ')}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>
        )}

        {/* Asymmetric Two-Column Museum Folio Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start min-h-[460px]">
          {/* Left Margin Rail (Folio Number + Linked Study Plates) */}
          <aside className="lg:col-span-3 space-y-6 lg:sticky lg:top-8">
            <div className="pb-5 border-b border-[#1c1c1c]/20">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#7e2a1f] mb-1.5">
                {deck === 'trajeto' ? ui.trajeto : ui.representacao}
              </p>
              <div className="flex items-baseline gap-2 font-mono tabular-nums">
                <span className="text-3xl sm:text-4xl font-bold text-[#1c1c1c]">
                  {String(safeIndex + 1).padStart(2, '0')}
                </span>
                <span className="text-xs text-[#1c1c1c]/60">
                  {ui.of} {String(slides.length).padStart(2, '0')}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-[#1c1c1c]/65">
                {slideStatus === 'approved' ? (
                  <span className="inline-flex items-center gap-1 text-[#14532d] font-bold">
                    <Check className="w-3 h-3" />
                    {copy.translationReviewed}
                  </span>
                ) : (
                  <span>{copy.reviewPending}</span>
                )}
                {isModified && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-[#7e2a1f]">{copy.authorialEditActive}</span>
                  </>
                )}
              </div>
            </div>

            {/* Linked Iconographic Study Plates for This Slide */}
            {linkedAtlas.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#1c1c1c]/65">
                    {copy.platesHeading(linkedAtlas.length)}
                  </p>
                  {linkedAtlas.length >= 2 && (
                    <button
                      type="button"
                      onClick={() => onOpenLightbox(linkedAtlas[0], linkedAtlas[1].id)}
                      className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-[#7e2a1f] hover:underline"
                    >
                      <Columns2 className="w-3 h-3" />
                      <span>{copy.compareBtn}</span>
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {linkedAtlas.map((plate) => (
                    <button
                      key={plate.id}
                      type="button"
                      onClick={() => onOpenLightbox(plate)}
                      className="group w-full text-left bg-white/70 border border-[#1c1c1c]/25 hover:border-[#1c1c1c] overflow-hidden transition-colors"
                    >
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#e7e2da] border-b border-[#1c1c1c]/15">
                        <ArchivalPlateImage
                          src={plate.imageSrc}
                          alt={plate.imageAlt}
                          accessionCode={plate.accessionCode}
                          title={plate.title}
                          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.04]"
                        />
                        <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 px-2 py-0.5 bg-[#1c1c1c] text-[#f2efeb] font-mono text-[10px] uppercase tracking-wider">
                          <Expand className="w-2.5 h-2.5" />
                          <span>{copy.loupeBadge}</span>
                        </span>
                      </div>
                      <div className="p-3 space-y-0.5">
                        <p className="font-mono text-[10px] text-[#7e2a1f] tabular-nums">
                          {plate.year} · {plate.accessionCode}
                        </p>
                        <p className="font-serif text-sm font-medium leading-snug text-[#1c1c1c] line-clamp-2">
                          {plate.title}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* Main Slide Reading Folio */}
          <article
            id={`slide-${String(safeIndex + 1).padStart(2, '0')}`}
            className="lg:col-span-9 p-7 sm:p-10 lg:p-12 bg-white/75 backdrop-blur-[4px] border-[1.5px] border-[#1c1c1c] space-y-8"
          >
            <header className="border-b border-[#1c1c1c]/15 pb-6">
              <h1 className="font-serif font-light text-3xl sm:text-4xl lg:text-[3rem] leading-[1.08] text-[#1c1c1c] whitespace-pre-line">
                {current.title}
              </h1>
            </header>

            {/* Authentic 16:9 Slide Presentation Visual */}
            {current.slideImage && (
              <div className="relative group w-full bg-[#1c1c1c] border-[1.5px] border-[#1c1c1c] shadow-[4px_4px_0px_0px_#1c1c1c] overflow-hidden">
                <div className="relative aspect-[16/9] w-full bg-[#151515] flex items-center justify-center">
                  <img
                    src={current.slideImage}
                    alt={current.title.replace(/\n/g, ' ')}
                    className="w-full h-full object-contain"
                    loading="eager"
                  />
                  <div className="absolute top-3 left-3 bg-[#1c1c1c]/90 text-[#f2efeb] px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest border border-[#f2efeb]/20 backdrop-blur-sm pointer-events-none">
                    Slide {String(safeIndex + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')} · Saberes França-Brasil 2026
                  </div>
                  <div className="absolute bottom-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      type="button"
                      onClick={onOpenPresenter}
                      className="px-2.5 py-1 bg-[#f2efeb] text-[#1c1c1c] font-mono text-[10px] uppercase tracking-wider border border-[#1c1c1c] hover:bg-white inline-flex items-center gap-1.5 shadow-sm"
                      title={`${copy.presenterShortBtn} (P)`}
                    >
                      <Maximize2 className="w-3 h-3" />
                      <span>{copy.presenterShortBtn}</span>
                    </button>
                    {onOpenGoogleSlides && (
                      <button
                        type="button"
                        onClick={onOpenGoogleSlides}
                        className="px-2.5 py-1 bg-[#7e2a1f] text-[#f2efeb] font-mono text-[10px] uppercase tracking-wider border border-[#7e2a1f] hover:bg-[#1c1c1c] inline-flex items-center gap-1.5 shadow-sm"
                        title="Google Slides"
                      >
                        <Presentation className="w-3 h-3" />
                        <span>Google Slides</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Analytical Blocks */}
            <div
              className={
                isTwoColumnComparison || isFourFunctionsGrid
                  ? 'grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch'
                  : 'space-y-6 max-w-[68ch]'
              }
            >
              {current.blocks.map((block, bIdx) => (
                <div
                  key={bIdx}
                  className={
                    isTwoColumnComparison || isFourFunctionsGrid
                      ? 'p-5 bg-[#f2efeb]/75 border border-[#1c1c1c]/20 space-y-2.5'
                      : block.label
                      ? 'pt-4 border-t border-[#1c1c1c]/12 first:pt-0 first:border-t-0 space-y-1.5'
                      : 'space-y-1.5'
                  }
                >
                  {block.label && (
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#7e2a1f]">
                      {block.label}
                    </p>
                  )}
                  <p className="text-base sm:text-[1.0625rem] leading-[1.7] text-[#1c1c1c]/90 whitespace-pre-line">
                    {block.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Methodological Footnote & Primary Source */}
            {(current.footer || current.source) && (
              <footer className="pt-6 border-t border-[#1c1c1c]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {current.footer ? (
                  <p className="font-serif italic text-lg text-[#1c1c1c]/70 max-w-2xl">
                    {current.footer}
                  </p>
                ) : (
                  <span />
                )}

                {current.source && /^https:\/\//.test(current.source) && (
                  <a
                    href={current.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-[#7e2a1f] hover:underline shrink-0"
                  >
                    <span>{ui.source}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </footer>
            )}
          </article>
        </div>

        {/* Bottom Navigation & Tools Bar */}
        <div className="pt-5 border-t border-[#1c1c1c]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <button
              type="button"
              onClick={() => onChangeSlide(safeIndex - 1)}
              disabled={safeIndex === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.1em] border border-[#1c1c1c] text-[#1c1c1c] hover:bg-[#1c1c1c] hover:text-[#f2efeb] disabled:opacity-30 disabled:pointer-events-none transition-colors whitespace-nowrap shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{ui.previous}</span>
            </button>

            <span className="font-mono text-xs tabular-nums text-[#1c1c1c]/70 px-2">
              {String(safeIndex + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
            </span>

            <button
              type="button"
              onClick={() => onChangeSlide(safeIndex + 1)}
              disabled={safeIndex === slides.length - 1}
              className="inline-flex items-center gap-2 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.1em] border border-[#1c1c1c] bg-[#1c1c1c] text-[#f2efeb] hover:bg-[#7e2a1f] hover:border-[#7e2a1f] disabled:opacity-30 disabled:pointer-events-none transition-colors whitespace-nowrap shrink-0"
            >
              <span>{ui.next}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={onOpenStudioForSlide}
              className="inline-flex items-center gap-1.5 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.1em] border border-[#1c1c1c]/40 text-[#1c1c1c] hover:border-[#1c1c1c] hover:bg-[#1c1c1c] hover:text-[#f2efeb] transition-colors whitespace-nowrap shrink-0"
              title={copy.reviewSlideBtn}
            >
              <PenLine className="w-3.5 h-3.5" />
              <span>{copy.reviewSlideBtn}</span>
            </button>

            <button
              type="button"
              onClick={onOpenPresenter}
              className="inline-flex items-center gap-1.5 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.1em] border border-[#1c1c1c]/40 text-[#1c1c1c] hover:border-[#1c1c1c] hover:bg-[#1c1c1c] hover:text-[#f2efeb] transition-colors whitespace-nowrap shrink-0"
              title={`${copy.presenterShortBtn} (P)`}
            >
              <Presentation className="w-3.5 h-3.5" />
              <span>{copy.presenterShortBtn}</span>
            </button>

            {onOpenGoogleSlides && (
              <button
                type="button"
                onClick={onOpenGoogleSlides}
                className="inline-flex items-center gap-1.5 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.1em] border border-[#7e2a1f]/60 text-[#7e2a1f] hover:border-[#7e2a1f] hover:bg-[#7e2a1f] hover:text-[#f2efeb] transition-colors whitespace-nowrap shrink-0"
                title="Apresentar ou Exportar no Google Slides"
              >
                <Presentation className="w-3.5 h-3.5" />
                <span>Google Slides</span>
              </button>
            )}

            {onOpenGoogleDocs && (
              <button
                type="button"
                onClick={onOpenGoogleDocs}
                className="inline-flex items-center gap-1.5 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.1em] border border-[#1c1c1c]/40 text-[#1c1c1c] hover:border-[#1c1c1c] hover:bg-[#1c1c1c] hover:text-[#f2efeb] transition-colors whitespace-nowrap shrink-0"
                title="Ler ou Exportar como Google Doc"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Google Docs</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCopyLink}
              className="p-2 border border-[#1c1c1c]/40 text-[#1c1c1c] hover:border-[#1c1c1c] hover:bg-[#1c1c1c] hover:text-[#f2efeb] transition-colors"
              title={ui.copy}
              aria-label={ui.copy}
            >
              <Link2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleToggleFullscreen}
              className="p-2 border border-[#1c1c1c]/40 text-[#1c1c1c] hover:border-[#1c1c1c] hover:bg-[#1c1c1c] hover:text-[#f2efeb] transition-colors"
              title={ui.fullscreen}
              aria-label={ui.fullscreen}
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="p-2 border border-[#1c1c1c]/40 text-[#1c1c1c] hover:border-[#1c1c1c] hover:bg-[#1c1c1c] hover:text-[#f2efeb] transition-colors"
              title={ui.print}
              aria-label={ui.print}
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-[#1c1c1c]/60">
          <span>
            {ui.keys} · {copy.shortcutsSuffix(linkedAtlas.length > 0)}
          </span>
          <button
            type="button"
            onClick={onOpenSources}
            className="hover:text-[#7e2a1f] hover:underline"
          >
            {ui.work} · {ui.sources}
          </button>
        </div>
      </div>

      {/* Clean Paginated Print Deck (@media print only) */}
      <div className="hidden print-only">
        {slides.map((s, idx) => (
          <section key={idx} className="print-slide-page">
            <p className="font-mono text-[10pt] text-neutral-500 mb-6">
              ICONOCRACIA · {deck === 'trajeto' ? ui.trajeto : ui.representacao} ·{' '}
              {lang.toUpperCase()} · {idx + 1}/{slides.length} · {ui.printNote}
            </p>
            <h1 className="font-serif text-[24pt] leading-tight mb-6 whitespace-pre-line">
              {s.title}
            </h1>
            <div className="space-y-4">
              {s.blocks.map((b, bIdx) => (
                <div key={bIdx}>
                  {b.label && (
                    <p className="font-mono text-[9pt] uppercase tracking-wider text-neutral-600 mb-1">
                      {b.label}
                    </p>
                  )}
                  <p className="text-[12pt] leading-relaxed whitespace-pre-line">{b.text}</p>
                </div>
              ))}
            </div>
            {s.footer && (
              <p className="mt-8 pt-3 border-t border-neutral-300 font-serif italic text-[10.5pt] text-neutral-600">
                {s.footer}
              </p>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

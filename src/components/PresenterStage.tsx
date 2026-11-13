import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Expand,
  Maximize2,
  Pause,
  Play,
  RotateCcw,
  X,
} from 'lucide-react';
import { getAtlasForSlide, LANGUAGES } from '../data/atlasCatalog';
import { PORTAL_COPY } from '../data/portalCopy';
import { WORKSPACE_CONSTRAINTS } from '../firebase';
import { AtlasEntry, DeckId, LangCode, SlideItem, UIStrings } from '../types';

interface PresenterStageProps {
  deck: DeckId;
  lang: LangCode;
  slideIndex: number;
  slides: SlideItem[];
  ui: UIStrings;
  presenterNote: string;
  onSavePresenterNote: (note: string) => void;
  onChangeSlide: (index: number) => void;
  onChangeLang: (lang: LangCode) => void;
  onOpenLightbox: (entry: AtlasEntry, compareWithId?: string) => void;
  onOpenGoogleSlides?: () => void;
  onExit: () => void;
}

function formatSeconds(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function PresenterStage({
  deck,
  lang,
  slideIndex,
  slides,
  ui,
  presenterNote,
  onSavePresenterNote,
  onChangeSlide,
  onChangeLang,
  onOpenLightbox,
  onOpenGoogleSlides,
  onExit,
}: PresenterStageProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [targetMinutes, setTargetMinutes] = useState<number>(20);
  const [stageDisplayMode, setStageDisplayMode] = useState<'slide' | 'split' | 'text'>('slide');

  const safeIndex = Math.max(0, Math.min(slides.length - 1, slideIndex));
  const current = slides[safeIndex];
  const nextSlide = safeIndex < slides.length - 1 ? slides[safeIndex + 1] : null;
  const linkedAtlas = getAtlasForSlide(deck, safeIndex);
  const copy = PORTAL_COPY[lang] || PORTAL_COPY.pt;

  useEffect(() => {
    if (!isRunning) return;
    const interval = window.setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable)
      ) {
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        onExit();
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        if (safeIndex < slides.length - 1) onChangeSlide(safeIndex + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        if (safeIndex > 0) onChangeSlide(safeIndex - 1);
      } else if (e.key.toLowerCase() === 'z' && linkedAtlas.length > 0) {
        e.preventDefault();
        onOpenLightbox(linkedAtlas[0], linkedAtlas[1]?.id);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [linkedAtlas, onChangeSlide, onExit, onOpenLightbox, safeIndex, slides.length]);

  const targetSeconds = targetMinutes * 60;
  const isOverTime = elapsedSeconds > targetSeconds;
  const timeProgress = Math.min(100, (elapsedSeconds / targetSeconds) * 100);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      // Ignore fullscreen denial in restricted iframes
    }
  };

  if (!current) return null;

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#1c1c1c] text-[#f2efeb] flex flex-col">
      {/* Presenter Stage Top Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-3.5 border-b border-[#f2efeb]/20 bg-[#151515]">
        <div className="flex items-center gap-4">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#e5988b]">
            {copy.stageModeTitle}
          </span>
          <span aria-hidden="true" className="text-[#f2efeb]/30">·</span>
          <span className="text-xs text-[#f2efeb]/75 truncate max-w-[260px]">
            {deck === 'trajeto' ? ui.trajeto : ui.representacao}
          </span>
        </div>

        {/* Speech Timer Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#262626] border border-[#f2efeb]/25">
            <span
              className={`font-mono text-sm font-medium tabular-nums ${
                isOverTime ? 'text-[#e5988b]' : 'text-[#f2efeb]'
              }`}
            >
              {formatSeconds(elapsedSeconds)}
            </span>
            <span className="text-xs text-[#f2efeb]/50 font-mono tabular-nums">
              / {targetMinutes}:00
            </span>
            {isOverTime && (
              <span className="text-[11px] font-mono text-[#e5988b] ml-1">
                {copy.overTimeWarning}
              </span>
            )}

            <button
              type="button"
              onClick={() => setIsRunning((r) => !r)}
              className="ml-1 p-1 hover:bg-[#383838] text-[#e5988b] transition-colors"
              aria-label={isRunning ? 'Pausar cronômetro' : 'Iniciar cronômetro'}
              title={isRunning ? 'Pausar cronômetro' : 'Iniciar cronômetro'}
            >
              {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsRunning(false);
                setElapsedSeconds(0);
              }}
              className="p-1 hover:bg-[#383838] text-[#f2efeb]/70 transition-colors"
              aria-label="Zerar cronômetro"
              title="Zerar cronômetro"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <select
              value={targetMinutes}
              onChange={(e) => setTargetMinutes(Number(e.target.value))}
              aria-label="Meta de tempo da apresentação"
              className="ml-1 bg-[#1c1c1c] text-xs font-mono text-[#f2efeb] border border-[#f2efeb]/25 px-1.5 py-0.5"
            >
              <option value={15}>15 min</option>
              <option value={20}>20 min</option>
              <option value={30}>30 min</option>
              <option value={45}>45 min</option>
            </select>
          </div>

          <div className="flex items-center gap-0.5 p-0.5 bg-[#262626] border border-[#f2efeb]/25">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => onChangeLang(l.code)}
                className={`px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                  l.code === lang
                    ? 'bg-[#7e2a1f] text-[#f2efeb] font-bold'
                    : 'text-[#f2efeb]/65 hover:text-[#f2efeb]'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          {onOpenGoogleSlides && (
            <button
              type="button"
              onClick={onOpenGoogleSlides}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] bg-[#262626] hover:bg-[#383838] border border-[#f2efeb]/25 text-[#f2efeb] transition-colors whitespace-nowrap shrink-0"
              title="Apresentar com Google Slides"
            >
              <span>Google Slides</span>
            </button>
          )}

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 bg-[#262626] border border-[#f2efeb]/25 text-[#f2efeb]/85 hover:text-[#f2efeb] hover:border-[#f2efeb] transition-colors"
            title="Alternar tela cheia"
            aria-label="Alternar tela cheia"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onExit}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] bg-[#262626] hover:bg-[#7e2a1f] border border-[#f2efeb]/35 text-[#f2efeb] transition-colors whitespace-nowrap shrink-0"
          >
            <X className="w-3.5 h-3.5" />
            <span>{copy.exitStageBtn}</span>
          </button>
        </div>
      </div>

      {/* Subtle Pacing Bar */}
      <div className="w-full h-[2px] bg-[#2c2c2c]">
        <div
          className={`h-full transition-transform duration-300 origin-left ${
            isOverTime ? 'bg-[#e5988b]' : 'bg-[#7e2a1f]'
          }`}
          style={{ transform: `scaleX(${timeProgress / 100})` }}
        />
      </div>

      {/* Main Split Stage: Current Slide (Left 7 cols) + Next Slide & Notes (Right 5 cols) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 max-w-[1440px] w-full mx-auto">
        {/* Active Slide Stage */}
        <section className="lg:col-span-7 flex flex-col justify-between p-8 sm:p-10 bg-[#232323] border border-[#f2efeb]/25">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#f2efeb]/15 pb-4">
              <span className="font-mono text-sm tabular-nums text-[#e5988b]">
                {ui.number.toUpperCase()} {String(safeIndex + 1).padStart(2, '0')} /{' '}
                {String(slides.length).padStart(2, '0')}
              </span>

              <div className="flex items-center gap-2">
                {current.slideImage && (
                  <div className="flex items-center border border-[#f2efeb]/25 bg-[#1c1c1c] p-0.5 font-mono text-[9px] uppercase tracking-wider">
                    <button
                      type="button"
                      onClick={() => setStageDisplayMode('slide')}
                      className={`px-2 py-1 transition-colors ${
                        stageDisplayMode === 'slide'
                          ? 'bg-[#f2efeb] text-[#1c1c1c] font-bold'
                          : 'text-[#f2efeb]/70 hover:text-[#f2efeb]'
                      }`}
                    >
                      Slide Visual
                    </button>
                    <button
                      type="button"
                      onClick={() => setStageDisplayMode('split')}
                      className={`px-2 py-1 transition-colors ${
                        stageDisplayMode === 'split'
                          ? 'bg-[#f2efeb] text-[#1c1c1c] font-bold'
                          : 'text-[#f2efeb]/70 hover:text-[#f2efeb]'
                      }`}
                    >
                      Split
                    </button>
                    <button
                      type="button"
                      onClick={() => setStageDisplayMode('text')}
                      className={`px-2 py-1 transition-colors ${
                        stageDisplayMode === 'text'
                          ? 'bg-[#f2efeb] text-[#1c1c1c] font-bold'
                          : 'text-[#f2efeb]/70 hover:text-[#f2efeb]'
                      }`}
                    >
                      Texto
                    </button>
                  </div>
                )}

                {linkedAtlas.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onOpenLightbox(linkedAtlas[0], linkedAtlas[1]?.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider bg-[#1c1c1c] hover:bg-[#7e2a1f] border border-[#f2efeb]/35 text-[#f2efeb] transition-colors"
                  >
                    <Expand className="w-3.5 h-3.5" />
                    <span>{copy.projectPlateBtn(linkedAtlas.length)}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Authentic 16:9 Slide Presentation Projection */}
            {current.slideImage && stageDisplayMode !== 'text' && (
              <div className="relative w-full aspect-[16/9] bg-[#121212] border border-[#f2efeb]/25 shadow-2xl overflow-hidden flex items-center justify-center">
                <img
                  src={current.slideImage}
                  alt={current.title.replace(/\n/g, ' ')}
                  className="w-full h-full object-contain"
                  loading="eager"
                />
                <div className="absolute top-2 left-2 bg-[#1c1c1c]/90 text-[#f2efeb] px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest border border-[#f2efeb]/25 pointer-events-none">
                  Slide {String(safeIndex + 1).padStart(2, '0')} · Saberes França-Brasil 2026
                </div>
              </div>
            )}

            {/* Title & Analytical Points */}
            {(stageDisplayMode === 'text' || stageDisplayMode === 'split' || !current.slideImage) && (
              <div className="space-y-4">
                <h1 className="font-serif font-light text-2xl sm:text-3xl lg:text-4xl leading-[1.1] text-[#f2efeb] whitespace-pre-line">
                  {current.title}
                </h1>

                <div
                  className={
                    current.blocks.length === 2 && current.blocks.every((b) => b.label)
                      ? 'grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1'
                      : 'space-y-4 pt-1'
                  }
                >
                  {current.blocks.map((b, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-[#1c1c1c] border border-[#f2efeb]/15 space-y-1"
                    >
                      {b.label && (
                        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#e5988b]">
                          {b.label}
                        </p>
                      )}
                      <p className="text-sm sm:text-base leading-relaxed text-[#f2efeb]/90 whitespace-pre-line">
                        {b.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {stageDisplayMode === 'slide' && current.slideImage && (
              <div className="pt-2">
                <p className="font-serif italic text-base text-[#f2efeb]/80">
                  {current.title.replace(/\n/g, ' ')}
                </p>
              </div>
            )}
          </div>

          <div className="pt-6 mt-6 border-t border-[#f2efeb]/15 space-y-4">
            {current.footer && (
              <p className="font-serif italic text-base text-[#f2efeb]/70">{current.footer}</p>
            )}

            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => onChangeSlide(safeIndex - 1)}
                disabled={safeIndex === 0}
                className="inline-flex items-center gap-2 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.1em] border border-[#f2efeb]/40 text-[#f2efeb] hover:bg-[#f2efeb] hover:text-[#1c1c1c] disabled:opacity-30 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{ui.previous}</span>
              </button>

              <span className="text-xs font-mono text-[#f2efeb]/50 hidden sm:inline">
                {copy.stageKeyHint}
              </span>

              <button
                type="button"
                onClick={() => onChangeSlide(safeIndex + 1)}
                disabled={safeIndex === slides.length - 1}
                className="inline-flex items-center gap-2 px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.1em] bg-[#f2efeb] text-[#1c1c1c] hover:bg-[#7e2a1f] hover:text-[#f2efeb] disabled:opacity-30 transition-colors"
              >
                <span>{ui.next}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Right Presenter Column: Next Slide Preview + Editable Speaker Notes */}
        <aside className="lg:col-span-5 flex flex-col gap-6">
          {/* Next Slide Card */}
          <div className="p-5 bg-[#232323] border border-[#f2efeb]/25 space-y-2.5">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-[#f2efeb]/60">
              <span>{copy.nextSlideHeading}</span>
              {nextSlide && (
                <span className="tabular-nums">
                  {String(safeIndex + 2).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
                </span>
              )}
            </div>

            {nextSlide ? (
              <div className="space-y-3">
                {nextSlide.slideImage && (
                  <div className="relative aspect-[16/9] w-full bg-[#121212] border border-[#f2efeb]/20 overflow-hidden shadow-inner">
                    <img
                      src={nextSlide.slideImage}
                      alt={nextSlide.title.replace(/\n/g, ' ')}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                <h2 className="font-serif text-lg text-[#f2efeb]">
                  {nextSlide.title.replace(/\n/g, ' ')}
                </h2>
                <p className="text-xs leading-relaxed text-[#f2efeb]/70 line-clamp-2">
                  {nextSlide.blocks.map((b) => (b.label ? `${b.label}: ${b.text}` : b.text)).join(' · ')}
                </p>
              </div>
            ) : (
              <p className="text-xs italic text-[#f2efeb]/60">{copy.lastSlideSummary}</p>
            )}
          </div>

          {/* Live-Saved Speaker Notes */}
          <div className="flex-1 flex flex-col p-5 bg-[#232323] border border-[#f2efeb]/25 space-y-3">
            <div className="flex items-center justify-between">
              <label
                htmlFor="presenter-notes-input"
                className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#e5988b]"
              >
                {copy.speakerNotesLabel(String(safeIndex + 1).padStart(2, '0'))}
              </label>
              <span className="font-mono text-[10px] text-[#f2efeb]/50">{copy.autosavedBadge}</span>
            </div>

            <textarea
              id="presenter-notes-input"
              value={presenterNote}
              maxLength={WORKSPACE_CONSTRAINTS.MAX_PRESENTER_NOTE_LEN}
              onChange={(e) => onSavePresenterNote(e.target.value)}
              rows={9}
              placeholder={copy.speakerNotesPlaceholder}
              className="flex-1 w-full bg-[#1c1c1c] text-[#f2efeb] border border-[#f2efeb]/20 p-3.5 text-sm leading-relaxed focus:outline-none focus:border-[#e5988b] resize-y"
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

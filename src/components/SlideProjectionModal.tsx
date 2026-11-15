/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SlideProjectionModal Component
 * Immersive 16:9 Conference Projection Viewer for Ana Vitória Vanzin Mendes's
 * authentic 13 slides from "Between Representation and Authentication"
 */

import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  FileText,
  Maximize2,
  Minimize2,
  Volume2,
  X,
} from 'lucide-react';
import { BroadsheetLang } from '../data/broadsheetEditionData';
import { DeckId, LangCode, SlideItem } from '../types';

interface SlideProjectionModalProps {
  isOpen: boolean;
  slideNumber: number; // 1-based (1 to 13)
  lang: BroadsheetLang;
  slides: SlideItem[];
  onClose: () => void;
  onNavigateSlide: (slideNumber: number) => void;
  onOpenInReader?: (slideIndex: number) => void;
  onOpenPresenter?: (slideIndex: number) => void;
}

export function SlideProjectionModal({
  isOpen,
  slideNumber,
  lang,
  slides,
  onClose,
  onNavigateSlide,
  onOpenInReader,
  onOpenPresenter,
}: SlideProjectionModalProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const safeNumber = Math.max(1, Math.min(13, slideNumber));
  const slideIndex = safeNumber - 1;
  const currentSlide = slides[slideIndex];
  const slideImageSrc = `/slides/slide-${String(safeNumber).padStart(2, '0')}.png`;

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        if (safeNumber < 13) onNavigateSlide(safeNumber + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        if (safeNumber > 1) onNavigateSlide(safeNumber - 1);
      } else if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setShowNotes((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, safeNumber, onClose, onNavigateSlide]);

  if (!isOpen) return null;

  const toggleFullscreen = () => {
    setIsFullscreen((f) => !f);
  };

  const labels = {
    pt: {
      slideLabel: 'LÂMINA',
      of: 'DE',
      event: 'SABERES FRANÇA–BRASIL 2026',
      prev: 'Anterior',
      next: 'Próxima',
      close: 'Fechar (Esc)',
      toggleNotes: 'Roteiro de Tribuna',
      fullPresenter: 'Modo Apresentador Completo',
      openReader: 'Leitor Detalhado',
      googleSlides: 'Abrir no Google Slides',
    },
    en: {
      slideLabel: 'SLIDE',
      of: 'OF',
      event: 'SABERES FRANÇA–BRASIL 2026',
      prev: 'Previous',
      next: 'Next',
      close: 'Close (Esc)',
      toggleNotes: 'Lectern Script',
      fullPresenter: 'Full Presenter Stage',
      openReader: 'Detailed Folio Reader',
      googleSlides: 'Open in Google Slides',
    },
    fr: {
      slideLabel: 'DIAPOSITIVE',
      of: 'SUR',
      event: 'SABERES FRANÇA–BRASIL 2026',
      prev: 'Précédente',
      next: 'Suivante',
      close: 'Fermer (Esc)',
      toggleNotes: 'Texte de Conférence',
      fullPresenter: 'Mode Présentateur Complet',
      openReader: 'Lecteur Détaillé',
      googleSlides: 'Ouvrir dans Google Slides',
    },
  }[lang];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${labels.slideLabel} ${safeNumber}`}
      className="fixed inset-0 z-50 bg-[#121212]/95 backdrop-blur-md flex flex-col text-[#f2efeb] animate-in fade-in duration-200"
    >
      {/* Top Header Control Ribbon */}
      <header className="px-5 py-3 border-b border-[#f2efeb]/15 bg-[#181818] flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#e5988b] font-bold">
            {labels.slideLabel} {String(safeNumber).padStart(2, '0')} {labels.of} 13
          </span>
          <span aria-hidden="true" className="text-[#f2efeb]/30">·</span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#f2efeb]/70 hidden sm:inline">
            {labels.event}
          </span>
          {currentSlide && (
            <>
              <span aria-hidden="true" className="text-[#f2efeb]/30 hidden md:inline">·</span>
              <span className="font-serif italic text-sm text-[#f2efeb]/90 truncate max-w-sm hidden md:inline">
                {currentSlide.title.replace(/\n/g, ' ')}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">

          <button
            type="button"
            onClick={() => setShowNotes((n) => !n)}
            className={`inline-flex items-center gap-1.5 px-3 py-1 font-mono text-[10px] uppercase tracking-wider border transition-colors ${
              showNotes
                ? 'bg-[#f2efeb] text-[#1c1c1c] border-[#f2efeb]'
                : 'border-[#f2efeb]/30 text-[#f2efeb]/80 hover:border-[#f2efeb]'
            }`}
            title="Alternar notas de tribuna (N)"
          >
            <FileText className="w-3 h-3" />
            <span className="hidden sm:inline">{labels.toggleNotes}</span>
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 border border-[#f2efeb]/30 text-[#f2efeb]/80 hover:text-[#f2efeb] hover:border-[#f2efeb] transition-colors"
            title={isFullscreen ? 'Reduzir' : 'Tela cheia'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 border border-[#f2efeb]/40 bg-[#242424] text-[#f2efeb] hover:bg-[#7e2a1f] hover:border-[#7e2a1f] transition-colors"
            title={labels.close}
            aria-label={labels.close}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Center Proscenium / Stage */}
      <div className="flex-1 flex flex-col lg:flex-row items-stretch justify-center p-4 sm:p-6 lg:p-8 gap-6 overflow-y-auto">
        {/* 16:9 Image Projection Viewport */}
        <div
          className={`flex-1 flex flex-col items-center justify-center transition-all ${
            showNotes ? 'lg:max-w-[70%]' : 'max-w-full'
          }`}
        >
          <div className="relative w-full max-w-6xl aspect-[16/9] bg-[#0d0d0d] border-[1.5px] border-[#f2efeb]/25 shadow-2xl flex items-center justify-center overflow-hidden">
            <img
              src={slideImageSrc}
              alt={`Lâmina ${safeNumber}: ${currentSlide?.title || 'Saberes França-Brasil 2026'}`}
              className="w-full h-full object-contain"
              loading="eager"
            />

            {/* Subtle Overlay Corner Tag */}
            <div className="absolute bottom-3 left-3 bg-[#1c1c1c]/90 text-[#f2efeb] px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest border border-white/20 backdrop-blur-sm pointer-events-none">
              SLIDE {String(safeNumber).padStart(2, '0')} / 13
            </div>

            {/* Quick Next/Prev floating arrows */}
            {safeNumber > 1 && (
              <button
                type="button"
                onClick={() => onNavigateSlide(safeNumber - 1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-[#1c1c1c]/80 hover:bg-[#1c1c1c] text-[#f2efeb] border border-white/20 transition-all opacity-0 hover:opacity-100 group-hover:opacity-100 focus:opacity-100"
                aria-label={labels.prev}
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            {safeNumber < 13 && (
              <button
                type="button"
                onClick={() => onNavigateSlide(safeNumber + 1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-[#1c1c1c]/80 hover:bg-[#1c1c1c] text-[#f2efeb] border border-white/20 transition-all opacity-0 hover:opacity-100 group-hover:opacity-100 focus:opacity-100"
                aria-label={labels.next}
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Lectern Script / Notes Rail */}
        {showNotes && currentSlide && (
          <aside className="w-full lg:w-96 bg-[#1a1a1a] border border-[#f2efeb]/25 p-5 flex flex-col justify-between space-y-4 animate-in slide-in-from-right duration-200">
            <div className="space-y-4">
              <div className="border-b border-[#f2efeb]/15 pb-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#e5988b]">
                  {labels.toggleNotes} · Slide {String(safeNumber).padStart(2, '0')}
                </span>
                <h3 className="font-serif text-xl font-medium text-[#f2efeb] mt-1 whitespace-pre-line leading-tight">
                  {currentSlide.title}
                </h3>
              </div>

              <div className="space-y-3.5 max-h-[45vh] lg:max-h-[58vh] overflow-y-auto pr-1">
                {currentSlide.blocks.map((b, idx) => (
                  <div key={idx} className="p-3 bg-[#121212] border border-[#f2efeb]/15 space-y-1">
                    {b.label && (
                      <p className="font-mono text-[9px] uppercase tracking-wider text-[#e5988b]">
                        {b.label}
                      </p>
                    )}
                    <p className="text-xs sm:text-sm leading-relaxed text-[#f2efeb]/90 whitespace-pre-line">
                      {b.text}
                    </p>
                  </div>
                ))}

                {currentSlide.footer && (
                  <div className="pt-2 border-t border-[#f2efeb]/15">
                    <p className="font-serif italic text-xs text-[#f2efeb]/70">
                      {currentSlide.footer}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-[#f2efeb]/15 flex items-center justify-between gap-2">
              {onOpenInReader && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenInReader(slideIndex);
                    onClose();
                  }}
                  className="font-mono text-[10px] uppercase tracking-wider text-[#e5988b] hover:underline"
                >
                  {labels.openReader} ↗
                </button>
              )}
              {onOpenPresenter && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenPresenter(slideIndex);
                    onClose();
                  }}
                  className="font-mono text-[10px] uppercase tracking-wider text-[#f2efeb]/80 hover:text-[#f2efeb]"
                >
                  {labels.fullPresenter} ↗
                </button>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* Bottom Pacing & Navigation Bar */}
      <footer className="px-6 py-3.5 border-t border-[#f2efeb]/15 bg-[#181818] flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={safeNumber <= 1}
            onClick={() => onNavigateSlide(safeNumber - 1)}
            className="inline-flex items-center gap-1.5 px-4 py-2 font-mono text-[10px] uppercase tracking-wider border border-[#f2efeb]/35 text-[#f2efeb] hover:bg-[#f2efeb] hover:text-[#1c1c1c] disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{labels.prev}</span>
          </button>

          <span className="font-mono text-xs tabular-nums text-[#f2efeb]/70 px-2">
            {String(safeNumber).padStart(2, '0')} / 13
          </span>

          <button
            type="button"
            disabled={safeNumber >= 13}
            onClick={() => onNavigateSlide(safeNumber + 1)}
            className="inline-flex items-center gap-1.5 px-4 py-2 font-mono text-[10px] uppercase tracking-wider border border-[#f2efeb] bg-[#f2efeb] text-[#1c1c1c] hover:bg-[#7e2a1f] hover:border-[#7e2a1f] hover:text-[#f2efeb] disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <span>{labels.next}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 13-Slide Direct Jump Scrubber */}
        <div className="hidden md:flex items-center gap-1">
          {Array.from({ length: 13 }, (_, i) => i + 1).map((num) => {
            const active = num === safeNumber;
            return (
              <button
                key={num}
                type="button"
                onClick={() => onNavigateSlide(num)}
                className={`w-7 h-7 font-mono text-[10px] tabular-nums transition-all border ${
                  active
                    ? 'bg-[#7e2a1f] border-[#e5988b] text-[#f2efeb] font-bold scale-110'
                    : 'border-[#f2efeb]/20 text-[#f2efeb]/60 hover:border-[#f2efeb]/60 hover:text-[#f2efeb]'
                }`}
                title={`Ir para lâmina ${num}`}
              >
                {String(num).padStart(2, '0')}
              </button>
            );
          })}
        </div>

        <div className="font-mono text-[10px] text-[#f2efeb]/50 hidden lg:block">
          Atalhos: ← / → navegar · Esc fechar · N notas
        </div>
      </footer>
    </div>
  );
}

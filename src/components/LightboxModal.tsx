import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowUpRight,
  Columns2,
  ExternalLink,
  Move,
  RotateCcw,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { ATLAS_ENTRIES } from '../data/atlasCatalog';
import { AtlasEntry, DeckId } from '../types';
import { ArchivalPlateImage } from './ArchivalPlateImage';

interface LightboxModalProps {
  entry: AtlasEntry | null;
  initialCompareId?: string | null;
  onClose: () => void;
  onSelectEntry: (entry: AtlasEntry) => void;
  onJumpToSlide: (deck: DeckId, slideIndex: number) => void;
}

export function LightboxModal({
  entry,
  initialCompareId = null,
  onClose,
  onSelectEntry,
  onJumpToSlide,
}: LightboxModalProps) {
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOrigin = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const [compareMode, setCompareMode] = useState<boolean>(Boolean(initialCompareId));
  const [compareId, setCompareId] = useState<string>(initialCompareId || '');

  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    if (initialCompareId) {
      setCompareMode(true);
      setCompareId(initialCompareId);
    } else if (entry) {
      const sibling = ATLAS_ENTRIES.find((e) => e.id !== entry.id && e.axis === entry.axis);
      setCompareId(sibling?.id || ATLAS_ENTRIES.find((e) => e.id !== entry.id)?.id || '');
      setCompareMode(false);
    }
  }, [entry, initialCompareId]);

  useEffect(() => {
    if (!entry) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === '+' || e.key === '=') setZoom((z) => Math.min(4, +(z + 0.25).toFixed(2)));
      if (e.key === '-') {
        setZoom((z) => {
          const next = Math.max(1, +(z - 0.25).toFixed(2));
          if (next === 1) setPan({ x: 0, y: 0 });
          return next;
        });
      }
      if (e.key === '0') {
        setZoom(1);
        setPan({ x: 0, y: 0 });
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [entry, onClose]);

  if (!entry) return null;

  const compareEntry = compareMode
    ? ATLAS_ENTRIES.find((item) => item.id === compareId && item.id !== entry.id) || null
    : null;

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.25 : -0.25;
    setZoom((prev) => {
      const next = Math.max(1, Math.min(4, +(prev + delta).toFixed(2)));
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    dragOrigin.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || zoom <= 1) return;
    setPan({
      x: e.clientX - dragOrigin.current.x,
      y: e.clientY - dragOrigin.current.y,
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lightbox-title"
      className="fixed inset-0 z-50 flex flex-col bg-[#1c1c1c]/95 text-[#f2efeb] backdrop-blur-sm"
    >
      {/* Top Inspection Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-3.5 border-b border-[#f2efeb]/20 bg-[#151515]">
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-mono text-[11px] tracking-wider text-[#e5988b] shrink-0">
            {entry.accessionCode}
          </span>
          <span aria-hidden="true" className="text-[#f2efeb]/30">·</span>
          <h2 id="lightbox-title" className="font-serif text-lg sm:text-xl font-medium truncate">
            {entry.title}
          </h2>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-0.5 bg-[#262626] border border-[#f2efeb]/25 p-0.5">
            <button
              type="button"
              onClick={() => {
                setZoom((z) => {
                  const next = Math.max(1, +(z - 0.5).toFixed(2));
                  if (next === 1) setPan({ x: 0, y: 0 });
                  return next;
                });
              }}
              disabled={zoom <= 1}
              className="p-1.5 hover:bg-[#383838] disabled:opacity-35 transition-colors"
              aria-label="Reduzir zoom"
              title="Reduzir zoom (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="font-mono text-xs px-2 tabular-nums text-[#f2efeb]">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(4, +(z + 0.5).toFixed(2)))}
              disabled={zoom >= 4}
              className="p-1.5 hover:bg-[#383838] disabled:opacity-35 transition-colors"
              aria-label="Ampliar zoom"
              title="Ampliar zoom (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={resetView}
              disabled={zoom === 1 && pan.x === 0 && pan.y === 0}
              className="p-1.5 hover:bg-[#383838] disabled:opacity-35 transition-colors"
              aria-label="Restaurar enquadramento"
              title="Restaurar enquadramento (0)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setCompareMode((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.1em] border transition-colors whitespace-nowrap shrink-0 ${
              compareMode
                ? 'bg-[#7e2a1f] text-[#f2efeb] border-[#7e2a1f]'
                : 'bg-[#262626] text-[#f2efeb] border-[#f2efeb]/30 hover:border-[#f2efeb]'
            }`}
          >
            <Columns2 className="w-3.5 h-3.5" />
            <span>Comparar prancha</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.1em] bg-[#262626] hover:bg-[#7e2a1f] border border-[#f2efeb]/30 transition-colors whitespace-nowrap shrink-0"
            aria-label="Fechar mesa de luz"
          >
            <X className="w-4 h-4" />
            <span>Fechar</span>
          </button>
        </div>
      </div>

      {/* Main Split Inspection Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-y-auto lg:overflow-hidden">
        {/* Light Table Canvas */}
        <div className="lg:col-span-8 flex flex-col bg-[#141414] border-b lg:border-b-0 lg:border-r border-[#f2efeb]/20 min-h-[380px] lg:min-h-0">
          {compareMode && (
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 border-b border-[#f2efeb]/15 bg-[#1b1b1b] text-xs">
              <span className="text-[#f2efeb]/70">
                Cotejo visual situado: selecione a segunda prancha do Atlas
              </span>
              <select
                value={compareId}
                onChange={(e) => setCompareId(e.target.value)}
                aria-label="Selecionar prancha de comparação"
                className="bg-[#262626] text-[#f2efeb] border border-[#f2efeb]/30 px-2.5 py-1 text-xs focus:outline-none focus:border-[#e5988b]"
              >
                {ATLAS_ENTRIES.filter((item) => item.id !== entry.id).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.year} · {item.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div
            onWheel={handleWheel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className={`relative flex-1 overflow-hidden flex items-center justify-center p-6 select-none ${
              zoom > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'
            }`}
            onDoubleClick={() => {
              if (zoom > 1) resetView();
              else setZoom(2.25);
            }}
          >
            <div
              className={`grid gap-6 items-center justify-items-center w-full h-full ${
                compareEntry ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
              }`}
              style={{
                transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
                transition: isDragging ? 'none' : 'transform 160ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <figure className="flex flex-col items-center max-h-[70vh]">
                <ArchivalPlateImage
                  src={entry.imageSrc}
                  alt={entry.imageAlt}
                  accessionCode={entry.accessionCode}
                  title={entry.title}
                  className="max-h-[64vh] w-auto object-contain shadow-2xl border border-[#f2efeb]/20"
                />
                {compareEntry && (
                  <figcaption className="mt-2 font-mono text-[11px] text-[#f2efeb]/70">
                    {entry.year} · {entry.title}
                  </figcaption>
                )}
              </figure>

              {compareEntry && (
                <figure className="flex flex-col items-center max-h-[70vh]">
                  <ArchivalPlateImage
                    src={compareEntry.imageSrc}
                    alt={compareEntry.imageAlt}
                    accessionCode={compareEntry.accessionCode}
                    title={compareEntry.title}
                    className="max-h-[64vh] w-auto object-contain shadow-2xl border border-[#f2efeb]/20"
                  />
                  <figcaption className="mt-2 font-mono text-[11px] text-[#f2efeb]/70">
                    {compareEntry.year} · {compareEntry.title}
                  </figcaption>
                </figure>
              )}
            </div>

            <div className="pointer-events-none absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-[#f2efeb]/55">
              <span className="flex items-center gap-1.5">
                <Move className="w-3.5 h-3.5" />
                {zoom > 1
                  ? 'Arraste para inspecionar detalhes · Duplo clique para restaurar'
                  : 'Roda do mouse ou duplo clique para ampliar até 400%'}
              </span>
              <span>{entry.year}</span>
            </div>
          </div>

          {/* Thumbnail Strip for Fast Switching */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-t border-[#f2efeb]/15 bg-[#181818] overflow-x-auto">
            {ATLAS_ENTRIES.map((item) => {
              const active = item.id === entry.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectEntry(item)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 text-left transition-colors shrink-0 border ${
                    active
                      ? 'bg-[#7e2a1f] border-[#7e2a1f] text-[#f2efeb]'
                      : 'bg-transparent border-transparent text-[#f2efeb]/65 hover:text-[#f2efeb] hover:bg-[#242424]'
                  }`}
                >
                  <span className="font-mono text-[11px] tabular-nums">{item.year}</span>
                  <span className="text-xs truncate max-w-[140px]">{item.title.split('—')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Accession & Epistemological Metadata Panel (Archival Paper Folio Contrast) */}
        <aside className="lg:col-span-4 p-6 overflow-y-auto bg-[#f2efeb] dark:bg-[#161616] text-[#1c1c1c] dark:text-[#f2efeb] space-y-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#7e2a1f] dark:text-[#e5988b]">
              Ficha de Estudo Documental
            </p>
            <p className="mt-1.5 font-mono text-xs text-[#7e2a1f] dark:text-[#e5988b]">
              {entry.statusDetail}
            </p>
          </div>

          <dl className="divide-y divide-[#1c1c1c]/15 dark:divide-[#f2efeb]/15 border-y border-[#1c1c1c]/25 dark:border-[#f2efeb]/25 text-sm">
            <div className="py-3 grid grid-cols-3 gap-2">
              <dt className="font-mono text-[10px] uppercase tracking-wider text-[#1c1c1c]/60 dark:text-[#f2efeb]/70">Datação</dt>
              <dd className="col-span-2 font-mono text-xs tabular-nums font-bold text-[#1c1c1c] dark:text-[#f2efeb]">{entry.year}</dd>
            </div>
            <div className="py-3 grid grid-cols-3 gap-2">
              <dt className="font-mono text-[10px] uppercase tracking-wider text-[#1c1c1c]/60 dark:text-[#f2efeb]/70">Autoria</dt>
              <dd className="col-span-2 text-xs leading-relaxed text-[#1c1c1c]/85 dark:text-[#f2efeb]/85">{entry.creator}</dd>
            </div>
            <div className="py-3 grid grid-cols-3 gap-2">
              <dt className="font-mono text-[10px] uppercase tracking-wider text-[#1c1c1c]/60 dark:text-[#f2efeb]/70">Suporte</dt>
              <dd className="col-span-2 text-xs leading-relaxed text-[#1c1c1c]/85 dark:text-[#f2efeb]/85">{entry.medium}</dd>
            </div>
            <div className="py-3 grid grid-cols-3 gap-2">
              <dt className="font-mono text-[10px] uppercase tracking-wider text-[#1c1c1c]/60 dark:text-[#f2efeb]/70">Contexto</dt>
              <dd className="col-span-2 text-xs leading-relaxed text-[#1c1c1c]/85 dark:text-[#f2efeb]/85">
                {entry.repositoryOrContext}
              </dd>
            </div>
            <div className="py-3 grid grid-cols-3 gap-2">
              <dt className="font-mono text-[10px] uppercase tracking-wider text-[#1c1c1c]/60 dark:text-[#f2efeb]/70">Função</dt>
              <dd className="col-span-2 text-xs leading-relaxed text-[#1c1c1c] dark:text-[#f2efeb] font-semibold">
                {entry.analyticalFunction}
              </dd>
            </div>
          </dl>

          <div className="space-y-2">
            <h3 className="font-serif text-xl font-medium text-[#1c1c1c] dark:text-[#f2efeb]">Problema jurídico-visual</h3>
            <p className="text-sm leading-relaxed text-[#1c1c1c]/85 dark:text-[#f2efeb]/85">{entry.juridicalQuestion}</p>
          </div>

          <div className="p-4 bg-white/75 dark:bg-[#1e1e1e] border border-[#1c1c1c]/30 dark:border-[#f2efeb]/35 space-y-1.5">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#7e2a1f] dark:text-[#e5988b]">
              Protocolo de Verificação Autoral
            </p>
            <p className="text-xs leading-relaxed text-[#1c1c1c]/80 dark:text-[#f2efeb]/85">{entry.verificationNotes}</p>
            {entry.primarySourceUrl && (
              <a
                href={entry.primarySourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 pt-1 font-mono text-[11px] text-[#7e2a1f] dark:text-[#e5988b] hover:underline"
              >
                <span>{entry.primarySourceLabel || 'Consultar fonte primária'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          <div className="space-y-2.5">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#1c1c1c]/60 dark:text-[#f2efeb]/70">
              Slides vinculados nas apresentações
            </p>
            <div className="space-y-1.5">
              {entry.linkedSlides.map((ref) => (
                <button
                  key={`${ref.deck}-${ref.slideIndex}`}
                  type="button"
                  onClick={() => {
                    onClose();
                    onJumpToSlide(ref.deck, ref.slideIndex);
                  }}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-white/75 dark:bg-[#1e1e1e] hover:bg-[#1c1c1c] hover:text-[#f2efeb] dark:hover:bg-[#f2efeb] dark:hover:text-[#0d0d0d] border border-[#1c1c1c]/30 dark:border-[#f2efeb]/35 text-left text-xs transition-colors"
                >
                  <span className="truncate">
                    <span className="font-mono text-[10px] uppercase opacity-70 mr-1.5">
                      {ref.deck === 'representacao' ? 'DOC. 01' : 'DOC. 02'}
                    </span>
                    {ref.contextLabel}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

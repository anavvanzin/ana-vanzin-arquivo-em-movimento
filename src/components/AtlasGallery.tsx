import { useEffect, useState } from 'react';
import { ArrowUpRight, Box, Columns2, Expand, ExternalLink, Wand2 } from 'lucide-react';
import { ATLAS_ENTRIES } from '../data/atlasCatalog';
import { PORTAL_COPY } from '../data/portalCopy';
import { SavedAtelierRecord } from '../hooks/useArchiveStore';
import { AtlasAxis, AtlasEntry, DeckId, LangCode } from '../types';
import { ArchivalPlateImage } from './ArchivalPlateImage';
import { IconographicImageAtelier } from './IconographicImageAtelier';

export type AtlasSectionTab = 'catalog' | 'atelier';

interface AtlasGalleryProps {
  lang: LangCode;
  initialSection?: AtlasSectionTab;
  savedAtelierRecords: SavedAtelierRecord[];
  onSaveAtelierRecord: (input: {
    kind: 'image_plate' | 'spatial_view';
    title: string;
    promptOrSummary: string;
    axis: AtlasAxis;
    specSummary: string;
  }) => Promise<string>;
  onDeleteAtelierRecord: (id: string) => Promise<void>;
  onOpenCabinet3D: () => void;
  onChangeSection?: (section: AtlasSectionTab) => void;
  onOpenLightbox: (entry: AtlasEntry, compareWithId?: string) => void;
  onJumpToSlide: (deck: DeckId, slideIndex: number) => void;
  onNotify: (msg: string) => void;
}

export function AtlasGallery({
  lang,
  initialSection = 'catalog',
  savedAtelierRecords,
  onSaveAtelierRecord,
  onDeleteAtelierRecord,
  onOpenCabinet3D,
  onChangeSection,
  onOpenLightbox,
  onJumpToSlide,
  onNotify,
}: AtlasGalleryProps) {
  const [activeTab, setActiveTab] = useState<AtlasSectionTab>(initialSection);
  const [axisFilter, setAxisFilter] = useState<'all' | AtlasAxis>('all');
  const copy = PORTAL_COPY[lang] || PORTAL_COPY.pt;

  useEffect(() => {
    setActiveTab(initialSection);
  }, [initialSection]);

  const handleSelectTab = (tab: AtlasSectionTab) => {
    setActiveTab(tab);
    onChangeSection?.(tab);
  };

  const filtered =
    axisFilter === 'all'
      ? ATLAS_ENTRIES
      : ATLAS_ENTRIES.filter((entry) => entry.axis === axisFilter);

  const filterButtons: { id: 'all' | AtlasAxis; label: string }[] = [
    { id: 'all', label: 'Todo o acervo (6)' },
    { id: 'venda', label: 'A venda em comparação · 1494–1603' },
    { id: 'imperio', label: 'Império & Constituição · 1822–1839' },
    { id: 'republica', label: 'República, escada & moeda · 1890–1906' },
  ];

  return (
    <div className="max-w-[1360px] mx-auto px-6 sm:px-10 py-10 lg:py-12 space-y-10">
      {/* Header & Methodological Notice */}
      <header className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start border-b-[1.5px] border-[#1c1c1c] dark:border-[#f2efeb]/65 pb-8">
        <div className="lg:col-span-7 space-y-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#7e2a1f] dark:text-[#e5988b]">
            CATÁLOGO ANALÍTICO, ATELIER DE PRANCHAS & GABINETE 3D
          </p>
          <h1 className="font-serif font-light text-4xl sm:text-5xl leading-[1.02] text-[#1c1c1c] dark:text-[#f2efeb]">
            Atlas de fontes iconográficas e jurídicas
          </h1>
          <p className="text-sm sm:text-base leading-relaxed text-[#1c1c1c]/80 dark:text-[#f2efeb]/85 max-w-2xl">
            Conjunto comparativo dos seis núcleos visuais e normativos mobilizados nas duas
            apresentações, integrado ao atelier de síntese e edição visual em alta resolução e ao
            gabinete espacial tridimensional.
          </p>

          {/* Segmented Workspace Mode Switcher */}
          <div
            role="tablist"
            aria-label="Ambientes do Atlas Iconográfico"
            className="flex flex-wrap items-center gap-2 pt-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'catalog'}
              onClick={() => handleSelectTab('catalog')}
              className={`px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] border transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'catalog'
                  ? 'bg-[#1c1c1c] dark:bg-[#f2efeb] text-[#f2efeb] dark:text-[#0d0d0d] border-[#1c1c1c] dark:border-[#f2efeb]'
                  : 'bg-white/70 dark:bg-[#1a1a1a] text-[#1c1c1c] dark:text-[#f2efeb] border-[#1c1c1c]/40 dark:border-[#f2efeb]/45 hover:border-[#1c1c1c] dark:hover:border-[#f2efeb]'
              }`}
            >
              {copy.cabinetTabCatalog}
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'atelier'}
              onClick={() => handleSelectTab('atelier')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] border transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'atelier'
                  ? 'bg-[#7e2a1f] dark:bg-[#e5988b] text-[#f2efeb] dark:text-[#0d0d0d] border-[#7e2a1f] dark:border-[#e5988b]'
                  : 'bg-white/70 dark:bg-[#1a1a1a] text-[#1c1c1c] dark:text-[#f2efeb] border-[#1c1c1c]/40 dark:border-[#f2efeb]/45 hover:border-[#7e2a1f] dark:hover:border-[#e5988b] hover:text-[#7e2a1f] dark:hover:text-[#e5988b]'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>{copy.cabinetTabAtelier}</span>
            </button>

            <button
              type="button"
              onClick={onOpenCabinet3D}
              className="inline-flex items-center gap-1.5 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] border border-[#1c1c1c] dark:border-[#f2efeb]/70 bg-[#f2efeb] dark:bg-[#1a1a1a] text-[#1c1c1c] dark:text-[#f2efeb] hover:bg-[#1c1c1c] hover:text-[#f2efeb] dark:hover:bg-[#f2efeb] dark:hover:text-[#0d0d0d] transition-colors whitespace-nowrap shrink-0"
            >
              <Box className="w-3.5 h-3.5" />
              <span>{copy.cabinetTab3D}</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-5 p-6 bg-white/55 dark:bg-[#161616] backdrop-blur-[4px] border border-[#1c1c1c]/35 dark:border-[#f2efeb]/40 space-y-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#7e2a1f] dark:text-[#e5988b]">
            Nota metodológica sobre as pranchas visuais
          </p>
          <p className="text-xs leading-relaxed text-[#1c1c1c]/80 dark:text-[#f2efeb]/85">
            Conforme os critérios desta edição de trabalho, registro documental, filologia e hipótese
            interpretativa permanecem distintos. As pranchas abaixo e os ensaios gerados no atelier
            operam como referências visuais de estudo enquanto exemplares de acervo, cotas
            fotográficas e direitos de reprodução seguem em conferência autoral.
          </p>
        </div>
      </header>

      {activeTab === 'atelier' ? (
        <IconographicImageAtelier
          savedRecords={savedAtelierRecords}
          onSaveRecordLocal={onSaveAtelierRecord}
          onDeleteLocalRecord={onDeleteAtelierRecord}
          onInspectInLightbox={(entry) => onOpenLightbox(entry)}
          onNotify={onNotify}
        />
      ) : (
        <>
          {/* Filter Bar & Comparative Shortcut */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div
              role="group"
              aria-label="Filtrar casos do Atlas por eixo analítico"
              className="flex flex-wrap items-center gap-2"
            >
              {filterButtons.map((btn) => (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => setAxisFilter(btn.id)}
                  className={`px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.1em] border transition-colors whitespace-nowrap shrink-0 ${
                    axisFilter === btn.id
                      ? 'bg-[#1c1c1c] dark:bg-[#f2efeb] text-[#f2efeb] dark:text-[#0d0d0d] border-[#1c1c1c] dark:border-[#f2efeb]'
                      : 'bg-white/55 dark:bg-[#1a1a1a] text-[#1c1c1c]/80 dark:text-[#f2efeb]/85 border-[#1c1c1c]/30 dark:border-[#f2efeb]/35 hover:border-[#1c1c1c] dark:hover:border-[#f2efeb] hover:text-[#1c1c1c] dark:hover:text-[#f2efeb]'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenLightbox(ATLAS_ENTRIES[0], 'gieng-1543')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.1em] border border-[#1c1c1c] dark:border-[#f2efeb] bg-[#1c1c1c] dark:bg-[#f2efeb] text-[#f2efeb] dark:text-[#0d0d0d] hover:bg-[#7e2a1f] hover:border-[#7e2a1f] dark:hover:bg-[#e5988b] dark:hover:border-[#e5988b] transition-colors whitespace-nowrap shrink-0"
              >
                <Columns2 className="w-3.5 h-3.5" />
                <span>Comparar Brant (1494) ↔ Gieng (1543)</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenLightbox(ATLAS_ENTRIES[5], 'numismatica-1890')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.1em] border border-[#1c1c1c] dark:border-[#f2efeb]/70 text-[#1c1c1c] dark:text-[#f2efeb] hover:bg-[#1c1c1c] hover:text-[#f2efeb] dark:hover:bg-[#f2efeb] dark:hover:text-[#0d0d0d] transition-colors whitespace-nowrap shrink-0"
              >
                <Columns2 className="w-3.5 h-3.5" />
                <span>Comparar Escada (1906) ↔ Moeda (1890)</span>
              </button>
            </div>
          </div>

          {/* Detailed Museum Accession Rows */}
          <div className="space-y-8">
            {filtered.map((entry) => (
              <article
                key={entry.id}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8 bg-white/70 dark:bg-[#161616] backdrop-blur-[4px] border border-[#1c1c1c] dark:border-[#f2efeb]/65 items-stretch"
              >
                {/* Visual Plate */}
                <div className="lg:col-span-5 flex flex-col justify-between">
                  <button
                    type="button"
                    onClick={() => onOpenLightbox(entry)}
                    className="group relative w-full aspect-[4/3] overflow-hidden bg-[#e7e2da] dark:bg-[#1a1a1a] border border-[#1c1c1c]/30 dark:border-[#f2efeb]/35 hover:border-[#1c1c1c] dark:hover:border-[#f2efeb] transition-colors"
                    aria-label={`Ampliar prancha: ${entry.title}`}
                  >
                    <ArchivalPlateImage
                      src={entry.imageSrc}
                      alt={entry.imageAlt}
                      accessionCode={entry.accessionCode}
                      title={entry.title}
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                    />
                    <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1c1c1c] text-[#f2efeb] font-mono text-[10px] uppercase tracking-[0.1em] border border-white/20">
                      <Expand className="w-3.5 h-3.5" />
                      <span>Abrir lupa (100%–400%)</span>
                    </span>
                  </button>
                  <p className="mt-2.5 font-serif italic text-sm text-[#1c1c1c]/70 dark:text-[#f2efeb]/75">
                    {entry.accessionCode} — {entry.medium}
                  </p>
                </div>

                {/* Structured Accession Sheet */}
                <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-[#1c1c1c]/65 dark:text-[#f2efeb]/70 tabular-nums">
                      <span className="text-[#7e2a1f] dark:text-[#e5988b] font-bold">{entry.year}</span>
                      <span aria-hidden="true">·</span>
                      <span>{entry.creator}</span>
                    </div>

                    <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#1c1c1c] dark:text-[#f2efeb]">
                      {entry.title}
                    </h2>

                    <p className="font-mono text-[11px] text-[#7e2a1f] dark:text-[#e5988b]">
                      Status documental: {entry.statusDetail}
                    </p>

                    <div className="pt-2 space-y-2.5 text-sm leading-relaxed text-[#1c1c1c]/85 dark:text-[#f2efeb]/85">
                      <p>
                        <strong className="font-semibold text-[#1c1c1c] dark:text-[#f2efeb]">
                          Questão em exame:{' '}
                        </strong>
                        {entry.juridicalQuestion}
                      </p>
                      <p className="text-xs text-[#1c1c1c]/70 dark:text-[#f2efeb]/75">
                        <strong className="font-semibold text-[#1c1c1c] dark:text-[#f2efeb]">
                          Protocolo de arquivo:{' '}
                        </strong>
                        {entry.verificationNotes}
                      </p>
                    </div>

                    {entry.primarySourceUrl && (
                      <a
                        href={entry.primarySourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-[#7e2a1f] dark:text-[#e5988b] hover:underline"
                      >
                        <span>
                          {entry.primarySourceLabel || 'Consultar diploma legal na fonte oficial'}
                        </span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  <div className="pt-4 border-t border-[#1c1c1c]/15 dark:border-[#f2efeb]/20 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                      {entry.linkedSlides.map((ref) => (
                        <button
                          key={`${ref.deck}-${ref.slideIndex}`}
                          type="button"
                          onClick={() => onJumpToSlide(ref.deck, ref.slideIndex)}
                          className="inline-flex items-center gap-1 font-mono text-[11px] text-[#7e2a1f] dark:text-[#e5988b] hover:underline whitespace-nowrap"
                        >
                          <span>{ref.contextLabel}</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => onOpenLightbox(entry)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.1em] border border-[#1c1c1c] dark:border-[#f2efeb]/70 text-[#1c1c1c] dark:text-[#f2efeb] hover:bg-[#1c1c1c] hover:text-[#f2efeb] dark:hover:bg-[#f2efeb] dark:hover:text-[#0d0d0d] transition-colors whitespace-nowrap shrink-0"
                    >
                      <Expand className="w-3.5 h-3.5" />
                      <span>Inspecionar na mesa de luz</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

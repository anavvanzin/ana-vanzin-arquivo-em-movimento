import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Expand,
  ExternalLink,
  FileText,
} from 'lucide-react';
import { ATLAS_ENTRIES } from '../data/atlasCatalog';
import {
  formatTimelineCitationNote,
  TIMELINE_MILESTONES,
  TIMELINE_UI,
} from '../data/timelineMilestones';
import { AtlasEntry, DeckId, LangCode, TimelineFilter, TimelineMilestone } from '../types';
import { ArchivalPlateImage } from './ArchivalPlateImage';

interface DocumentaryTimelineProps {
  lang: LangCode;
  onOpenDeck: (deck: DeckId, lang: LangCode, slideIndex?: number) => void;
  onOpenAtlasEntry: (entry: AtlasEntry, compareWithId?: string) => void;
  onNavigateView: (view: 'atlas' | 'studio' | 'apparatus') => void;
  onNotify?: (msg: string) => void;
}

export function DocumentaryTimeline({
  lang,
  onOpenDeck,
  onOpenAtlasEntry,
  onNavigateView,
  onNotify,
}: DocumentaryTimelineProps) {
  const copy = TIMELINE_UI[lang] || TIMELINE_UI.pt;
  const [activeFilter, setActiveFilter] = useState<TimelineFilter>('all');
  const [selectedId, setSelectedId] = useState<string>(TIMELINE_MILESTONES[0].id);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const trackRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const visibleMilestones = useMemo<TimelineMilestone[]>(() => {
    if (activeFilter === 'all') return TIMELINE_MILESTONES;
    if (activeFilter === 'trajeto' || activeFilter === 'representacao') {
      return TIMELINE_MILESTONES.filter((m) =>
        m.citedInSlides.some((citation) => citation.deck === activeFilter)
      );
    }
    return TIMELINE_MILESTONES.filter((m) => m.axis === activeFilter);
  }, [activeFilter]);

  const activeMilestone = useMemo<TimelineMilestone>(() => {
    const found = visibleMilestones.find((m) => m.id === selectedId);
    return found || visibleMilestones[0] || TIMELINE_MILESTONES[0];
  }, [selectedId, visibleMilestones]);

  const activeIndex = useMemo(
    () => visibleMilestones.findIndex((m) => m.id === activeMilestone.id),
    [activeMilestone.id, visibleMilestones]
  );

  useEffect(() => {
    if (!visibleMilestones.some((m) => m.id === selectedId) && visibleMilestones.length > 0) {
      setSelectedId(visibleMilestones[0].id);
    }
  }, [selectedId, visibleMilestones]);

  const selectMilestone = (id: string, focusButton = false) => {
    setSelectedId(id);
    const targetBtn = nodeRefs.current[id];
    if (targetBtn) {
      targetBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      if (focusButton) targetBtn.focus();
    }
  };

  const handleStep = (delta: -1 | 1) => {
    if (visibleMilestones.length === 0) return;
    const nextIdx = Math.max(0, Math.min(visibleMilestones.length - 1, activeIndex + delta));
    selectMilestone(visibleMilestones[nextIdx].id);
  };

  const handleTrackKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const next = visibleMilestones[Math.min(visibleMilestones.length - 1, idx + 1)];
      if (next) selectMilestone(next.id, true);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = visibleMilestones[Math.max(0, idx - 1)];
      if (prev) selectMilestone(prev.id, true);
    } else if (e.key === 'Home') {
      e.preventDefault();
      if (visibleMilestones[0]) selectMilestone(visibleMilestones[0].id, true);
    } else if (e.key === 'End') {
      e.preventDefault();
      const last = visibleMilestones[visibleMilestones.length - 1];
      if (last) selectMilestone(last.id, true);
    }
  };

  const handleCopyCitation = async () => {
    const note = formatTimelineCitationNote(activeMilestone, lang);
    try {
      await navigator.clipboard.writeText(note);
      setCopiedId(activeMilestone.id);
      onNotify?.(copy.citationCopiedToast);
      window.setTimeout(() => {
        setCopiedId((prev) => (prev === activeMilestone.id ? null : prev));
      }, 2200);
    } catch {
      onNotify?.(copy.citationCopiedToast);
    }
  };

  const milestoneCopy = activeMilestone.copy[lang] || activeMilestone.copy.pt;
  const linkedAtlasEntry = useMemo(
    () =>
      activeMilestone.atlasEntryId
        ? ATLAS_ENTRIES.find((e) => e.id === activeMilestone.atlasEntryId) || null
        : null,
    [activeMilestone.atlasEntryId]
  );

  const isVerifiedPrimary = activeMilestone.epistemicStatus === 'primary_verified';
  const isCopied = copiedId === activeMilestone.id;

  return (
    <section aria-labelledby="documentary-timeline-heading" className="space-y-6">
      {/* Header + Citation Check Legend + Stepper */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-[#1c1c1c]/15 pb-6">
        <div className="space-y-2.5 max-w-3xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#7e2a1f]">
            {copy.kicker}
          </p>
          <h2
            id="documentary-timeline-heading"
            className="font-serif text-3xl sm:text-4xl lg:text-[2.75rem] font-light leading-[1.06] text-[#1c1c1c]"
          >
            {copy.heading}
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-[#1c1c1c]/75 max-w-2xl">
            {copy.methodNote}
          </p>

          {/* Unboxed Verification Legend */}
          <div className="pt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px]">
            <span className="inline-flex items-center gap-1.5 text-[#14532d]">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{copy.verificationLegendVerified}</span>
            </span>
            <span aria-hidden="true" className="text-[#1c1c1c]/30">
              ·
            </span>
            <span className="inline-flex items-center gap-1.5 text-[#7e2a1f]">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{copy.verificationLegendPending}</span>
            </span>
          </div>
        </div>

        {/* Step Controls & Numeric Progress */}
        <div className="flex items-center gap-2 self-start lg:self-end shrink-0">
          <span className="font-mono text-xs tabular-nums text-[#1c1c1c]/70 mr-1.5">
            {String(activeIndex + 1).padStart(2, '0')} /{' '}
            {String(visibleMilestones.length).padStart(2, '0')}
          </span>
          <button
            type="button"
            onClick={() => handleStep(-1)}
            disabled={activeIndex <= 0}
            aria-label={copy.previousMilestone}
            className="p-2.5 min-w-[40px] min-h-[40px] inline-flex items-center justify-center border border-[#1c1c1c] text-[#1c1c1c] hover:bg-[#1c1c1c] hover:text-[#f2efeb] disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleStep(1)}
            disabled={activeIndex >= visibleMilestones.length - 1}
            aria-label={copy.nextMilestone}
            className="p-2.5 min-w-[40px] min-h-[40px] inline-flex items-center justify-center border border-[#1c1c1c] text-[#1c1c1c] hover:bg-[#1c1c1c] hover:text-[#f2efeb] disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Interactive Filter Segmented Bar */}
      <div
        role="group"
        aria-label={copy.heading}
        className="flex flex-wrap items-center gap-2"
      >
        {copy.filters.map((f) => {
          const isActive = activeFilter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setActiveFilter(f.id)}
              aria-pressed={isActive}
              className={`px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.1em] border transition-colors whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-[#1c1c1c] border-[#1c1c1c] text-[#f2efeb]'
                  : 'bg-white/50 border-[#1c1c1c]/30 text-[#1c1c1c]/80 hover:border-[#1c1c1c] hover:text-[#1c1c1c]'
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Interactive Horizontal Chronological Track */}
      <div className="bg-white/45 backdrop-blur-[4px] border-[1.5px] border-[#1c1c1c] px-4 py-5 sm:px-6">
        <div
          ref={trackRef}
          role="tablist"
          aria-label={copy.trackAriaLabel}
          className="relative flex items-stretch gap-3 overflow-x-auto pb-2 scroll-smooth"
        >
          {visibleMilestones.map((milestone, idx) => {
            const prev = idx > 0 ? visibleMilestones[idx - 1] : null;
            const showEarlyModernHiatus =
              prev && prev.sortYear <= 1603 && milestone.sortYear >= 1822;
            const showEmpireToRepublicHiatus =
              prev && prev.sortYear >= 1822 && prev.sortYear < 1889 && milestone.sortYear >= 1889;

            const isSelected = milestone.id === activeMilestone.id;
            const mCopy = milestone.copy[lang] || milestone.copy.pt;
            const nodeVerified = milestone.epistemicStatus === 'primary_verified';

            return (
              <Fragment key={milestone.id}>
                {(showEarlyModernHiatus || showEmpireToRepublicHiatus) && (
                  <div
                    aria-hidden="true"
                    className="flex flex-col justify-center items-center px-1.5 shrink-0 select-none"
                  >
                    <div className="h-full border-l border-dashed border-[#1c1c1c]/30 relative flex items-center">
                      <span className="ml-1.5 font-mono text-[10px] tracking-wider text-[#1c1c1c]/55 [writing-mode:vertical-rl] rotate-180 whitespace-nowrap">
                        {showEarlyModernHiatus
                          ? copy.hiatusLabels.earlyModernToEmpire
                          : copy.hiatusLabels.empireToRepublic}
                      </span>
                    </div>
                  </div>
                )}

                <button
                  ref={(el) => {
                    nodeRefs.current[milestone.id] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`timeline-tab-${milestone.id}`}
                  aria-selected={isSelected}
                  aria-controls={`timeline-panel-${activeMilestone.id}`}
                  tabIndex={isSelected ? 0 : -1}
                  onClick={() => selectMilestone(milestone.id)}
                  onKeyDown={(e) => handleTrackKeyDown(e, idx)}
                  className={`group relative flex flex-col justify-between text-left min-w-[190px] sm:min-w-[204px] max-w-[222px] p-4 border transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7e2a1f] ${
                    isSelected
                      ? 'bg-white border-[1.5px] border-[#1c1c1c] shadow-[4px_4px_0px_#7e2a1f]'
                      : 'bg-[#f2efeb]/80 border-[#1c1c1c]/20 hover:bg-white hover:border-[#1c1c1c]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 w-full pb-2.5 border-b border-[#1c1c1c]/12">
                    <span
                      className={`font-mono text-sm sm:text-base font-bold tabular-nums whitespace-nowrap ${
                        isSelected ? 'text-[#7e2a1f]' : 'text-[#1c1c1c]'
                      }`}
                    >
                      {milestone.year}
                    </span>
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] tabular-nums text-[#1c1c1c]/60">
                      {nodeVerified ? (
                        <CheckCircle2
                          className="w-3 h-3 text-[#14532d]"
                          aria-hidden="true"
                        />
                      ) : (
                        <AlertTriangle
                          className="w-3 h-3 text-[#7e2a1f]"
                          aria-hidden="true"
                        />
                      )}
                      <span>{String(idx + 1).padStart(2, '0')}</span>
                    </span>
                  </div>

                  <div className="pt-2.5 space-y-1.5">
                    <p
                      className={`font-serif text-lg leading-snug line-clamp-2 ${
                        isSelected ? 'text-[#1c1c1c] font-bold' : 'text-[#1c1c1c]/85 font-medium'
                      }`}
                    >
                      {mCopy.shortLabel}
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-[#1c1c1c]/55 truncate">
                      {copy.sourceKindLabels[milestone.sourceKind]}
                    </p>
                  </div>
                </button>
              </Fragment>
            );
          })}
        </div>
      </div>

      {/* Synchronized Citation & Comparative Detail Card */}
      <article
        key={activeMilestone.id}
        role="tabpanel"
        id={`timeline-panel-${activeMilestone.id}`}
        aria-labelledby={`timeline-tab-${activeMilestone.id}`}
        className="animate-timeline-panel bg-white/75 backdrop-blur-[4px] border border-[#1c1c1c] p-6 sm:p-8 lg:p-10"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left 8 (or 12) Columns: Scholarly Citation Sheet */}
          <div className={`${linkedAtlasEntry ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-6`}>
            {/* Top Register Line + Copy Citation Button */}
            <div className="space-y-3 border-b border-[#1c1c1c]/15 pb-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[11px] text-[#1c1c1c]/65 tabular-nums">
                  <span className="text-[#7e2a1f] font-bold">{activeMilestone.year}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeMilestone.accessionCode}</span>
                  <span aria-hidden="true">·</span>
                  <span>{copy.sourceKindLabels[activeMilestone.sourceKind]}</span>
                  <span aria-hidden="true">·</span>
                  <span
                    className={`inline-flex items-center gap-1 ${
                      isVerifiedPrimary ? 'text-[#14532d]' : 'text-[#7e2a1f]'
                    }`}
                  >
                    {isVerifiedPrimary ? (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    )}
                    <span>{copy.epistemicLabels[activeMilestone.epistemicStatus]}</span>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyCitation}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] border border-[#1c1c1c] text-[#1c1c1c] hover:bg-[#1c1c1c] hover:text-[#f2efeb] transition-colors whitespace-nowrap shrink-0"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#14532d]" />
                      <span>{copy.copiedCitationLabel}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copy.copyCitationLabel}</span>
                    </>
                  )}
                </button>
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl font-medium leading-snug text-[#1c1c1c]">
                {milestoneCopy.title}
              </h3>
            </div>

            {/* Parallel Bipolar Comparison (Matrix / Repertoire ⇄ Examined Case / Reception) */}
            <div className="space-y-2">
              <div
                aria-hidden="true"
                className="hidden sm:flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-[#1c1c1c]/60 px-1"
              >
                <span>{copy.axisBridgeHeaderLeft}</span>
                <span>⇄</span>
                <span>{copy.axisBridgeHeaderRight}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 border border-[#1c1c1c]/25 divide-y sm:divide-y-0 sm:divide-x divide-[#1c1c1c]/20 bg-[#f2efeb]/65">
                <div className="p-4 sm:p-5 space-y-1.5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#1c1c1c]/60">
                    {milestoneCopy.matrixPole.tag}
                  </p>
                  <p className="font-serif text-lg font-medium leading-snug text-[#1c1c1c]">
                    {milestoneCopy.matrixPole.title}
                  </p>
                  <p className="text-xs leading-relaxed text-[#1c1c1c]/75">
                    {milestoneCopy.matrixPole.summary}
                  </p>
                </div>

                <div className="p-4 sm:p-5 space-y-1.5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#7e2a1f]">
                    {milestoneCopy.casePole.tag}
                  </p>
                  <p className="font-serif text-lg font-medium leading-snug text-[#1c1c1c]">
                    {milestoneCopy.casePole.title}
                  </p>
                  <p className="text-xs leading-relaxed text-[#1c1c1c]/75">
                    {milestoneCopy.casePole.summary}
                  </p>
                </div>
              </div>
            </div>

            {/* Key Documentary Formulation */}
            <blockquote className="py-4 border-y border-[#1c1c1c]/15 font-serif italic text-lg sm:text-xl leading-relaxed text-[#1c1c1c] max-w-2xl">
              “{milestoneCopy.keyFormulation}”
            </blockquote>

            {/* Source Citation & Methodological Qualification */}
            <div className="space-y-2.5 text-xs leading-relaxed max-w-2xl">
              <p className="text-[#1c1c1c]/85">
                <strong className="font-mono text-[10px] uppercase tracking-wider text-[#1c1c1c]">
                  {copy.bibliographicRefLabel}
                </strong>{' '}
                <span>{milestoneCopy.bibliographicRef}</span>
              </p>
              <p className="text-[#1c1c1c]/75">
                <strong className="font-mono text-[10px] uppercase tracking-wider text-[#7e2a1f]">
                  {copy.qualificationLabel}
                </strong>{' '}
                <span>{milestoneCopy.documentaryCaution}</span>
              </p>

              {/* Optional Cross-Link to the 11/11/2026 Montesquieu / Dauchy Intervention */}
              {activeMilestone.companionCrossRef && (
                <p className="pt-1 text-[#1c1c1c]/80">
                  <span>
                    {activeMilestone.companionCrossRef.noteByLang[lang] ||
                      activeMilestone.companionCrossRef.noteByLang.pt}{' '}
                  </span>
                  <a
                    href={activeMilestone.companionCrossRef.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-[11px] text-[#7e2a1f] hover:underline whitespace-nowrap"
                  >
                    <span>
                      {activeMilestone.companionCrossRef.labelByLang[lang] ||
                        activeMilestone.companionCrossRef.labelByLang.pt}
                    </span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </p>
              )}
            </div>

            {/* Direct Slide Citations & Action Bar */}
            <div className="pt-4 border-t border-[#1c1c1c]/15 space-y-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#1c1c1c]/60">
                {copy.citedSlidesLabel}
              </p>

              <div className="flex flex-wrap gap-2">
                {activeMilestone.citedInSlides.map((citation) => {
                  const slideTitle = citation.titleByLang[lang] || citation.titleByLang.pt;
                  return (
                    <button
                      key={`${citation.deck}-${citation.slideIndex}`}
                      type="button"
                      onClick={() => onOpenDeck(citation.deck, lang, citation.slideIndex)}
                      className="inline-flex items-center gap-2 px-3 py-2 text-xs text-left border border-[#1c1c1c]/25 bg-[#f2efeb]/70 hover:border-[#1c1c1c] hover:bg-white transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 shrink-0 text-[#7e2a1f]" />
                      <span className="font-mono text-[10px] tabular-nums text-[#1c1c1c]/65 whitespace-nowrap">
                        {copy.deckNames[citation.deck]} · Slide {citation.slideNum}
                      </span>
                      <span className="font-medium text-[#1c1c1c] truncate max-w-[240px]">
                        {slideTitle}
                      </span>
                      <ArrowRight className="w-3 h-3 shrink-0 opacity-70" />
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                {linkedAtlasEntry && (
                  <button
                    type="button"
                    onClick={() => onOpenAtlasEntry(linkedAtlasEntry)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.1em] border border-[#1c1c1c] bg-[#1c1c1c] text-[#f2efeb] hover:bg-[#7e2a1f] hover:border-[#7e2a1f] transition-colors whitespace-nowrap shrink-0"
                  >
                    <Expand className="w-3.5 h-3.5" />
                    <span>{copy.openLightbox}</span>
                  </button>
                )}

                {activeMilestone.primarySourceUrl && (
                  <a
                    href={activeMilestone.primarySourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.1em] border border-[#1c1c1c] text-[#1c1c1c] hover:bg-[#1c1c1c] hover:text-[#f2efeb] transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>{copy.openPrimarySource}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => onNavigateView('apparatus')}
                  className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-[#7e2a1f] hover:underline whitespace-nowrap shrink-0"
                >
                  <span>{copy.openApparatus}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Right 4 Columns: Optional Linked Study Plate Preview */}
          {linkedAtlasEntry && (
            <div className="lg:col-span-4 space-y-2.5">
              <button
                type="button"
                onClick={() => onOpenAtlasEntry(linkedAtlasEntry)}
                aria-label={`${copy.openLightbox}: ${linkedAtlasEntry.title}`}
                className="group relative block w-full aspect-[4/3] overflow-hidden border border-[#1c1c1c]/30 hover:border-[#1c1c1c] bg-[#e7e2da] text-left transition-colors"
              >
                <ArchivalPlateImage
                  src={linkedAtlasEntry.imageSrc}
                  alt={`${linkedAtlasEntry.imageAlt} (${copy.platePreviewAltSuffix})`}
                  accessionCode={linkedAtlasEntry.accessionCode}
                  title={linkedAtlasEntry.title}
                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                />
                <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 px-2.5 py-1 bg-[#1c1c1c] text-[#f2efeb] font-mono text-[10px] uppercase tracking-[0.1em]">
                  <Expand className="w-3 h-3" />
                  <span>{copy.openLightbox}</span>
                </span>
              </button>
              <p className="font-serif italic text-sm text-[#1c1c1c]/75">
                {linkedAtlasEntry.accessionCode} — {linkedAtlasEntry.title}
              </p>
            </div>
          )}
        </div>
      </article>
    </section>
  );
}

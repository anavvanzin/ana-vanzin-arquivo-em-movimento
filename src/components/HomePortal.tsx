import { useState } from 'react';
import {
  ArrowRight,
  Box,
  Check,
  Columns2,
  Copy,
  Expand,
  ExternalLink,
  FileText,
  Presentation,
  Wand2,
} from 'lucide-react';
import { ATLAS_ENTRIES, LANGUAGES } from '../data/atlasCatalog';
import { PORTAL_COPY } from '../data/portalCopy';
import {
  COMPANION_INTERVENTION_BY_LANG,
  MONTESQUIEU_COMPANION_URL,
} from '../data/timelineMilestones';
import { AtlasEntry, DeckId, EditorialContent, LangCode, UIStrings } from '../types';
import { ArchivalPlateImage } from './ArchivalPlateImage';
import { DocumentaryTimeline } from './DocumentaryTimeline';

interface HomePortalProps {
  lang: LangCode;
  ui: UIStrings;
  editorial: EditorialContent;
  getReviewStats: (
    deck: DeckId,
    lang: LangCode
  ) => { total: number; approved: number; modified: number };
  onChangeLang: (lang: LangCode) => void;
  onOpenDeck: (deck: DeckId, lang: LangCode, slideIndex?: number) => void;
  onOpenPresenter: (deck: DeckId, lang: LangCode) => void;
  onOpenAtlasEntry: (entry: AtlasEntry, compareWithId?: string) => void;
  onNavigateView: (
    view: 'atlas' | 'cabinet3d' | 'studio' | 'apparatus' | 'slides' | 'docs' | 'drive',
    atlasSection?: 'catalog' | 'atelier'
  ) => void;
  onNotify?: (msg: string) => void;
}

const PRIMARY_LANGS: { code: LangCode; badge: string; fullLabel: string }[] = [
  { code: 'pt', badge: 'PT', fullLabel: 'Português' },
  { code: 'en', badge: 'EN', fullLabel: 'English' },
  { code: 'fr', badge: 'FR', fullLabel: 'Français' },
  { code: 'it', badge: 'IT', fullLabel: 'Italiano' },
  { code: 'nl', badge: 'NL', fullLabel: 'Nederlands' },
];

export function HomePortal({
  lang,
  ui,
  editorial,
  getReviewStats,
  onChangeLang,
  onOpenDeck,
  onOpenPresenter,
  onOpenAtlasEntry,
  onNavigateView,
  onNotify,
}: HomePortalProps) {
  const [copiedCompanion, setCopiedCompanion] = useState(false);
  const companion = COMPANION_INTERVENTION_BY_LANG[lang] || COMPANION_INTERVENTION_BY_LANG.pt;
  const copy = PORTAL_COPY[lang] || PORTAL_COPY.pt;

  const handleCopyCompanionCitation = async () => {
    try {
      await navigator.clipboard.writeText(companion.academicCitation);
      setCopiedCompanion(true);
      onNotify?.(companion.copiedToast);
      window.setTimeout(() => setCopiedCompanion(false), 2200);
    } catch {
      onNotify?.(companion.copiedToast);
    }
  };

  // DOC. 01 leads with "Entre representação e autenticação" (13 slides), followed by DOC. 02 ("O que a pesquisa me fez abandonar", 14 slides)
  const decksMeta: {
    id: DeckId;
    docCode: string;
    slideCount: number;
    category: string;
    title: string;
    subtitle: string;
  }[] = [
    {
      id: 'representacao',
      docCode: '[ DOC. 01 ]',
      slideCount: 13,
      category: ui.communication,
      title: ui.representacao,
      subtitle: ui.representacaoSub,
    },
    {
      id: 'trajeto',
      docCode: '[ DOC. 02 ]',
      slideCount: 14,
      category: ui.trajectory,
      title: ui.trajeto,
      subtitle: ui.trajetoSub,
    },
  ];

  return (
    <div className="w-full">
      {/* Variation 8 Opening Split: Left Editorial Hero Leading to DOC. 01 + Right Frosted Archive Panel */}
      <section className="grid grid-cols-1 lg:grid-cols-12 border-b-[1.5px] border-[#1c1c1c]">
        {/* Left Main Stage */}
        <div className="lg:col-span-7 xl:col-span-8 p-6 sm:p-10 lg:p-14 xl:p-16 lg:border-r-[1.5px] lg:border-[#1c1c1c] flex flex-col justify-between gap-8">
          <div className="space-y-6">
            <div>
              <p className="font-script text-[2.85rem] sm:text-[3.5rem] leading-none text-[#1c1c1c] -mb-2 -ml-1 select-none">
                Ana Vitória Vanzin
              </p>
              <p className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-[#7e2a1f] ml-1">
                {copy.brandSubtitle}
              </p>
            </div>

            <h1 className="font-serif font-light text-[clamp(3.1rem,6.3vw,6.2rem)] leading-[0.86] tracking-[-0.04em] uppercase text-[#1c1c1c]">
              Iconocracia
              <span className="block italic font-medium text-[#7e2a1f]">
                {copy.heroTitleAccent}
              </span>
            </h1>

            <p className="font-serif text-xl sm:text-2xl leading-[1.42] text-[#1c1c1c]/90 max-w-[560px]">
              {ui.description}
            </p>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.12em] text-[#1c1c1c]/65">
              <span>PPGD / UFSC</span>
              <span aria-hidden="true">·</span>
              <span>{ui.date}</span>
              <span aria-hidden="true">·</span>
              <span>ORCID 0009-0004-8464-6761</span>
            </div>

            {/* Primary Opening Presentation Gateway: Leads Directly to "Entre representação e autenticação" in PT / EN / FR */}
            <div className="p-5 sm:p-6 bg-white/65 backdrop-blur-[4px] border-[1.5px] border-[#1c1c1c] space-y-4 max-w-2xl">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1c1c1c]/15 pb-2.5">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#7e2a1f] font-bold">
                  {copy.leadKicker}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#1c1c1c]/65 tabular-nums">
                  {copy.leadScopeBadge}
                </span>
              </div>

              <div className="space-y-1.5">
                <h2 className="font-serif text-2xl sm:text-3xl font-medium leading-[1.12] text-[#1c1c1c]">
                  {ui.representacao}
                </h2>
                <p className="text-sm leading-relaxed text-[#1c1c1c]/80">{copy.leadSummary}</p>
              </div>

              {/* Trilingual + Full Edition Switcher */}
              <div className="space-y-2">
                <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-[#1c1c1c]/65">
                  {copy.leadEditionsLabel}
                </span>
                <div
                  role="group"
                  aria-label={copy.leadEditionsLabel}
                  className="flex flex-wrap items-center gap-1.5"
                >
                  {PRIMARY_LANGS.map((item) => {
                    const active = item.code === lang;
                    const isCoreColloquiumLang =
                      item.code === 'pt' || item.code === 'en' || item.code === 'fr';
                    return (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => onChangeLang(item.code)}
                        aria-pressed={active}
                        className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] border transition-colors whitespace-nowrap shrink-0 ${
                          active
                            ? 'bg-[#7e2a1f] border-[#7e2a1f] text-[#f2efeb] font-bold'
                            : isCoreColloquiumLang
                            ? 'bg-[#f2efeb] border-[#1c1c1c] text-[#1c1c1c] hover:bg-[#1c1c1c] hover:text-[#f2efeb]'
                            : 'bg-white/60 border-[#1c1c1c]/35 text-[#1c1c1c]/75 hover:border-[#1c1c1c] hover:text-[#1c1c1c]'
                        }`}
                      >
                        {item.badge} · {item.fullLabel}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Primary Launch Actions for DOC. 01 */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => onOpenPresenter('representacao', lang)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] border border-[#1c1c1c] bg-[#1c1c1c] text-[#f2efeb] hover:bg-[#7e2a1f] hover:border-[#7e2a1f] transition-colors whitespace-nowrap shrink-0"
                >
                  <Presentation className="w-3.5 h-3.5" />
                  <span>
                    {copy.leadPresentPrimary} ({lang.toUpperCase()})
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenDeck('representacao', lang, 0)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] border border-[#1c1c1c] bg-white/80 text-[#1c1c1c] hover:bg-[#1c1c1c] hover:text-[#f2efeb] transition-colors whitespace-nowrap shrink-0"
                >
                  <span>
                    {copy.leadOpenSlides} ({lang.toUpperCase()})
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* C01 Editorial Scope Strip */}
          <div className="pt-6 border-t border-[#1c1c1c]/15 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1.5 max-w-xl">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#7e2a1f]">
                {editorial.contributionTitle}
              </p>
              <p className="text-sm leading-relaxed text-[#1c1c1c]/80">
                {editorial.contribution[0]}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigateView('apparatus')}
              className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-[#1c1c1c] hover:text-[#7e2a1f] border-b border-[#1c1c1c]/40 hover:border-[#7e2a1f] pb-0.5 transition-colors whitespace-nowrap shrink-0 self-start sm:self-end"
            >
              <span>{ui.sources}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Archive Panel (Frosted Veil + DOC 01 [Representação] / DOC 02 [Trajeto] + Compact Corner Montesquieu Banner) */}
        <aside className="lg:col-span-5 xl:col-span-4 bg-white/40 backdrop-blur-[5px] p-6 sm:p-8 lg:p-10 flex flex-col justify-between gap-6">
          <div className="divide-y divide-[#1c1c1c]/15">
            {decksMeta.map((deck, index) => {
              const stats = getReviewStats(deck.id, lang);
              const isPrimaryDoc = index === 0;
              return (
                <article key={deck.id} className="py-6 first:pt-0 space-y-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span
                      className={`font-mono text-[10px] uppercase tracking-[0.2em] ${
                        isPrimaryDoc ? 'text-[#7e2a1f] font-bold' : 'text-[#7e2a1f]'
                      }`}
                    >
                      {deck.docCode}
                    </span>
                    <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[#1c1c1c]/60 tabular-nums">
                      <span>{copy.slidesCountLabel(deck.slideCount)}</span>
                      <span aria-hidden="true">·</span>
                      <span>{deck.category}</span>
                      {stats.approved > 0 && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-[#7e2a1f] font-bold">
                            {stats.approved}/{stats.total}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {isPrimaryDoc && (
                    <button
                      type="button"
                      onClick={() => onOpenDeck(deck.id, lang, 0)}
                      className="group/thumb relative aspect-[16/9] w-full overflow-hidden bg-[#1c1c1c] border border-[#1c1c1c]/30 hover:border-[#1c1c1c] transition-all block text-left shadow-[2px_2px_0px_0px_#1c1c1c]"
                    >
                      <img
                        src="/slides/slide-01.png"
                        alt={deck.title}
                        className="w-full h-full object-contain group-hover/thumb:scale-[1.02] transition-transform duration-200"
                        loading="eager"
                      />
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-[#1c1c1c]/90 text-[#f2efeb] font-mono text-[9px] uppercase tracking-wider border border-white/20">
                        13 Slides Reais · Saberes França-Brasil 2026
                      </div>
                    </button>
                  )}

                  <h2 className="font-serif text-2xl sm:text-[1.95rem] font-medium leading-[1.1] text-[#1c1c1c]">
                    <button
                      type="button"
                      onClick={() => onOpenDeck(deck.id, lang, 0)}
                      className="text-left hover:text-[#7e2a1f] transition-colors"
                    >
                      {deck.title}
                    </button>
                  </h2>

                  <p className="font-serif text-lg leading-[1.45] text-[#1c1c1c]/75">
                    {deck.subtitle}
                  </p>

                  {/* 5-Language Quick Jump Links */}
                  <div
                    className="flex flex-wrap items-center gap-1.5 pt-1"
                    role="group"
                    aria-label={`${ui.lang}: ${deck.title}`}
                  >
                    {LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => onOpenDeck(deck.id, l.code, 0)}
                        title={`${deck.title} (${l.nativeLabel})`}
                        className={`px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider transition-colors whitespace-nowrap shrink-0 ${
                          l.code === lang
                            ? 'text-[#7e2a1f] font-bold underline underline-offset-4'
                            : 'text-[#1c1c1c]/60 hover:text-[#1c1c1c]'
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => onOpenPresenter(deck.id, lang)}
                      className={`px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.12em] border transition-colors whitespace-nowrap shrink-0 ${
                        isPrimaryDoc
                          ? 'border-[#1c1c1c] bg-[#1c1c1c] text-[#f2efeb] hover:bg-[#7e2a1f] hover:border-[#7e2a1f]'
                          : 'border-[#1c1c1c] text-[#1c1c1c] hover:bg-[#1c1c1c] hover:text-[#f2efeb]'
                      }`}
                    >
                      {copy.presentBtn}
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenDeck(deck.id, lang, 0)}
                      className={`px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.12em] border transition-colors whitespace-nowrap shrink-0 ${
                        isPrimaryDoc
                          ? 'border-[#1c1c1c] text-[#1c1c1c] hover:bg-[#1c1c1c] hover:text-[#f2efeb]'
                          : 'border-[#1c1c1c] bg-[#1c1c1c] text-[#f2efeb] hover:bg-[#7e2a1f] hover:border-[#7e2a1f]'
                      }`}
                    >
                      {copy.openDocBtn}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Google Workspace Integrations: Google Slides & Google Docs */}
          <div className="py-4 border-t border-[#1c1c1c]/15 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#7e2a1f] font-bold">
                [ GOOGLE WORKSPACE ]
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#1c1c1c]/60">
                DRIVE · SLIDES · DOCS
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onNavigateView('slides')}
                className="p-3 border border-[#1c1c1c] bg-white/70 hover:bg-[#1c1c1c] hover:text-[#f2efeb] text-left transition-all space-y-1 group"
              >
                <div className="flex items-center justify-between text-[#7e2a1f] group-hover:text-[#e5988b]">
                  <Presentation className="w-4 h-4" />
                  <ArrowRight className="w-3 h-3" />
                </div>
                <div className="font-serif text-sm font-medium leading-tight">
                  Google Slides
                </div>
                <p className="font-mono text-[9px] uppercase tracking-wider text-[#1c1c1c]/60 group-hover:text-[#f2efeb]/70">
                  Usar meus slides
                </p>
              </button>

              <button
                type="button"
                onClick={() => onNavigateView('docs')}
                className="p-3 border border-[#1c1c1c] bg-white/70 hover:bg-[#1c1c1c] hover:text-[#f2efeb] text-left transition-all space-y-1 group"
              >
                <div className="flex items-center justify-between text-[#7e2a1f] group-hover:text-[#e5988b]">
                  <FileText className="w-4 h-4" />
                  <ArrowRight className="w-3 h-3" />
                </div>
                <div className="font-serif text-sm font-medium leading-tight">
                  Google Docs
                </div>
                <p className="font-mono text-[9px] uppercase tracking-wider text-[#1c1c1c]/60 group-hover:text-[#f2efeb]/70">
                  Ler manuscritos
                </p>
              </button>
            </div>
          </div>

          {/* Small Compact Corner Banner: Montesquieu / Serge Dauchy (11/11/2026) */}
          <aside
            aria-label={companion.kicker}
            className="mt-auto p-3.5 bg-[#f2efeb]/90 border border-[#1c1c1c]/35 space-y-2"
          >
            <div className="flex items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[#7e2a1f] tabular-nums">
              <span>11.11.2026 · MONTESQUIEU</span>
              <span className="text-[#1c1c1c]/60">CCJ/UFSC</span>
            </div>

            <div className="space-y-0.5">
              <h3 className="font-serif text-base font-medium leading-snug text-[#1c1c1c]">
                <a
                  href={MONTESQUIEU_COMPANION_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#7e2a1f] transition-colors"
                >
                  {companion.title}
                </a>
              </h3>
              <p className="text-[11px] leading-snug text-[#1c1c1c]/70 line-clamp-2">
                {companion.subtitle}
              </p>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <a
                href={MONTESQUIEU_COMPANION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] border border-[#1c1c1c] text-[#1c1c1c] hover:bg-[#1c1c1c] hover:text-[#f2efeb] transition-colors whitespace-nowrap shrink-0"
              >
                <span>{companion.openLabel}</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                type="button"
                onClick={handleCopyCompanionCitation}
                className="inline-flex items-center gap-1 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] border border-[#1c1c1c]/35 text-[#1c1c1c]/80 hover:border-[#1c1c1c] hover:text-[#1c1c1c] transition-colors whitespace-nowrap shrink-0"
              >
                {copiedCompanion ? (
                  <>
                    <Check className="w-3 h-3 text-[#14532d]" />
                    <span>{companion.copiedLabel}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>{companion.copyCitationLabel}</span>
                  </>
                )}
              </button>
            </div>
          </aside>
        </aside>
      </section>

      {/* Main Interactive Focal Point: Chronological Documentary Timeline (1494–1906) */}
      <div className="px-6 sm:px-10 lg:px-14 py-12 lg:py-16 border-b-[1.5px] border-[#1c1c1c]">
        <div className="max-w-[1360px] mx-auto">
          <DocumentaryTimeline
            lang={lang}
            onOpenDeck={onOpenDeck}
            onOpenAtlasEntry={onOpenAtlasEntry}
            onNavigateView={onNavigateView}
            onNotify={onNotify}
          />
        </div>
      </div>

      {/* Curatorial Atlas Preview Section */}
      <section
        aria-labelledby="atlas-preview-heading"
        className="px-6 sm:px-10 lg:px-14 py-12 lg:py-16"
      >
        <div className="max-w-[1360px] mx-auto space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#1c1c1c]/15 pb-5">
            <div className="space-y-1.5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#7e2a1f]">
                {copy.atlasKicker}
              </p>
              <h2
                id="atlas-preview-heading"
                className="font-serif text-3xl sm:text-4xl font-light text-[#1c1c1c]"
              >
                {copy.atlasHeading}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => onNavigateView('cabinet3d')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.1em] border border-[#1c1c1c] bg-[#1c1c1c] text-[#f2efeb] hover:bg-[#7e2a1f] hover:border-[#7e2a1f] transition-colors whitespace-nowrap shrink-0"
              >
                <Box className="w-3.5 h-3.5" />
                <span>{copy.open3dCabinetBtn}</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateView('atlas', 'atelier')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.1em] border border-[#7e2a1f] text-[#7e2a1f] hover:bg-[#7e2a1f] hover:text-[#f2efeb] transition-colors whitespace-nowrap shrink-0"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>{copy.openImageAtelierBtn}</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenAtlasEntry(ATLAS_ENTRIES[0], 'ripa-1603')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.1em] border border-[#1c1c1c] text-[#1c1c1c] hover:bg-[#1c1c1c] hover:text-[#f2efeb] transition-colors whitespace-nowrap shrink-0"
              >
                <Columns2 className="w-3.5 h-3.5" />
                <span>{copy.compareBrantRipa}</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateView('atlas', 'catalog')}
                className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-[#7e2a1f] hover:underline whitespace-nowrap shrink-0"
              >
                <span>{copy.viewFullCatalog}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ATLAS_ENTRIES.map((entry) => (
              <article
                key={entry.id}
                className="group flex flex-col bg-white/55 backdrop-blur-[3px] border border-[#1c1c1c]/20 hover:border-[#1c1c1c] transition-colors overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => onOpenAtlasEntry(entry)}
                  className="relative aspect-[4/3] w-full overflow-hidden bg-[#e7e2da] text-left border-b border-[#1c1c1c]/15"
                  aria-label={`${copy.lightTableBadge}: ${entry.title}`}
                >
                  <ArchivalPlateImage
                    src={entry.imageSrc}
                    alt={entry.imageAlt}
                    accessionCode={entry.accessionCode}
                    title={entry.title}
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                  />
                  <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 px-2.5 py-1 bg-[#1c1c1c] text-[#f2efeb] font-mono text-[10px] uppercase tracking-[0.1em]">
                    <Expand className="w-3 h-3" />
                    <span>{copy.lightTableBadge}</span>
                  </span>
                </button>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#1c1c1c]/65 tabular-nums">
                      <span className="text-[#7e2a1f] font-bold">{entry.year}</span>
                      <span aria-hidden="true">·</span>
                      <span>{entry.accessionCode}</span>
                    </div>
                    <h3 className="font-serif text-xl font-medium leading-snug text-[#1c1c1c]">
                      <button
                        type="button"
                        onClick={() => onOpenAtlasEntry(entry)}
                        className="text-left hover:text-[#7e2a1f] transition-colors"
                      >
                        {entry.title}
                      </button>
                    </h3>
                    <p className="text-xs leading-relaxed text-[#1c1c1c]/75 line-clamp-2">
                      {entry.juridicalQuestion}
                    </p>
                  </div>

                  <p className="pt-2 border-t border-[#1c1c1c]/12 font-mono text-[10px] text-[#7e2a1f]">
                    {entry.statusDetail}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * HomePortal Component
 * Flagship Landing Page & Archive Portal for ICONOCRACIA
 * Led by the Embedded Interactive Slide Player + Academic Broadsheet Edition
 * Author: Ana Vitória Vanzin Mendes (PPGD/UFSC · Ius Gentium)
 */

import { useState } from 'react';
import {
  ArrowRight,
  Box,
  Check,
  Columns2,
  Copy,
  Expand,
  ExternalLink,
  Presentation,
  Wand2,
} from 'lucide-react';
import { ATLAS_ENTRIES, LANGUAGES } from '../data/atlasCatalog';
import { BroadsheetLang } from '../data/broadsheetEditionData';
import { PORTAL_COPY } from '../data/portalCopy';
import {
  COMPANION_INTERVENTION_BY_LANG,
  MONTESQUIEU_COMPANION_URL,
} from '../data/timelineMilestones';
import { AtlasEntry, DeckId, EditorialContent, LangCode, SlideItem, UIStrings } from '../types';
import { ArchivalPlateImage } from './ArchivalPlateImage';
import { BroadsheetEdition } from './BroadsheetEdition';
import { DocumentaryTimeline } from './DocumentaryTimeline';
import { EmbeddedSlidePlayer } from './EmbeddedSlidePlayer';

interface HomePortalProps {
  lang: LangCode;
  ui: UIStrings;
  editorial: EditorialContent;
  slides?: SlideItem[];
  getMergedSlides: (deck: DeckId, lang: LangCode) => SlideItem[];
  getPresenterNote: (deck: DeckId, index: number, lang: LangCode) => string;
  getReviewStats: (
    deck: DeckId,
    lang: LangCode
  ) => { total: number; approved: number; modified: number };
  onChangeLang: (lang: LangCode) => void;
  onOpenDeck: (deck: DeckId, lang: LangCode, slideIndex?: number) => void;
  onOpenPresenter: (deck: DeckId, lang: LangCode, slideIndex?: number) => void;
  onOpenAtlasEntry: (entry: AtlasEntry, compareWithId?: string) => void;
  onNavigateView: (
    view: 'atlas' | 'cabinet3d' | 'studio' | 'apparatus',
    atlasSection?: 'catalog' | 'atelier'
  ) => void;
  onNotify?: (msg: string) => void;
}

export function HomePortal({
  lang,
  ui,
  slides = [],
  getMergedSlides,
  getPresenterNote,
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

  const broadsheetLang: BroadsheetLang =
    lang === 'pt' || lang === 'en' || lang === 'fr' ? lang : 'pt';

  const doc2Stats = getReviewStats('trajeto', lang);

  return (
    <div className="w-full">
      {/* 0. Embedded Interactive Public Slide Player (DOC. 01 & DOC. 02 + Fullscreen) */}
      <EmbeddedSlidePlayer
        lang={lang}
        ui={ui}
        getMergedSlides={getMergedSlides}
        getPresenterNote={getPresenterNote}
        onChangeLang={onChangeLang}
        onOpenInReader={(deck, l, idx) => onOpenDeck(deck, l, idx)}
        onOpenPresenter={(deck, l, idx) => onOpenPresenter(deck, l, idx)}
        onOpenLightbox={onOpenAtlasEntry}
      />

      {/* 1. Flagship Presentation & Broadsheet Edition */}
      <section id="flagship-broadsheet" aria-label="Edição especial de apresentação">
        <BroadsheetEdition
          currentLang={broadsheetLang}
          slides={slides}
          ui={ui}
          onChangeLang={(nextBroadsheetLang) => onChangeLang(nextBroadsheetLang as LangCode)}
          onOpenDeckInReader={(deck, l, sIdx) => onOpenDeck(deck, l, sIdx)}
          onOpenPresenterStage={(deck, l, sIdx) => onOpenPresenter(deck, l, sIdx)}
          onNotify={onNotify || (() => {})}
        />
      </section>

      {/* 2. Secondary Doctoral Dossier & Montesquieu Colloquium Cross-Reference */}
      <section
        id="dossier-complementary"
        aria-label="Documentos complementares da pesquisa"
        className="border-b-[1.5px] border-[#1c1c1c] dark:border-[#f2efeb]/30 bg-white/40 dark:bg-[#121212] backdrop-blur-[4px] px-6 sm:px-10 lg:px-14 py-12"
      >
        <div className="max-w-[1360px] mx-auto space-y-8">
          <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[#1c1c1c]/20 dark:border-[#f2efeb]/20 pb-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#7e2a1f] dark:text-[#e5988b] font-bold">
                [ DOSSIÊ DOUTORAL · DOCUMENTO COMPLEMENTAR ]
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#1c1c1c] dark:text-[#f2efeb] mt-1">
                Trajetória, Metodologia e Referências de Colóquio
              </h2>
            </div>
            <span className="font-mono text-xs uppercase tracking-wider text-[#1c1c1c]/60 dark:text-[#f2efeb]/65">
              PPGD/UFSC · 2026
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* DOC. 02 Feature Card */}
            <article className="lg:col-span-7 p-6 sm:p-8 border border-[#1c1c1c] dark:border-[#f2efeb]/45 bg-[#f2efeb] dark:bg-[#191919] flex flex-col justify-between gap-6 shadow-[3px_3px_0px_0px_#1c1c1c] dark:shadow-[3px_3px_0px_0px_rgba(242,239,235,0.22)]">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1c1c1c]/15 dark:border-[#f2efeb]/20 pb-3">
                  <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#7e2a1f] dark:text-[#e5988b] font-bold">
                    [ DOC. 02 · 14 SLIDES ]
                  </span>
                  <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-[#1c1c1c]/60 dark:text-[#f2efeb]/65">
                    <span>{ui.trajectory}</span>
                    {doc2Stats.approved > 0 && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-[#7e2a1f] dark:text-[#e5988b] font-bold">
                          {doc2Stats.approved}/{doc2Stats.total} revisados
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-serif text-2xl sm:text-3xl font-medium leading-tight text-[#1c1c1c] dark:text-[#f2efeb]">
                    {ui.trajeto}
                  </h3>
                  <p className="font-serif text-lg leading-relaxed text-[#1c1c1c]/80 dark:text-[#f2efeb]/85 italic">
                    {ui.trajetoSub}
                  </p>
                  <p className="text-sm leading-relaxed text-[#1c1c1c]/75 dark:text-[#f2efeb]/80 pt-1">
                    Exposição sobre o percurso metodológico da tese, os desvios epistemológicos, os
                    arquivos confrontados e as premissas historiográficas abandonadas na busca pelo estatuto
                    jurídico da imagem no trânsito atlântico.
                  </p>
                </div>

                {/* Multilingual Links for DOC. 02 */}
                <div className="space-y-1.5 pt-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#1c1c1c]/60 dark:text-[#f2efeb]/65">
                    {ui.lang}:
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => onOpenDeck('trajeto', l.code, 0)}
                        className={`px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider border transition-colors ${
                          l.code === lang
                            ? 'bg-[#7e2a1f] border-[#7e2a1f] text-[#f2efeb] font-bold'
                            : 'bg-white/80 dark:bg-[#121212] border-[#1c1c1c]/30 dark:border-[#f2efeb]/30 text-[#1c1c1c] dark:text-[#f2efeb] hover:border-[#1c1c1c] dark:hover:border-[#f2efeb]'
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[#1c1c1c]/15 dark:border-[#f2efeb]/20">
                <button
                  type="button"
                  onClick={() => onOpenPresenter('trajeto', lang)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] border border-[#1c1c1c] dark:border-[#f2efeb] bg-[#1c1c1c] dark:bg-[#f2efeb] text-[#f2efeb] dark:text-[#0d0d0d] hover:bg-[#7e2a1f] hover:border-[#7e2a1f] dark:hover:bg-[#e5988b] dark:hover:border-[#e5988b] transition-colors whitespace-nowrap"
                >
                  <Presentation className="w-3.5 h-3.5" />
                  <span>Apresentar Trajetória</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenDeck('trajeto', lang, 0)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] border border-[#1c1c1c] dark:border-[#f2efeb]/60 bg-white dark:bg-[#121212] text-[#1c1c1c] dark:text-[#f2efeb] hover:bg-[#1c1c1c] hover:text-[#f2efeb] dark:hover:bg-[#f2efeb] dark:hover:text-[#0d0d0d] transition-colors whitespace-nowrap"
                >
                  <span>Abrir 14 Slides</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>

            {/* Right Column: Montesquieu Colloquium Academic Card */}
            <aside
              aria-label={companion.kicker}
              className="lg:col-span-5 p-6 sm:p-8 border border-[#1c1c1c] dark:border-[#f2efeb]/45 bg-[#f2efeb] dark:bg-[#191919] flex flex-col justify-between gap-6"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[#7e2a1f] dark:text-[#e5988b] tabular-nums border-b border-[#1c1c1c]/15 dark:border-[#f2efeb]/20 pb-3">
                  <span className="font-bold">11.11.2026 · COLÓQUIO MONTESQUIEU</span>
                  <span className="text-[#1c1c1c]/60 dark:text-[#f2efeb]/65">CCJ / UFSC</span>
                </div>

                <div className="space-y-2.5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#1c1c1c]/60 dark:text-[#f2efeb]/65">
                    {companion.kicker}
                  </p>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold leading-snug text-[#1c1c1c] dark:text-[#f2efeb]">
                    <a
                      href={MONTESQUIEU_COMPANION_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#7e2a1f] dark:hover:text-[#e5988b] transition-colors"
                    >
                      {companion.title}
                    </a>
                  </h3>
                  <p className="text-sm leading-relaxed text-[#1c1c1c]/80 dark:text-[#f2efeb]/85">
                    {companion.subtitle}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-[#1c1c1c]/15 dark:border-[#f2efeb]/20">
                <a
                  href={MONTESQUIEU_COMPANION_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.1em] border border-[#1c1c1c] dark:border-[#f2efeb]/60 text-[#1c1c1c] dark:text-[#f2efeb] hover:bg-[#1c1c1c] hover:text-[#f2efeb] dark:hover:bg-[#f2efeb] dark:hover:text-[#0d0d0d] transition-colors whitespace-nowrap"
                >
                  <span>{companion.openLabel}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  type="button"
                  onClick={handleCopyCompanionCitation}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.1em] border border-[#1c1c1c]/40 dark:border-[#f2efeb]/35 text-[#1c1c1c]/80 dark:text-[#f2efeb]/85 hover:border-[#1c1c1c] dark:hover:border-[#f2efeb] hover:text-[#1c1c1c] dark:hover:text-[#f2efeb] transition-colors whitespace-nowrap"
                >
                  {copiedCompanion ? (
                    <>
                      <Check className="w-3 h-3 text-[#14532d] dark:text-[#6ee7b7]" />
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
          </div>
        </div>
      </section>

      {/* 3. Main Interactive Focal Point: Chronological Documentary Timeline (1494–1906) */}
      <section
        id="chronological-timeline"
        aria-label="Linha do tempo documental (1494-1906)"
        className="px-6 sm:px-10 lg:px-14 py-12 lg:py-16 border-b-[1.5px] border-[#1c1c1c] dark:border-[#f2efeb]/30 bg-white/20 dark:bg-[#0f0f0f]"
      >
        <div className="max-w-[1360px] mx-auto">
          <DocumentaryTimeline
            lang={lang}
            onOpenDeck={onOpenDeck}
            onOpenAtlasEntry={onOpenAtlasEntry}
            onNavigateView={onNavigateView}
            onNotify={onNotify}
          />
        </div>
      </section>

      {/* 4. Curatorial Atlas Preview Section */}
      <section
        id="atlas-preview"
        aria-labelledby="atlas-preview-heading"
        className="px-6 sm:px-10 lg:px-14 py-12 lg:py-16"
      >
        <div className="max-w-[1360px] mx-auto space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#1c1c1c]/15 dark:border-[#f2efeb]/20 pb-5">
            <div className="space-y-1.5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#7e2a1f] dark:text-[#e5988b]">
                {copy.atlasKicker}
              </p>
              <h2
                id="atlas-preview-heading"
                className="font-serif text-3xl sm:text-4xl font-light text-[#1c1c1c] dark:text-[#f2efeb]"
              >
                {copy.atlasHeading}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => onNavigateView('cabinet3d')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.1em] border border-[#1c1c1c] dark:border-[#f2efeb] bg-[#1c1c1c] dark:bg-[#f2efeb] text-[#f2efeb] dark:text-[#0d0d0d] hover:bg-[#7e2a1f] hover:border-[#7e2a1f] dark:hover:bg-[#e5988b] dark:hover:border-[#e5988b] transition-colors whitespace-nowrap shrink-0"
              >
                <Box className="w-3.5 h-3.5" />
                <span>{copy.open3dCabinetBtn}</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateView('atlas', 'atelier')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.1em] border border-[#7e2a1f] dark:border-[#e5988b] text-[#7e2a1f] dark:text-[#e5988b] hover:bg-[#7e2a1f] hover:text-[#f2efeb] dark:hover:bg-[#e5988b] dark:hover:text-[#0d0d0d] transition-colors whitespace-nowrap shrink-0"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>{copy.openImageAtelierBtn}</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenAtlasEntry(ATLAS_ENTRIES[0], 'ripa-1603')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.1em] border border-[#1c1c1c] dark:border-[#f2efeb]/60 text-[#1c1c1c] dark:text-[#f2efeb] hover:bg-[#1c1c1c] hover:text-[#f2efeb] dark:hover:bg-[#f2efeb] dark:hover:text-[#0d0d0d] transition-colors whitespace-nowrap shrink-0"
              >
                <Columns2 className="w-3.5 h-3.5" />
                <span>{copy.compareBrantRipa}</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateView('atlas', 'catalog')}
                className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-[#7e2a1f] dark:text-[#e5988b] hover:underline whitespace-nowrap shrink-0"
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
                className="group flex flex-col bg-white/55 dark:bg-[#181818] backdrop-blur-[3px] border border-[#1c1c1c]/20 dark:border-[#f2efeb]/25 hover:border-[#1c1c1c] dark:hover:border-[#f2efeb] transition-colors overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => onOpenAtlasEntry(entry)}
                  className="relative aspect-[4/3] w-full overflow-hidden bg-[#e7e2da] dark:bg-[#111111] text-left border-b border-[#1c1c1c]/15 dark:border-[#f2efeb]/15"
                  aria-label={`${copy.lightTableBadge}: ${entry.title}`}
                >
                  <ArchivalPlateImage
                    src={entry.imageSrc}
                    alt={entry.imageAlt}
                    accessionCode={entry.accessionCode}
                    title={entry.title}
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                  />
                  <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 px-2.5 py-1 bg-[#1c1c1c] text-[#f2efeb] border border-[#f2efeb]/20 font-mono text-[10px] uppercase tracking-[0.1em]">
                    <Expand className="w-3 h-3" />
                    <span>{copy.lightTableBadge}</span>
                  </span>
                </button>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#1c1c1c]/65 dark:text-[#f2efeb]/70 tabular-nums">
                      <span className="text-[#7e2a1f] dark:text-[#e5988b] font-bold">{entry.year}</span>
                      <span aria-hidden="true">·</span>
                      <span>{entry.accessionCode}</span>
                    </div>
                    <h3 className="font-serif text-xl font-medium leading-snug text-[#1c1c1c] dark:text-[#f2efeb]">
                      <button
                        type="button"
                        onClick={() => onOpenAtlasEntry(entry)}
                        className="text-left hover:text-[#7e2a1f] dark:hover:text-[#e5988b] transition-colors"
                      >
                        {entry.title}
                      </button>
                    </h3>
                    <p className="text-xs leading-relaxed text-[#1c1c1c]/75 dark:text-[#f2efeb]/80 line-clamp-2">
                      {entry.juridicalQuestion}
                    </p>
                  </div>

                  <p className="pt-2 border-t border-[#1c1c1c]/12 dark:border-[#f2efeb]/15 font-mono text-[10px] text-[#7e2a1f] dark:text-[#e5988b]">
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

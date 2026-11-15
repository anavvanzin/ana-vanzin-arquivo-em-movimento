/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BroadsheetEdition Component
 * Flagship Academic Newspaper & Conference Reader for ICONOCRACIA
 * "Between Representation and Authentication"
 * Author: Ana Vitória Vanzin Mendes (PPGD/UFSC · Ius Gentium)
 */

import { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  Columns2,
  Copy,
  Download,
  Expand,
  ExternalLink,
  FileText,
  Maximize2,
  Presentation,
  Printer,
  Sparkles,
  Volume2,
} from 'lucide-react';
import {
  BROADSHEET_DATA,
  BroadsheetLang,
} from '../data/broadsheetEditionData';
import {
  COMPANION_INTERVENTION_BY_LANG,
  MONTESQUIEU_COMPANION_URL,
} from '../data/timelineMilestones';
import { DeckId, LangCode, SlideItem, UIStrings } from '../types';
import { SlideProjectionModal } from './SlideProjectionModal';

interface BroadsheetEditionProps {
  currentLang: BroadsheetLang;
  slides: SlideItem[];
  ui: UIStrings;
  onChangeLang: (lang: BroadsheetLang) => void;
  onOpenDeckInReader: (deck: DeckId, lang: LangCode, slideIndex?: number) => void;
  onOpenPresenterStage: (deck: DeckId, lang: LangCode, slideIndex?: number) => void;
  onNotify: (msg: string) => void;
}

export function BroadsheetEdition({
  currentLang,
  slides,
  ui,
  onChangeLang,
  onOpenDeckInReader,
  onOpenPresenterStage,
  onNotify,
}: BroadsheetEditionProps) {
  const [largeType, setLargeType] = useState<boolean>(false);
  const [activeSlideNumber, setActiveSlideNumber] = useState<number | null>(null);
  const [copiedCitation, setCopiedCitation] = useState<boolean>(false);

  // Accordion details toggle states
  const [fold1Open, setFold1Open] = useState<boolean>(false);
  const [fold2Open, setFold2Open] = useState<boolean>(false);
  const [fold3Open, setFold3Open] = useState<boolean>(false);

  const data = BROADSHEET_DATA[currentLang] || BROADSHEET_DATA.pt;
  const companion =
    COMPANION_INTERVENTION_BY_LANG[currentLang as LangCode] || COMPANION_INTERVENTION_BY_LANG.pt;

  const handleCopyCitation = async () => {
    try {
      const citationText = `MENDES, Ana Vitória Vanzin. Between Representation and Authentication. In: Saberes França–Brasil: história, direito e circulação de modelos. Florianópolis: PPGD/UFSC, 2026.`;
      await navigator.clipboard.writeText(citationText);
      setCopiedCitation(true);
      onNotify('Citação acadêmica copiada para a área de transferência.');
      window.setTimeout(() => setCopiedCitation(false), 2200);
    } catch {
      onNotify('Não foi possível copiar automaticamente.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const scrollToAnchor = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full bg-[#f2efeb] dark:bg-[#0d0d0d] text-[#1c1c1c] dark:text-[#f2efeb] transition-colors">
      {/* 1. Academic Reading Toolbar */}
      <div className="no-print sticky top-0 z-30 bg-[#f2efeb]/95 dark:bg-[#141414]/95 backdrop-blur-[6px] border-b-[1.5px] border-[#1c1c1c] dark:border-[#f2efeb]/65 shadow-sm">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between gap-3 font-mono text-[11px] uppercase tracking-wider">
          {/* Anchor Navigation */}
          <nav aria-label="Navegação da edição" className="flex items-center gap-1 sm:gap-3 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => scrollToAnchor('representation')}
              className="py-1 px-2 text-[#1c1c1c]/80 dark:text-[#f2efeb]/85 hover:text-[#7e2a1f] dark:hover:text-[#e5988b] hover:underline underline-offset-4 whitespace-nowrap"
            >
              {data.navigation.argument}
            </button>
            <span aria-hidden="true" className="text-[#1c1c1c]/30 dark:text-[#f2efeb]/35">/</span>
            <button
              type="button"
              onClick={() => scrollToAnchor('case-file')}
              className="py-1 px-2 text-[#1c1c1c]/80 dark:text-[#f2efeb]/85 hover:text-[#7e2a1f] dark:hover:text-[#e5988b] hover:underline underline-offset-4 whitespace-nowrap"
            >
              {data.navigation.caseFile}
            </button>
            <span aria-hidden="true" className="text-[#1c1c1c]/30 dark:text-[#f2efeb]/35">/</span>
            <button
              type="button"
              onClick={() => scrollToAnchor('method')}
              className="py-1 px-2 text-[#1c1c1c]/80 dark:text-[#f2efeb]/85 hover:text-[#7e2a1f] dark:hover:text-[#e5988b] hover:underline underline-offset-4 whitespace-nowrap"
            >
              {data.navigation.method}
            </button>
            <span aria-hidden="true" className="text-[#1c1c1c]/30 dark:text-[#f2efeb]/35">/</span>
            <button
              type="button"
              onClick={() => scrollToAnchor('sources')}
              className="py-1 px-2 text-[#1c1c1c]/80 dark:text-[#f2efeb]/85 hover:text-[#7e2a1f] dark:hover:text-[#e5988b] hover:underline underline-offset-4 whitespace-nowrap"
            >
              {data.navigation.sources}
            </button>
          </nav>

          {/* Reading Actions: Type Toggle, Print, Slides Modal Trigger, Language Selector */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Modal Trigger for all 13 Slides */}
            <button
              type="button"
              onClick={() => setActiveSlideNumber(1)}
              className="group inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#1c1c1c] dark:bg-[#f2efeb] text-[#f2efeb] dark:text-[#0d0d0d] hover:bg-[#7e2a1f] dark:hover:bg-[#e5988b] dark:hover:text-[#0d0d0d] transition-colors whitespace-nowrap"
              title="Abrir modal de projeção das 13 lâminas reais em 16:9"
            >
              <Presentation className="w-3.5 h-3.5 text-[#e5988b] dark:text-[#7e2a1f] dark:group-hover:text-[#0d0d0d]" />
              <span className="hidden sm:inline">{data.navigation.slidesModalBtn}</span>
              <span className="sm:hidden">13 Lâminas</span>
            </button>

            {/* Type Size Toggle */}
            <button
              type="button"
              onClick={() => setLargeType((t) => !t)}
              className="p-1 px-2 border border-[#1c1c1c]/40 dark:border-[#f2efeb]/45 hover:border-[#1c1c1c] dark:hover:border-[#f2efeb] hover:bg-white dark:hover:bg-[#222222] text-[#1c1c1c] dark:text-[#f2efeb] transition-colors"
              title={data.navigation.typeToggleDesc}
              aria-pressed={largeType}
            >
              {largeType ? 'A−' : 'A＋'}
            </button>

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="hidden md:inline-flex items-center gap-1 px-2 py-1 border border-[#1c1c1c]/40 dark:border-[#f2efeb]/45 hover:border-[#1c1c1c] dark:hover:border-[#f2efeb] hover:bg-white dark:hover:bg-[#222222] text-[#1c1c1c] dark:text-[#f2efeb] transition-colors"
              title="Imprimir edição em papel A3 ou salvar PDF"
            >
              <Printer className="w-3 h-3" />
              <span>{data.navigation.printBtn}</span>
            </button>

            {/* Trilingual Segmented Selector */}
            <div className="flex items-center border border-[#1c1c1c] dark:border-[#f2efeb]/65 bg-white/70 dark:bg-[#1c1c1c] p-0.5" role="group" aria-label="Idioma do periódico">
              {(['pt', 'en', 'fr'] as BroadsheetLang[]).map((l) => {
                const active = currentLang === l;
                return (
                  <button
                    key={l}
                    type="button"
                    onClick={() => onChangeLang(l)}
                    className={`px-2 py-0.5 text-[10px] font-bold uppercase transition-colors ${
                      active
                        ? 'bg-[#1c1c1c] dark:bg-[#f2efeb] text-[#f2efeb] dark:text-[#0d0d0d]'
                        : 'text-[#1c1c1c]/60 dark:text-[#f2efeb]/70 hover:text-[#1c1c1c] dark:hover:text-[#f2efeb]'
                    }`}
                  >
                    {l.toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Newspaper Broadsheet Paper Canvas */}
      <main className="max-w-[1360px] mx-auto p-4 sm:p-8 lg:p-12 space-y-8">
        <div className="bg-[#f2efeb] dark:bg-[#141414] border-[1.5px] border-[#1c1c1c] dark:border-[#f2efeb]/70 p-6 sm:p-10 lg:p-12 shadow-[6px_6px_0px_0px_#1c1c1c] dark:shadow-[6px_6px_0px_0px_rgba(242,239,235,0.22)] space-y-8">
          {/* Topline Editorial Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-[1.5px] border-[#1c1c1c] dark:border-[#f2efeb]/65 pb-3 font-mono text-[11px] uppercase tracking-[0.14em] text-[#1c1c1c]/80 dark:text-[#f2efeb]/85">
            <span>{data.toplineLeft}</span>
            <span className="text-[#7e2a1f] dark:text-[#e5988b] sm:text-right font-medium">{data.toplineRight}</span>
          </div>

          {/* Monumental Newspaper Masthead */}
          <header className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-2 pb-6 border-b border-[#1c1c1c] dark:border-[#f2efeb]/60">
              {/* Left Column (Author Credit) */}
              <div className="lg:col-span-3 p-4 border border-[#1c1c1c] dark:border-[#f2efeb]/60 bg-white/50 dark:bg-[#1a1a1a] space-y-1">
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#7e2a1f] dark:text-[#e5988b]">
                  PESQUISADORA / AUTORA
                </span>
                <h3 className="font-serif text-lg font-bold text-[#1c1c1c] dark:text-[#f2efeb] leading-tight">
                  {data.authorName}
                </h3>
                <p className="font-serif italic text-xs text-[#1c1c1c]/70 dark:text-[#f2efeb]/75">
                  {data.authorTitle}
                </p>
                <p className="font-mono text-[10px] uppercase tracking-wider text-[#1c1c1c]/60 dark:text-[#f2efeb]/70">
                  {data.authorInstitution}
                </p>
              </div>

              {/* Center Column: Grand Newspaper Title */}
              <div className="lg:col-span-6 text-center space-y-2">
                <h1 className="font-serif font-bold text-5xl sm:text-7xl lg:text-8xl tracking-tight text-[#1c1c1c] dark:text-[#f2efeb] uppercase leading-none select-none">
                  {data.mastheadTitle}
                </h1>
                <div className="font-serif text-xs sm:text-sm tracking-[0.22em] uppercase text-[#7e2a1f] dark:text-[#e5988b] font-semibold">
                  {data.mastheadSubtitle}
                </div>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#1c1c1c]/60 dark:text-[#f2efeb]/70 pt-1">
                  — {data.mastheadMotto} —
                </p>
              </div>

              {/* Right Column (Edition Meta Box) */}
              <div className="lg:col-span-3 p-4 border border-[#1c1c1c] dark:border-[#f2efeb]/60 bg-white/50 dark:bg-[#1a1a1a] space-y-1">
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#7e2a1f] dark:text-[#e5988b]">
                  COMUNICAÇÃO DOUTORAL
                </span>
                <h3 className="font-serif text-lg font-bold text-[#1c1c1c] dark:text-[#f2efeb] leading-tight">
                  {data.editionBanner.event}
                </h3>
                <p className="font-mono text-[10px] uppercase tracking-wider text-[#1c1c1c]/80 dark:text-[#f2efeb]/85">
                  {data.editionBanner.duration}
                </p>
                <p className="font-serif italic text-xs text-[#1c1c1c]/70 dark:text-[#f2efeb]/75">
                  {data.editionBanner.structure}
                </p>
              </div>
            </div>

            {/* Double Rule Editorial Theme Banner */}
            <div className="border-t-4 border-b border-[#1c1c1c] dark:border-[#f2efeb]/70 py-4 text-center space-y-2 border-double">
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#7e2a1f] dark:text-[#e5988b] font-bold">
                [ {data.issueTheme.badge} ]
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal leading-tight text-[#1c1c1c] dark:text-[#f2efeb] max-w-4xl mx-auto whitespace-pre-line">
                {data.issueTheme.headline}
              </h2>
              <p className="font-serif italic text-base sm:text-lg text-[#1c1c1c]/75 dark:text-[#f2efeb]/80 max-w-2xl mx-auto">
                {data.issueTheme.subtitle}
              </p>
            </div>
          </header>

          {/* 3. Three-Column Broadsheet Editorial Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* COLUMN 1: Front Page · Representation (Sections 01–04) */}
            <article
              id="representation"
              className="lg:col-span-4 space-y-6 lg:border-r lg:border-[#1c1c1c]/25 dark:lg:border-[#f2efeb]/25 lg:pr-8"
            >
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] border-b border-[#1c1c1c]/20 dark:border-[#f2efeb]/25 pb-2">
                <span className="text-[#7e2a1f] dark:text-[#e5988b] font-bold">{data.section1.label}</span>
                <span className="text-xl font-serif italic text-[#1c1c1c]/60 dark:text-[#f2efeb]/70">{data.section1.number}</span>
              </div>

              <div className="space-y-3">
                <h3 className="font-serif text-3xl sm:text-4xl font-light leading-[1.08] text-[#1c1c1c] dark:text-[#f2efeb]">
                  {data.section1.headline}
                </h3>
                <p className="font-serif text-base leading-snug text-[#1c1c1c]/85 dark:text-[#f2efeb]/90">
                  {data.section1.deck}
                </p>
                <p className="font-mono text-[10px] text-[#1c1c1c]/60 dark:text-[#f2efeb]/70">
                  {data.section1.byline}
                </p>
              </div>

              {/* Interactive Slide Projection Teaser Card for DOC. 01 */}
              <div className="space-y-2">
                <div
                  onClick={() => setActiveSlideNumber(1)}
                  className="group cursor-pointer relative aspect-[16/9] w-full bg-[#121212] border-[1.5px] border-[#1c1c1c] dark:border-[#f2efeb]/65 overflow-hidden shadow-md"
                >
                  <img
                    src="/slides/slide-01.png"
                    alt={data.section1.headline}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <span className="px-3 py-1.5 bg-[#1c1c1c] text-[#f2efeb] font-mono text-[10px] uppercase tracking-wider border border-white/30 flex items-center gap-1.5 group-hover:scale-105 transition-transform">
                      <Maximize2 className="w-3 h-3 text-[#e5988b]" />
                      <span>{data.navigation.projectSlideLabel} 01</span>
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between font-mono text-[10px] text-[#1c1c1c]/70 dark:text-[#f2efeb]/75 px-1">
                  <span>LÂMINAS 01 A 04 · SABERES 2026</span>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setActiveSlideNumber(num)}
                        className="px-1.5 py-0.5 border border-[#1c1c1c]/30 dark:border-[#f2efeb]/40 hover:border-[#7e2a1f] dark:hover:border-[#e5988b] hover:text-[#7e2a1f] dark:hover:text-[#e5988b] transition-colors"
                      >
                        {String(num).padStart(2, '0')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Lead Body Copy with Drop Cap */}
              <div className={`space-y-4 text-justify ${largeType ? 'text-lg leading-[1.8]' : 'text-base leading-[1.72]'}`}>
                <p>
                  <span className="float-left text-5xl font-serif font-bold leading-none pr-3 pt-1 text-[#7e2a1f] dark:text-[#e5988b]">
                    {data.section1.dropCapLetter}
                  </span>
                  {data.section1.leadP1.slice(1)}
                </p>
                <p>{data.section1.leadP2}</p>
              </div>

              {/* Evidence Ledger Box */}
              <aside className="p-4 border-[1.5px] border-[#1c1c1c] dark:border-[#f2efeb]/65 bg-white/70 dark:bg-[#1a1a1a] space-y-3">
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#7e2a1f] dark:text-[#e5988b] font-bold block">
                  {data.section1.evidenceLedger.kicker}
                </span>
                <h4 className="font-serif text-lg font-bold text-[#1c1c1c] dark:text-[#f2efeb]">
                  {data.section1.evidenceLedger.title}
                </h4>
                <ul className="space-y-2.5 pt-1 text-sm">
                  {data.section1.evidenceLedger.items.map((item, idx) => (
                    <li key={idx} className="border-t border-[#1c1c1c]/15 dark:border-[#f2efeb]/20 pt-2">
                      <strong className="block font-serif font-bold text-[#1c1c1c] dark:text-[#f2efeb]">
                        {item.document}
                      </strong>
                      <span className="text-[#1c1c1c]/80 dark:text-[#f2efeb]/85 leading-relaxed text-xs sm:text-sm">
                        {item.question}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="font-mono text-[10px] text-[#1c1c1c]/60 dark:text-[#f2efeb]/70 pt-1 border-t border-[#1c1c1c]/15 dark:border-[#f2efeb]/20">
                  {data.section1.evidenceLedger.footnote}
                </p>
              </aside>

              {/* Subheading & Analytical Development */}
              <div className="space-y-3">
                <h4 className="font-serif font-bold text-xl border-t-2 border-b border-[#1c1c1c] dark:border-[#f2efeb]/65 py-2 text-[#1c1c1c] dark:text-[#f2efeb]">
                  {data.section1.thinHeading}
                </h4>
                <div className={`space-y-4 text-justify ${largeType ? 'text-lg leading-[1.8]' : 'text-base leading-[1.72]'}`}>
                  <p>{data.section1.bodyP1}</p>
                  <p>{data.section1.bodyP2}</p>
                  <p>{data.section1.bodyP3}</p>
                </div>
              </div>

              {/* Expandable Case Fold */}
              <div className="border-t border-b border-[#1c1c1c]/25 dark:border-[#f2efeb]/30 py-2">
                <button
                  type="button"
                  onClick={() => setFold1Open((o) => !o)}
                  className="w-full flex items-center justify-between text-left font-serif font-bold text-base py-1 hover:text-[#7e2a1f] dark:hover:text-[#e5988b]"
                >
                  <span>{data.section1.foldTitle}</span>
                  {fold1Open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {fold1Open && (
                  <div className="pt-2 pb-1 space-y-3 text-sm leading-relaxed text-[#1c1c1c]/85 dark:text-[#f2efeb]/85">
                    <p>{data.section1.foldP1}</p>
                    <p>{data.section1.foldP2}</p>
                  </div>
                )}
              </div>

              {/* Pull Quote */}
              <blockquote className="border-t-2 border-b-2 border-[#1c1c1c] dark:border-[#f2efeb]/65 py-4 text-center space-y-2">
                <p className="font-serif italic text-xl font-medium leading-snug text-[#1c1c1c] dark:text-[#f2efeb]">
                  {data.section1.pullQuote}
                </p>
                <cite className="font-mono text-[10px] uppercase tracking-wider text-[#1c1c1c]/60 dark:text-[#f2efeb]/70 not-italic block">
                  {data.section1.pullQuoteCite}
                </cite>
              </blockquote>
            </article>

            {/* COLUMN 2: Case File · Law & Numismatics (Sections 09–11) */}
            <article
              id="case-file"
              className="lg:col-span-4 space-y-6 lg:border-r lg:border-[#1c1c1c]/25 dark:lg:border-[#f2efeb]/25 lg:pr-8"
            >
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] border-b border-[#1c1c1c]/20 dark:border-[#f2efeb]/25 pb-2">
                <span className="text-[#7e2a1f] dark:text-[#e5988b] font-bold">{data.section2.label}</span>
                <span className="text-xl font-serif italic text-[#1c1c1c]/60 dark:text-[#f2efeb]/70">{data.section2.number}</span>
              </div>

              <div className="space-y-3">
                <h3 className="font-serif text-3xl sm:text-4xl font-light leading-[1.08] text-[#1c1c1c] dark:text-[#f2efeb]">
                  {data.section2.headline}
                </h3>
                <p className="font-serif text-base leading-snug text-[#1c1c1c]/85 dark:text-[#f2efeb]/90">
                  {data.section2.deck}
                </p>
                <p className="font-mono text-[10px] text-[#1c1c1c]/60 dark:text-[#f2efeb]/70">
                  {data.section2.byline}
                </p>
              </div>

              {/* Interactive Slide Projection Teaser Card for DOC. 02 */}
              <div className="space-y-2">
                <div
                  onClick={() => setActiveSlideNumber(9)}
                  className="group cursor-pointer relative aspect-[16/9] w-full bg-[#121212] border-[1.5px] border-[#1c1c1c] dark:border-[#f2efeb]/65 overflow-hidden shadow-md"
                >
                  <img
                    src="/slides/slide-09.png"
                    alt={data.section2.headline}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <span className="px-3 py-1.5 bg-[#1c1c1c] text-[#f2efeb] font-mono text-[10px] uppercase tracking-wider border border-white/30 flex items-center gap-1.5 group-hover:scale-105 transition-transform">
                      <Maximize2 className="w-3 h-3 text-[#e5988b]" />
                      <span>{data.navigation.projectSlideLabel} 09</span>
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between font-mono text-[10px] text-[#1c1c1c]/70 dark:text-[#f2efeb]/75 px-1">
                  <span>LÂMINAS 09 A 11 · OURO & LEGISLAÇÃO</span>
                  <div className="flex gap-1.5">
                    {[9, 10, 11].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setActiveSlideNumber(num)}
                        className="px-1.5 py-0.5 border border-[#1c1c1c]/30 dark:border-[#f2efeb]/40 hover:border-[#7e2a1f] dark:hover:border-[#e5988b] hover:text-[#7e2a1f] dark:hover:text-[#e5988b] transition-colors"
                      >
                        {String(num).padStart(2, '0')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Case Narrative */}
              <div className={`space-y-4 text-justify ${largeType ? 'text-lg leading-[1.8]' : 'text-base leading-[1.72]'}`}>
                <p>
                  <span className="float-left text-5xl font-serif font-bold leading-none pr-3 pt-1 text-[#7e2a1f] dark:text-[#e5988b]">
                    {data.section2.dropCapLetter}
                  </span>
                  {data.section2.leadP1.slice(1)}
                </p>
                <p>{data.section2.leadP2}</p>
              </div>

              {/* 1890 Benchmark Date Callout */}
              <div className="flex items-center gap-5 p-4 border-t border-b border-[#1c1c1c] dark:border-[#f2efeb]/65 bg-white/50 dark:bg-[#1a1a1a]">
                <strong className="font-serif text-5xl font-bold tracking-tight text-[#7e2a1f] dark:text-[#e5988b]">
                  {data.section2.benchmarkYear}
                </strong>
                <p className="font-mono text-xs uppercase tracking-wider leading-relaxed text-[#1c1c1c]/80 dark:text-[#f2efeb]/85 whitespace-pre-line">
                  {data.section2.benchmarkText}
                </p>
              </div>

              {/* The Perfect Copy Subsection */}
              <div className="space-y-3">
                <h4 className="font-serif font-bold text-xl border-t-2 border-b border-[#1c1c1c] dark:border-[#f2efeb]/65 py-2 text-[#1c1c1c] dark:text-[#f2efeb]">
                  {data.section2.thinHeading}
                </h4>
                <div className={`space-y-4 text-justify ${largeType ? 'text-lg leading-[1.8]' : 'text-base leading-[1.72]'}`}>
                  <p>{data.section2.bodyP1}</p>
                  <p>{data.section2.bodyP2}</p>
                </div>
              </div>

              {/* Legal Notes Triad */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {data.section2.legalNotes.map((note, idx) => (
                  <div key={idx} className="p-3 border border-[#1c1c1c]/30 dark:border-[#f2efeb]/35 bg-white/60 dark:bg-[#1a1a1a] space-y-1">
                    <span className="font-serif italic text-xs text-[#7e2a1f] dark:text-[#e5988b] font-bold">
                      {note.num}
                    </span>
                    <h5 className="font-serif font-bold text-sm text-[#1c1c1c] dark:text-[#f2efeb]">
                      {note.title}
                    </h5>
                    <p className="text-xs leading-relaxed text-[#1c1c1c]/80 dark:text-[#f2efeb]/85">
                      {note.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Expandable Case Fold */}
              <div className="border-t border-b border-[#1c1c1c]/25 dark:border-[#f2efeb]/30 py-2">
                <button
                  type="button"
                  onClick={() => setFold2Open((o) => !o)}
                  className="w-full flex items-center justify-between text-left font-serif font-bold text-base py-1 hover:text-[#7e2a1f] dark:hover:text-[#e5988b]"
                >
                  <span>{data.section2.foldTitle}</span>
                  {fold2Open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {fold2Open && (
                  <div className="pt-2 pb-1 space-y-3 text-sm leading-relaxed text-[#1c1c1c]/85 dark:text-[#f2efeb]/85">
                    <p>{data.section2.foldP1}</p>
                    <p>{data.section2.foldP2}</p>
                  </div>
                )}
              </div>

              {/* Pull Quote */}
              <blockquote className="border-t-2 border-b-2 border-[#1c1c1c] dark:border-[#f2efeb]/65 py-4 text-center space-y-2">
                <p className="font-serif italic text-xl font-medium leading-snug text-[#1c1c1c] dark:text-[#f2efeb]">
                  {data.section2.pullQuote}
                </p>
                <cite className="font-mono text-[10px] uppercase tracking-wider text-[#1c1c1c]/60 dark:text-[#f2efeb]/70 not-italic block">
                  {data.section2.pullQuoteCite}
                </cite>
              </blockquote>

              <p className="p-3 bg-[#1c1c1c]/5 dark:bg-[#1e1e1e] border-l-2 border-[#1c1c1c] dark:border-[#e5988b] text-xs font-serif italic text-[#1c1c1c]/80 dark:text-[#f2efeb]/85">
                {data.section2.readingNote}
              </p>
            </article>

            {/* COLUMN 3: Method · Working Vocabulary & Visual Inquiry (Sections 05–08) */}
            <article id="method" className="lg:col-span-4 space-y-6">
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] border-b border-[#1c1c1c]/20 dark:border-[#f2efeb]/25 pb-2">
                <span className="text-[#7e2a1f] dark:text-[#e5988b] font-bold">{data.section3.label}</span>
                <span className="text-xl font-serif italic text-[#1c1c1c]/60 dark:text-[#f2efeb]/70">{data.section3.number}</span>
              </div>

              {/* Traditional Broadsheet Advert / The Four Verbs Display */}
              <div className="p-6 border border-[#1c1c1c] dark:border-[#f2efeb]/70 outline outline-4 outline-[#1c1c1c] dark:outline-[#f2efeb]/50 outline-offset-[-6px] bg-white/80 dark:bg-[#1a1a1a] text-center space-y-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#7e2a1f] dark:text-[#e5988b] font-bold">
                  ✦ {data.section3.adEyebrow} ✦
                </p>
                <h3 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-[#1c1c1c] dark:text-[#f2efeb] leading-none">
                  {data.section3.adTitle}{' '}
                  <span className="block text-5xl sm:text-6xl text-[#7e2a1f] dark:text-[#e5988b]">
                    {data.section3.adTitleSpan}
                  </span>
                </h3>
                <div className="w-12 h-0.5 bg-[#1c1c1c] dark:bg-[#f2efeb]/65 mx-auto my-2" />
                <h4 className="font-serif text-base font-bold text-[#1c1c1c] dark:text-[#f2efeb]">
                  {data.section3.adSubtitle}
                </h4>
                <p className="text-xs text-[#1c1c1c]/80 dark:text-[#f2efeb]/85 text-left leading-relaxed">
                  {data.section3.adBodyTop}
                </p>

                <ol className="text-left space-y-2 pt-2 border-t border-[#1c1c1c]/20 dark:border-[#f2efeb]/20">
                  {data.section3.verbs.map((v, idx) => (
                    <li key={idx} className="border-b border-[#1c1c1c]/10 dark:border-[#f2efeb]/15 pb-2 text-xs">
                      <strong className="font-serif text-sm font-bold text-[#7e2a1f] dark:text-[#e5988b] block">
                        {idx + 1}. {v.verb}
                      </strong>
                      <span className="text-[#1c1c1c]/80 dark:text-[#f2efeb]/85 leading-relaxed">{v.definition}</span>
                    </li>
                  ))}
                </ol>

                <p className="text-xs text-[#1c1c1c]/80 dark:text-[#f2efeb]/85 text-left leading-relaxed pt-2">
                  {data.section3.adBodyBottom}
                </p>
                <span className="font-mono text-[9px] uppercase tracking-wider text-[#1c1c1c]/50 dark:text-[#f2efeb]/65 block pt-1">
                  {data.section3.adByline}
                </span>
              </div>

              {/* Comparison as a Question Card */}
              <div className="p-5 border border-[#1c1c1c] dark:border-[#f2efeb]/60 bg-white/60 dark:bg-[#1a1a1a] space-y-4">
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#7e2a1f] dark:text-[#e5988b] font-bold block">
                  {data.section3.comparisonKicker}
                </span>
                <h4 className="font-serif text-2xl font-bold text-[#1c1c1c] dark:text-[#f2efeb] leading-snug">
                  {data.section3.comparisonTitle}
                </h4>

                <div className="space-y-4">
                  {data.section3.comparisons.map((c, idx) => (
                    <div key={idx} className="border-t border-[#1c1c1c]/20 dark:border-[#f2efeb]/20 pt-3 space-y-1.5">
                      <h5 className="font-serif font-bold text-base text-[#1c1c1c] dark:text-[#f2efeb]">
                        {c.title}
                      </h5>
                      {c.paragraphs.map((p, pIdx) => (
                        <p key={pIdx} className="text-xs sm:text-sm leading-relaxed text-[#1c1c1c]/85 dark:text-[#f2efeb]/85">
                          {p}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Slide Projection Teaser Card for Method (Slides 05 to 08) */}
              <div className="space-y-2">
                <div
                  onClick={() => setActiveSlideNumber(5)}
                  className="group cursor-pointer relative aspect-[16/9] w-full bg-[#121212] border-[1.5px] border-[#1c1c1c] dark:border-[#f2efeb]/65 overflow-hidden shadow-md"
                >
                  <img
                    src="/slides/slide-05.png"
                    alt="Quatro funções analíticas"
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <span className="px-3 py-1.5 bg-[#1c1c1c] text-[#f2efeb] font-mono text-[10px] uppercase tracking-wider border border-white/30 flex items-center gap-1.5 group-hover:scale-105 transition-transform">
                      <Maximize2 className="w-3 h-3 text-[#e5988b]" />
                      <span>{data.navigation.projectSlideLabel} 05</span>
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between font-mono text-[10px] text-[#1c1c1c]/70 dark:text-[#f2efeb]/75 px-1">
                  <span>LÂMINAS 05 A 08 · MÉTODO COMPARATIVO</span>
                  <div className="flex gap-1.5">
                    {[5, 6, 7, 8].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setActiveSlideNumber(num)}
                        className="px-1.5 py-0.5 border border-[#1c1c1c]/30 dark:border-[#f2efeb]/40 hover:border-[#7e2a1f] dark:hover:border-[#e5988b] hover:text-[#7e2a1f] dark:hover:text-[#e5988b] transition-colors"
                      >
                        {String(num).padStart(2, '0')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Expandable Case Fold */}
              <div className="border-t border-b border-[#1c1c1c]/25 dark:border-[#f2efeb]/30 py-2">
                <button
                  type="button"
                  onClick={() => setFold3Open((o) => !o)}
                  className="w-full flex items-center justify-between text-left font-serif font-bold text-base py-1 hover:text-[#7e2a1f] dark:hover:text-[#e5988b]"
                >
                  <span>{data.section3.foldTitle}</span>
                  {fold3Open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {fold3Open && (
                  <div className="pt-2 pb-1 space-y-3 text-sm leading-relaxed text-[#1c1c1c]/85 dark:text-[#f2efeb]/85">
                    <p>{data.section3.foldP1}</p>
                    <p>{data.section3.foldP2}</p>
                  </div>
                )}
              </div>

              <p className="p-3 bg-[#1c1c1c]/5 dark:bg-[#1e1e1e] border-l-2 border-[#1c1c1c] dark:border-[#e5988b] text-xs font-serif italic text-[#1c1c1c]/80 dark:text-[#f2efeb]/85">
                {data.section3.methodNote}
              </p>
            </article>
          </div>

          {/* 4. Full-Span Editorial Closing & Section 13/13 */}
          <section className="pt-8 border-t-2 border-[#1c1c1c] dark:border-[#f2efeb]/70 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-8 border-[1.5px] border-[#1c1c1c] dark:border-[#f2efeb]/65 bg-white/70 dark:bg-[#1a1a1a] items-center">
              <div className="lg:col-span-5 space-y-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#7e2a1f] dark:text-[#e5988b] font-bold block">
                  {data.closing.kicker}
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-light leading-snug text-[#1c1c1c] dark:text-[#f2efeb]">
                  {data.closing.headline}
                </h3>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveSlideNumber(12)}
                    className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider bg-[#1c1c1c] dark:bg-[#f2efeb] text-[#f2efeb] dark:text-[#0d0d0d] hover:bg-[#7e2a1f] dark:hover:bg-[#e5988b] dark:hover:text-[#0d0d0d] transition-colors"
                  >
                    Projetar Lâmina 12
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSlideNumber(13)}
                    className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider border border-[#1c1c1c] dark:border-[#f2efeb]/70 text-[#1c1c1c] dark:text-[#f2efeb] hover:bg-[#1c1c1c] hover:text-[#f2efeb] dark:hover:bg-[#f2efeb] dark:hover:text-[#0d0d0d] transition-colors"
                  >
                    Projetar Lâmina 13
                  </button>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-3 text-sm leading-relaxed text-[#1c1c1c]/85 dark:text-[#f2efeb]/85 border-t lg:border-t-0 lg:border-l border-[#1c1c1c]/25 dark:border-[#f2efeb]/25 pt-4 lg:pt-0 lg:pl-6">
                <p className="font-serif text-base sm:text-lg font-medium text-[#1c1c1c] dark:text-[#f2efeb]">
                  {data.closing.closingP1}
                </p>
                <p>{data.closing.closingP2}</p>
                <p className="font-mono text-[10px] text-[#1c1c1c]/60 dark:text-[#f2efeb]/70 pt-2 border-t border-[#1c1c1c]/15 dark:border-[#f2efeb]/20">
                  {data.closing.editorialDisclosure}
                </p>
              </div>
            </div>
          </section>

          {/* 5. Small Compact Corner Banner: Montesquieu / Serge Dauchy (11/11/2026) */}
          <aside
            aria-label={companion.kicker}
            className="p-4 bg-[#f2efeb] dark:bg-[#1a1a1a] border border-[#1c1c1c] dark:border-[#f2efeb]/60 space-y-2.5 max-w-2xl ml-auto"
          >
            <div className="flex items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[#7e2a1f] dark:text-[#e5988b] tabular-nums">
              <span>11.11.2026 · MONTESQUIEU NO BRASIL</span>
              <span className="text-[#1c1c1c]/60 dark:text-[#f2efeb]/70">CCJ / UFSC</span>
            </div>
            <h4 className="font-serif text-lg font-bold text-[#1c1c1c] dark:text-[#f2efeb] leading-tight">
              {companion.title}
            </h4>
            <p className="text-xs text-[#1c1c1c]/75 dark:text-[#f2efeb]/80 leading-relaxed">
              {companion.subtitle}
            </p>
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#1c1c1c]/15 dark:border-[#f2efeb]/20 font-mono text-[10px] uppercase tracking-wider">
              <a
                href={MONTESQUIEU_COMPANION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#7e2a1f] dark:text-[#e5988b] hover:underline"
              >
                <span>{companion.openLabel}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <button
                type="button"
                onClick={handleCopyCitation}
                className="inline-flex items-center gap-1 text-[#1c1c1c]/70 dark:text-[#f2efeb]/80 hover:text-[#1c1c1c] dark:hover:text-[#f2efeb]"
              >
                {copiedCitation ? <Check className="w-3 h-3 text-[#14532d] dark:text-[#6ee7b7]" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCitation ? companion.copiedLabel : companion.copyCitationLabel}</span>
              </button>
            </div>
          </aside>

          {/* 6. Sources & Reading Map Footer */}
          <footer id="sources" className="pt-8 border-t-2 border-[#1c1c1c] dark:border-[#f2efeb]/70 space-y-6">
            <div className="flex items-center justify-between border-b border-[#1c1c1c] dark:border-[#f2efeb]/65 pb-3">
              <h3 className="font-serif text-2xl font-bold text-[#1c1c1c] dark:text-[#f2efeb]">
                {data.sourcesSection.title}
              </h3>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#7e2a1f] dark:text-[#e5988b]">
                {data.sourcesSection.subtitle}
              </span>
            </div>

            <ol className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {data.sourcesSection.sources.map((s, idx) => (
                <li key={idx} className="p-4 border border-[#1c1c1c]/30 dark:border-[#f2efeb]/35 bg-white/50 dark:bg-[#1a1a1a] space-y-1.5">
                  <span className="font-mono text-xs text-[#7e2a1f] dark:text-[#e5988b] font-bold">{s.num}</span>
                  <h4 className="font-serif text-base font-bold text-[#1c1c1c] dark:text-[#f2efeb] leading-snug">
                    {s.title}
                  </h4>
                  <p className="text-xs text-[#1c1c1c]/75 dark:text-[#f2efeb]/80 leading-relaxed font-serif">
                    {s.citation}
                  </p>
                  <button
                    type="button"
                    onClick={() => scrollToAnchor(s.anchor.replace('#', ''))}
                    className="font-mono text-[9px] uppercase tracking-wider text-[#7e2a1f] dark:text-[#e5988b] hover:underline pt-2 block"
                  >
                    Ver no texto ↗
                  </button>
                </li>
              ))}
            </ol>

            {/* Colophon & Bottom Mark */}
            <div className="pt-6 border-t border-[#1c1c1c]/20 dark:border-[#f2efeb]/25 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-wider text-[#1c1c1c]/60 dark:text-[#f2efeb]/70">
              <p>{data.sourcesSection.colophonLeft}</p>
              <p>{data.sourcesSection.colophonRight}</p>
            </div>
            <div className="text-center font-serif italic text-2xl text-[#1c1c1c]/40 dark:text-[#f2efeb]/45 pt-2 select-none">
              Iconocracia · Um arquivo em movimento
            </div>
          </footer>
        </div>
      </main>

      {/* 7. Embedded Slide Projection Modal */}
      {activeSlideNumber !== null && (
        <SlideProjectionModal
          isOpen={activeSlideNumber !== null}
          slideNumber={activeSlideNumber}
          lang={currentLang}
          slides={slides}
          onClose={() => setActiveSlideNumber(null)}
          onNavigateSlide={(num) => setActiveSlideNumber(num)}
          onOpenInReader={(slideIdx) => onOpenDeckInReader('representacao', currentLang as LangCode, slideIdx)}
          onOpenPresenter={(slideIdx) => onOpenPresenterStage('representacao', currentLang as LangCode, slideIdx)}
        />
      )}
    </div>
  );
}

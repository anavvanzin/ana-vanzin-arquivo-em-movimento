import React, { useRef, useState } from 'react';
import { Check, CheckCircle2, Cloud, Database, Download, Eye, RotateCcw, Upload } from 'lucide-react';
import { LANGUAGES } from '../data/atlasCatalog';
import { WORKSPACE_CONSTRAINTS } from '../firebase';
import {
  DeckId,
  LangCode,
  ReviewStatus,
  SlideBlock,
  SlideItem,
  SlideOverride,
  UIStrings,
} from '../types';

interface TranslationStudioProps {
  initialDeck: DeckId;
  initialLang: LangCode;
  initialSlideIndex: number;
  ui: UIStrings;
  cloudSyncActive?: boolean;
  onSignInCloud?: () => Promise<void>;
  getMergedSlides: (deck: DeckId, lang: LangCode) => SlideItem[];
  getSlideOverride: (deck: DeckId, lang: LangCode, index: number) => SlideOverride;
  isSlideModified: (deck: DeckId, lang: LangCode, index: number) => boolean;
  getDeckReviewStats: (
    deck: DeckId,
    lang: LangCode
  ) => { total: number; approved: number; modified: number };
  onUpdateSlide: (
    deck: DeckId,
    lang: LangCode,
    index: number,
    patch: {
      title?: string;
      blocks?: SlideBlock[];
      footer?: string;
      status?: ReviewStatus;
      philologicalNote?: string;
    }
  ) => void;
  onResetSlide: (deck: DeckId, lang: LangCode, index: number) => void;
  onExportDeck: (deck: DeckId, lang: LangCode) => void;
  onExportAll: () => void;
  onImportJson: (
    jsonText: string,
    targetDeck: DeckId,
    targetLang: LangCode
  ) => { ok: boolean; message: string };
  onOpenInReader: (deck: DeckId, lang: LangCode, index: number) => void;
  onOpenDriveWorkspace?: () => void;
  onNotify: (msg: string) => void;
}

export function TranslationStudio({
  initialDeck,
  initialLang,
  initialSlideIndex,
  ui,
  cloudSyncActive = false,
  onSignInCloud,
  getMergedSlides,
  getSlideOverride,
  isSlideModified,
  getDeckReviewStats,
  onUpdateSlide,
  onResetSlide,
  onExportDeck,
  onExportAll,
  onImportJson,
  onOpenInReader,
  onOpenDriveWorkspace,
  onNotify,
}: TranslationStudioProps) {
  const [deck, setDeck] = useState<DeckId>(initialDeck);
  const [refLang, setRefLang] = useState<LangCode>('pt');
  const [targetLang, setTargetLang] = useState<LangCode>(
    initialLang === 'pt' ? 'fr' : initialLang
  );
  const [slideIdx, setSlideIdx] = useState<number>(initialSlideIndex);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const refSlides = getMergedSlides(deck, refLang);
  const targetSlides = getMergedSlides(deck, targetLang);
  const safeIndex = Math.max(0, Math.min(targetSlides.length - 1, slideIdx));

  const refSlide = refSlides[safeIndex];
  const targetSlide = targetSlides[safeIndex];
  const override = getSlideOverride(deck, targetLang, safeIndex);
  const modified = isSlideModified(deck, targetLang, safeIndex);
  const stats = getDeckReviewStats(deck, targetLang);

  const handleDeckSwitch = (nextDeck: DeckId) => {
    setDeck(nextDeck);
    setSlideIdx(0);
  };

  const handleBlockChange = (bIdx: number, field: 'label' | 'text', value: string) => {
    const nextBlocks = targetSlide.blocks.map((b, i) =>
      i === bIdx ? { ...b, [field]: value } : b
    );
    onUpdateSlide(deck, targetLang, safeIndex, { blocks: nextBlocks });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result || '');
      const result = onImportJson(content, deck, targetLang);
      onNotify(result.message);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  if (!refSlide || !targetSlide) return null;

  const isApproved = override.status === 'approved';

  return (
    <div className="max-w-[1360px] mx-auto px-6 sm:px-10 py-10 lg:py-12 space-y-8">
      {/* Studio Header */}
      <header className="flex flex-wrap items-end justify-between gap-6 border-b-[1.5px] border-[#1c1c1c] pb-8">
        <div className="space-y-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#7e2a1f]">
            EDIÇÃO DE TRABALHO · COTEJO AUTORAL SEM TRADUÇÃO AUTOMÁTICA
          </p>
          <h1 className="font-serif font-light text-4xl sm:text-5xl text-[#1c1c1c]">
            Estúdio de revisão e traduções
          </h1>
          <p className="text-sm text-[#1c1c1c]/75 max-w-2xl">
            Compare lado a lado o texto-base e cada uma das cinco edições linguísticas, registre
            decisões terminológicas e exporte o arquivo JSON pronto para publicação.
          </p>
        </div>

        {/* Export / Import Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.1em] border border-[#1c1c1c] text-[#1c1c1c] hover:bg-[#1c1c1c] hover:text-[#f2efeb] transition-colors whitespace-nowrap shrink-0"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Importar JSON</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onExportAll();
              onNotify('Pacote completo de revisões exportado.');
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.1em] border border-[#1c1c1c] text-[#1c1c1c] hover:bg-[#1c1c1c] hover:text-[#f2efeb] transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Backup completo</span>
          </button>

          {cloudSyncActive ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.1em] border border-[#14532d]/50 bg-white/75 text-[#14532d] whitespace-nowrap shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Firestore em tempo real</span>
            </span>
          ) : (
            onSignInCloud && (
              <button
                type="button"
                onClick={() => {
                  void onSignInCloud();
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.1em] border border-[#1c1c1c] text-[#1c1c1c] hover:bg-[#1c1c1c] hover:text-[#f2efeb] transition-colors whitespace-nowrap shrink-0"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Sincronizar Firebase</span>
              </button>
            )
          )}

          {onOpenDriveWorkspace && (
            <button
              type="button"
              onClick={onOpenDriveWorkspace}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.1em] border border-[#7e2a1f] text-[#7e2a1f] hover:bg-[#7e2a1f] hover:text-[#f2efeb] transition-colors whitespace-nowrap shrink-0"
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>Sincronizar no Drive</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              onExportDeck(deck, targetLang);
              onNotify(`Arquivo ${deck}-${targetLang}.json exportado.`);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.1em] border border-[#1c1c1c] bg-[#1c1c1c] text-[#f2efeb] hover:bg-[#7e2a1f] hover:border-[#7e2a1f] transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>
              Exportar {deck}-{targetLang}.json
            </span>
          </button>
        </div>
      </header>

      {/* Deck & Language Pair Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white/55 backdrop-blur-[4px] border border-[#1c1c1c]">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center border border-[#1c1c1c] bg-[#f2efeb]">
            <button
              type="button"
              onClick={() => handleDeckSwitch('representacao')}
              className={`px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors whitespace-nowrap ${
                deck === 'representacao'
                  ? 'bg-[#1c1c1c] text-[#f2efeb]'
                  : 'text-[#1c1c1c]/70 hover:text-[#1c1c1c]'
              }`}
            >
              01. {ui.representacao}
            </button>
            <button
              type="button"
              onClick={() => handleDeckSwitch('trajeto')}
              className={`px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.1em] border-l border-[#1c1c1c] transition-colors whitespace-nowrap ${
                deck === 'trajeto'
                  ? 'bg-[#1c1c1c] text-[#f2efeb]'
                  : 'text-[#1c1c1c]/70 hover:text-[#1c1c1c]'
              }`}
            >
              02. {ui.trajeto}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <label htmlFor="ref-lang-select" className="font-mono text-[10px] uppercase tracking-wider text-[#1c1c1c]/70">
              Referência:
            </label>
            <select
              id="ref-lang-select"
              value={refLang}
              onChange={(e) => setRefLang(e.target.value as LangCode)}
              className="bg-[#f2efeb] border border-[#1c1c1c]/40 px-2.5 py-1.5 text-xs font-medium text-[#1c1c1c] focus:outline-none focus:border-[#7e2a1f]"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label} — {l.nativeLabel}
                </option>
              ))}
            </select>

            <span className="text-[#1c1c1c]/50 px-1">→</span>

            <label htmlFor="target-lang-select" className="font-mono text-[10px] uppercase tracking-wider text-[#1c1c1c]/70">
              Edição em revisão:
            </label>
            <select
              id="target-lang-select"
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value as LangCode)}
              className="bg-white border border-[#7e2a1f] px-2.5 py-1.5 text-xs font-semibold text-[#7e2a1f] focus:outline-none"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label} — {l.nativeLabel}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px] tabular-nums text-[#1c1c1c]/75">
          <span>
            Aprovados: {stats.approved}/{stats.total}
          </span>
          <span aria-hidden="true">·</span>
          <span>Editados: {stats.modified}</span>
        </div>
      </div>

      {/* Horizontal Slide Strip Selector */}
      <div
        role="tablist"
        aria-label="Selecionar slide para revisão"
        className="flex items-center gap-1.5 overflow-x-auto pb-1"
      >
        {targetSlides.map((s, idx) => {
          const ov = getSlideOverride(deck, targetLang, idx);
          const mod = isSlideModified(deck, targetLang, idx);
          const active = idx === safeIndex;
          return (
            <button
              key={idx}
              role="tab"
              aria-selected={active}
              type="button"
              onClick={() => setSlideIdx(idx)}
              title={s.title.replace(/\n/g, ' ')}
              className={`px-3 py-2 border font-mono text-xs tabular-nums transition-colors shrink-0 flex items-center gap-1.5 ${
                active
                  ? 'bg-[#1c1c1c] text-[#f2efeb] border-[#1c1c1c] font-bold'
                  : ov.status === 'approved'
                  ? 'bg-white/75 border-[#14532d]/50 text-[#14532d]'
                  : 'bg-white/60 border-[#1c1c1c]/25 text-[#1c1c1c]/75 hover:border-[#1c1c1c] hover:text-[#1c1c1c]'
              }`}
            >
              <span>{String(idx + 1).padStart(2, '0')}</span>
              {ov.status === 'approved' && <Check className="w-3 h-3" />}
              {mod && ov.status !== 'approved' && <span aria-label="Modificado">*</span>}
            </button>
          );
        })}
      </div>

      {/* Side-by-Side Bilingual Comparison & Editing Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Reference Text */}
        <section className="p-7 bg-white/45 backdrop-blur-[4px] border border-[#1c1c1c]/40 space-y-6">
          <div className="flex items-center justify-between border-b border-[#1c1c1c]/15 pb-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#1c1c1c]/65">
              Texto de Referência ({refLang.toUpperCase()}) · Slide{' '}
              {String(safeIndex + 1).padStart(2, '0')}
            </span>
            <button
              type="button"
              onClick={() => onOpenInReader(deck, targetLang, safeIndex)}
              className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-[#7e2a1f] hover:underline"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Ver no Leitor</span>
            </button>
          </div>

          <div className="space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-wider text-[#1c1c1c]/55">Título</p>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#1c1c1c] whitespace-pre-line">
              {refSlide.title}
            </h2>
          </div>

          <div className="space-y-4">
            {refSlide.blocks.map((block, idx) => (
              <div
                key={idx}
                className="p-4 bg-[#f2efeb]/85 border border-[#1c1c1c]/20 space-y-1.5"
              >
                <p className="font-mono text-[10px] uppercase tracking-wider text-[#7e2a1f]">
                  Bloco {idx + 1} {block.label ? `· ${block.label}` : '(sem rótulo)'}
                </p>
                <p className="text-sm leading-relaxed text-[#1c1c1c]/90 whitespace-pre-line">
                  {block.text}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-[#1c1c1c]/15 space-y-1">
            <p className="font-mono text-[10px] uppercase tracking-wider text-[#1c1c1c]/55">
              Nota de rodapé metodológica
            </p>
            <p className="font-serif italic text-base text-[#1c1c1c]/75">
              {refSlide.footer || '— Sem nota de rodapé neste slide —'}
            </p>
          </div>
        </section>

        {/* Right Column: Editable Target Edition */}
        <section className="p-7 bg-white/80 backdrop-blur-[4px] border-[1.5px] border-[#1c1c1c] space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1c1c1c]/15 pb-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#7e2a1f] font-bold">
              Edição Ativa ({targetLang.toUpperCase()}) · Slide{' '}
              {String(safeIndex + 1).padStart(2, '0')}
            </span>

            <div className="flex items-center gap-2">
              {modified && (
                <button
                  type="button"
                  onClick={() => {
                    onResetSlide(deck, targetLang, safeIndex);
                    onNotify('Slide restaurado ao texto canônico original.');
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider border border-[#1c1c1c]/40 text-[#1c1c1c]/75 hover:border-[#1c1c1c] hover:text-[#1c1c1c] transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restaurar original</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  const nextStatus: ReviewStatus = isApproved ? 'pending' : 'approved';
                  onUpdateSlide(deck, targetLang, safeIndex, { status: nextStatus });
                  onNotify(
                    nextStatus === 'approved'
                      ? 'Slide marcado como revisado pela autora.'
                      : 'Slide retornado para revisão pendente.'
                  );
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] border transition-colors whitespace-nowrap shrink-0 ${
                  isApproved
                    ? 'bg-[#14532d] text-[#f2efeb] border-[#14532d]'
                    : 'bg-[#f2efeb] text-[#1c1c1c] border-[#1c1c1c] hover:bg-[#1c1c1c] hover:text-[#f2efeb]'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isApproved ? 'Revisado pela autora' : 'Marcar como revisado'}</span>
              </button>
            </div>
          </div>

          {/* Editable Title */}
          <div className="space-y-1.5">
            <label
              htmlFor="studio-title-input"
              className="block font-mono text-[10px] uppercase tracking-wider text-[#1c1c1c]/65"
            >
              Título do slide ({targetLang.toUpperCase()})
            </label>
            <textarea
              id="studio-title-input"
              rows={2}
              maxLength={WORKSPACE_CONSTRAINTS.MAX_TITLE_LEN}
              value={targetSlide.title}
              onChange={(e) => onUpdateSlide(deck, targetLang, safeIndex, { title: e.target.value })}
              className="w-full font-serif text-xl sm:text-2xl p-3 bg-[#f2efeb]/80 border border-[#1c1c1c]/35 text-[#1c1c1c] focus:outline-none focus:border-[#7e2a1f]"
            />
          </div>

          {/* Editable Blocks */}
          <div className="space-y-4">
            {targetSlide.blocks.map((block, idx) => (
              <div
                key={idx}
                className="p-4 bg-[#f2efeb]/80 border border-[#1c1c1c]/25 space-y-2.5"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#1c1c1c]/65 shrink-0">
                    Rótulo {idx + 1}:
                  </span>
                  <input
                    type="text"
                    maxLength={WORKSPACE_CONSTRAINTS.MAX_BLOCK_LABEL_LEN}
                    value={block.label}
                    placeholder="(opcional)"
                    onChange={(e) => handleBlockChange(idx, 'label', e.target.value)}
                    className="flex-1 bg-white border border-[#1c1c1c]/30 px-2.5 py-1 text-xs font-mono text-[#1c1c1c] focus:outline-none focus:border-[#7e2a1f]"
                  />
                </div>
                <textarea
                  rows={3}
                  maxLength={WORKSPACE_CONSTRAINTS.MAX_BLOCK_TEXT_LEN}
                  value={block.text}
                  onChange={(e) => handleBlockChange(idx, 'text', e.target.value)}
                  aria-label={`Texto do bloco ${idx + 1}`}
                  className="w-full bg-white border border-[#1c1c1c]/30 p-2.5 text-sm leading-relaxed text-[#1c1c1c] focus:outline-none focus:border-[#7e2a1f]"
                />
              </div>
            ))}
          </div>

          {/* Editable Methodological Footer */}
          <div className="space-y-1.5">
            <label
              htmlFor="studio-footer-input"
              className="block font-mono text-[10px] uppercase tracking-wider text-[#1c1c1c]/65"
            >
              Nota de rodapé metodológica ({targetLang.toUpperCase()})
            </label>
            <textarea
              id="studio-footer-input"
              rows={2}
              maxLength={WORKSPACE_CONSTRAINTS.MAX_FOOTER_LEN}
              value={targetSlide.footer}
              onChange={(e) =>
                onUpdateSlide(deck, targetLang, safeIndex, { footer: e.target.value })
              }
              className="w-full bg-[#f2efeb]/80 border border-[#1c1c1c]/35 p-2.5 text-base italic font-serif text-[#1c1c1c] focus:outline-none focus:border-[#7e2a1f]"
            />
          </div>

          {/* Philological Note */}
          <div className="space-y-1.5 pt-2 border-t border-[#1c1c1c]/15">
            <label
              htmlFor="studio-philology-input"
              className="block font-mono text-[10px] uppercase tracking-wider text-[#7e2a1f]"
            >
              Registro filológico / observação de tradução (uso interno da autora)
            </label>
            <input
              id="studio-philology-input"
              type="text"
              maxLength={WORKSPACE_CONSTRAINTS.MAX_PHILOLOGY_LEN}
              value={override.philologicalNote || ''}
              onChange={(e) =>
                onUpdateSlide(deck, targetLang, safeIndex, { philologicalNote: e.target.value })
              }
              placeholder="Ex.: Manter 'Zwischenraum' em alemão; verificar equivalência jurídica de 'curso legal' em francês..."
              className="w-full bg-[#f2efeb]/80 border border-[#1c1c1c]/35 px-3 py-2 text-xs text-[#1c1c1c] focus:outline-none focus:border-[#7e2a1f]"
            />
          </div>
        </section>
      </div>
    </div>
  );
}

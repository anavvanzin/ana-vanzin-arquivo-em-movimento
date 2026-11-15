import React, { useState } from 'react';
import { BookmarkPlus, ExternalLink, Loader2, Search } from 'lucide-react';
import { LangCode } from '../types';
import { WORKSPACE_CONSTRAINTS } from '../utils/constraints';

interface GroundingSource {
  title: string;
  uri: string;
}

interface GroundingResult {
  synthesis: string;
  sources: GroundingSource[];
  searchQueries: string[];
}

interface ResearchGroundingPanelProps {
  lang: LangCode;
  onSaveNoteLocal?: (title: string, synthesis: string, sources: GroundingSource[]) => Promise<void>;
  onNotify?: (msg: string) => void;
}

const ARCHIVAL_PRESETS = [
  {
    label: 'Brant (1494) · Narrenschiff',
    query:
      'Localize edições digitais fac-similares verificadas de Das Narrenschiff (Basel, Johann Bergmann von Olpe, 1494) de Sebastian Brant com a xilogravura da Justiça vendada pelo louco em acervos universitários ou bibliotecas nacionais.',
  },
  {
    label: 'Ripa (1603) · Iconologia',
    query:
      'Localize o exemplar digitalizado de Cesare Ripa, Iconologia (Roma, Lepido Facii, 1603), verbete Giustizia, e suas cotas em acervos públicos de referência.',
  },
  {
    label: 'Gieng (1543) · Berna',
    query:
      'Dados patrimoniais e museológicos verificados sobre a Gerechtigkeitsbrunnen (Fonte da Justiça, 1543) atribuída a Hans Gieng em Berna e o exemplar original no Bernisches Historisches Museum.',
  },
  {
    label: 'Debret (1839) · Voyage Pittoresque',
    query:
      'Referência catalográfica na BnF (Gallica) e Biblioteca Nacional do Brasil para Jean-Baptiste Debret, Voyage Pittoresque et Historique au Brésil, Tomo III (1839), pranchas da coroação e corte imperial.',
  },
  {
    label: 'Decreto 155-B (1890) & Moeda',
    query:
      'Texto oficial e contexto normativo do Decreto nº 155-B de 14 de janeiro de 1890 sobre festas públicas da República e efígies monetárias republicanas brasileiras de 1889–1891.',
  },
];

function escapeDocHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function buildGroundedNoteHtml(
  query: string,
  synthesis: string,
  sources: GroundingSource[]
): string {
  const paragraphs = synthesis
    .split(/\n{2,}/)
    .map(
      (p) =>
        `<p style="line-height:1.6;margin:10px 0;">${escapeDocHtml(p).replace(/\n/g, '<br/>')}</p>`
    )
    .join('');

  const linksHtml =
    sources.length > 0
      ? `<h2 style="font-family:Georgia,serif;font-size:14pt;margin-top:18px;">Fontes web verificadas</h2><ul>${sources
          .map(
            (s) =>
              `<li style="margin:6px 0;"><a href="${escapeDocHtml(s.uri)}">${escapeDocHtml(
                s.title
              )}</a><br/><span style="font-size:9pt;color:#68625b;">${escapeDocHtml(
                s.uri
              )}</span></li>`
          )
          .join('')}</ul>`
      : '';

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>Ficha de Verificação Documental</title></head>
<body style="font-family:Arial,sans-serif;color:#1c1c1c;max-width:700px;margin:0 auto;">
  <p style="font-size:9pt;text-transform:uppercase;letter-spacing:1px;color:#7e2a1f;">
    ICONOCRACIA · Ficha de Verificação Bibliográfica e Arquivística
  </p>
  <h1 style="font-family:Georgia,serif;font-size:18pt;color:#1c1c1c;">${escapeDocHtml(query)}</h1>
  <p style="font-size:9.5pt;color:#524d46;">Data da consulta: ${new Date().toLocaleString('pt-BR')}</p>
  <hr style="border:none;border-top:1px solid #dfd9ce;margin:14px 0;"/>
  ${paragraphs}
  ${linksHtml}
</body>
</html>`;
}

export function ResearchGroundingPanel({
  lang,
  onSaveNoteLocal,
  onNotify,
}: ResearchGroundingPanelProps) {
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [savingLocal, setSavingLocal] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [result, setResult] = useState<GroundingResult | null>(null);
  const [lastQuery, setLastQuery] = useState<string>('');

  const executeSearch = async (targetQuery: string) => {
    const trimmed = targetQuery.trim();
    if (!trimmed) return;
    setLoading(true);
    setError('');
    setLastQuery(trimmed);

    try {
      const res = await fetch('/api/research/grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: trimmed,
          lang,
          context:
            'Pesquisa doutoral sobre iconografia jurídica, alegoria da Justiça, Império e República no Brasil (1494–1906).',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Não foi possível concluir a verificação documental.');
      }
      setResult({
        synthesis: data.synthesis || '',
        sources: Array.isArray(data.sources) ? data.sources : [],
        searchQueries: Array.isArray(data.searchQueries) ? data.searchQueries : [],
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao consultar fontes externas.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  const handleSaveLocal = async () => {
    if (!result || !onSaveNoteLocal) return;
    setSavingLocal(true);
    try {
      await onSaveNoteLocal(lastQuery, result.synthesis, result.sources);
      onNotify?.('Ficha documental salva no caderno local.');
    } catch (err: unknown) {
      if (onNotify) {
        onNotify(err instanceof Error ? err.message : 'Erro ao salvar ficha localmente.');
      }
    } finally {
      setSavingLocal(false);
    }
  };

  return (
    <section className="p-7 bg-white/75 dark:bg-[#161616] backdrop-blur-[4px] border-[1.5px] border-[#1c1c1c] dark:border-[#f2efeb]/65 space-y-6">
      <div className="space-y-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#7e2a1f] dark:text-[#e5988b]">
          CONFERÊNCIA EXTERNA · PESQUISA FUNDAMENTADA NO GOOGLE SEARCH
        </p>
        <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#1c1c1c] dark:text-[#f2efeb]">
          Localizador de exemplares, cotas de acervo e diplomas legais
        </h2>
        <p className="text-sm leading-relaxed text-[#1c1c1c]/80 dark:text-[#f2efeb]/85 max-w-3xl">
          Consulte catálogos patrimoniais, bibliotecas digitais (Gallica/BnF, BSB, Biblioteca
          Nacional, portais legislativos) e referências museológicas atualizadas com links diretos
          para conferência autoral.
        </p>
      </div>

      {/* Curated Verification Presets */}
      <div className="flex flex-wrap items-center gap-2">
        {ARCHIVAL_PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            disabled={loading}
            onClick={() => {
              setQuery(preset.query);
              executeSearch(preset.query);
            }}
            className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] border border-[#1c1c1c]/35 dark:border-[#f2efeb]/40 bg-[#f2efeb]/80 dark:bg-[#1e1e1e] text-[#1c1c1c] dark:text-[#f2efeb] hover:border-[#1c1c1c] hover:bg-[#1c1c1c] hover:text-[#f2efeb] dark:hover:bg-[#f2efeb] dark:hover:text-[#0d0d0d] transition-colors whitespace-nowrap shrink-0"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Custom Search Input */}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <label htmlFor="archival-grounding-input" className="sr-only">
          Consulta documental ou iconográfica
        </label>
        <input
          id="archival-grounding-input"
          type="text"
          maxLength={WORKSPACE_CONSTRAINTS.MAX_QUERY_TITLE_LEN}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ex.: Exemplar digital de Cesare Ripa Iconologia 1603 Roma página da Giustizia..."
          className="flex-1 px-3.5 py-2.5 text-sm bg-[#f2efeb] dark:bg-[#121212] border border-[#1c1c1c]/40 dark:border-[#f2efeb]/45 text-[#1c1c1c] dark:text-[#f2efeb] placeholder:text-[#1c1c1c]/45 dark:placeholder:text-[#f2efeb]/45 focus:outline-none focus:border-[#7e2a1f] dark:focus:border-[#e5988b]"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.1em] border border-[#1c1c1c] dark:border-[#f2efeb] bg-[#1c1c1c] dark:bg-[#f2efeb] text-[#f2efeb] dark:text-[#0d0d0d] hover:bg-[#7e2a1f] hover:border-[#7e2a1f] dark:hover:bg-[#e5988b] dark:hover:border-[#e5988b] transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          <span>{loading ? 'Consultando fontes...' : 'Verificar fontes na web'}</span>
        </button>
      </form>

      {error && (
        <div className="p-4 bg-[#7e2a1f]/10 dark:bg-[#e5988b]/10 border border-[#7e2a1f] dark:border-[#e5988b] text-xs text-[#7e2a1f] dark:text-[#e5988b]">
          {error}
        </div>
      )}

      {result && (
        <div className="pt-4 border-t border-[#1c1c1c]/15 dark:border-[#f2efeb]/20 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-xs text-[#1c1c1c]/70 dark:text-[#f2efeb]/75">
              Síntese documental verificada · {result.sources.length}{' '}
              {result.sources.length === 1 ? 'fonte localizada' : 'fontes localizadas'}
            </p>

            <div className="flex flex-wrap items-center gap-2.5">
              {onSaveNoteLocal && (
                <button
                  type="button"
                  disabled={savingLocal}
                  onClick={handleSaveLocal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.1em] border border-[#1c1c1c] dark:border-[#f2efeb] bg-[#1c1c1c] dark:bg-[#f2efeb] text-[#f2efeb] dark:text-[#0d0d0d] hover:bg-[#7e2a1f] hover:border-[#7e2a1f] dark:hover:bg-[#e5988b] dark:hover:border-[#e5988b] transition-colors whitespace-nowrap shrink-0 disabled:opacity-60"
                >
                  {savingLocal ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <BookmarkPlus className="w-3.5 h-3.5" />
                  )}
                  <span>Salvar no caderno local</span>
                </button>
              )}
            </div>
          </div>

          <div className="p-5 bg-[#f2efeb]/80 dark:bg-[#1e1e1e] border border-[#1c1c1c]/20 dark:border-[#f2efeb]/25 space-y-3 text-sm leading-relaxed text-[#1c1c1c]/90 dark:text-[#f2efeb]/90 whitespace-pre-line max-w-prose">
            {result.synthesis}
          </div>

          {result.sources.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#1c1c1c]/65 dark:text-[#f2efeb]/70">
                Links e referências rastreadas na web
              </h3>
              <ul className="divide-y divide-[#1c1c1c]/15 dark:divide-[#f2efeb]/15 border-y border-[#1c1c1c]/25 dark:border-[#f2efeb]/25">
                {result.sources.map((src, idx) => (
                  <li key={src.uri} className="py-2.5 flex items-baseline justify-between gap-4">
                    <div className="flex items-baseline gap-2.5 min-w-0">
                      <span className="font-mono text-xs tabular-nums text-[#7e2a1f] dark:text-[#e5988b] shrink-0">
                        {String(idx + 1).padStart(2, '0')}.
                      </span>
                      <a
                        href={src.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-[#1c1c1c] dark:text-[#f2efeb] hover:text-[#7e2a1f] dark:hover:text-[#e5988b] hover:underline truncate"
                      >
                        {src.title}
                      </a>
                    </div>
                    <a
                      href={src.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Abrir fonte: ${src.title}`}
                      className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-[#1c1c1c]/65 dark:text-[#f2efeb]/75 hover:text-[#7e2a1f] dark:hover:text-[#e5988b] shrink-0"
                    >
                      <span>Abrir</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

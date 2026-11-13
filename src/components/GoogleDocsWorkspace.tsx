import React, { useCallback, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  ExternalLink,
  Eye,
  FileEdit,
  FileText,
  Loader2,
  Maximize2,
  RefreshCw,
  Search,
} from 'lucide-react';
import { LANGUAGES } from '../data/atlasCatalog';
import { PORTAL_COPY } from '../data/portalCopy';
import { DriveFileItem } from '../services/googleDrive';
import {
  exportResearchDeckToGoogleDoc,
  fetchGoogleDoc,
  GoogleDocDetail,
  listUserGoogleDocs,
  parseGoogleDocId,
} from '../services/googleDocs';
import { DeckId, LangCode, SlideItem, UIStrings } from '../types';
import { GoogleSignInButton } from './GoogleSignInButton';

interface GoogleDocsWorkspaceProps {
  lang: LangCode;
  ui: UIStrings;
  user: User | null;
  needsAuth: boolean;
  isSigningIn: boolean;
  initialDocId?: string | null;
  onSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
  getMergedSlides: (deck: DeckId, lang: LangCode) => SlideItem[];
  getPresenterNote: (deck: DeckId, index: number) => string;
  onNotify: (msg: string) => void;
}

function formatModified(iso?: string): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function GoogleDocsWorkspace({
  lang,
  ui,
  user,
  needsAuth,
  isSigningIn,
  initialDocId,
  onSignIn,
  onSignOut,
  getMergedSlides,
  getPresenterNote,
  onNotify,
}: GoogleDocsWorkspaceProps) {
  const copy = PORTAL_COPY[lang] || PORTAL_COPY.pt;

  const [docs, setDocs] = useState<DriveFileItem[]>([]);
  const [loadingList, setLoadingList] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customInputUrl, setCustomInputUrl] = useState<string>('');

  const [activeDocId, setActiveDocId] = useState<string | null>(initialDocId || null);
  const [activeDocDetail, setActiveDocDetail] = useState<GoogleDocDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'reader' | 'embedded'>('reader');

  const [exportDeck, setExportDeck] = useState<DeckId>('representacao');
  const [exportLang, setExportLang] = useState<LangCode>(lang);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [lastExported, setLastExported] = useState<{
    id: string;
    url: string;
    title: string;
    count: number;
  } | null>(null);

  const [errorMessage, setErrorMessage] = useState<string>('');

  const loadDocsList = useCallback(async () => {
    if (needsAuth) return;
    setLoadingList(true);
    setErrorMessage('');
    try {
      const items = await listUserGoogleDocs(searchQuery);
      setDocs(items);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Não foi possível carregar os documentos do Google Docs.';
      setErrorMessage(msg);
    } finally {
      setLoadingList(false);
    }
  }, [needsAuth, searchQuery]);

  useEffect(() => {
    if (!needsAuth) {
      loadDocsList();
    }
  }, [loadDocsList, needsAuth]);

  const loadDocDetail = useCallback(async (id: string) => {
    setLoadingDetail(true);
    setErrorMessage('');
    try {
      const detail = await fetchGoogleDoc(id);
      setActiveDocDetail(detail);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Erro ao carregar o conteúdo do Google Doc.';
      setErrorMessage(msg);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  useEffect(() => {
    if (activeDocId && !needsAuth) {
      loadDocDetail(activeDocId);
    }
  }, [activeDocId, loadDocDetail, needsAuth]);

  const handleSelectDoc = (id: string) => {
    setActiveDocId(id);
    window.location.hash = `#/docs/${id}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoadCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInputUrl.trim()) return;
    const parsedId = parseGoogleDocId(customInputUrl);
    if (!parsedId) {
      setErrorMessage(
        'Link ou ID inválido. Cole a URL completa do documento (ex: https://docs.google.com/document/d/.../edit) ou seu ID.'
      );
      return;
    }
    handleSelectDoc(parsedId);
  };

  const handleExportToGoogleDoc = async () => {
    if (needsAuth) {
      onNotify('Conecte sua conta do Google antes de exportar para o Google Docs.');
      return;
    }
    setIsExporting(true);
    setErrorMessage('');
    try {
      const slides = getMergedSlides(exportDeck, exportLang);
      const deckTitle = exportDeck === 'representacao' ? ui.representacao : ui.trajeto;
      const res = await exportResearchDeckToGoogleDoc({
        deckId: exportDeck,
        deckTitle,
        lang: exportLang,
        slides,
        getPresenterNote,
      });
      setLastExported({
        id: res.documentId,
        url: res.webViewLink,
        title: `ICONOCRACIA — ${deckTitle} [${exportLang.toUpperCase()}]`,
        count: res.slideCount,
      });
      onNotify(`Documento acadêmico criado com sucesso no Google Docs (${res.slideCount} slides).`);
      loadDocsList();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Erro ao exportar manuscrito para o Google Docs.';
      setErrorMessage(msg);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyDocText = () => {
    if (!activeDocDetail?.bodyText) return;
    navigator.clipboard.writeText(activeDocDetail.bodyText);
    onNotify('Texto do documento copiado para a área de transferência.');
  };

  return (
    <div className="min-h-full bg-[#f2efeb] text-[#1c1c1c] pb-24">
      {/* Top Banner / Header in Variation 8 style */}
      <section className="border-b-[1.5px] border-[#1c1c1c] bg-[#f2efeb] px-6 lg:px-12 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#7e2a1f]">
              GOOGLE WORKSPACE · DOCS API & EDITORIAL REPOSITORIES
            </span>
            <div className="flex items-center gap-3">
              {needsAuth ? (
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-[#1c1c1c]/60">
                    Acesso a documentos requer autenticação:
                  </span>
                  <GoogleSignInButton
                    onClick={onSignIn}
                    loading={isSigningIn}
                    label="Conectar Google Docs"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3 font-mono text-xs">
                  <span className="inline-flex items-center gap-1.5 text-[#14532d]">
                    <CheckCircle2 className="w-4 h-4 text-[#14532d]" />
                    <span>Conectado: {user?.email || 'Google'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={onSignOut}
                    className="border border-[#1c1c1c]/40 px-2 py-1 hover:bg-[#1c1c1c] hover:text-[#f2efeb] transition-colors"
                  >
                    Desconectar
                  </button>
                </div>
              )}
            </div>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl font-light leading-[0.95] tracking-tight uppercase text-[#1c1c1c] mb-3">
            Google Docs <span className="italic text-[#7e2a1f] font-normal">Manuscritos</span>
          </h1>

          <p className="font-serif text-lg sm:text-xl text-[#1c1c1c]/80 max-w-3xl leading-relaxed">
            Consulte, inspecione e elabore manuscritos doutorais no Google Docs com a identidade
            editorial do projeto ICONOCRACIA, ou exporte a integralidade das comunicações acadêmicas.
          </p>
        </div>
      </section>

      {/* Error message banner */}
      {errorMessage && (
        <div className="bg-[#7e2a1f]/10 border-b border-[#7e2a1f] px-6 py-3">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 font-mono text-xs text-[#7e2a1f]">
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage('')}
              className="underline uppercase tracking-wider text-[11px]"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace Body */}
      <div className="max-w-6xl mx-auto px-6 lg:px-12 py-8">
        {activeDocId ? (
          <section className="space-y-6">
            {/* Active Document Toolbar */}
            <div className="border-[1.5px] border-[#1c1c1c] bg-white/40 p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveDocId(null);
                    window.location.hash = '#/docs';
                  }}
                  className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-[#7e2a1f] hover:underline mb-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Voltar para lista de documentos
                </button>
                <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#1c1c1c]">
                  {activeDocDetail?.title || 'Carregando documento...'}
                </h2>
                <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-[#1c1c1c]/65 mt-1">
                  <span>ID: {activeDocId}</span>
                  {activeDocDetail?.webViewLink && (
                    <>
                      <span>·</span>
                      <a
                        href={activeDocDetail.webViewLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[#7e2a1f] hover:underline font-bold"
                      >
                        Abrir e Editar no Google Docs <ExternalLink className="w-3 h-3" />
                      </a>
                    </>
                  )}
                </div>
              </div>

              {/* View mode toggle & actions */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex border border-[#1c1c1c] p-0.5 bg-[#f2efeb]">
                  <button
                    type="button"
                    onClick={() => setViewMode('reader')}
                    className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors ${
                      viewMode === 'reader'
                        ? 'bg-[#1c1c1c] text-[#f2efeb] font-bold'
                        : 'text-[#1c1c1c] hover:bg-[#1c1c1c]/10'
                    }`}
                  >
                    Leitura Tipográfica
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('embedded')}
                    className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors ${
                      viewMode === 'embedded'
                        ? 'bg-[#1c1c1c] text-[#f2efeb] font-bold'
                        : 'text-[#1c1c1c] hover:bg-[#1c1c1c]/10'
                    }`}
                  >
                    Editor Embutido
                  </button>
                </div>

                {activeDocDetail?.bodyText && (
                  <button
                    type="button"
                    onClick={handleCopyDocText}
                    className="inline-flex items-center gap-1.5 border border-[#1c1c1c] px-3 py-1.5 font-mono text-xs uppercase tracking-wider hover:bg-[#1c1c1c] hover:text-[#f2efeb] transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Texto</span>
                  </button>
                )}
              </div>
            </div>

            {/* TAB 1: TYPOGRAPHIC READER MODE (Rendered in Cormorant Garamond & Space Mono) */}
            {viewMode === 'reader' && (
              <div className="border-[1.5px] border-[#1c1c1c] bg-white p-8 sm:p-14 shadow-sm min-h-[600px] max-w-4xl mx-auto">
                {loadingDetail ? (
                  <div className="flex items-center justify-center py-20 font-mono text-xs text-[#1c1c1c]/60 gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#7e2a1f]" />
                    <span>Carregando estrutura do Google Doc...</span>
                  </div>
                ) : activeDocDetail?.paragraphs && activeDocDetail.paragraphs.length > 0 ? (
                  <article className="space-y-6">
                    <div className="border-b-[1.5px] border-[#1c1c1c] pb-4 mb-6">
                      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#7e2a1f]">
                        ICONOCRACIA · LEITURA DOCUMENTAL
                      </div>
                      <h1 className="font-serif text-3xl sm:text-4xl font-light text-[#1c1c1c] mt-1">
                        {activeDocDetail.title}
                      </h1>
                    </div>

                    {activeDocDetail.paragraphs.map((p, idx) => {
                      const isTitle = p.headingLevel === 'TITLE';
                      const isHeading1 = p.headingLevel === 'HEADING_1';
                      const isHeading2 = p.headingLevel === 'HEADING_2';
                      const isHeading3 = p.headingLevel === 'HEADING_3';

                      if (isTitle) {
                        return (
                          <h2
                            key={idx}
                            className="font-serif text-2xl sm:text-3xl font-medium text-[#1c1c1c] pt-2"
                          >
                            {p.text}
                          </h2>
                        );
                      }
                      if (isHeading1) {
                        return (
                          <h3
                            key={idx}
                            className="font-serif text-xl sm:text-2xl font-medium text-[#7e2a1f] pt-4 border-t border-[#1c1c1c]/15"
                          >
                            {p.text}
                          </h3>
                        );
                      }
                      if (isHeading2 || isHeading3) {
                        return (
                          <h4
                            key={idx}
                            className="font-mono text-xs uppercase tracking-wider text-[#1c1c1c] font-bold pt-2"
                          >
                            {p.text}
                          </h4>
                        );
                      }
                      return (
                        <p
                          key={idx}
                          className="font-serif text-lg leading-relaxed text-[#1c1c1c]/90 text-justify"
                        >
                          {p.text}
                        </p>
                      );
                    })}
                  </article>
                ) : (
                  <div className="text-center py-20 font-serif text-lg text-[#1c1c1c]/50">
                    O documento está vazio ou não possui elementos de parágrafo de texto editáveis.
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: EMBEDDED GOOGLE DOCS VIEWER */}
            {viewMode === 'embedded' && (
              <div className="border-[1.5px] border-[#1c1c1c] bg-[#1c1c1c] overflow-hidden shadow-lg">
                <div className="h-[750px] w-full bg-white">
                  <iframe
                    src={`https://docs.google.com/document/d/${activeDocId}/preview`}
                    title={activeDocDetail?.title || 'Google Docs Preview'}
                    className="w-full h-full border-0"
                    loading="lazy"
                  />
                </div>
                <div className="p-3 bg-[#151515] text-[#f2efeb] font-mono text-xs flex flex-wrap items-center justify-between gap-3 border-t border-[#f2efeb]/20">
                  <span className="text-[#e5988b] uppercase tracking-wider">
                    Google Docs Live Preview
                  </span>
                  <a
                    href={`https://docs.google.com/document/d/${activeDocId}/edit`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 border border-[#f2efeb]/30 px-3 py-1 text-[#f2efeb] hover:bg-[#f2efeb] hover:text-[#1c1c1c] transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Abrir Editor Completo no Google Docs ↗</span>
                  </a>
                </div>
              </div>
            )}
          </section>
        ) : (
          /* Document Selector & Library */
          <div className="space-y-12">
            {/* Quick URL/ID input */}
            <section className="border-[1.5px] border-[#1c1c1c] bg-white/40 p-6">
              <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-[#7e2a1f] mb-2">
                [ ACESSO DIRETO ] · COLAR URL OU ID DE DOCUMENTO GOOGLE DOCS
              </h2>
              <p className="font-serif text-base text-[#1c1c1c]/80 mb-4">
                Cole a URL de qualquer documento Google Docs para inspecioná-lo na tipografia
                arquivística do portal:
              </p>
              <form onSubmit={handleLoadCustomUrl} className="flex flex-wrap gap-2">
                <input
                  type="text"
                  value={customInputUrl}
                  onChange={(e) => setCustomInputUrl(e.target.value)}
                  placeholder="https://docs.google.com/document/d/.../edit ou ID do Google Doc"
                  className="flex-1 min-w-[280px] bg-white border border-[#1c1c1c] px-4 py-2.5 font-mono text-xs text-[#1c1c1c] placeholder:text-[#1c1c1c]/40 focus:outline-none focus:ring-1 focus:ring-[#7e2a1f]"
                />
                <button
                  type="submit"
                  className="border border-[#1c1c1c] bg-[#1c1c1c] text-[#f2efeb] px-5 py-2.5 font-mono text-xs uppercase tracking-wider hover:bg-[#7e2a1f] transition-colors whitespace-nowrap"
                >
                  Abrir Documento
                </button>
              </form>
            </section>

            {/* Export Section: Export Doctoral Decks to Google Docs */}
            <section className="border-[1.5px] border-[#1c1c1c] bg-white/40 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-[#7e2a1f]">
                  [ EXPORTAÇÃO EDITORIAL ] · GERAR MANUSCRITO GOOGLE DOCS
                </h2>
                <span className="font-mono text-[11px] text-[#1c1c1c]/60">
                  Cria um documento formatado com lâminas, notas e fontes
                </span>
              </div>

              <p className="font-serif text-base text-[#1c1c1c]/85 mb-4 leading-relaxed">
                Transforme qualquer comunicação doutoral em um manuscrito editável completo no seu
                Google Drive:
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={exportDeck}
                  onChange={(e) => setExportDeck(e.target.value as DeckId)}
                  className="bg-white border border-[#1c1c1c] px-3 py-2 font-mono text-xs text-[#1c1c1c] focus:outline-none"
                >
                  <option value="representacao">
                    [ DOC. 01 ] Entre representação e autenticação (13 slides)
                  </option>
                  <option value="trajeto">
                    [ DOC. 02 ] O que a pesquisa me fez abandonar (14 slides)
                  </option>
                </select>

                <select
                  value={exportLang}
                  onChange={(e) => setExportLang(e.target.value as LangCode)}
                  className="bg-white border border-[#1c1c1c] px-3 py-2 font-mono text-xs text-[#1c1c1c] focus:outline-none"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      Edição: {l.label} ({l.code.toUpperCase()})
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  disabled={isExporting}
                  onClick={handleExportToGoogleDoc}
                  className="inline-flex items-center gap-2 border border-[#1c1c1c] bg-[#7e2a1f] text-[#f2efeb] px-5 py-2 font-mono text-xs uppercase tracking-wider hover:bg-[#1c1c1c] transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Gerando Google Doc...</span>
                    </>
                  ) : (
                    <>
                      <FileEdit className="w-3.5 h-3.5" />
                      <span>Criar Documento no Google Docs</span>
                    </>
                  )}
                </button>
              </div>

              {lastExported && (
                <div className="mt-4 p-3 border border-[#14532d] bg-[#14532d]/10 font-mono text-xs text-[#14532d] flex flex-wrap items-center justify-between gap-3">
                  <span>
                    ✓ Documento criado: <strong>{lastExported.title}</strong> ({lastExported.count} slides).
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleSelectDoc(lastExported.id)}
                      className="underline font-bold uppercase tracking-wider hover:text-[#1c1c1c]"
                    >
                      Ler no App
                    </button>
                    <span>·</span>
                    <a
                      href={lastExported.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 underline font-bold uppercase tracking-wider"
                    >
                      Abrir no Google Docs ↗
                    </a>
                  </div>
                </div>
              )}
            </section>

            {/* User Documents in Drive */}
            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b-[1.5px] border-[#1c1c1c]">
                <div>
                  <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-[#7e2a1f]">
                    [ MEUS DOCUMENTOS ] · GOOGLE DOCS & MANUSCRITOS NO DRIVE
                  </h2>
                  <p className="font-serif text-sm text-[#1c1c1c]/70">
                    Selecione qualquer documento de pesquisa para ler e inspecionar
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#1c1c1c]/40" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Filtrar por título..."
                      className="bg-white border border-[#1c1c1c] pl-8 pr-3 py-1.5 font-mono text-xs text-[#1c1c1c] focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={loadDocsList}
                    disabled={loadingList || needsAuth}
                    className="border border-[#1c1c1c] p-2 hover:bg-[#1c1c1c] hover:text-[#f2efeb] transition-colors disabled:opacity-40"
                    title="Atualizar lista"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingList ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {needsAuth ? (
                <div className="border border-dashed border-[#1c1c1c]/30 p-12 text-center bg-white/30 space-y-4">
                  <FileText className="w-10 h-10 mx-auto text-[#7e2a1f]/60" />
                  <h3 className="font-serif text-2xl font-light text-[#1c1c1c]">
                    Conecte sua conta Google para listar seus documentos
                  </h3>
                  <p className="font-sans text-sm text-[#1c1c1c]/70 max-w-md mx-auto">
                    Conceda permissão de leitura aos documentos do Google Docs para abri-los
                    diretamente no portal ICONOCRACIA.
                  </p>
                  <GoogleSignInButton
                    onClick={onSignIn}
                    loading={isSigningIn}
                    label="Conectar com o Google"
                  />
                </div>
              ) : loadingList ? (
                <div className="border border-[#1c1c1c]/20 p-12 text-center bg-white/20 font-mono text-xs text-[#1c1c1c]/60 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#7e2a1f]" />
                  <span>Buscando documentos no Google Drive...</span>
                </div>
              ) : docs.length === 0 ? (
                <div className="border border-dashed border-[#1c1c1c]/30 p-12 text-center bg-white/30 space-y-3">
                  <FileText className="w-8 h-8 mx-auto text-[#1c1c1c]/40" />
                  <p className="font-serif text-lg text-[#1c1c1c]/70">
                    Nenhum documento encontrado no seu Google Drive
                    {searchQuery ? ` com o termo "${searchQuery}"` : ''}.
                  </p>
                  <p className="font-sans text-xs text-[#1c1c1c]/50">
                    Use o botão acima para exportar uma apresentação como Google Doc ou cole um link
                    direto.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {docs.map((item) => (
                    <article
                      key={item.id}
                      className="border-[1.5px] border-[#1c1c1c] bg-white/60 p-5 flex flex-col justify-between hover:border-[#7e2a1f] transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 font-mono text-[10px] text-[#1c1c1c]/60 mb-2">
                          <span className="uppercase tracking-wider">GOOGLE DOCS</span>
                          {item.modifiedTime && (
                            <span>Modificado: {formatModified(item.modifiedTime)}</span>
                          )}
                        </div>

                        <h3 className="font-serif text-xl font-medium text-[#1c1c1c] leading-snug line-clamp-2 mb-3">
                          {item.name}
                        </h3>

                        {item.description && (
                          <p className="font-sans text-xs text-[#1c1c1c]/70 line-clamp-2 mb-4">
                            {item.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-4 border-t border-[#1c1c1c]/15 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleSelectDoc(item.id)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 border border-[#1c1c1c] bg-[#1c1c1c] text-[#f2efeb] px-3 py-2 font-mono text-xs uppercase tracking-wider hover:bg-[#7e2a1f] transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ler no App</span>
                        </button>

                        {item.webViewLink && (
                          <a
                            href={item.webViewLink}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 border border-[#1c1c1c] text-[#1c1c1c] hover:bg-[#1c1c1c] hover:text-[#f2efeb] transition-colors"
                            title="Abrir no Google Docs ↗"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

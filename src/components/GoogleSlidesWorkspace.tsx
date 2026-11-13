import React, { useCallback, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Eye,
  FileText,
  FolderOpen,
  Layout,
  Loader2,
  Maximize2,
  Monitor,
  Pause,
  Play,
  Presentation,
  RefreshCw,
  RotateCcw,
  Search,
  Sparkles,
} from 'lucide-react';
import { LANGUAGES } from '../data/atlasCatalog';
import { PORTAL_COPY } from '../data/portalCopy';
import {
  DriveFileItem,
} from '../services/googleDrive';
import {
  exportResearchDeckToGoogleSlides,
  fetchGooglePresentation,
  GooglePresentationDetail,
  GoogleSlideSummary,
  listUserGoogleSlides,
  parseGooglePresentationId,
} from '../services/googleSlides';
import { DeckId, LangCode, SlideItem, UIStrings } from '../types';
import { GoogleSignInButton } from './GoogleSignInButton';

interface GoogleSlidesWorkspaceProps {
  lang: LangCode;
  ui: UIStrings;
  user: User | null;
  needsAuth: boolean;
  isSigningIn: boolean;
  initialPresentationId?: string | null;
  onSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
  getMergedSlides: (deck: DeckId, lang: LangCode) => SlideItem[];
  getPresenterNote: (deck: DeckId, index: number) => string;
  onOpenDeckInReader: (deck: DeckId, lang: LangCode, slideIndex?: number) => void;
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

function formatSeconds(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function GoogleSlidesWorkspace({
  lang,
  ui,
  user,
  needsAuth,
  isSigningIn,
  initialPresentationId,
  onSignIn,
  onSignOut,
  getMergedSlides,
  getPresenterNote,
  onOpenDeckInReader,
  onNotify,
}: GoogleSlidesWorkspaceProps) {
  const copy = PORTAL_COPY[lang] || PORTAL_COPY.pt;

  // Presentations list
  const [presentations, setPresentations] = useState<DriveFileItem[]>([]);
  const [loadingList, setLoadingList] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customInputUrl, setCustomInputUrl] = useState<string>('');

  // Active Presentation
  const [activePresentationId, setActivePresentationId] = useState<string | null>(
    initialPresentationId || null
  );
  const [activeDetail, setActiveDetail] = useState<GooglePresentationDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [selectedSlideIndex, setSelectedSlideIndex] = useState<number>(0);
  const [viewTab, setViewTab] = useState<'embed' | 'parsed'>('embed');

  // Presentation Timer (speech rehearsal)
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [targetMinutes, setTargetMinutes] = useState<number>(20);

  // Export state
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

  // Timer interval
  useEffect(() => {
    if (!isTimerRunning) return;
    const interval = window.setInterval(() => {
      setTimerSeconds((s) => s + 1);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isTimerRunning]);

  // Load presentations list when authenticated
  const loadPresentations = useCallback(async () => {
    if (needsAuth) return;
    setLoadingList(true);
    setErrorMessage('');
    try {
      const items = await listUserGoogleSlides(searchQuery);
      setPresentations(items);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Não foi possível carregar as apresentações do Google Slides.';
      setErrorMessage(msg);
    } finally {
      setLoadingList(false);
    }
  }, [needsAuth, searchQuery]);

  useEffect(() => {
    if (!needsAuth) {
      loadPresentations();
    }
  }, [loadPresentations, needsAuth]);

  // Load active presentation detail
  const loadPresentationDetail = useCallback(
    async (id: string) => {
      setLoadingDetail(true);
      setErrorMessage('');
      try {
        const detail = await fetchGooglePresentation(id);
        setActiveDetail(detail);
        setSelectedSlideIndex(0);
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : 'Erro ao carregar os dados detalhados da apresentação do Google Slides.';
        setErrorMessage(msg);
      } finally {
        setLoadingDetail(false);
      }
    },
    []
  );

  useEffect(() => {
    if (activePresentationId && !needsAuth) {
      loadPresentationDetail(activePresentationId);
    }
  }, [activePresentationId, loadPresentationDetail, needsAuth]);

  const handleSelectPresentation = (id: string) => {
    setActivePresentationId(id);
    window.location.hash = `#/slides/${id}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoadCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInputUrl.trim()) return;
    const parsedId = parseGooglePresentationId(customInputUrl);
    if (!parsedId) {
      setErrorMessage(
        'Link ou ID inválido. Cole a URL completa da apresentação (ex: https://docs.google.com/presentation/d/.../edit) ou seu ID.'
      );
      return;
    }
    handleSelectPresentation(parsedId);
  };

  const handleExportToGoogleSlides = async () => {
    if (needsAuth) {
      onNotify('Conecte sua conta do Google antes de exportar para o Google Slides.');
      return;
    }
    setIsExporting(true);
    setErrorMessage('');
    try {
      const slides = getMergedSlides(exportDeck, exportLang);
      const deckTitle = exportDeck === 'representacao' ? ui.representacao : ui.trajeto;
      const res = await exportResearchDeckToGoogleSlides({
        deckId: exportDeck,
        deckTitle,
        lang: exportLang,
        slides,
        getPresenterNote,
      });
      setLastExported({
        id: res.presentationId,
        url: res.webViewLink,
        title: `ICONOCRACIA — ${deckTitle} [${exportLang.toUpperCase()}]`,
        count: res.slideCount,
      });
      onNotify(
        `Apresentação exportada com sucesso para o Google Slides (${res.slideCount} slides).`
      );
      // Automatically refresh list
      loadPresentations();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Erro ao exportar a apresentação para o Google Slides.';
      setErrorMessage(msg);
    } finally {
      setIsExporting(false);
    }
  };

  const activeSlide: GoogleSlideSummary | undefined =
    activeDetail?.slides?.[selectedSlideIndex];

  return (
    <div className="min-h-full bg-[#f2efeb] text-[#1c1c1c] pb-24">
      {/* Top Banner / Header in Variation 8 style */}
      <section className="border-b-[1.5px] border-[#1c1c1c] bg-[#f2efeb] px-6 lg:px-12 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#7e2a1f]">
              GOOGLE WORKSPACE · SLIDES API & DRIVE INTEGRATION
            </span>
            <div className="flex items-center gap-3">
              {needsAuth ? (
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-[#1c1c1c]/60">
                    Acesso a apresentações requer autenticação:
                  </span>
                  <GoogleSignInButton
                    onClick={onSignIn}
                    loading={isSigningIn}
                    label="Conectar Google Slides"
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
            Google Slides <span className="italic text-[#7e2a1f] font-normal">Apresentação</span>
          </h1>

          <p className="font-serif text-lg sm:text-xl text-[#1c1c1c]/80 max-w-3xl leading-relaxed">
            Apresente suas próprias apresentações do Google Slides diretamente no ecossistema
            ICONOCRACIA, ou exporte as comunicações doutorais do dossiê para a sua conta do Google Drive.
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
        {/* If an active presentation is selected, show presentation viewer */}
        {activePresentationId ? (
          <section className="space-y-6">
            {/* Active Presentation Header Toolbar */}
            <div className="border-[1.5px] border-[#1c1c1c] bg-white/40 p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setActivePresentationId(null);
                    window.location.hash = '#/slides';
                  }}
                  className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-[#7e2a1f] hover:underline mb-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Voltar para lista de apresentações
                </button>
                <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#1c1c1c]">
                  {activeDetail?.title || 'Carregando apresentação...'}
                </h2>
                <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-[#1c1c1c]/65 mt-1">
                  <span>ID: {activePresentationId}</span>
                  {activeDetail?.slides && (
                    <>
                      <span>·</span>
                      <span>{activeDetail.slides.length} slides</span>
                    </>
                  )}
                  {activeDetail?.webViewLink && (
                    <>
                      <span>·</span>
                      <a
                        href={activeDetail.webViewLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[#7e2a1f] hover:underline font-bold"
                      >
                        Abrir no Google Slides <ExternalLink className="w-3 h-3" />
                      </a>
                    </>
                  )}
                </div>
              </div>

              {/* Mode toggles & speech timer dock */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex border border-[#1c1c1c] p-0.5 bg-[#f2efeb]">
                  <button
                    type="button"
                    onClick={() => setViewTab('embed')}
                    className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors ${
                      viewTab === 'embed'
                        ? 'bg-[#1c1c1c] text-[#f2efeb] font-bold'
                        : 'text-[#1c1c1c] hover:bg-[#1c1c1c]/10'
                    }`}
                  >
                    Player Interativo
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewTab('parsed')}
                    className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors ${
                      viewTab === 'parsed'
                        ? 'bg-[#1c1c1c] text-[#f2efeb] font-bold'
                        : 'text-[#1c1c1c] hover:bg-[#1c1c1c]/10'
                    }`}
                  >
                    Pranchas & Notas ({activeDetail?.slides.length || 0})
                  </button>
                </div>

                {/* Speech timer widget */}
                <div className="flex items-center gap-2 border border-[#1c1c1c] px-3 py-1.5 bg-[#f2efeb] font-mono text-xs">
                  <Clock className="w-3.5 h-3.5 text-[#7e2a1f]" />
                  <span
                    className={`font-mono text-sm font-bold tabular-nums ${
                      timerSeconds > targetMinutes * 60 ? 'text-[#7e2a1f]' : 'text-[#1c1c1c]'
                    }`}
                  >
                    {formatSeconds(timerSeconds)}
                  </span>
                  <span className="text-[#1c1c1c]/40">/ {targetMinutes}m</span>
                  <button
                    type="button"
                    onClick={() => setIsTimerRunning((r) => !r)}
                    className="p-1 hover:bg-[#1c1c1c] hover:text-[#f2efeb] transition-colors"
                    title={isTimerRunning ? 'Pausar cronômetro' : 'Iniciar cronômetro'}
                  >
                    {isTimerRunning ? (
                      <Pause className="w-3 h-3" />
                    ) : (
                      <Play className="w-3 h-3" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsTimerRunning(false);
                      setTimerSeconds(0);
                    }}
                    className="p-1 hover:bg-[#1c1c1c] hover:text-[#f2efeb] transition-colors"
                    title="Zerar cronômetro"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                  <select
                    value={targetMinutes}
                    onChange={(e) => setTargetMinutes(Number(e.target.value))}
                    className="bg-transparent border-0 font-mono text-xs text-[#1c1c1c] cursor-pointer"
                  >
                    <option value={15}>15m</option>
                    <option value={20}>20m</option>
                    <option value={30}>30m</option>
                    <option value={45}>45m</option>
                  </select>
                </div>
              </div>
            </div>

            {/* TAB 1: EMBED PLAYER (Full interactive Google Slides presentation player) */}
            {viewTab === 'embed' && (
              <div className="border-[1.5px] border-[#1c1c1c] bg-[#1c1c1c] shadow-lg overflow-hidden">
                <div className="aspect-[16/9] w-full relative bg-black">
                  <iframe
                    src={`https://docs.google.com/presentation/d/${activePresentationId}/embed?start=false&loop=false&delayms=3000`}
                    title={activeDetail?.title || 'Google Slides Presentation'}
                    className="w-full h-full border-0"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
                <div className="p-3 bg-[#151515] text-[#f2efeb] font-mono text-xs flex flex-wrap items-center justify-between gap-3 border-t border-[#f2efeb]/20">
                  <div className="flex items-center gap-3">
                    <span className="text-[#e5988b] uppercase tracking-wider">
                      Google Slides Live Player
                    </span>
                    <span className="text-[#f2efeb]/40">·</span>
                    <span className="text-[#f2efeb]/70">
                      Use os controles do player ou as setas do teclado para navegar entre os slides
                    </span>
                  </div>
                  <a
                    href={`https://docs.google.com/presentation/d/${activePresentationId}/present`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 border border-[#f2efeb]/30 px-3 py-1 text-[#f2efeb] hover:bg-[#f2efeb] hover:text-[#1c1c1c] transition-colors"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Apresentar em Tela Cheia no Google ↗</span>
                  </a>
                </div>
              </div>
            )}

            {/* TAB 2: PARSED SLIDES & NOTES (Detailed slide-by-slide examination) */}
            {viewTab === 'parsed' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left slide thumbnails list */}
                <div className="lg:col-span-4 border-[1.5px] border-[#1c1c1c] bg-white/40 p-4 max-h-[680px] overflow-y-auto space-y-2">
                  <div className="font-mono text-xs uppercase tracking-wider text-[#7e2a1f] mb-3 pb-2 border-b border-[#1c1c1c]/15">
                    Slides Extraídos ({activeDetail?.slides.length || 0})
                  </div>
                  {activeDetail?.slides.map((s, idx) => (
                    <button
                      key={s.objectId}
                      type="button"
                      onClick={() => setSelectedSlideIndex(idx)}
                      className={`w-full text-left p-3 border transition-all ${
                        selectedSlideIndex === idx
                          ? 'border-[#7e2a1f] bg-[#7e2a1f]/10 font-medium'
                          : 'border-[#1c1c1c]/20 hover:border-[#1c1c1c] bg-white/60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 font-mono text-[11px] text-[#1c1c1c]/60 mb-1">
                        <span>SLIDE {String(idx + 1).padStart(2, '0')}</span>
                        {s.speakerNotes && (
                          <span className="text-[#7e2a1f] uppercase tracking-wider font-bold">
                            Tem notas
                          </span>
                        )}
                      </div>
                      <div className="font-serif text-base text-[#1c1c1c] line-clamp-1">
                        {s.title}
                      </div>
                      {s.snippet && (
                        <div className="text-xs text-[#1c1c1c]/70 line-clamp-2 mt-1">
                          {s.snippet}
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Right selected slide detail & speaker notes */}
                <div className="lg:col-span-8 border-[1.5px] border-[#1c1c1c] bg-white/60 p-6 flex flex-col justify-between min-h-[500px]">
                  {activeSlide ? (
                    <div>
                      <div className="flex items-center justify-between gap-4 pb-3 border-b border-[#1c1c1c]/15 mb-4 font-mono text-xs text-[#1c1c1c]/60">
                        <span>
                          SLIDE {String(selectedSlideIndex + 1).padStart(2, '0')} DE{' '}
                          {activeDetail?.slides.length || 0}
                        </span>
                        <span>ID: {activeSlide.objectId}</span>
                      </div>

                      <h3 className="font-serif text-3xl font-light text-[#1c1c1c] mb-4">
                        {activeSlide.title}
                      </h3>

                      {activeSlide.snippet && (
                        <div className="border border-[#1c1c1c]/15 p-4 bg-white/70 font-sans text-sm leading-relaxed text-[#1c1c1c]/85 whitespace-pre-wrap mb-6">
                          {activeSlide.snippet}
                        </div>
                      )}

                      {/* Speaker notes section */}
                      <div className="border-t-[1.5px] border-[#1c1c1c]/20 pt-4">
                        <div className="font-mono text-xs uppercase tracking-wider text-[#7e2a1f] mb-2 flex items-center justify-between">
                          <span>Notas de Condução Oral (Google Slides)</span>
                          {activeSlide.speakerNotes && (
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(activeSlide.speakerNotes);
                                onNotify('Notas copiadas para a área de transferência.');
                              }}
                              className="hover:underline text-[11px]"
                            >
                              Copiar Notas
                            </button>
                          )}
                        </div>
                        {activeSlide.speakerNotes ? (
                          <div className="p-3 bg-[#f2efeb] border border-[#1c1c1c]/25 font-sans text-sm text-[#1c1c1c] leading-relaxed whitespace-pre-wrap">
                            {activeSlide.speakerNotes}
                          </div>
                        ) : (
                          <p className="font-serif italic text-sm text-[#1c1c1c]/50">
                            Nenhuma nota de orador registrada neste slide.
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-24 text-center font-serif text-lg text-[#1c1c1c]/50">
                      Selecione um slide na coluna à esquerda para inspecionar seu conteúdo e notas.
                    </div>
                  )}

                  {/* Navigation footer */}
                  <div className="pt-6 border-t border-[#1c1c1c]/15 flex items-center justify-between gap-4 mt-6">
                    <button
                      type="button"
                      disabled={selectedSlideIndex <= 0}
                      onClick={() => setSelectedSlideIndex((i) => Math.max(0, i - 1))}
                      className="inline-flex items-center gap-1.5 border border-[#1c1c1c] px-4 py-2 font-mono text-xs uppercase tracking-wider hover:bg-[#1c1c1c] hover:text-[#f2efeb] disabled:opacity-40 transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Slide Anterior
                    </button>
                    <button
                      type="button"
                      disabled={
                        !activeDetail?.slides ||
                        selectedSlideIndex >= activeDetail.slides.length - 1
                      }
                      onClick={() =>
                        setSelectedSlideIndex((i) =>
                          Math.min((activeDetail?.slides.length || 1) - 1, i + 1)
                        )
                      }
                      className="inline-flex items-center gap-1.5 border border-[#1c1c1c] px-4 py-2 font-mono text-xs uppercase tracking-wider hover:bg-[#1c1c1c] hover:text-[#f2efeb] disabled:opacity-40 transition-colors"
                    >
                      Próximo Slide
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        ) : (
          /* Presentation Selector & Library */
          <div className="space-y-12">
            {/* Quick Link/ID input */}
            <section className="border-[1.5px] border-[#1c1c1c] bg-white/40 p-6">
              <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-[#7e2a1f] mb-2">
                [ ACESSO DIRETO ] · COLAR URL OU ID DE APRESENTAÇÃO
              </h2>
              <p className="font-serif text-base text-[#1c1c1c]/80 mb-4">
                Tem o link de uma apresentação específica do Google Slides? Cole-o abaixo para
                apresentá-la imediatamente:
              </p>
              <form onSubmit={handleLoadCustomUrl} className="flex flex-wrap gap-2">
                <input
                  type="text"
                  value={customInputUrl}
                  onChange={(e) => setCustomInputUrl(e.target.value)}
                  placeholder="https://docs.google.com/presentation/d/.../edit ou ID do Google Slides"
                  className="flex-1 min-w-[280px] bg-white border border-[#1c1c1c] px-4 py-2.5 font-mono text-xs text-[#1c1c1c] placeholder:text-[#1c1c1c]/40 focus:outline-none focus:ring-1 focus:ring-[#7e2a1f]"
                />
                <button
                  type="submit"
                  className="border border-[#1c1c1c] bg-[#1c1c1c] text-[#f2efeb] px-5 py-2.5 font-mono text-xs uppercase tracking-wider hover:bg-[#7e2a1f] transition-colors whitespace-nowrap"
                >
                  Carregar Apresentação
                </button>
              </form>
            </section>

            {/* Export Section: Export Doctoral Decks to Google Slides */}
            <section className="border-[1.5px] border-[#1c1c1c] bg-white/40 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-[#7e2a1f]">
                  [ EXPORTAÇÃO AUTORAL ] · EXPORTAR COMUNICAÇÕES PARA O GOOGLE SLIDES
                </h2>
                <span className="font-mono text-[11px] text-[#1c1c1c]/60">
                  Cria uma apresentação nativa no seu Google Drive com notas de orador
                </span>
              </div>

              <p className="font-serif text-base text-[#1c1c1c]/85 mb-4 leading-relaxed">
                Exporte a apresentação doutoral completa (todas as lâminas, blocos textuais e roteiro
                de condução oral) diretamente para o seu Google Slides:
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
                  onClick={handleExportToGoogleSlides}
                  className="inline-flex items-center gap-2 border border-[#1c1c1c] bg-[#7e2a1f] text-[#f2efeb] px-5 py-2 font-mono text-xs uppercase tracking-wider hover:bg-[#1c1c1c] transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Gerando Apresentação no Drive...</span>
                    </>
                  ) : (
                    <>
                      <Presentation className="w-3.5 h-3.5" />
                      <span>Exportar para o Google Slides</span>
                    </>
                  )}
                </button>
              </div>

              {lastExported && (
                <div className="mt-4 p-3 border border-[#14532d] bg-[#14532d]/10 font-mono text-xs text-[#14532d] flex flex-wrap items-center justify-between gap-3">
                  <span>
                    ✓ Apresentação criada: <strong>{lastExported.title}</strong> ({lastExported.count} slides).
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleSelectPresentation(lastExported.id)}
                      className="underline font-bold uppercase tracking-wider hover:text-[#1c1c1c]"
                    >
                      Apresentar Agora no App
                    </button>
                    <span>·</span>
                    <a
                      href={lastExported.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 underline font-bold uppercase tracking-wider"
                    >
                      Abrir no Google ↗
                    </a>
                  </div>
                </div>
              )}
            </section>

            {/* Presentations from user's Drive */}
            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b-[1.5px] border-[#1c1c1c]">
                <div>
                  <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-[#7e2a1f]">
                    [ MEU GOOGLE DRIVE ] · APRESENTAÇÕES DISPONÍVEIS
                  </h2>
                  <p className="font-serif text-sm text-[#1c1c1c]/70">
                    Selecione qualquer arquivo do Google Slides para projetar na aplicação
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
                    onClick={loadPresentations}
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
                  <Presentation className="w-10 h-10 mx-auto text-[#7e2a1f]/60" />
                  <h3 className="font-serif text-2xl font-light text-[#1c1c1c]">
                    Conecte sua conta Google para listar suas apresentações
                  </h3>
                  <p className="font-sans text-sm text-[#1c1c1c]/70 max-w-md mx-auto">
                    Conceda permissão de leitura às apresentações do Google Slides para visualizá-las
                    e projetá-las diretamente aqui.
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
                  <span>Buscando apresentações no Google Drive...</span>
                </div>
              ) : presentations.length === 0 ? (
                <div className="border border-dashed border-[#1c1c1c]/30 p-12 text-center bg-white/30 space-y-3">
                  <Presentation className="w-8 h-8 mx-auto text-[#1c1c1c]/40" />
                  <p className="font-serif text-lg text-[#1c1c1c]/70">
                    Nenhuma apresentação do Google Slides encontrada no seu Google Drive
                    {searchQuery ? ` com o termo "${searchQuery}"` : ''}.
                  </p>
                  <p className="font-sans text-xs text-[#1c1c1c]/50">
                    Você pode usar o botão acima para exportar uma apresentação doutoral ou colar um link
                    direto.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {presentations.map((item) => (
                    <article
                      key={item.id}
                      className="border-[1.5px] border-[#1c1c1c] bg-white/60 p-5 flex flex-col justify-between hover:border-[#7e2a1f] transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 font-mono text-[10px] text-[#1c1c1c]/60 mb-2">
                          <span className="uppercase tracking-wider">GOOGLE SLIDES</span>
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
                          onClick={() => handleSelectPresentation(item.id)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 border border-[#1c1c1c] bg-[#1c1c1c] text-[#f2efeb] px-3 py-2 font-mono text-xs uppercase tracking-wider hover:bg-[#7e2a1f] transition-colors"
                        >
                          <Monitor className="w-3.5 h-3.5" />
                          <span>Apresentar</span>
                        </button>

                        {item.webViewLink && (
                          <a
                            href={item.webViewLink}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 border border-[#1c1c1c] text-[#1c1c1c] hover:bg-[#1c1c1c] hover:text-[#f2efeb] transition-colors"
                            title="Abrir no Google Slides ↗"
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

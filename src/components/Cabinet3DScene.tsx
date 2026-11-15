import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  BookmarkPlus,
  Camera,
  ChevronDown,
  ChevronUp,
  Expand,
  RotateCcw,
} from 'lucide-react';
import { ATLAS_ENTRIES } from '../data/atlasCatalog';
import { SavedAtelierRecord } from '../hooks/useArchiveStore';
import {
  CABINET_ARTIFACTS,
  CabinetArtifactId,
  CabinetCameraPreset,
  CabinetFinishPreset,
  CabinetSceneController,
  mountIconocraciaCabinetScene,
} from '../three/iconocraciaCabinet';
import { AtlasAxis, AtlasEntry, DeckId } from '../types';

interface Cabinet3DSceneProps {
  savedSpatialRecords: SavedAtelierRecord[];
  onSaveSpatialRecord: (input: {
    kind: 'image_plate' | 'spatial_view';
    title: string;
    promptOrSummary: string;
    axis: AtlasAxis;
    specSummary: string;
  }) => Promise<string>;
  onOpenLightbox: (entry: AtlasEntry) => void;
  onJumpToSlide: (deck: DeckId, slideIndex: number) => void;
  onExitCabinet: () => void;
  onNotify: (msg: string) => void;
}

const CAMERA_BUTTONS: { id: CabinetCameraPreset; label: string }[] = [
  { id: 'overview', label: 'Panorama' },
  { id: 'venda', label: '01. Iustitia (1494–1603)' },
  { id: 'moeda', label: '02. Moeda (1889)' },
  { id: 'escada', label: '03. Escadaria (1906)' },
];

const FINISH_BUTTONS: { id: CabinetFinishPreset; label: string }[] = [
  { id: 'patina', label: 'Bronze & Calcário' },
  { id: 'gesso', label: 'Gesso & Aço' },
  { id: 'numismatica', label: 'Ouro & Oxblood' },
];

export function Cabinet3DScene({
  savedSpatialRecords,
  onSaveSpatialRecord,
  onOpenLightbox,
  onJumpToSlide,
  onExitCabinet,
  onNotify,
}: Cabinet3DSceneProps) {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<CabinetSceneController | null>(null);

  const [activePreset, setActivePreset] = useState<CabinetCameraPreset>('overview');
  const [selectedArtifactId, setSelectedArtifactId] = useState<CabinetArtifactId>('venda');
  const [explodePct, setExplodePct] = useState<number>(0);
  const [finishPreset, setFinishPreset] = useState<CabinetFinishPreset>('patina');
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(false);
  const [contextLost, setContextLost] = useState<boolean>(false);
  const [isSavingBookmark, setIsSavingBookmark] = useState<boolean>(false);

  const onSelectRef = useRef<(id: CabinetArtifactId) => void>(() => {});
  onSelectRef.current = (id: CabinetArtifactId) => {
    setSelectedArtifactId(id);
    setActivePreset(id);
  };

  useEffect(() => {
    const mountEl = canvasMountRef.current;
    if (!mountEl) return;

    let ctrl: CabinetSceneController | null = null;
    try {
      ctrl = mountIconocraciaCabinetScene({
        container: mountEl,
        onSelectArtifact: (id) => onSelectRef.current(id),
        onContextStatusChange: (lost) => setContextLost(lost),
      });
      controllerRef.current = ctrl;
    } catch (err) {
      console.error('WebGL initialization failed:', err);
      setContextLost(true);
    }

    return () => {
      ctrl?.dispose();
      controllerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === 'h' || e.key === 'H') {
        setDockCollapsed((prev) => !prev);
      } else if (e.key === 'Escape') {
        onExitCabinet();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onExitCabinet]);

  const handleCameraPreset = useCallback((preset: CabinetCameraPreset) => {
    setActivePreset(preset);
    if (preset !== 'overview') {
      setSelectedArtifactId(preset);
    }
    controllerRef.current?.setCameraPreset(preset);
  }, []);

  const handleExplodeChange = useCallback((pct: number) => {
    setExplodePct(pct);
    controllerRef.current?.setExplodeFactor(pct / 100);
  }, []);

  const handleFinishChange = useCallback((finish: CabinetFinishPreset) => {
    setFinishPreset(finish);
    controllerRef.current?.setFinishPreset(finish);
  }, []);

  const handleResetScene = useCallback(() => {
    setActivePreset('overview');
    setExplodePct(0);
    setFinishPreset('patina');
    controllerRef.current?.setCameraPreset('overview');
    controllerRef.current?.setExplodeFactor(0);
    controllerRef.current?.setFinishPreset('patina');
  }, []);

  const handleDownloadSnapshot = useCallback(() => {
    const ctrl = controllerRef.current;
    if (!ctrl) return;
    const dataUrl = ctrl.captureSnapshotDataUrl();
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `gabinete-3d-${activePreset}-${explodePct}pct.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    onNotify('Captura PNG do Gabinete 3D exportada.');
  }, [activePreset, explodePct, onNotify]);

  const activeSpec = CABINET_ARTIFACTS[selectedArtifactId];

  const handleSaveSpatialBookmark = useCallback(async () => {
    setIsSavingBookmark(true);
    try {
      const specSummary = `Câmera: ${activePreset} · Explosão: ${explodePct}% · Material: ${finishPreset}`;
      await onSaveSpatialRecord({
        kind: 'spatial_view',
        title: `${activeSpec.accessionCode} — ${activeSpec.title}`,
        promptOrSummary: activeSpec.juridicalNote,
        axis: activeSpec.axis,
        specSummary,
      });
      onNotify('Vista espacial salva no caderno local.');
    } catch (err: unknown) {
      onNotify(err instanceof Error ? err.message : 'Falha ao arquivar vista espacial.');
    } finally {
      setIsSavingBookmark(false);
    }
  }, [activePreset, activeSpec, explodePct, finishPreset, onNotify, onSaveSpatialRecord]);

  const handleOpen2DPlate = useCallback(() => {
    const found = ATLAS_ENTRIES.find((e) => e.id === activeSpec.atlasEntryId) || ATLAS_ENTRIES[0];
    onOpenLightbox(found);
  }, [activeSpec.atlasEntryId, onOpenLightbox]);

  const spatialCount = savedSpatialRecords.filter((r) => r.kind === 'spatial_view').length;

  return (
    <div
      role="region"
      aria-label="Gabinete Espacial 3D de Iconologia e Autoridade Jurídica"
      className="fixed inset-0 z-40 w-screen h-screen overflow-hidden bg-[#e9e4db] dark:bg-[#0d0d0d] text-[#1c1c1c] dark:text-[#f2efeb] select-none"
    >
      {/* Isolated WebGL Canvas Mount Container (Strictly Outside Sibling HUD Elements) */}
      <div ref={canvasMountRef} className="absolute inset-0 w-full h-full" />

      {/* Fallback Banner ONLY if WebGL Context is Unavailable or Lost */}
      {contextLost && (
        <div className="absolute inset-0 z-20 flex items-center justify-center p-6 bg-[#f2efeb] dark:bg-[#0d0d0d]">
          <div className="max-w-md p-6 bg-white dark:bg-[#161616] border border-[#1c1c1c] dark:border-[#f2efeb]/65 space-y-3 text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#7e2a1f] dark:text-[#e5988b]">
              GABINETE ESPACIAL · MODO DE SEGURANÇA
            </p>
            <h2 className="font-serif text-2xl text-[#1c1c1c] dark:text-[#f2efeb]">
              Contexto gráfico 3D temporariamente suspenso
            </h2>
            <p className="text-xs leading-relaxed text-[#1c1c1c]/80 dark:text-[#f2efeb]/85">
              Você pode retornar ao catálogo bidimensional e abrir qualquer prancha na mesa de luz
              com zoom de até 400%.
            </p>
            <button
              type="button"
              onClick={onExitCabinet}
              className="inline-flex items-center gap-2 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] border border-[#1c1c1c] dark:border-[#f2efeb] bg-[#1c1c1c] dark:bg-[#f2efeb] text-[#f2efeb] dark:text-[#0d0d0d] whitespace-nowrap shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar ao Atlas</span>
            </button>
          </div>
        </div>
      )}

      {/* Minimal Top-Left Navigation & Title Strip (No backdrop-filter over WebGL) */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between gap-4 pointer-events-none">
        <div className="pointer-events-auto inline-flex items-center gap-3 px-3.5 py-2 bg-[#f2efeb] dark:bg-[#161616] border border-[#1c1c1c] dark:border-[#f2efeb]/65">
          <button
            type="button"
            onClick={onExitCabinet}
            className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-[#1c1c1c] dark:text-[#f2efeb] hover:text-[#7e2a1f] dark:hover:text-[#e5988b] transition-colors whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao Atlas</span>
          </button>
          <span aria-hidden="true" className="text-[#1c1c1c]/30 dark:text-[#f2efeb]/35">
            ·
          </span>
          <span className="font-serif text-base sm:text-lg font-medium text-[#1c1c1c] dark:text-[#f2efeb] truncate max-w-[260px] sm:max-w-none">
            Gabinete Espacial 3D (1494–1906)
          </span>
        </div>

        <div className="hidden md:inline-flex pointer-events-auto items-center gap-2 px-3 py-1.5 bg-[#f2efeb] dark:bg-[#161616] border border-[#1c1c1c]/60 dark:border-[#f2efeb]/50 font-mono text-[10px] uppercase tracking-[0.1em] text-[#1c1c1c]/75 dark:text-[#f2efeb]/80">
          <span>Arraste para orbitar</span>
          <span aria-hidden="true">·</span>
          <span>Clique em um modelo</span>
          <span aria-hidden="true">·</span>
          <span>Tecla H oculta painel</span>
        </div>
      </div>

      {/* Unified Collapsible Bottom-Center Control Dock (<= 15% height, solid surface, zero backdrop-filter) */}
      <div
        className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-10 w-[min(940px,94vw)] transition-transform duration-200 ease-out ${
          dockCollapsed ? 'translate-y-[calc(100%-30px)]' : 'translate-y-0'
        }`}
      >
        {/* Top Edge Collapse / Expand Tab */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setDockCollapsed((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-[#1c1c1c] dark:bg-[#f2efeb] text-[#f2efeb] dark:text-[#0d0d0d] font-mono text-[10px] uppercase tracking-[0.12em] border border-b-0 border-[#1c1c1c] dark:border-[#f2efeb] hover:bg-[#7e2a1f] dark:hover:bg-[#e5988b] transition-colors whitespace-nowrap shrink-0"
          >
            {dockCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Mostrar controles (H)</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Ocultar controles (H)</span>
              </>
            )}
          </button>
        </div>

        {/* Main Compact Dock Body */}
        <div className="p-3.5 sm:p-4 bg-[#f2efeb] dark:bg-[#161616] border-[1.5px] border-[#1c1c1c] dark:border-[#f2efeb]/70 space-y-3">
          {/* Row 1: Active Artifact Analytical Readout + Cross-Links */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1c1c1c]/15 dark:border-[#f2efeb]/20 pb-2.5">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] text-[#7e2a1f] dark:text-[#e5988b] tabular-nums">
                <span className="font-bold">{activeSpec.accessionCode}</span>
                <span aria-hidden="true">·</span>
                <span>{activeSpec.yearRange}</span>
                <span aria-hidden="true">·</span>
                <span className="text-[#1c1c1c] dark:text-[#f2efeb] font-semibold truncate">{activeSpec.title}</span>
              </div>
              <p className="text-xs text-[#1c1c1c]/80 dark:text-[#f2efeb]/85 truncate mt-0.5">{activeSpec.juridicalNote}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleOpen2DPlate}
                className="inline-flex items-center gap-1 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] border border-[#1c1c1c]/45 dark:border-[#f2efeb]/50 text-[#1c1c1c] dark:text-[#f2efeb] hover:bg-[#1c1c1c] hover:text-[#f2efeb] dark:hover:bg-[#f2efeb] dark:hover:text-[#0d0d0d] transition-colors whitespace-nowrap shrink-0"
              >
                <Expand className="w-3 h-3" />
                <span>Prancha 2D</span>
              </button>
              <button
                type="button"
                onClick={() => onJumpToSlide(activeSpec.linkedDeck, activeSpec.linkedSlideIndex)}
                className="inline-flex items-center gap-1 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] border border-[#7e2a1f] dark:border-[#e5988b] text-[#7e2a1f] dark:text-[#e5988b] hover:bg-[#7e2a1f] hover:text-[#f2efeb] dark:hover:bg-[#e5988b] dark:hover:text-[#0d0d0d] transition-colors whitespace-nowrap shrink-0"
              >
                <span>Slide {String(activeSpec.linkedSlideIndex + 1).padStart(2, '0')}</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Row 2: Camera Presets + Exploded View + Material Finishes + Export */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Camera View Buttons */}
            <div
              role="group"
              aria-label="Enquadramentos de câmera"
              className="flex flex-wrap items-center gap-1"
            >
              {CAMERA_BUTTONS.map((cam) => (
                <button
                  key={cam.id}
                  type="button"
                  onClick={() => handleCameraPreset(cam.id)}
                  className={`px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] border transition-colors whitespace-nowrap shrink-0 ${
                    activePreset === cam.id
                      ? 'bg-[#1c1c1c] dark:bg-[#f2efeb] text-[#f2efeb] dark:text-[#0d0d0d] border-[#1c1c1c] dark:border-[#f2efeb]'
                      : 'bg-white dark:bg-[#1e1e1e] text-[#1c1c1c]/85 dark:text-[#f2efeb]/85 border-[#1c1c1c]/35 dark:border-[#f2efeb]/40 hover:border-[#1c1c1c] dark:hover:border-[#f2efeb]'
                  }`}
                >
                  {cam.label}
                </button>
              ))}
            </div>

            {/* Exploded View Slider */}
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[#1c1c1c] dark:text-[#f2efeb] shrink-0">
              <label htmlFor="cabinet-explode-slider" className="whitespace-nowrap">
                Vista explodida
              </label>
              <input
                id="cabinet-explode-slider"
                type="range"
                min={0}
                max={100}
                step={1}
                value={explodePct}
                onChange={(e) => handleExplodeChange(Number(e.target.value))}
                className="w-24 sm:w-28 accent-[#7e2a1f] dark:accent-[#e5988b] cursor-pointer"
              />
              <span className="w-8 text-right tabular-nums">{explodePct}%</span>
            </div>

            {/* Finish Switcher */}
            <div
              role="group"
              aria-label="Acabamento material"
              className="flex flex-wrap items-center gap-1"
            >
              {FINISH_BUTTONS.map((fin) => (
                <button
                  key={fin.id}
                  type="button"
                  onClick={() => handleFinishChange(fin.id)}
                  className={`px-2 py-1 font-mono text-[10px] border transition-colors whitespace-nowrap shrink-0 ${
                    finishPreset === fin.id
                      ? 'bg-[#7e2a1f] dark:bg-[#e5988b] text-[#f2efeb] dark:text-[#0d0d0d] border-[#7e2a1f] dark:border-[#e5988b]'
                      : 'bg-white dark:bg-[#1e1e1e] text-[#1c1c1c]/80 dark:text-[#f2efeb]/85 border-[#1c1c1c]/30 dark:border-[#f2efeb]/35 hover:border-[#1c1c1c] dark:hover:border-[#f2efeb]'
                  }`}
                >
                  {fin.label}
                </button>
              ))}
            </div>

            {/* Utility Actions: Reset, PNG Capture, Firestore Bookmark */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleResetScene}
                title="Restaurar vista inicial"
                className="inline-flex items-center gap-1 px-2 py-1 font-mono text-[10px] uppercase border border-[#1c1c1c]/40 dark:border-[#f2efeb]/45 bg-white dark:bg-[#1e1e1e] text-[#1c1c1c] dark:text-[#f2efeb] hover:bg-[#1c1c1c] hover:text-[#f2efeb] dark:hover:bg-[#f2efeb] dark:hover:text-[#0d0d0d] transition-colors whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadSnapshot}
                title="Baixar imagem PNG desta vista 3D"
                className="inline-flex items-center gap-1 px-2.5 py-1 font-mono text-[10px] uppercase border border-[#1c1c1c] dark:border-[#f2efeb] bg-[#1c1c1c] dark:bg-[#f2efeb] text-[#f2efeb] dark:text-[#0d0d0d] hover:bg-[#7e2a1f] hover:border-[#7e2a1f] dark:hover:bg-[#e5988b] dark:hover:border-[#e5988b] transition-colors whitespace-nowrap shrink-0"
              >
                <Camera className="w-3 h-3" />
                <span>PNG</span>
              </button>

              <button
                type="button"
                disabled={isSavingBookmark}
                onClick={handleSaveSpatialBookmark}
                className="inline-flex items-center gap-1 px-2.5 py-1 font-mono text-[10px] uppercase border border-[#7e2a1f] dark:border-[#e5988b] bg-white dark:bg-[#1e1e1e] text-[#7e2a1f] dark:text-[#e5988b] hover:bg-[#7e2a1f] hover:text-[#f2efeb] dark:hover:bg-[#e5988b] dark:hover:text-[#0d0d0d] transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
              >
                <BookmarkPlus className="w-3 h-3" />
                <span>
                  {isSavingBookmark
                    ? 'Salvando...'
                    : `Salvar vista${spatialCount > 0 ? ` (${spatialCount})` : ''}`}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

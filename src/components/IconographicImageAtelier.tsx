import { ChangeEvent, FormEvent, useState } from 'react';
import {
  BookmarkPlus,
  Download,
  Expand,
  ExternalLink,
  ImagePlus,
  Loader2,
  RefreshCw,
  Trash2,
  Upload,
  Wand2,
} from 'lucide-react';
import { ATLAS_ENTRIES } from '../data/atlasCatalog';
import { SavedAtelierRecord } from '../hooks/useArchiveStore';
import { AtlasAxis, AtlasEntry } from '../types';

type AtelierMode = 'create' | 'edit';
type AspectRatioOption = '4:3' | '3:4' | '1:1' | '16:9' | '4:1';
type ImageSizeOption = '1K' | '2K' | '4K';

interface GeneratedPlateResult {
  imageUrl: string;
  mimeType: string;
  notes: string;
  aspectRatio: AspectRatioOption;
  imageSize: ImageSizeOption;
  promptUsed: string;
  mode: AtelierMode;
  sources: { title: string; uri: string }[];
}

interface IconographicImageAtelierProps {
  savedRecords: SavedAtelierRecord[];
  onSaveRecordLocal: (input: {
    kind: 'image_plate' | 'spatial_view';
    title: string;
    promptOrSummary: string;
    axis: AtlasAxis;
    specSummary: string;
  }) => Promise<string>;
  onDeleteLocalRecord: (id: string) => Promise<void>;
  onInspectInLightbox: (entry: AtlasEntry) => void;
  onNotify: (msg: string) => void;
}

const CREATE_PRESETS: {
  label: string;
  title: string;
  axis: AtlasAxis;
  aspect: AspectRatioOption;
  prompt: string;
}[] = [
  {
    label: 'Xilogravura · Venda (1494–1603)',
    title: 'Estudo xilográfico — Alegoria da Justiça e atributo da venda',
    axis: 'venda',
    aspect: '3:4',
    prompt:
      'High-resolution Renaissance woodcut and copperplate engraving on laid rag paper (#f2efeb), standing female allegory of Iustitia holding equilibrium scales and upright sword, fine cross-hatching in deep charcoal ink (#1c1c1c), museum print cabinet lighting, documentary plate study.',
  },
  {
    label: 'Alegoria Constitucional · Império (1822–1839)',
    title: 'Estudo litográfico — Alegoria constitucional oitocentista',
    axis: 'imperio',
    aspect: '4:3',
    prompt:
      'Nineteenth-century neoclassical lithograph and intaglio frontispiece on warm archival rag paper, female constitutional allegory beside a carved stone tablet of public law and tropical botanical framing, crisp academic linework, museum conservation photography.',
  },
  {
    label: 'Numismática & Pórtico · República (1889–1906)',
    title: 'Estudo numismático — Efígie republicana em cunho metálico',
    axis: 'republica',
    aspect: '1:1',
    prompt:
      'Macro studio numismatic photography of an 1889 struck bronze and silver republican trial coin resting on cream archival card, crisp profile bust wearing a Phrygian cap, milled reed edge, raking side light revealing high-relief die engraving.',
  },
];

const EDIT_PRESETS: {
  label: string;
  prompt: string;
}[] = [
  {
    label: 'Remover ou destacar venda ocular',
    prompt:
      'Preserve the historical engraving style, paper grain, and posture, but remove the blindfold so the allegory gazes directly ahead with clear open eyes, maintaining authentic 16th-century intaglio cross-hatching.',
  },
  {
    label: 'Converter para água-forte em papel vergê',
    prompt:
      'Transform this image into a monochrome copperplate etching printed in deep carbon ink (#1c1c1c) on warm laid cotton paper (#f2efeb) with subtle plate-mark embossing along the margins.',
  },
  {
    label: 'Iluminação rasante de gabinete',
    prompt:
      'Apply directional raking museum conservation light from the upper left to emphasize surface relief, carved edges, and material texture while keeping neutral archival fidelity.',
  },
];

async function urlToDataUrl(url: string): Promise<{ dataUrl: string; mimeType: string }> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Não foi possível carregar a prancha de referência selecionada.');
  }
  const blob = await response.blob();
  const mimeType = blob.type || 'image/png';
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('Falha ao converter imagem de referência.'));
    };
    reader.onerror = () => reject(new Error('Erro de leitura do arquivo de imagem.'));
    reader.readAsDataURL(blob);
  });
  return { dataUrl, mimeType };
}

export function IconographicImageAtelier({
  savedRecords,
  onSaveRecordLocal,
  onDeleteLocalRecord,
  onInspectInLightbox,
  onNotify,
}: IconographicImageAtelierProps) {
  const [mode, setMode] = useState<AtelierMode>('create');
  const [title, setTitle] = useState<string>(
    'Estudo comparativo — Alegoria jurídica e suporte material'
  );
  const [axis, setAxis] = useState<AtlasAxis>('venda');
  const [prompt, setPrompt] = useState<string>(CREATE_PRESETS[0].prompt);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>('4:3');
  const [imageSize, setImageSize] = useState<ImageSizeOption>('1K');
  const [useWebGrounding, setUseWebGrounding] = useState<boolean>(false);

  const [sourceImageDataUrl, setSourceImageDataUrl] = useState<string | null>(null);
  const [sourceMimeType, setSourceMimeType] = useState<string>('image/png');
  const [sourceLabel, setSourceLabel] = useState<string>('');
  const [loadingSourceId, setLoadingSourceId] = useState<string | null>(null);

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [result, setResult] = useState<GeneratedPlateResult | null>(null);
  const [isSavingLocal, setIsSavingLocal] = useState<boolean>(false);

  const plateRecords = savedRecords.filter((r) => r.kind === 'image_plate');

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Selecione um arquivo de imagem válido (PNG, JPEG ou WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSourceImageDataUrl(reader.result);
        setSourceMimeType(file.type || 'image/png');
        setSourceLabel(file.name);
        setMode('edit');
        setErrorMsg('');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleLoadCanonicalPlate = async (entry: AtlasEntry) => {
    setLoadingSourceId(entry.id);
    setErrorMsg('');
    try {
      const { dataUrl, mimeType } = await urlToDataUrl(entry.imageSrc);
      setSourceImageDataUrl(dataUrl);
      setSourceMimeType(mimeType);
      setSourceLabel(`${entry.accessionCode} · ${entry.title}`);
      setAxis(entry.axis);
      setTitle(`Derivação analítica — ${entry.accessionCode}`);
      setMode('edit');
      if (prompt === CREATE_PRESETS[0].prompt) {
        setPrompt(EDIT_PRESETS[0].prompt);
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Falha ao carregar prancha do Atlas para edição.'
      );
    } finally {
      setLoadingSourceId(null);
    }
  };

  const handleUseResultAsEditSource = () => {
    if (!result) return;
    setSourceImageDataUrl(result.imageUrl);
    setSourceMimeType(result.mimeType);
    setSourceLabel('Última prancha gerada nesta sessão');
    setMode('edit');
    setPrompt(EDIT_PRESETS[2].prompt);
    onNotify('Prancha carregada como matriz para edição iterativa.');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setErrorMsg('Informe a descrição iconográfica ou instrução de edição.');
      return;
    }
    if (mode === 'edit' && !sourceImageDataUrl) {
      setErrorMsg(
        'Para editar, envie uma imagem do seu computador ou selecione uma das 6 pranchas do Atlas.'
      );
      return;
    }

    setIsGenerating(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/atelier/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          base64Image: mode === 'edit' ? sourceImageDataUrl : undefined,
          mimeType: mode === 'edit' ? sourceMimeType : undefined,
          aspectRatio,
          imageSize,
          useWebGrounding,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Não foi possível gerar ou editar a prancha.');
      }

      setResult({
        imageUrl: data.imageUrl,
        mimeType: data.mimeType || 'image/png',
        notes: data.notes || '',
        aspectRatio: (data.aspectRatio as AspectRatioOption) || aspectRatio,
        imageSize: (data.imageSize as ImageSizeOption) || imageSize,
        promptUsed: prompt.trim(),
        mode,
        sources: Array.isArray(data.sources) ? data.sources : [],
      });
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Erro inesperado ao comunicar com o atelier visual.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPng = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result.imageUrl;
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 48);
    a.download = `${slug || 'prancha-iconocracia'}-${result.imageSize.toLowerCase()}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleSaveRecordLocal = async () => {
    if (!result) return;
    setIsSavingLocal(true);
    try {
      const specSummary = `${result.mode === 'edit' ? 'Edição' : 'Criação'} · ${
        result.aspectRatio
      } · ${result.imageSize}${useWebGrounding ? ' · Web/Img Search' : ''}`;
      await onSaveRecordLocal({
        kind: 'image_plate',
        title: title.trim() || 'Prancha de estudo iconográfico',
        promptOrSummary: result.promptUsed,
        axis,
        specSummary,
      });
      onNotify('Registro metodológico salvo no caderno local.');
    } catch (err: unknown) {
      onNotify(err instanceof Error ? err.message : 'Falha ao salvar registro localmente.');
    } finally {
      setIsSavingLocal(false);
    }
  };

  const handleInspectGeneratedPlate = () => {
    if (!result) return;
    const syntheticEntry: AtlasEntry = {
      id: `atelier-session-${Date.now()}`,
      accessionCode: 'ATELIER · ESTUDO',
      axis,
      year: '2026',
      sortYear: 2026,
      title: title.trim() || 'Prancha de estudo experimental',
      creator: 'Atelier Iconográfico ICONOCRACIA (estudo formal assistido)',
      medium: `${result.mode === 'edit' ? 'Derivação visual sobre matriz' : 'Síntese visual'} · ${
        result.aspectRatio
      } · ${result.imageSize}`,
      repositoryOrContext:
        'Prancha experimental de trabalho — distinta de fac-símile documental primário',
      imageSrc: result.imageUrl,
      imageAlt: title.trim() || 'Prancha gerada no atelier iconográfico',
      aspectClass: result.aspectRatio === '3:4' ? 'aspect-[3/4]' : 'aspect-[4/3]',
      epistemicStatus: 'study_plate',
      statusDetail: 'Estudo visual experimental (não substitui cota de acervo)',
      analyticalFunction:
        'Ensaio comparativo de composição, iluminação rasante e variações de atributos alegóricos.',
      juridicalQuestion: result.promptUsed,
      verificationNotes:
        'Artefato gerado em sessão para hipótese visual; mantenha separado das fontes primárias verificadas.',
      linkedSlides: [],
    };
    onInspectInLightbox(syntheticEntry);
  };

  return (
    <section
      aria-labelledby="atelier-heading"
      className="space-y-8 animate-timeline-panel"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Controls Form */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-6 p-6 sm:p-8 bg-white/70 dark:bg-[#161616] border border-[#1c1c1c] dark:border-[#f2efeb]/65 space-y-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1c1c1c]/15 dark:border-[#f2efeb]/20 pb-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#7e2a1f] dark:text-[#e5988b]">
                ATELIER ICONOGRÁFICO · ALTA RESOLUÇÃO (1K–4K)
              </p>
              <h2
                id="atelier-heading"
                className="font-serif text-2xl sm:text-3xl font-medium text-[#1c1c1c] dark:text-[#f2efeb]"
              >
                Criar ou editar pranchas de estudo
              </h2>
            </div>

            {/* Mode Switcher */}
            <div
              role="group"
              aria-label="Modo do atelier de pranchas"
              className="flex items-center border border-[#1c1c1c] dark:border-[#f2efeb]/65"
            >
              <button
                type="button"
                onClick={() => setMode('create')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors whitespace-nowrap shrink-0 ${
                  mode === 'create'
                    ? 'bg-[#1c1c1c] dark:bg-[#f2efeb] text-[#f2efeb] dark:text-[#0d0d0d]'
                    : 'bg-transparent text-[#1c1c1c] dark:text-[#f2efeb] hover:bg-[#1c1c1c]/10 dark:hover:bg-[#f2efeb]/10'
                }`}
              >
                <ImagePlus className="w-3.5 h-3.5" />
                <span>Criar prancha</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('edit')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.1em] border-l border-[#1c1c1c] dark:border-[#f2efeb]/65 transition-colors whitespace-nowrap shrink-0 ${
                  mode === 'edit'
                    ? 'bg-[#7e2a1f] dark:bg-[#e5988b] text-[#f2efeb] dark:text-[#0d0d0d]'
                    : 'bg-transparent text-[#1c1c1c] dark:text-[#f2efeb] hover:bg-[#1c1c1c]/10 dark:hover:bg-[#f2efeb]/10'
                }`}
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Editar prancha</span>
              </button>
            </div>
          </div>

          {/* Title & Axis */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label
                htmlFor="atelier-plate-title"
                className="block font-mono text-[10px] uppercase tracking-[0.14em] text-[#1c1c1c]/75 dark:text-[#f2efeb]/80"
              >
                Título da prancha de estudo
              </label>
              <input
                id="atelier-plate-title"
                type="text"
                maxLength={240}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-[#f2efeb] dark:bg-[#121212] border border-[#1c1c1c]/45 dark:border-[#f2efeb]/45 font-serif text-base text-[#1c1c1c] dark:text-[#f2efeb] focus:outline-none focus:border-[#7e2a1f] dark:focus:border-[#e5988b]"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="atelier-axis"
                className="block font-mono text-[10px] uppercase tracking-[0.14em] text-[#1c1c1c]/75 dark:text-[#f2efeb]/80"
              >
                Eixo analítico
              </label>
              <select
                id="atelier-axis"
                value={axis}
                onChange={(e) => setAxis(e.target.value as AtlasAxis)}
                className="w-full px-3 py-2.5 bg-[#f2efeb] dark:bg-[#121212] border border-[#1c1c1c]/45 dark:border-[#f2efeb]/45 font-mono text-[11px] text-[#1c1c1c] dark:text-[#f2efeb] focus:outline-none focus:border-[#7e2a1f] dark:focus:border-[#e5988b]"
              >
                <option value="venda">Venda (1494–1603)</option>
                <option value="imperio">Império (1822–1839)</option>
                <option value="republica">República (1889–1906)</option>
              </select>
            </div>
          </div>

          {/* Source Image Picker when in Edit Mode */}
          {mode === 'edit' && (
            <div className="p-4 bg-[#f2efeb] dark:bg-[#1a1a1a] border border-[#1c1c1c]/35 dark:border-[#f2efeb]/40 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#7e2a1f] dark:text-[#e5988b] font-bold">
                  Matriz visual para edição
                </span>
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] border border-[#1c1c1c] dark:border-[#f2efeb]/70 bg-white dark:bg-[#222222] text-[#1c1c1c] dark:text-[#f2efeb] hover:bg-[#1c1c1c] hover:text-[#f2efeb] dark:hover:bg-[#f2efeb] dark:hover:text-[#0d0d0d] cursor-pointer transition-colors whitespace-nowrap shrink-0">
                  <Upload className="w-3 h-3" />
                  <span>Enviar arquivo</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleFileUpload}
                    className="sr-only"
                  />
                </label>
              </div>

              <div className="space-y-1.5">
                <span className="block font-mono text-[10px] text-[#1c1c1c]/70 dark:text-[#f2efeb]/75">
                  Ou carregar prancha do catálogo como base:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {ATLAS_ENTRIES.map((entry) => (
                    <button
                      key={entry.id}
                      type="button"
                      disabled={loadingSourceId === entry.id}
                      onClick={() => handleLoadCanonicalPlate(entry)}
                      className="px-2.5 py-1 font-mono text-[10px] border border-[#1c1c1c]/35 dark:border-[#f2efeb]/40 bg-white/80 dark:bg-[#222222] text-[#1c1c1c] dark:text-[#f2efeb] hover:border-[#1c1c1c] dark:hover:border-[#f2efeb] transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
                    >
                      {loadingSourceId === entry.id
                        ? 'Carregando...'
                        : `${entry.year} · ${entry.accessionCode}`}
                    </button>
                  ))}
                </div>
              </div>

              {sourceImageDataUrl && (
                <div className="flex items-center gap-3 pt-2 border-t border-[#1c1c1c]/15 dark:border-[#f2efeb]/20">
                  <img
                    src={sourceImageDataUrl}
                    alt="Matriz selecionada para edição"
                    referrerPolicy="no-referrer"
                    className="w-16 h-12 object-cover border border-[#1c1c1c]/40 dark:border-[#f2efeb]/45 bg-white dark:bg-[#121212] shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[10px] text-[#1c1c1c] dark:text-[#f2efeb] truncate">
                      Matriz ativa: {sourceLabel}
                    </p>
                    <p className="font-mono text-[10px] text-[#1c1c1c]/60 dark:text-[#f2efeb]/70">
                      Descreva abaixo a transformação formal, material ou luminosa desejada.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Curated Presets */}
          <div className="space-y-2">
            <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-[#1c1c1c]/70 dark:text-[#f2efeb]/75">
              {mode === 'create'
                ? 'Matrizes descritivas sugeridas:'
                : 'Operações comparativas sugeridas:'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {mode === 'create'
                ? CREATE_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setTitle(preset.title);
                        setAxis(preset.axis);
                        setAspectRatio(preset.aspect);
                        setPrompt(preset.prompt);
                      }}
                      className="px-2.5 py-1 font-mono text-[10px] border border-[#1c1c1c]/35 dark:border-[#f2efeb]/40 bg-[#f2efeb] dark:bg-[#1e1e1e] text-[#1c1c1c] dark:text-[#f2efeb] hover:border-[#7e2a1f] dark:hover:border-[#e5988b] hover:text-[#7e2a1f] dark:hover:text-[#e5988b] transition-colors whitespace-nowrap shrink-0"
                    >
                      {preset.label}
                    </button>
                  ))
                : EDIT_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setPrompt(preset.prompt)}
                      className="px-2.5 py-1 font-mono text-[10px] border border-[#1c1c1c]/35 dark:border-[#f2efeb]/40 bg-[#f2efeb] dark:bg-[#1e1e1e] text-[#1c1c1c] dark:text-[#f2efeb] hover:border-[#7e2a1f] dark:hover:border-[#e5988b] hover:text-[#7e2a1f] dark:hover:text-[#e5988b] transition-colors whitespace-nowrap shrink-0"
                    >
                      {preset.label}
                    </button>
                  ))}
            </div>
          </div>

          {/* Prompt Textarea */}
          <div className="space-y-1.5">
            <label
              htmlFor="atelier-prompt"
              className="block font-mono text-[10px] uppercase tracking-[0.14em] text-[#1c1c1c]/75 dark:text-[#f2efeb]/80"
            >
              {mode === 'create'
                ? 'Descrição iconográfica e técnica (gravura, suporte, atributos, iluminação)'
                : 'Instrução de edição sobre a prancha selecionada'}
            </label>
            <textarea
              id="atelier-prompt"
              rows={4}
              maxLength={2000}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Descreva os elementos formais, técnica gráfica, suporte material e enquadramento..."
              className="w-full p-3 bg-[#f2efeb] dark:bg-[#121212] border border-[#1c1c1c]/45 dark:border-[#f2efeb]/45 font-serif text-base leading-relaxed text-[#1c1c1c] dark:text-[#f2efeb] placeholder:text-[#1c1c1c]/45 dark:placeholder:text-[#f2efeb]/45 focus:outline-none focus:border-[#7e2a1f] dark:focus:border-[#e5988b]"
            />
          </div>

          {/* Aspect Ratio, Resolution & Search Grounding */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-[#1c1c1c]/75 dark:text-[#f2efeb]/80">
                Proporção da prancha
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(['4:3', '3:4', '1:1', '16:9', '4:1'] as AspectRatioOption[]).map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setAspectRatio(ratio)}
                    className={`px-2.5 py-1 font-mono text-[10px] border tabular-nums transition-colors whitespace-nowrap shrink-0 ${
                      aspectRatio === ratio
                        ? 'bg-[#1c1c1c] dark:bg-[#f2efeb] text-[#f2efeb] dark:text-[#0d0d0d] border-[#1c1c1c] dark:border-[#f2efeb]'
                        : 'bg-[#f2efeb] dark:bg-[#1e1e1e] text-[#1c1c1c]/80 dark:text-[#f2efeb]/85 border-[#1c1c1c]/35 dark:border-[#f2efeb]/40 hover:border-[#1c1c1c] dark:hover:border-[#f2efeb]'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-[#1c1c1c]/75 dark:text-[#f2efeb]/80">
                Resolução de saída
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(['1K', '2K', '4K'] as ImageSizeOption[]).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setImageSize(sz)}
                    className={`px-3 py-1 font-mono text-[10px] border tabular-nums transition-colors whitespace-nowrap shrink-0 ${
                      imageSize === sz
                        ? 'bg-[#7e2a1f] dark:bg-[#e5988b] text-[#f2efeb] dark:text-[#0d0d0d] border-[#7e2a1f] dark:border-[#e5988b]'
                        : 'bg-[#f2efeb] dark:bg-[#1e1e1e] text-[#1c1c1c]/80 dark:text-[#f2efeb]/85 border-[#1c1c1c]/35 dark:border-[#f2efeb]/40 hover:border-[#1c1c1c] dark:hover:border-[#f2efeb]'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer select-none pt-1">
            <input
              type="checkbox"
              checked={useWebGrounding}
              onChange={(e) => setUseWebGrounding(e.target.checked)}
              className="mt-0.5 accent-[#7e2a1f] dark:accent-[#e5988b]"
            />
            <span className="text-xs leading-snug text-[#1c1c1c]/80 dark:text-[#f2efeb]/85">
              Ancorar referências visuais e históricas com busca na Web e Google Imagens
            </span>
          </label>

          {errorMsg && (
            <div
              role="alert"
              className="p-3.5 bg-[#7e2a1f]/10 dark:bg-[#e5988b]/10 border border-[#7e2a1f] dark:border-[#e5988b] font-mono text-[11px] text-[#7e2a1f] dark:text-[#e5988b]"
            >
              {errorMsg}
            </div>
          )}

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#1c1c1c]/15 dark:border-[#f2efeb]/20">
            <span className="font-mono text-[10px] text-[#1c1c1c]/60 dark:text-[#f2efeb]/70">
              Estudo formal separado de fontes primárias
            </span>

            <button
              type="submit"
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] border border-[#1c1c1c] dark:border-[#f2efeb] bg-[#1c1c1c] dark:bg-[#f2efeb] text-[#f2efeb] dark:text-[#0d0d0d] hover:bg-[#7e2a1f] hover:border-[#7e2a1f] dark:hover:bg-[#e5988b] dark:hover:border-[#e5988b] transition-colors whitespace-nowrap shrink-0 disabled:opacity-55"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processando prancha ({imageSize})...</span>
                </>
              ) : (
                <>
                  {mode === 'create' ? (
                    <ImagePlus className="w-3.5 h-3.5" />
                  ) : (
                    <Wand2 className="w-3.5 h-3.5" />
                  )}
                  <span>{mode === 'create' ? 'Gerar prancha de estudo' : 'Aplicar edição'}</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Right Column: Light-Table Preview & Archival Persistence */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 sm:p-8 bg-white/70 dark:bg-[#161616] border border-[#1c1c1c] dark:border-[#f2efeb]/65 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1c1c1c]/15 dark:border-[#f2efeb]/20 pb-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#7e2a1f] dark:text-[#e5988b]">
                PROVA DE ESTUDO · MESA DE INSPEÇÃO
              </span>
              {result && (
                <span className="font-mono text-[10px] text-[#1c1c1c]/65 dark:text-[#f2efeb]/70 tabular-nums">
                  {result.mode === 'edit' ? 'EDIÇÃO' : 'CRIAÇÃO'} · {result.aspectRatio} ·{' '}
                  {result.imageSize}
                </span>
              )}
            </div>

            {result ? (
              <div className="space-y-4">
                <div className="relative w-full overflow-hidden bg-[#e7e2da] dark:bg-[#121212] border border-[#1c1c1c]/35 dark:border-[#f2efeb]/40">
                  <img
                    src={result.imageUrl}
                    alt={title}
                    referrerPolicy="no-referrer"
                    className="w-full max-h-[440px] object-contain mx-auto block"
                  />
                </div>

                {result.notes && (
                  <p className="text-xs font-serif italic leading-relaxed text-[#1c1c1c]/80 dark:text-[#f2efeb]/85">
                    {result.notes}
                  </p>
                )}

                {result.sources.length > 0 && (
                  <div className="pt-2 border-t border-[#1c1c1c]/15 dark:border-[#f2efeb]/20 space-y-1">
                    <span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-[#1c1c1c]/65 dark:text-[#f2efeb]/70">
                      Referências consultadas:
                    </span>
                    <div className="flex flex-wrap gap-3">
                      {result.sources.slice(0, 4).map((s) => (
                        <a
                          key={s.uri}
                          href={s.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-mono text-[10px] text-[#7e2a1f] dark:text-[#e5988b] hover:underline truncate max-w-[240px]"
                        >
                          <span className="truncate">{s.title}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#1c1c1c]/15 dark:border-[#f2efeb]/20">
                  <button
                    type="button"
                    onClick={handleInspectGeneratedPlate}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.1em] border border-[#1c1c1c] dark:border-[#f2efeb] bg-[#1c1c1c] dark:bg-[#f2efeb] text-[#f2efeb] dark:text-[#0d0d0d] hover:bg-[#7e2a1f] hover:border-[#7e2a1f] dark:hover:bg-[#e5988b] dark:hover:border-[#e5988b] transition-colors whitespace-nowrap shrink-0"
                  >
                    <Expand className="w-3.5 h-3.5" />
                    <span>Lupa 400%</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleUseResultAsEditSource}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.1em] border border-[#1c1c1c] dark:border-[#f2efeb]/70 text-[#1c1c1c] dark:text-[#f2efeb] hover:bg-[#1c1c1c] hover:text-[#f2efeb] dark:hover:bg-[#f2efeb] dark:hover:text-[#0d0d0d] transition-colors whitespace-nowrap shrink-0"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refinar / Editar esta prancha</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadPng}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.1em] border border-[#1c1c1c] dark:border-[#f2efeb]/70 text-[#1c1c1c] dark:text-[#f2efeb] hover:bg-[#1c1c1c] hover:text-[#f2efeb] dark:hover:bg-[#f2efeb] dark:hover:text-[#0d0d0d] transition-colors whitespace-nowrap shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar PNG</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSavingLocal}
                    onClick={handleSaveRecordLocal}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.1em] border border-[#7e2a1f] dark:border-[#e5988b] text-[#7e2a1f] dark:text-[#e5988b] hover:bg-[#7e2a1f] hover:text-[#f2efeb] dark:hover:bg-[#e5988b] dark:hover:text-[#0d0d0d] transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    <span>{isSavingLocal ? 'Salvando...' : 'Salvar no caderno local'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-16 px-6 bg-[#f2efeb] dark:bg-[#121212] border border-dashed border-[#1c1c1c]/30 dark:border-[#f2efeb]/35 text-center space-y-2">
                <p className="font-serif text-xl text-[#1c1c1c] dark:text-[#f2efeb]">
                  Nenhuma prova gerada nesta sessão
                </p>
                <p className="text-xs leading-relaxed text-[#1c1c1c]/70 dark:text-[#f2efeb]/75 max-w-md mx-auto">
                  Utilize o formulário ao lado para sintetizar uma prancha comparativa em 1K, 2K ou
                  4K ou carregue uma das seis pranchas do Atlas para testar variações formais e
                  atributos alegóricos.
                </p>
              </div>
            )}
          </div>

          {/* Saved Local Plate Metadata Ledger */}
          <div className="p-6 bg-white/55 dark:bg-[#161616] border border-[#1c1c1c]/35 dark:border-[#f2efeb]/40 space-y-3">
            <div className="flex items-center justify-between gap-2 border-b border-[#1c1c1c]/15 dark:border-[#f2efeb]/20 pb-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#7e2a1f] dark:text-[#e5988b]">
                CADERNO LOCAL DE MATRIZES ({plateRecords.length})
              </span>
              <span className="font-mono text-[10px] text-[#1c1c1c]/60 dark:text-[#f2efeb]/70">
                Metadados e instruções salvos no navegador
              </span>
            </div>

            {plateRecords.length === 0 ? (
              <p className="text-xs text-[#1c1c1c]/70 dark:text-[#f2efeb]/75">
                Nenhuma matriz iconográfica registrada ainda neste navegador. Gere uma prancha ou
                salve uma vista do Gabinete 3D para reutilizá-la aqui.
              </p>
            ) : (
              <div className="divide-y divide-[#1c1c1c]/15 dark:divide-[#f2efeb]/15 max-h-60 overflow-y-auto pr-1">
                {plateRecords.map((rec) => (
                  <div
                    key={rec.id}
                    className="py-3 first:pt-1 last:pb-0 flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] text-[#1c1c1c]/65 dark:text-[#f2efeb]/70 tabular-nums">
                        <span className="uppercase text-[#7e2a1f] dark:text-[#e5988b] font-bold">{rec.axis}</span>
                        <span aria-hidden="true">·</span>
                        <span>{rec.specSummary}</span>
                      </div>
                      <p className="font-serif text-base font-medium text-[#1c1c1c] dark:text-[#f2efeb] truncate">
                        {rec.title}
                      </p>
                      <p className="text-xs text-[#1c1c1c]/75 dark:text-[#f2efeb]/80 line-clamp-2">
                        {rec.promptOrSummary}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setTitle(rec.title);
                          setAxis(rec.axis);
                          setPrompt(rec.promptOrSummary);
                          onNotify('Instrução carregada no formulário do atelier.');
                        }}
                        className="px-2.5 py-1 font-mono text-[10px] uppercase border border-[#1c1c1c]/40 dark:border-[#f2efeb]/45 text-[#1c1c1c] dark:text-[#f2efeb] hover:bg-[#1c1c1c] hover:text-[#f2efeb] dark:hover:bg-[#f2efeb] dark:hover:text-[#0d0d0d] transition-colors whitespace-nowrap shrink-0"
                      >
                        Reusar
                      </button>
                      <button
                        type="button"
                        onClick={() => void onDeleteLocalRecord(rec.id)}
                        aria-label={`Remover registro ${rec.title}`}
                        className="p-1.5 text-[#1c1c1c]/55 dark:text-[#f2efeb]/65 hover:text-[#7e2a1f] dark:hover:text-[#e5988b] transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

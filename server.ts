import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

const ALLOWED_ASPECT_RATIOS = new Set([
  '1:1',
  '3:4',
  '4:3',
  '9:16',
  '16:9',
  '1:4',
  '4:1',
]);

const ALLOWED_IMAGE_SIZES = new Set(['1K', '2K', '4K']);

function getGenAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

interface GroundingSource {
  title: string;
  uri: string;
}

async function generateWithRetry(
  ai: GoogleGenAI,
  query: string,
  lang: string,
  context?: string
) {
  const maxAttempts = 2;
  let lastErr: unknown;

  const langLabel =
    lang === 'en'
      ? 'English'
      : lang === 'fr'
      ? 'French'
      : lang === 'it'
      ? 'Italian'
      : lang === 'nl'
      ? 'Dutch'
      : 'Portuguese (pt-BR)';

  const systemInstruction = [
    'You are a rigorous archival, iconographic, and legal-history research assistant supporting the doctoral dossier ICONOCRACIA (PPGD/UFSC).',
    `Respond in ${langLabel}.`,
    'Separate verified documentary data (repositories, shelfmarks/cotas, dates, official editions, digital facsimiles, legislation) from interpretive commentary.',
    'Keep the response concise (3 to 5 short paragraphs or structured bullet points) with precise institutional attributions.',
  ].join(' ');

  const fullPrompt = context
    ? `Contexto do dossiê: ${context}\n\nConsulta documental: ${query}`
    : query;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: fullPrompt,
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }],
        },
      });
      return response;
    } catch (err: unknown) {
      lastErr = err;
      const status = (err as { status?: number })?.status;
      if (attempt < maxAttempts && (status === 503 || status === 500)) {
        await new Promise((resolve) => setTimeout(resolve, 700 * attempt));
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}

function stripDataUrlPrefix(rawBase64: string): { data: string; detectedMime?: string } {
  const trimmed = rawBase64.trim();
  const match = trimmed.match(/^data:([^;]+);base64,(.+)$/s);
  if (match) {
    return { detectedMime: match[1], data: match[2].trim() };
  }
  return { data: trimmed };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '18mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.post('/api/research/grounding', async (req, res) => {
    try {
      const { query, lang = 'pt', context = '' } = req.body || {};
      if (!query || typeof query !== 'string' || !query.trim()) {
        res.status(400).json({ error: 'Informe uma consulta documental válida.' });
        return;
      }

      const ai = getGenAIClient();
      const response = await generateWithRetry(ai, query.trim(), String(lang), String(context));

      const synthesis = response.text ?? '';
      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
      const rawChunks = groundingMetadata?.groundingChunks ?? [];
      const seenUris = new Set<string>();
      const sources: GroundingSource[] = [];

      for (const chunk of rawChunks) {
        const uri = chunk.web?.uri;
        const title = chunk.web?.title;
        if (uri && !seenUris.has(uri)) {
          seenUris.add(uri);
          sources.push({
            uri,
            title: title || uri,
          });
        }
      }

      const searchQueries = groundingMetadata?.webSearchQueries ?? [];

      res.json({
        synthesis,
        sources,
        searchQueries,
      });
    } catch (err: unknown) {
      console.error('Research grounding error:', err);
      const status = (err as { status?: number })?.status || 500;
      const rawMsg = err instanceof Error ? err.message : String(err);

      if (
        status === 403 ||
        status === 400 ||
        rawMsg.includes('API_KEY_INVALID') ||
        rawMsg.includes('PERMISSION_DENIED')
      ) {
        res.status(status).json({
          error:
            'Não foi possível autenticar a consulta Gemini. Verifique a chave configurada em Settings > Secrets.',
        });
        return;
      }

      if (status === 429 || rawMsg.includes('RESOURCE_EXHAUSTED')) {
        res.status(429).json({
          error:
            'Limite de requisições atingido (429). Aguarde alguns instantes ou selecione uma chave com faturamento ativo em Settings > Secrets.',
        });
        return;
      }

      res.status(status >= 400 && status < 600 ? status : 500).json({
        error: rawMsg || 'Falha ao consultar a pesquisa documental fundamentada.',
      });
    }
  });

  // Server-side Image Creation & Editing Atelier using gemini-nano-banana-2.1
  app.post('/api/atelier/image', async (req, res) => {
    try {
      const {
        prompt,
        base64Image,
        mimeType,
        aspectRatio = '4:3',
        imageSize = '1K',
        useWebGrounding = false,
      } = req.body || {};

      if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
        res.status(400).json({
          error: 'Descreva a prancha iconográfica a criar ou a instrução de edição.',
        });
        return;
      }

      const safeAspect = ALLOWED_ASPECT_RATIOS.has(String(aspectRatio))
        ? String(aspectRatio)
        : '4:3';
      const safeSize = ALLOWED_IMAGE_SIZES.has(String(imageSize))
        ? (String(imageSize) as '1K' | '2K' | '4K')
        : '1K';

      const parts: Array<
        { text: string } | { inlineData: { data: string; mimeType: string } }
      > = [];

      if (typeof base64Image === 'string' && base64Image.trim().length > 0) {
        const { data, detectedMime } = stripDataUrlPrefix(base64Image);
        const resolvedMime =
          typeof mimeType === 'string' && mimeType.startsWith('image/')
            ? mimeType
            : detectedMime || 'image/png';
        parts.push({
          inlineData: {
            data,
            mimeType: resolvedMime,
          },
        });
      }

      parts.push({ text: prompt.trim().slice(0, 2000) });

      const ai = getGenAIClient();

      let lastErr: unknown;
      let response;
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          response = await ai.models.generateContent({
            model: 'gemini-nano-banana-2.1',
            contents: { parts },
            config: {
              imageConfig: {
                aspectRatio: safeAspect,
                imageSize: safeSize,
              },
              ...(useWebGrounding
                ? {
                    tools: [
                      {
                        googleSearch: {
                          searchTypes: {
                            webSearch: {},
                            imageSearch: {},
                          },
                        },
                      },
                    ],
                  }
                : {}),
            },
          });
          break;
        } catch (err: unknown) {
          lastErr = err;
          const status = (err as { status?: number })?.status;
          if (attempt < 2 && (status === 500 || status === 503)) {
            await new Promise((r) => setTimeout(r, 800));
            continue;
          }
          throw err;
        }
      }

      if (!response) {
        throw lastErr || new Error('Sem resposta do modelo de imagem.');
      }

      let imageUrl: string | null = null;
      let outputMimeType = 'image/png';
      const textNotes: string[] = [];

      for (const part of response.candidates?.[0]?.content?.parts ?? []) {
        if (part.inlineData?.data && !imageUrl) {
          outputMimeType = part.inlineData.mimeType || 'image/png';
          imageUrl = `data:${outputMimeType};base64,${part.inlineData.data}`;
        } else if (part.text) {
          textNotes.push(part.text);
        }
      }

      if (!imageUrl) {
        res.status(422).json({
          error:
            textNotes.join(' ').trim() ||
            'O modelo não retornou uma prancha visual para esta instrução. Ajuste a descrição e tente novamente.',
        });
        return;
      }

      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
      const sources: GroundingSource[] = [];
      const seen = new Set<string>();
      for (const chunk of groundingChunks) {
        const uri = chunk.web?.uri;
        if (uri && !seen.has(uri)) {
          seen.add(uri);
          sources.push({ uri, title: chunk.web?.title || uri });
        }
      }

      res.json({
        imageUrl,
        mimeType: outputMimeType,
        notes: textNotes.join('\n').trim(),
        aspectRatio: safeAspect,
        imageSize: safeSize,
        sources,
      });
    } catch (err: unknown) {
      console.error('Image atelier error:', err);
      const status = (err as { status?: number })?.status || 500;
      const rawMsg = err instanceof Error ? err.message : String(err);

      if (
        status === 403 ||
        status === 400 ||
        rawMsg.includes('API_KEY_INVALID') ||
        rawMsg.includes('PERMISSION_DENIED')
      ) {
        res.status(status).json({
          error:
            'Verifique a chave de API selecionada no painel Settings > Secrets para gerar ou editar pranchas em alta resolução.',
        });
        return;
      }

      if (status === 429 || rawMsg.includes('RESOURCE_EXHAUSTED')) {
        res.status(429).json({
          error:
            'Cota de geração de imagens atingida (429). Verifique ou atualize sua chave com faturamento ativo em Settings > Secrets.',
        });
        return;
      }

      res.status(status >= 400 && status < 600 ? status : 500).json({
        error: rawMsg || 'Falha ao processar a prancha iconográfica no servidor.',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.use((req, res, next) => {
      if (req.method !== 'GET' || req.path.startsWith('/api/')) {
        next();
        return;
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

void startServer();

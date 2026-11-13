import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

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

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

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

      if (status === 403 || status === 400 || rawMsg.includes('API_KEY_INVALID') || rawMsg.includes('PERMISSION_DENIED')) {
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

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

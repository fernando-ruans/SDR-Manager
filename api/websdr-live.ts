type VercelRequest = {
  method?: string;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  setHeader: (name: string, value: string) => void;
  json: (body: unknown) => void;
  send: (body: string) => void;
};

const ENDPOINT = 'http://websdr.ewi.utwente.nl/~~websdrlistk?v=1&fmt=2&chseq=0';

function extractJsonArray(raw: string): string {
  const jsonStart = raw.indexOf('[');

  if (jsonStart < 0) {
    throw new Error('Resposta do WebSDR sem payload JSON válido.');
  }

  return raw.slice(jsonStart);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method && req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const upstream = await fetch(ENDPOINT, {
      headers: {
        'user-agent': 'Mozilla/5.0',
      },
    });

    if (!upstream.ok) {
      res.status(upstream.status).json({
        error: `Falha ao consultar catálogo WebSDR (${upstream.status})`,
      });
      return;
    }

    const text = await upstream.text();
    const payload = extractJsonArray(text);

    res.setHeader('content-type', 'application/json; charset=utf-8');
    res.status(200).send(payload);
  } catch (error) {
    res.status(502).json({
      error: error instanceof Error ? error.message : 'Falha no proxy WebSDR',
    });
  }
}
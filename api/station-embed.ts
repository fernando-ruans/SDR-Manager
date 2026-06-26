type VercelRequest = {
  method?: string;
  query?: {
    station?: string | string[];
    path?: string | string[];
  };
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  setHeader: (name: string, value: string) => void;
  send: (body: string | Buffer) => void;
  json: (body: unknown) => void;
};

function queryValue(value: string | string[] | undefined): string | null {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? value[0] : value;
}

function buildTargetUrl(station: URL, pathValue: string | null): URL {
  if (!pathValue) {
    return station;
  }

  if (/^https?:\/\//i.test(pathValue)) {
    return new URL(pathValue);
  }

  return new URL(pathValue, station);
}

function rewriteHtml(html: string, station: URL, target: URL): string {
  const stationEncoded = encodeURIComponent(station.toString());
  const toProxy = (absoluteUrl: URL): string => {
    const path = `${absoluteUrl.pathname}${absoluteUrl.search}${absoluteUrl.hash}`;
    return `/api/station-embed?station=${stationEncoded}&path=${encodeURIComponent(path)}`;
  };

  const rewritten = html.replace(/\b(src|href|action)=(["'])([^"']+)\2/gi, (full, attr, quote, rawValue) => {
    if (
      rawValue.startsWith('#') ||
      rawValue.startsWith('data:') ||
      rawValue.startsWith('javascript:') ||
      rawValue.startsWith('mailto:')
    ) {
      return full;
    }

    let resolved: URL;

    try {
      resolved = new URL(rawValue, target);
    } catch {
      return full;
    }

    if (resolved.origin !== station.origin) {
      return full;
    }

    return `${attr}=${quote}${toProxy(resolved)}${quote}`;
  });

  const runtimePatch = `
<script>
(() => {
  const station = ${JSON.stringify(station.toString())};
  const stationOrigin = new URL(station).origin;
  const proxify = (input) => {
    try {
      const url = new URL(String(input), location.href);
      if (url.origin === location.origin) return String(input);
      if (url.origin !== stationOrigin) return String(input);
      const path = url.pathname + url.search + url.hash;
      return '/api/station-embed?station=' + encodeURIComponent(station) + '&path=' + encodeURIComponent(path);
    } catch {
      return String(input);
    }
  };

  const nativeFetch = window.fetch;
  if (nativeFetch) {
    window.fetch = (input, init) => {
      if (typeof input === 'string') return nativeFetch(proxify(input), init);
      if (input && typeof input.url === 'string') {
        return nativeFetch(new Request(proxify(input.url), input), init);
      }
      return nativeFetch(input, init);
    };
  }

  const xhrOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, ...rest) {
    return xhrOpen.call(this, method, proxify(url), ...rest);
  };
})();
</script>`;

  if (rewritten.includes('</head>')) {
    return rewritten.replace('</head>', `${runtimePatch}</head>`);
  }

  return `${runtimePatch}${rewritten}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method && req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const stationValue = queryValue(req.query?.station);

  if (!stationValue) {
    res.status(400).json({ error: 'Missing station parameter' });
    return;
  }

  let stationUrl: URL;

  try {
    stationUrl = new URL(stationValue);
  } catch {
    res.status(400).json({ error: 'Invalid station URL' });
    return;
  }

  const targetUrl = buildTargetUrl(stationUrl, queryValue(req.query?.path));

  if (targetUrl.origin !== stationUrl.origin) {
    res.status(400).json({ error: 'Cross-origin station path denied' });
    return;
  }

  try {
    const upstream = await fetch(targetUrl.toString(), {
      headers: {
        'user-agent': 'Mozilla/5.0',
      },
    });

    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
    res.setHeader('content-type', contentType);
    res.setHeader('cache-control', 'no-store');

    if (!upstream.ok) {
      res.status(upstream.status).send(`Upstream station request failed (${upstream.status})`);
      return;
    }

    if (contentType.includes('text/html')) {
      const html = await upstream.text();
      const body = rewriteHtml(html, stationUrl, targetUrl);
      res.status(200).send(body);
      return;
    }

    const buffer = Buffer.from(await upstream.arrayBuffer());
    res.status(200).send(buffer);
  } catch (error) {
    res.status(502).json({
      error: error instanceof Error ? error.message : 'Station proxy failure',
    });
  }
}
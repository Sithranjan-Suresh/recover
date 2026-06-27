function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function looksBlocked(text) {
  const lower = text.toLowerCase();
  const blockedSignals = ['sign in to linkedin', 'join now', 'authwall', 'join linkedin'];
  const hasSignal = blockedSignals.some((s) => lower.includes(s));
  return hasSignal || text.length < 200;
}

export async function POST(request) {
  const { url } = await request.json();

  if (!url || !/^https?:\/\/([a-z]+\.)?linkedin\.com\//i.test(url)) {
    return Response.json({ error: 'Invalid LinkedIn URL' }, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
        Accept: 'text/html',
      },
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return Response.json({ blocked: true, text: null });
    }

    const html = await response.text();
    const text = stripHtml(html).slice(0, 3000);

    if (looksBlocked(text)) {
      return Response.json({ blocked: true, text: null });
    }

    return Response.json({ blocked: false, text });
  } catch (err) {
    clearTimeout(timeout);
    return Response.json({ blocked: true, text: null, error: err.name === 'AbortError' ? 'timeout' : 'fetch_failed' });
  }
}

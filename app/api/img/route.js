// Image proxy so canvas never taints on cross-origin sources (Pexels, etc.).
// Same-origin fetch => canvas.convertToBlob works cleanly.

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 });
    // Basic allow-list — only http/https
    if (!/^https?:\/\//i.test(url)) return NextResponse.json({ error: 'Invalid url' }, { status: 400 });

    const upstream = await fetch(url, {
      headers: { 'User-Agent': 'KaapiDaBot/1.0 (+preview)' },
      cache: 'force-cache',
    });
    if (!upstream.ok) return NextResponse.json({ error: 'Upstream failed', status: upstream.status }, { status: 502 });
    const contentType = upstream.headers.get('content-type') || 'image/jpeg';
    const buf = await upstream.arrayBuffer();
    return new NextResponse(Buffer.from(buf), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    return NextResponse.json({ error: 'Proxy failed', message: err && err.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';

const AUTH_KEY = 'P8lN1gWIRAGJTdYFiPQB6A';
const BASE_URL = 'https://apihub.kma.go.kr/api/typ01/url/kma_sfctm3.php';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tm1 = searchParams.get('tm1');
  const tm2 = searchParams.get('tm2');
  const stn = searchParams.get('stn') || '108';

  if (!tm1 || !tm2) {
    return NextResponse.json({ error: 'Missing parameters tm1 or tm2' }, { status: 400 });
  }

  try {
    const url = `${BASE_URL}?tm1=${tm1}&tm2=${tm2}&stn=${stn}&help=0&authKey=${AUTH_KEY}`;
    const response = await fetch(url);
    const text = await response.text();

    return new NextResponse(text, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Failed to fetch from KMA' }, { status: 500 });
  }
}

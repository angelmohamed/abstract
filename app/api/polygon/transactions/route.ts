export const runtime = 'edge';

import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');
  if (!address) {
    return NextResponse.json({ error: 'Missing address parameter' }, { status: 400 });
  }
  try {
    const apiKey = process.env.POLYGONSCAN_API_KEY;
    if (!apiKey) {
      throw new Error('POLYGONSCAN_API_KEY not configured');
    }
    const apiUrl = `https://api.polygonscan.com/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

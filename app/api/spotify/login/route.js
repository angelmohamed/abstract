export const runtime = 'edge';

import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  const name = searchParams.get('name');

  if (!email || !name) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/register?status=error`);
  }

  const scopes = ['user-top-read'];
  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/api/spotify/callback`;

  const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${process.env.SPOTIFY_CLIENT_ID}&scope=${encodeURIComponent(
    scopes.join(' ')
  )}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(`${email},${name}`)}`;

  return NextResponse.redirect(authUrl);
}

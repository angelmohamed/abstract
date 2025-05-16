export const runtime = 'edge';

// app/api/spotify/callback/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  
  if (!code || !state) {
    console.error("Missing code or state.");
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/register?status=error`);
  }

  const [email, name] = state.split(',');

  if (!email || !name) {
    console.error("Missing email or name.");
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/register?status=error`);
  }

  try {
    // Fetch Spotify token
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL}/api/spotify/callback`,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error("Failed to fetch access token:", tokenData);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/register?status=error`);
    }

    // Fetch top artists from Spotify
    const userTopArtistsResponse = await fetch('https://api.spotify.com/v1/me/top/artists?limit=10', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const artistData = await userTopArtistsResponse.json();

    if (!userTopArtistsResponse.ok || !artistData.items) {
      console.error("Failed to fetch top artists:", artistData);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/register?status=error`);
    }

    // Insert all fields at once
    const { error: insertError } = await supabase
      .from('users')
      .insert([{
        name,
        email,
        spotify_id: artistData.items[0]?.id || null,
        top_artists: artistData.items.map((artist) => ({
          name: artist.name,
          id: artist.id,
          genres: artist.genres,
        })),
      }]);

    if (insertError) {
      console.error("Error inserting data in Supabase:", insertError);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/register?status=error`);
    }

    console.log("Successfully inserted user with Spotify data for email:", email);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/register/success`);
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/register?status=error`);
  }
}

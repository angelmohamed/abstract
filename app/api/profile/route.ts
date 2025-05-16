export const runtime = 'edge';

// app/api/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';

interface ProfileRequestBody {
  wallet: string;
  username?: string;
  name?: string;
  avatar_url?: string;
  bio?: string;
}

// 获取用户资料
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const wallet = searchParams.get('wallet');

  if (!wallet) {
    return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('wallet_address', wallet)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    // 如果用户不存在，返回空对象
    if (!data) {
      return NextResponse.json({});
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to get user profile:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// 创建或更新用户资料
export async function POST(request: NextRequest) {
  try {
    const body: ProfileRequestBody = await request.json();
    const { wallet, username, name, avatar_url, bio } = body;

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    // 检查用户名是否已存在（如果提供了用户名）
    if (username) {
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('wallet_address')
        .eq('username', username)
        .neq('wallet_address', wallet) // 排除当前用户
        .single();

      if (existingUser) {
        return NextResponse.json({ error: 'Username is already taken' }, { status: 400 });
      }
    }

    // 检查用户是否已存在
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('wallet_address')
      .eq('wallet_address', wallet)
      .single();

    let result;

    if (existingProfile) {
      // 更新现有用户
      result = await supabase
        .from('profiles')
        .update({
          username,
          name,
          avatar_url,
          bio,
          updated_at: new Date().toISOString()
        })
        .eq('wallet_address', wallet);
    } else {
      // 创建新用户
      result = await supabase
        .from('profiles')
        .insert([
          {
            wallet_address: wallet,
            username,
            name,
            avatar_url,
            bio,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);
    }

    if (result.error) {
      throw result.error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save user profile:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
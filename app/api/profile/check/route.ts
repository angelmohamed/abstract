export const runtime = 'edge';

// app/api/profile/check/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';

interface ProfileData {
  wallet_address: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
  is_new: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const wallet = searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet address is required' }, 
        { status: 400 }
      );
    }
    
    // 使用导入的 supabase 客户端
    const { data, error } = await supabase.rpc('check_and_create_profile', {
      wallet_address_param: wallet
    });

    if (error) {
      console.error('Error checking/creating profile:', error);
      return NextResponse.json(
        { error: error.message }, 
        { status: 500 }
      );
    }

    // 返回用户资料数据（包括 is_new 标志，指示是否是新创建的资料）
    return NextResponse.json(data[0] as ProfileData);
    
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
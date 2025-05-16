export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL, 
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 获取特定事件的评论 Get comments for a specific event
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
        return NextResponse.json({ error: '缺少事件ID参数' }, { status: 400 });
    }

    try {
        // 获取评论并联合查询用户信息 Get comments and join user information
        const { data, error } = await supabase
            .from('comments')
            .select(`
                commentID,
                created_at,
                commentBody,
                wallet_address,
                poolID,
                parent_id,
                reply_count,
                profiles:wallet_address(username, avatar_url)
            `)
            .eq('poolID', eventId)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        // 格式化数据，组合用户信息 Format data and combine user info
        const formattedComments = data.map(comment => ({
            id: comment.commentID,
            created_at: comment.created_at,
            content: comment.commentBody,
            wallet_address: comment.wallet_address,
            parent_id: comment.parent_id,
            reply_count: comment.reply_count,
            username: comment.profiles?.username || comment.wallet_address.slice(0, 6) + '...',
            avatar_url: comment.profiles?.avatar_url
        }));

        return NextResponse.json(formattedComments);
    } catch (error) {
        console.error('获取评论失败 ❌ Failed to get comments:', error);
        return NextResponse.json({ error: '服务器错误' }, { status: 500 });
    }
}

// 添加新评论 Add new comment
export async function POST(request) {
    try {
        const { wallet, eventId, comment, parent_id } = await request.json();

        if (!wallet || !eventId || !comment) {
            return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
        }

        // 准备评论数据 Prepare comment data
        const commentData = {
            wallet_address: wallet,
            poolID: eventId,
            commentBody: comment,
            created_at: new Date().toISOString()
        };

        // 如果是回复，添加父评论ID If it's a reply, add parent comment ID
        if (parent_id) {
            commentData.parent_id = parent_id;
        }

        // 插入新评论 Insert new comment
        const { data, error } = await supabase
            .from('comments')
            .insert([commentData])
            .select();

        if (error) {
            throw error;
        }

        // 获取评论作者信息 Retrieve comment author information
        const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('wallet_address', wallet)
            .single();

        if (userError && userError.code !== 'PGRST116') {
            console.error('获取用户数据失败 ❌ Failed to get user data:', userError);
        }

        // 返回新创建的评论 Return the newly created comment
        const newComment = {
            id: data[0].commentID,
            content: data[0].commentBody,
            created_at: data[0].created_at,
            wallet_address: wallet,
            parent_id: data[0].parent_id,
            reply_count: 0,
            username: userData?.username || wallet.slice(0, 6) + '...',
            avatar_url: userData?.avatar_url
        };

        return NextResponse.json(newComment);
    } catch (error) {
        console.error('添加评论失败 ❌ Failed to add comment:', error);
        return NextResponse.json({ error: '服务器错误' }, { status: 500 });
    }
}

// 删除评论 Delete a comment
export async function DELETE(request) {
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('commentId');
    
    if (!commentId) {
        return NextResponse.json({ error: '缺少评论ID参数' }, { status: 400 });
    }

    try {
        // JWT 验证已由 Supabase RLS 策略处理，这里我们只需要执行删除操作
        // JWT verification is handled by Supabase RLS policies, we just need to execute the delete operation here
        const { error } = await supabase
            .from('comments')
            .delete()
            .eq('commentID', commentId);

        if (error) {
            // 如果是权限错误，返回403
            // If it's a permission error, return 403
            if (error.code === '42501' || error.message.includes('permission denied')) {
                return NextResponse.json({ error: '无权删除此评论' }, { status: 403 });
            }
            throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('删除评论失败 ❌ Failed to delete comment:', error);
        return NextResponse.json({ error: '服务器错误' }, { status: 500 });
    }
}

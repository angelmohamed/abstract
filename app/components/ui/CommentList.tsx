import React, { memo, useEffect, useRef, useState, useCallback } from "react";
import { CommentListProps, CommentProps } from "@/types/comments";
import { Loader } from "lucide-react";
import { Comment, ReplyForm } from "./comment";

const CommentList: React.FC<CommentListProps> = (props) => {
    const { comments, isLoading, onReply, onDelete, replyingTo, eventId, onReplyAdded, currentUserWallet } = props;

    const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
    const [displayedComments, setDisplayedComments] = useState<CommentProps["comment"][]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [isFetching, setIsFetching] = useState(false);

    const COMMENTS_PER_PAGE = 10;

    const observer = useRef<IntersectionObserver | null>(null);
    const lastCommentRef = useCallback((node: HTMLDivElement | null) => {
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadMoreComments();
            }
        });

        if (node) observer.current.observe(node);
    }, [hasMore, displayedComments]);

    const toggleReplies = (commentId: string) => {
        setExpandedComments(prev => ({
            ...prev,
            [commentId]: !prev[commentId]
        }));
    };

    const loadMoreComments = () => {
        if (!comments || isFetching) return;
    
        setIsFetching(true);
    
        setTimeout(() => {
            const mainComments = comments.filter(comment => !comment?.parentId);
            const nextPage = currentPage + 1;
            const startIndex = currentPage * COMMENTS_PER_PAGE;
            const endIndex = startIndex + COMMENTS_PER_PAGE;
            const newComments = mainComments.slice(startIndex, endIndex);
    
            if (newComments.length > 0) {
                setDisplayedComments(prev => [...prev, ...newComments]);
                setCurrentPage(nextPage);
                setHasMore(endIndex < mainComments.length);
            } else {
                setHasMore(false);
            }
    
            setIsFetching(false);
        }, 1000);
    };

    useEffect(() => {
        if (comments && comments.length > 0) {
            const mainComments = comments.filter(comment => !comment?.parentId);
            const initialComments = mainComments.slice(0, COMMENTS_PER_PAGE);
            setDisplayedComments(initialComments);
            setHasMore(mainComments.length > COMMENTS_PER_PAGE);
            setCurrentPage(1);
        } else {
            setDisplayedComments([]);
            setHasMore(false);
        }
    }, [comments]);

    return (
        <div className="space-y-1 mb-4">
            {displayedComments.map((comment: any, index: number) => {
                const isLast = index === displayedComments.length - 1;

                return (
                    <div
                        key={comment._id}
                        ref={isLast ? lastCommentRef : null}
                    >
                        <Comment
                            comment={comment}
                            onReply={onReply}
                            onDelete={onDelete}
                            isReplyOpen={replyingTo === comment._id}
                            currentUserWallet={currentUserWallet}
                        />

                        {replyingTo === comment._id && (
                            <ReplyForm
                                parentId={comment._id}
                                eventId={eventId}
                                onReplyAdded={onReplyAdded}
                                onCancel={() => onReply("")}
                            />
                        )}

                        {/* Replies */}
                        {(() => {
                            const repliesForComment = comments?.filter(reply => reply?.parentId === comment._id) || [];
                            return repliesForComment.length > 0 && (
                                <>
                                    <button
                                        onClick={() => toggleReplies(comment._id)}
                                        className="text-xs text-gray-400 hover:text-white ml-10 mt-1 flex items-center"
                                    >
                                        {expandedComments[comment._id] ? 'Hide' : 'Show'} {repliesForComment.length} {repliesForComment.length === 1 ? 'reply' : 'replies'}
                                    </button>

                                    {expandedComments[comment._id] && (
                                        <div className="ml-10 border-l-2 border-gray-800 pl-4 mt-2">
                                            {repliesForComment.map((reply: any) => (
                                                <Comment
                                                    key={reply._id}
                                                    comment={reply}
                                                    onDelete={onDelete}
                                                    currentUserWallet={currentUserWallet}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                );
            })}
            {isFetching && (
                <div className="flex justify-center items-center py-4 text-gray-400">
                  <Loader className="w-26 h-26 animate-spin bg-blend-overlay" />
                  Loading more...
                </div>
            )}
        </div>
        
    );
};

export default memo(CommentList);

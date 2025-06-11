import React, { useState } from "react";
import { CommentListProps, CommentProps } from "@/types/comments";
import { Comment, ReplyForm } from "./comment";

const CommentList: React.FC<CommentListProps> = (props) => {
    const { comments, isLoading, onReply, onDelete, replyingTo, eventId, onReplyAdded, currentUserWallet } = props;
    const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

    if (isLoading) {
        return <div className="text-center py-4">Loading comments...</div>;
    }

    if (!comments || comments.length === 0) {
        return <div className="text-center py-4 text-gray-400">No comments yet</div>;
    }

    // Separate main comments and replies
    const mainComments = comments.filter(comment => !comment?.parent_id);
    const repliesByParentId = comments.reduce((acc, comment) => {
        if (comment?.parent_id) {
            if (!acc[comment.parent_id]) {
                acc[comment.parent_id] = [];
            }
            acc[comment.parent_id].push(comment);
        }
        return acc;
    }, {} as Record<string, CommentProps["comment"][]>);

    // Toggle replies visibility
    const toggleReplies = (commentId: string) => {
        setExpandedComments(prev => ({
            ...prev,
            [commentId]: !prev[commentId]
        }));
    };

    return (
        <div className="space-y-1">
            {mainComments.map((comment) => (
                <div key={comment?.id}>
                    {comment && (
                        <>
                            <Comment
                                comment={comment}
                                onReply={onReply}
                                onDelete={onDelete}
                                isReplyOpen={replyingTo === comment.id}
                                currentUserWallet={currentUserWallet}
                            />

                            {/* Reply form */}
                            {replyingTo === comment.id && (
                                <ReplyForm
                                    parentId={comment.id}
                                    eventId={eventId}
                                    onReplyAdded={onReplyAdded}
                                    onCancel={() => onReply("")}
                                />
                            )}

                            {/* Display replies to this comment */}
                            {repliesByParentId[comment.id] && repliesByParentId[comment.id].length > 0 && (
                                <>
                                    <button
                                        onClick={() => toggleReplies(comment.id)}
                                        className="text-xs text-gray-400 hover:text-white ml-10 mt-1 flex items-center"
                                    >
                                        {expandedComments[comment.id] ? 'Hide' : 'Show'} {repliesByParentId[comment.id].length} {repliesByParentId[comment.id].length === 1 ? 'reply' : 'replies'}
                                    </button>

                                    {expandedComments[comment.id] && (
                                        <div className="ml-10 border-l-2 border-gray-800 pl-4 mt-2">
                                            {repliesByParentId[comment.id].map(reply => (
                                                reply && (
                                                    <Comment
                                                        key={reply.id}
                                                        comment={reply}
                                                        onDelete={onDelete}
                                                        currentUserWallet={currentUserWallet}
                                                    />
                                                )
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>
            ))}
        </div>
    );
}

export default CommentList;
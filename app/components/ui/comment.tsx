"use client";
import React, { useState,useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/app/components/ui/avatar";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from 'date-fns';

import { Trash2, Reply } from "lucide-react";
import { useWallet } from "@/app/walletconnect/walletContext.js";

interface CommentProps extends React.HTMLAttributes<HTMLDivElement> {
  comment?: {
    id: string;
    content: string;
    created_at: string;
    username: string;
    avatar_url?: string;
    wallet_address?: string;
    parent_id?: string | null;
    reply_count?: number;
  };
  onReply?: (commentId: string) => void;
  onDelete?: (commentId: string) => void;
  isReplyOpen?: boolean;
  currentUserWallet?: string;
}

export function Comment({ 
  className, 
  comment, 
  onReply, 
  onDelete, 
  isReplyOpen, 
  currentUserWallet, 
  ...props 
}: CommentProps) {
  if (!comment) {
    return null;
  }

  // Format time, e.g. "3 hours ago"
  const timeAgo = comment.created_at 
    ? formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })
    : "";
    
  // Check if the current user is the author of this comment
  const isAuthor = currentUserWallet && comment.wallet_address === currentUserWallet;

  return (
    <div className={cn("w-full pt-4 pb-4 flex items-start space-x-3", className)} {...props}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        <Avatar>
          {comment.avatar_url ? (
            <AvatarImage src={comment.avatar_url} alt={comment.username} />
          ) : (
            <AvatarFallback className="bg-blue-500">
              {comment.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>
      </div>

      <div className="flex-1 min-w-0">
        {/* Username and time */}
        <div className="flex items-center mb-1 flex-wrap gap-2">
          <span className="font-medium text-white truncate">{comment.username}</span>
          <span className="text-xs text-gray-400">{timeAgo}</span>
        </div>

        {/* Comment content */}
        <p className="text-sm text-white whitespace-pre-wrap break-words">{comment.content}</p>
        
        {/* Comment actions */}
        <div className="flex mt-2 space-x-4">
          {onReply && !comment.parent_id && (
            <button 
              onClick={() => onReply(comment.id)} 
              className="flex items-center text-xs text-gray-400 hover:text-white"
            >
              <Reply size={14} className="mr-1" />
              {comment.reply_count ? `Reply (${comment.reply_count})` : "Reply"}
            </button>
          )}
          
          {isAuthor && onDelete && (
            <button 
              onClick={() => onDelete(comment.id)} 
              className="flex items-center text-xs text-gray-400 hover:text-red-500"
            >
              <Trash2 size={14} className="mr-1" />
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface ReplyFormProps {
  parentId: string;
  eventId: string;
  onReplyAdded: (newReply: CommentProps["comment"]) => void;
  onCancel: () => void;
}

export function ReplyForm({ parentId, eventId, onReplyAdded, onCancel }: ReplyFormProps) {
 
  const {address} = useWallet();
  const [reply, setReply] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [account, setaccount] = useState("");


  useEffect(() => {
    try {
      setaccount(address?address:"")
    } catch (err) { }
  }, [address]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!account || !reply.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wallet: account,
          eventId,
          comment: reply.trim(),
          parent_id: parentId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit reply");
      }

      const newReply = await response.json();
      
      // Add new reply and update UI
      onReplyAdded(newReply);
      
      // Clear reply box
      setReply("");
      onCancel();
    } catch (error) {
      console.error("Reply submission error:", error);
      alert("Failed to post reply. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-2 mb-3 ml-10">
      <textarea
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        placeholder="Write your reply..."
        className="w-full px-3 py-2 bg-black border border-gray-700 rounded-lg text-white mb-2 min-h-[80px] focus:border-blue-500 focus:outline-none"
        disabled={isSubmitting}
      />
      <div className="flex justify-end space-x-2">
        <Button 
          type="button" 
          onClick={onCancel}
          className="w-auto border border-gray-700 bg-transparent text-gray-400 hover:bg-gray-800 hover:text-white transition-colors duration-300"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting || !reply.trim()}
          className="w-auto border border-white bg-transparent text-white hover:bg-white hover:text-black transition-colors duration-300"
        >
          {isSubmitting ? "Posting..." : "Post Reply"}
        </Button>
      </div>
    </form>
  );
}

interface CommentListProps {
  comments: CommentProps["comment"][];
  isLoading?: boolean;
  onReply: (commentId: string) => void;
  onDelete: (commentId: string) => void;
  replyingTo: string | null;
  eventId: string;
  onReplyAdded: (newReply: CommentProps["comment"]) => void;
  currentUserWallet?: string;
}

export function CommentList({ 
  comments, 
  isLoading, 
  onReply, 
  onDelete, 
  replyingTo, 
  eventId, 
  onReplyAdded,
  currentUserWallet
}: CommentListProps) {
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

interface CommentFormProps {
  eventId: string;
  onCommentAdded: (newComment: CommentProps["comment"]) => void;
}

export function CommentForm({ eventId, onCommentAdded }: CommentFormProps) {
  
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {address} = useWallet();
  const [account, setaccount] = useState(address);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!account || !comment.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wallet: account,
          eventId,
          comment: comment.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit comment");
      }

      const newComment = await response.json();
      
      // Add new comment to the list
      onCommentAdded(newComment);
      
      // Clear comment box
      setComment("");
    } catch (error) {
      console.error("Comment submission error:", error);
      alert("Failed to post comment. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!account) {
    return (
      <div className="text-center my-4">
        <p className="text-sm text-gray-300 mb-2">Please connect your wallet to comment</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 mb-6">
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write your comment..."
        className="w-full px-3 py-2 bg-black border border-gray-700 rounded-lg text-white mb-2 min-h-[100px] focus:border-blue-500 focus:outline-none"
        disabled={isSubmitting}
      />
      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={isSubmitting || !comment.trim()}
          className="w-auto border border-white bg-transparent text-white hover:bg-white hover:text-black transition-colors duration-300"
        >
          {isSubmitting ? "Posting..." : "Post Comment"}
        </Button>
      </div>
    </form>
  );
}

interface CommentSectionProps {
  eventId: string;
}

export function CommentSection({ eventId }: CommentSectionProps) {
  const {address} = useWallet();
  const [account, setaccount] = useState(address);
  const [comments, setComments] = useState<CommentProps["comment"][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  React.useEffect(() => {
    const fetchComments = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/comments?eventId=${eventId}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch comments");
        }
        
        const data = await response.json();
        setComments(data);
      } catch (error) {
        console.error("Error loading comments:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId) {
      fetchComments();
    }
  }, [eventId]);

  const handleCommentAdded = (newComment: CommentProps["comment"]) => {
    if (newComment) {
      // If it's a reply, we need to update the parent's reply count
      if (!newComment.parent_id) {
        // It's a top-level comment
        setComments(prev => [newComment, ...prev]);
      } else {
        // It's a reply, add to the list and update parent
        setComments(prev => {
          const updated = [...prev];
          const parentIndex = updated.findIndex(c => c?.id === newComment.parent_id);
          
          if (parentIndex !== -1 && updated[parentIndex]) {
            // Update parent's reply count
            updated[parentIndex] = {
              ...updated[parentIndex]!,
              reply_count: (updated[parentIndex]!.reply_count || 0) + 1
            };
          }
          
          // Add the reply to the list
          return [newComment, ...updated];
        });
      }
    }
  };

  const handleReply = (commentId: string) => {
    setReplyingTo(prevState => prevState === commentId ? null : commentId);
  };

  const handleDelete = async (commentId: string) => {
    if (!account || !commentId) return;

    if (!confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      const response = await fetch(`/api/comments?commentId=${commentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete comment");
      }

      // Remove the comment from the UI
      setComments(prev => {
        const deletedComment = prev.find(c => c?.id === commentId);
        const newComments = prev.filter(c => c?.id !== commentId);
        
        // If it's a reply, update the reply count of the parent comment
        if (deletedComment?.parent_id) {
          const parentIndex = newComments.findIndex(c => c?.id === deletedComment.parent_id);
          if (parentIndex !== -1 && newComments[parentIndex]?.reply_count) {
            newComments[parentIndex] = {
              ...newComments[parentIndex]!,
              reply_count: Math.max(0, (newComments[parentIndex]!.reply_count || 1) - 1)
            };
          }
        }
        
        // If it's a main comment, also delete all its replies
        return newComments.filter(c => c?.parent_id !== commentId);
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment. Please try again later.");
    }
  };

  // Calculate total comments count (main comments + replies)
  const totalCommentsCount = comments.length;

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-4">Comments ({totalCommentsCount})</h2>
      <CommentForm eventId={eventId} onCommentAdded={handleCommentAdded} />
      <CommentList 
        comments={comments} 
        isLoading={isLoading} 
        onReply={handleReply}
        onDelete={handleDelete}
        replyingTo={replyingTo}
        eventId={eventId}
        onReplyAdded={handleCommentAdded}
        currentUserWallet={account?account:""}
      />
    </div>
  );
}

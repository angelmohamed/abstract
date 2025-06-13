"use client";
import React, { useState,useEffect, useContext } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/app/components/ui/avatar";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from 'date-fns';

import { Trash2, Reply } from "lucide-react";
import { useWallet } from "@/app/walletconnect/walletContext.js";
import CommentForm from "./CommentForm";
import { CommentProps,PostCommentRequestData } from "@/types/comments";
import CommentList from "./CommentList";
import { getComments, postComment } from "@/services/market";
import { toastAlert } from "@/lib/toast";
import { useSelector } from "react-redux";
import { SocketContext } from "@/config/socketConnectivity";
import { deleteComment } from "@/services/user";

const avatarColors = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-red-500',
  'bg-yellow-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-teal-500',
  'bg-orange-500',
  'bg-cyan-500'
];

export function Comment({ 
  className, 
  comment, 
  onReply, 
  onDelete, 
  isReplyOpen, 
  currentUserWallet, 
  ...props 
}: CommentProps) {
  const user = useSelector((state: any) => state?.auth?.user || {});

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
          {comment?.userId?.profileImg ? (
            <AvatarImage src={comment?.userId?.profileImg} alt={comment?.userId?.userName} />
          ) : (
            <AvatarFallback className={avatarColors[Math.floor(Math.random() * avatarColors.length)]}>
              {comment?.userId?.userName?comment?.userId?.userName.charAt(0).toUpperCase():"unknown".charAt(0).toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>
      </div>

      <div className="flex-1 min-w-0">
        {/* Username and time */}
        <div className="flex items-center mb-1 flex-wrap gap-2">
          <span className="font-medium text-white truncate">{comment?.userId?.userName||"Unknown user"}</span>
          <span className="text-xs text-gray-400">{timeAgo}</span>
        </div>

        {/* Comment content */}
        <p className="text-sm text-white whitespace-pre-wrap break-words">{comment.content}</p>
        
        {/* Comment actions */}
        <div className="flex mt-2 space-x-4">
          {onReply && !comment.parentId && (
            <button 
              onClick={() => onReply(comment._id)} 
              className="flex items-center text-xs text-gray-400 hover:text-white"
            >
              <Reply size={14} className="mr-1" />
              {comment.reply_count ? `Reply (${comment.reply_count})` : "Reply"}
            </button>
          )}
          
          {user._id && onDelete && user._id===comment?.userId?._id && (
            <button 
              onClick={() => onDelete(comment._id)} 
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
  const user = useSelector((state: any) => state?.auth?.user || {});


  useEffect(() => {
    try {
      setaccount(address?address:"")
    } catch (err) { }
  }, [address]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // if (!account || !reply.trim()) {
    //   return;
    // }

    try {
      setIsSubmitting(true);
      const reqData = {
        userId: user._id,
        eventId: eventId,
        content: reply,
        parentId:parentId,
      }
      const {success, comment} = await postComment(reqData);
      if (!success) {
        toastAlert("error", "Failed to post comment. Please try again later.");
        return
      }
      // toastAlert("success", "Comment posted successfully!");      
      // onReplyAdded(comment);

      setReply("");
      onCancel();
    } catch (error) {
      console.error("Reply submission error:", error);
      // alert("Failed to post reply. Please try again later.");
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
          onClick={handleSubmit}
          className="w-auto border border-white bg-transparent text-white hover:bg-white hover:text-black transition-colors duration-300"
        >
          {isSubmitting ? "Posting..." : "Post Reply"}
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

  const socketContext = useContext(SocketContext);

  React.useEffect(() => {
    const fetchComments = async () => {
      try {
        setIsLoading(true);
        const response = await getComments(eventId)
        if (!response.success) {
          return
        } 
        setComments(response.comments || []);
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
      if (!newComment.parentId) {
        // It's a top-level comment
        setComments(prev => [newComment, ...prev]);
      } else {
        // It's a reply, add to the list and update parent
        setComments(prev => {
          const updated = [...prev];
          const parentIndex = updated.findIndex(c => c?._id === newComment.parentId);
          
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

    // if (!confirm("Are you sure you want to delete this comment?")) {
    //   return;
    // }

    try {
      const {success,message} = await deleteComment({id:commentId});
      if (!success) {
        toastAlert("error", message || "Failed to delete comment. Please try again later.");
        return;
      }
      // toastAlert("success", "Comment deleted successfully!");
      
      setComments(prev => {
        const deletedComment = prev.find(c => c?._id === commentId);  
        const newComments = prev.filter(c => c?._id !== commentId);
        
        // // If it's a reply, update the reply count of the parent comment
        if (deletedComment?.parentId) {
          const parentIndex = newComments.findIndex(c => c?._id === deletedComment.parentId);
          if (parentIndex !== -1 && newComments[parentIndex]?.reply_count) {
            newComments[parentIndex] = {
              ...newComments[parentIndex]!,
              reply_count: Math.max(0, (newComments[parentIndex]!.reply_count || 1) - 1)
            };
          }
        }
        
        // If it's a main comment, also delete all its replies
        return newComments.filter(c => c?.parentId !== commentId);
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      // alert("Failed to delete comment. Please try again later.");
    }
  };

  // Calculate total comments count (main comments + replies)
  const totalCommentsCount = comments.length;

  useEffect(() => {
    const socket = socketContext?.socket;
    if (!socket){
      return;
    }

    const handleCommentAdded = (result: any) => {
    const parsedData = JSON.parse(result);
    console.log('cmt socket Data: ', parsedData);
    const { type, data } = parsedData;
      if (type === "add" && data?.eventId === eventId) {
        setComments(prev => [data, ...prev]);
        }else if(type==="delete" && data?.eventId === eventId) {
        setComments(prev => prev.filter(comment => comment?._id !== data.id));
        }
      }
    
    socket.on("comment", handleCommentAdded);

    return () => {
      socket.off("comment", handleCommentAdded)
    };
  
  }, [socketContext?.socket]);

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

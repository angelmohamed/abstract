"use client";
import React, { useState, useEffect, useContext, useRef } from "react";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/app/components/ui/avatar";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { setUser } from "@/store/slices/auth/userSlice";

import { Trash2, Reply } from "lucide-react";
import CommentForm from "./CommentForm";
import { CommentProps, PostCommentRequestData } from "@/types/comments";
import CommentList from "./CommentList";
import { getComments, postComment } from "@/services/market";
import { toastAlert } from "@/lib/toast";
import { useSelector, useDispatch } from "react-redux";
import { SocketContext } from "@/config/socketConnectivity";
import { deleteComment } from "@/services/user";
import PopupModal from "./usernameModal";
import { isEmpty } from "@/lib/isEmpty";
import { addUserName } from "@/services/user";
import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDownIcon } from "@radix-ui/react-icons";

const avatarColors = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-red-500",
  "bg-yellow-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-teal-500",
  "bg-orange-500",
  "bg-cyan-500",
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
  const { signedIn } = useSelector((state: any) => state?.auth?.session);

  if (!comment) {
    return null;
  }

  // Format time, e.g. "3 hours ago"
  let timeAgo = comment.createdAt
    ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })
    : "";
  timeAgo = timeAgo.replace(/hours?/g, "hr").replace(/minutes?/g, "min");

  // Check if the current user is the author of this comment
  const isAuthor =
    currentUserWallet && comment.wallet_address === currentUserWallet;

  const getColorFromUsername = (username: string | undefined) => {
    try {
      if (!username || typeof username !== "string" || username.trim() === "") {
        return avatarColors[0];
      }

      let hash = 0;
      for (let i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + ((hash << 5) - hash);
      }
      const index = Math.abs(hash) % avatarColors.length;
      return avatarColors[index];
    } catch {
      return avatarColors[0];
    }
  };

  return (
    <div
      className={cn("w-full pt-4 pb-4 flex items-start space-x-3", className)}
      {...props}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <Link href={`/profile/${comment?.userId?.userName}`}>
          <Avatar>
            {comment?.userId?.profileImg ? (
              <AvatarImage
                src={comment?.userId?.profileImg}
                alt={comment?.userId?.userName}
              />
            ) : (
              <AvatarFallback
                className={getColorFromUsername(comment?.userId?.userName)}
              >
                {comment?.userId?.userName
                  ? comment?.userId?.userName.charAt(0).toUpperCase()
                  : "unknown".charAt(0).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
        </Link>
      </div>

      <div className="flex-1 min-w-0">
        {/* Username and time */}
        <div className="flex items-center mb-1 flex-wrap gap-2">
          <span className="font-medium text-white truncate">
            <Link href={`/profile/${comment?.userId?.userName}`}>
              {comment?.userId?.userName || "Unknown user"}
            </Link>
          </span>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                className="flex items-center gap-1 px-2 py-0.5 text-[12px] font-normal rounded"
                aria-label="Customise options"
                style={{ background: "#152632", color: "#7DFDFE" }}
              >
                <span>125 Yes | More than 10 Million</span>
                <ChevronDownIcon className="w-4 h-4" />
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="comment-dropdown-content"
                sideOffset={5}
              >
                <DropdownMenu.Item className="px-2 py-0.5 cursor-pointer hover:bg-[#100f0f] text-[12px] font-normal flex gap-2 items-center justify-between">
                  <span style={{ background: "#152632", color: "#7DFDFE" }} >15.9K Yes</span>                  
                  <span>More than 10 Million</span>
                </DropdownMenu.Item>
                <DropdownMenu.Item className="px-2 py-0.5 cursor-pointer hover:bg-[#100f0f] text-[12px] font-normal flex gap-2 items-center justify-between">
                  <span style={{ background: "#152632", color: "#7DFDFE" }} >10.2K Yes</span>                  
                  <span>More than 8 Million</span>
                </DropdownMenu.Item>
                <DropdownMenu.Item className="px-2 py-0.5 cursor-pointer hover:bg-[#100f0f] text-[12px] font-normal flex gap-2 items-center justify-between">
                  <span style={{ background: "#210d1a", color: "#ec4899" }} >2.2K No</span>                  
                  <span>More than 8 Million</span>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
          <span className="text-xs text-gray-400">{timeAgo}</span>
        </div>

        {/* Comment content */}
        <p className="text-sm text-white whitespace-pre-wrap break-words">
          {comment.content}
        </p>

        {/* Comment actions */}
        <div className="flex mt-2 space-x-4">
          {onReply && signedIn && !comment.parentId && (
            <button
              onClick={() => onReply(comment._id)}
              className="flex items-center text-xs text-gray-400 hover:text-white"
            >
              <Reply size={14} className="mr-1" />
              {comment.reply_count ? `Reply (${comment.reply_count})` : "Reply"}
            </button>
          )}

          {user._id && onDelete && user._id === comment?.userId?._id && (
            <button
              onClick={() => onDelete(comment._id)}
              className="flex items-center text-xs text-gray-400 hover:text-red-500"
            >
              <Trash2 size={14} className="mr-1" />
              Delete
            </button>
          )}
          {/* {getTimeAgo(comment.createdAt)} */}
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
  comments: CommentProps["comment"][];
}

export function ReplyForm({
  parentId,
  eventId,
  onReplyAdded,
  onCancel,
  comments,
}: ReplyFormProps) {
  const { address } = useSelector(
    (state: any) => state?.walletconnect?.walletconnect
  );
  const [reply, setReply] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modelError, setModelError] = useState("");
  const [account, setaccount] = useState("");
  const user = useSelector((state: any) => state?.auth?.user || {});
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const dispatch = useDispatch();

  useEffect(() => {
    try {
      setaccount(address ? address : "");
    } catch (err) {}
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
        parentId: parentId,
      };
      const { success, comment } = await postComment(reqData);
      if (!success) {
        toastAlert("error", "Failed to post comment. Please try again later.");
        return;
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

  const onchangeReply = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!user || isEmpty(user?.userName)) {
      setIsModalOpen(true);
      return;
    }
    setReply(e.target.value);
  };

  const handleSaveUsername = async (username: string): Promise<boolean> => {
    try {
      if (!username.trim()) {
        setModelError("Username cannot be empty.");
        return false;
      }
      if (username.length < 6) {
        setModelError("Username must be at least 6 characters long.");
        return false;
      }
      if (username.length > 20) {
        setModelError("Username must be at most 20 characters long.");
        return false;
      }
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        setModelError(
          "Username can only contain letters, numbers, and underscores."
        );
        return false;
      }

      const reqData = {
        userName: username,
      };
      const { status, message, result } = await addUserName(reqData);

      if (!status) {
        if (message) {
          toastAlert("error", message);
        }
        return false;
      }
      console.log("result: ", result);

      setModelError("");
      dispatch(setUser(result));

      toastAlert("success", "Username saved successfully!");
      return true;
    } catch (error) {
      console.error("Error saving username:", error);
      toastAlert("error", "An unexpected error occurred. Please try again.");
      return false;
    }
  };

  // Set initial reply text with username mention
  useEffect(() => {
    // Find the parent comment to get the username
    const parentComment: any = comments?.find((c: any) => c?._id === parentId);
    console.log(
      parentComment,
      "parentComment",
      parentId,
      "parentId",
      comments,
      "comments"
    );
    if (parentComment?.userId?.userName) {
      setReply(`@${parentComment?.userId?.userName} `);
    }
  }, [parentId, comments]);

  // Auto-focus the input when the form is rendered
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <>
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="mt-2 mb-3 ml-10 transition-all duration-300 ease-in-out transform origin-top"
      >
        <div className="relative w-full flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Add comment..."
            className="flex-1 px-4 py-3 bg-[#0f0f0f] border border-input rounded-xl text-white focus:border-input focus:outline-none text-base min-w-0 pr-32 transition-all duration-200"
            disabled={isSubmitting}
            maxLength={300}
          />
          <Button
            type="submit"
            disabled={isSubmitting || !reply.trim()}
            className="absolute right-2 top-2 bottom-2 h-auto px-4 bg-transparent border-none text-white hover:bg-[#232326] hover:text-white transition-colors duration-300 rounded-md"
          >
            {isSubmitting ? "Posting..." : "Reply"}
          </Button>
        </div>
      </form>
      <PopupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUsername}
        error={modelError}
        setError={setModelError}
      />
    </>
  );
}

interface CommentSectionProps {
  eventId: string;
}

export function CommentSection({ eventId }: CommentSectionProps) {
  const { address } = useSelector(
    (state: any) => state?.walletconnect?.walletconnect
  );
  const [account, setaccount] = useState(address);
  const [comments, setComments] = useState<CommentProps["comment"][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const socketContext = useContext(SocketContext);

  React.useEffect(() => {
    const fetchComments = async () => {
      try {
        setIsLoading(true);
        const response = await getComments(eventId);
        if (!response.success) {
          return;
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
        setComments((prev) => [newComment, ...prev]);
      } else {
        // It's a reply, add to the list and update parent
        setComments((prev) => {
          const updated = [...prev];
          const parentIndex = updated.findIndex(
            (c) => c?._id === newComment.parentId
          );

          if (parentIndex !== -1 && updated[parentIndex]) {
            // Update parent's reply count
            updated[parentIndex] = {
              ...updated[parentIndex]!,
              reply_count: (updated[parentIndex]!.reply_count || 0) + 1,
            };
          }

          // Add the reply to the list
          return [newComment, ...updated];
        });
      }
    }
  };

  const handleReply = (commentId: string) => {
    setReplyingTo((prevState) => (prevState === commentId ? null : commentId));
  };

  const handleDelete = async (commentId: string) => {
    // if (!confirm("Are you sure you want to delete this comment?")) {
    //   return;
    // }

    try {
      const { success, message } = await deleteComment({ id: commentId });
      if (!success) {
        toastAlert(
          "error",
          message || "Failed to delete comment. Please try again later."
        );
        return;
      }
      // toastAlert("success", "Comment deleted successfully!");

      setComments((prev) => {
        const deletedComment = prev.find((c) => c?._id === commentId);
        const newComments = prev.filter((c) => c?._id !== commentId);

        // // If it's a reply, update the reply count of the parent comment
        if (deletedComment?.parentId) {
          const parentIndex = newComments.findIndex(
            (c) => c?._id === deletedComment.parentId
          );
          if (parentIndex !== -1 && newComments[parentIndex]?.reply_count) {
            newComments[parentIndex] = {
              ...newComments[parentIndex]!,
              reply_count: Math.max(
                0,
                (newComments[parentIndex]!.reply_count || 1) - 1
              ),
            };
          }
        }

        // If it's a main comment, also delete all its replies
        return newComments.filter((c) => c?.parentId !== commentId);
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
    if (!socket) {
      return;
    }

    const handleCommentAdded = (result: any) => {
      const parsedData = JSON.parse(result);
      // console.log('cmt socket Data: ', parsedData);
      const { type, data } = parsedData;
      if (type === "add" && data?.eventId === eventId) {
        setComments((prev) => [data, ...prev]);
      } else if (type === "delete" && data?.eventId === eventId) {
        setComments((prev) =>
          prev.filter((comment) => comment?._id !== data.id)
        );
      }
    };

    socket.on("comment", handleCommentAdded);

    return () => {
      socket.off("comment", handleCommentAdded);
    };
  }, [socketContext?.socket]);

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-4">
        Comments ({totalCommentsCount})
      </h2>
      <CommentForm eventId={eventId} onCommentAdded={handleCommentAdded} />
      <CommentList
        comments={comments}
        isLoading={isLoading}
        onReply={handleReply}
        onDelete={handleDelete}
        replyingTo={replyingTo}
        eventId={eventId}
        onReplyAdded={handleCommentAdded}
        currentUserWallet={account ? account : ""}
      />
    </div>
  );
}

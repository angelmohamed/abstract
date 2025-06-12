import React, { useSelector } from "@/store";
import { useState } from "react";
import { Button } from "./button";
import { CommentProps } from "@/types/comments";
import { postComment } from "@/services/market";
import { toastAlert } from "@/lib/toast";

interface CommentFormProps {
  eventId: string;
  onCommentAdded: (newComment: CommentProps["comment"]) => void;
}

const CommentForm = ({ eventId, onCommentAdded }: CommentFormProps) => {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signedIn } = useSelector((state) => state?.auth?.session);
  const {_id} = useSelector((state) => state?.auth?.user || {});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!signedIn) {
      return;
    }

    try {
      if(!_id) {
        toastAlert("error", "Failed to post comment. Please try again later.");
        return;
      }
      setIsSubmitting(true);
      const reqData = {
        userId: _id,
        eventId: eventId,
        content: newComment,
        parentId:null,
      }
      console.log('reqData: ', reqData);

      const {success, comment} = await postComment(reqData);
      if (!success) {
        toastAlert("error", "Failed to post comment. Please try again later.");
        return
      }
      toastAlert("success", "Comment posted successfully!");
      onCommentAdded(comment);
      setNewComment("");
    } catch (error) {
      console.error("Comment submission error:", error);
      toastAlert("error", "Failed to post comment. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!signedIn) {
    return (
      <div className="text-center my-4">
        <p className="text-sm text-gray-300 mb-2">
            You need to be logged in to comment.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 mb-6">
      <textarea
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="Write your comment..."
        className="w-full px-3 py-2 bg-black border border-gray-700 rounded-lg text-white mb-2 min-h-[100px] focus:border-blue-500 focus:outline-none"
        disabled={isSubmitting}
      />
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting || !newComment.trim()}
          onClick={handleSubmit}
          className="w-auto border border-white bg-transparent text-white hover:bg-white hover:text-black transition-colors duration-300"
        >
          {isSubmitting ? "Posting..." : "Post Comment"}
        </Button>
      </div>
    </form>
  );
};

export default CommentForm;

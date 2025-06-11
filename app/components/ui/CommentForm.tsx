import React, { useSelector } from "@/store";
import { useState } from "react";
import { Button } from "./button";
import { CommentProps } from "@/types/comments";

interface CommentFormProps {
  eventId: string;
  onCommentAdded: (newComment: CommentProps["comment"]) => void;
}

const CommentForm = ({ eventId, onCommentAdded }: CommentFormProps) => {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signedIn } = useSelector((state) => state?.auth?.session);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!signedIn) {
      return;
    }

    try {
      setIsSubmitting(true);

      // const response = await fetch("/api/comments", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     wallet: account,
      //     eventId,
      //     comment: comment.trim(),
      //   }),
      // });

      // if (!response.ok) {
      //   throw new Error("Failed to submit comment");
      // }

      // const newComment = await response.json();

      // Add new comment to the list
      // onCommentAdded(newComment);

      // Clear comment box
      setComment("");
    } catch (error) {
      console.error("Comment submission error:", error);
      alert("Failed to post comment. Please try again later.");
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
};

export default CommentForm;

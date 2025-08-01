import React, { useSelector, useDispatch } from "@/store";
import { useState } from "react";
import { Button } from "./button";
import { CommentProps } from "@/types/comments";
import { postComment } from "@/services/market";
import { toastAlert } from "@/lib/toast";
import { isEmpty } from "@/lib/isEmpty";
import { addUserName } from "@/services/user";
import { setUser } from "@/store/slices/auth/userSlice";
import PopupModal from "./usernameModal";

interface CommentFormProps {
  eventId: string;
  onCommentAdded: (newComment: CommentProps["comment"]) => void;
}

const CommentForm = ({ eventId, onCommentAdded }: CommentFormProps) => {
  const dispatch = useDispatch();
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modelError, setModelError] = useState("");

  const { signedIn } = useSelector((state) => state?.auth?.session);
  const { _id, userName } = useSelector((state) => state?.auth?.user || {});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!signedIn) {
      return;
    }

    try {
      if (!_id) {
        toastAlert("error", "Failed to post comment. Please try again later.");
        return;
      }
      setIsSubmitting(true);
      const reqData = {
        userId: _id,
        eventId: eventId,
        content: newComment,
        parentId: null,
      };
      console.log("reqData: ", reqData);

      const { success, comment } = await postComment(reqData);
      if (!success) {
        toastAlert("error", "Failed to post comment. Please try again later.");
        return;
      }
      toastAlert("success", "Comment posted successfully!");
      // onCommentAdded(comment);
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
      <div className="text-center my-4 min-h-12">
        <p className="text-sm text-gray-300 mb-2">
          You need to be logged in to comment.
        </p>
      </div>
    );
  }

  const onchangeComment = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isEmpty(userName)) {
      setIsModalOpen(true);
      return;
    }
    setNewComment(e.target.value);
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

  return (
    <>
      <form onSubmit={handleSubmit} className="mt-4 mb-6 w-full">
        <div className="relative w-full flex items-center">
          <input
            type="text"
            value={newComment}
            onChange={onchangeComment}
            placeholder="Add comment..."
            className="flex-1 px-4 py-3 bg-[#0f0f0f] border border-input rounded-xl text-white focus:border-input focus:outline-none text-base min-w-0 pr-32"
            disabled={isSubmitting}
            maxLength={300}
          />
          <Button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="absolute right-2 top-2 bottom-2 h-auto px-4 bg-transparent border-none text-white hover:bg-[#232326] hover:text-white transition-colors duration-300 rounded-md"
          >
            {isSubmitting ? "Posting..." : "Post"}
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
};

export default CommentForm;

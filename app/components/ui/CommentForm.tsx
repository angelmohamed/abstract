import React, { useSelector, useDispatch } from "@/store";
import { useState } from "react";
import { Button } from "./button";
import { CommentProps } from "@/types/comments";
import { postComment } from "@/services/market";
import { toastAlert } from "@/lib/toast";
import { isEmpty } from "@/lib/isEmpty";
import { addUserName } from "@/services/user";
import { setUser } from "@/store/slices/auth/userSlice";
import { Dialog } from "radix-ui";
import { Cross2Icon } from "@radix-ui/react-icons";

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
  const {_id,userName} = useSelector((state) => state?.auth?.user || {});

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

  const PopupModal = ({
    isOpen,
    onClose,
    onSave,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onSave: (username: string) => Promise<boolean>;
  }) => {
    const [username, setUsername] = useState("");
  
    if (!isOpen) return null;

    const handleSave = async (e) => {
      e.preventDefault();
      const success = await onSave(username);
      if (success) {
        onClose();
      }
    };
  
    return (
      <Dialog.Root open={isOpen} onOpenChange={onClose}>
        <Dialog.Portal>
          <Dialog.Overlay className="DialogOverlay" />
          <Dialog.Content className="DialogContent">
            <Dialog.Title className="DialogTitle text-lg font-bold mb-4 text-white">
              Update Username
            </Dialog.Title>
              {/* <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"> */}
              {/* <div className="rounded-lg p-6 w-96 shadow-lg"> */}
              {/* <h2 className="text-lg font-bold mb-4 text-white">Update Username</h2> */}
              <p className="text-sm text-gray-400 mb-4">
                Please enter your username to comment.
              </p>
              <input
                type="text"
                value={username}
                onChange={(e) => {setUsername(e.target.value), setModelError("")}}
                placeholder="Enter your username"
                className="w-full px-3 py-2 bg-gray-700 text-white rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {modelError && (
                <p className="text-red-500 text-sm mb-4">{modelError}</p>
              )}
              <div className="flex justify-end gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Save
                </button>
              </div>
              {/* </div>/ */}
              {/* </div> */}
            <Dialog.Close asChild>
              <button
                className="modal_close_brn"
                aria-label="Close"
              >
                <Cross2Icon />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
     
    );
  };

  const onchangeComment = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if(isEmpty(userName)){
      setIsModalOpen(true);
      return;
    }
    setNewComment(e.target.value);
  }

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
        setModelError("Username can only contain letters, numbers, and underscores.");
        return false;
      }
  
      const reqData = {
        userName: username,
      };
      const { status, message,result } = await addUserName(reqData);
  
      if (!status) {
        if (message) {
          toastAlert("error", message);
        }
        return false;
      }
      console.log('result: ', result);

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
    <form onSubmit={handleSubmit} className="mt-4 mb-6">
      <textarea
        value={newComment}
        onChange={onchangeComment}
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
    <PopupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUsername}
      />    
    </>
  );
};

export default CommentForm;

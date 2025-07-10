import { useState } from "react";
import { Dialog } from "radix-ui";
import { Cross2Icon } from "@radix-ui/react-icons";

const UsernameModal = ({
    isOpen,
    onClose,
    onSave,
    setError,
    error,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onSave: (username: string) => Promise<boolean>;
    setError: (error: string) => void;
    error: string;
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
                onChange={(e) => {setUsername(e.target.value), setError("")}}
                placeholder="Enter your username"
                className="w-full px-3 py-2 bg-gray-700 text-white rounded mb-4  focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
              />
              {error && (
                <p className="text-red-500 text-sm mb-4">{error}</p>
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

  export default UsernameModal;
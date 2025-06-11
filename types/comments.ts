export interface CommentProps extends React.HTMLAttributes<HTMLDivElement> {
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

export interface CommentListProps {
  comments: CommentProps["comment"][];
  isLoading?: boolean;
  onReply: (commentId: string) => void;
  onDelete: (commentId: string) => void;
  replyingTo: string | null;
  eventId: string;
  onReplyAdded: (newReply: CommentProps["comment"]) => void;
  currentUserWallet?: string;
}

export interface CommentProps extends React.HTMLAttributes<HTMLDivElement> {
  comment?: {
    _id: string;
    content: string;
    createdAt: string;
    userId?: {
      profileImg?: string;
      name?: string;
      userName?: string;
      _id?: string;
      uniqueId: string;
    };
    avatar_url?: string;
    wallet_address?: string;
    parentId?: string | null;
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

//post request data type
export interface PostCommentRequestData {
  userId: string;
  eventId: string;
  content: string;
  parentId: string | null;
}

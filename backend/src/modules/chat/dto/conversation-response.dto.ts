export class ConversationResponseDto {
  id: string;
  participants: string[];
  boatId?: string;
  offer?: {
    priceInEth: number;
    message: string;
    offeredBy: string;
    status: 'pending' | 'accepted' | 'rejected' | 'expired';
    createdAt: Date;
  };
  lastMessage?: {
    content: string;
    senderId: string;
    timestamp: Date;
    messageType: string;
  };
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt: Date;
}

export class MessageResponseDto {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: 'text' | 'offer' | 'system';
  timestamp: Date;
  isRead: boolean;
}

export class ChatParticipantResponseDto {
  address: string;
  displayName?: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: Date;
}
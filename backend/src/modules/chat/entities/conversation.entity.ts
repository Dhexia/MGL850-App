export interface Conversation {
  id: string;
  participants: string[]; // Array of wallet addresses
  boatId?: string; // Optional: if conversation is about a specific boat
  offer?: {
    priceInEth: number;
    message: string;
    offeredBy: string; // wallet address
    status: 'pending' | 'accepted' | 'rejected' | 'expired';
    createdAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string; // wallet address
  content: string;
  messageType: 'text' | 'offer' | 'system';
  timestamp: Date;
  readBy: string[]; // Array of wallet addresses who have read this message
}

export interface ChatParticipant {
  address: string;
  displayName?: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: Date;
}
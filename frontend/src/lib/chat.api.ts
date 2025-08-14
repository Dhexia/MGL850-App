import Constants from 'expo-constants';

const API_BASE = (Constants.expoConfig?.extra as any)?.apiBase as string;

export interface CreateConversationRequest {
  participants: string[];
  boatId?: string;
  offer?: {
    priceInEth: number;
    message: string;
  };
}

export interface SendMessageRequest {
  conversationId: string;
  content: string;
  messageType?: 'text' | 'offer' | 'system';
}

export interface ConversationResponse {
  id: string;
  participants: string[];
  boatId?: string;
  offer?: {
    priceInEth: number;
    message: string;
    offeredBy: string;
    status: 'pending' | 'accepted' | 'rejected' | 'expired';
    createdAt: string;
  };
  lastMessage?: {
    content: string;
    senderId: string;
    timestamp: string;
    messageType: string;
  };
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
}

export interface MessageResponse {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: 'text' | 'offer' | 'system';
  timestamp: string;
  isRead: boolean;
}

export class ChatAPI {
  private static async getAuthHeaders(): Promise<HeadersInit> {
    // Get JWT token from SecureStore
    try {
      const { getItemAsync } = await import('expo-secure-store');
      const token = await getItemAsync('jwt');
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };
    } catch (error) {
      console.error('Error getting auth token:', error);
      return {
        'Content-Type': 'application/json',
      };
    }
  }

  static async createConversation(request: CreateConversationRequest): Promise<ConversationResponse> {
    const response = await fetch(`${API_BASE}/chat/conversations`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to create conversation: ${response.statusText}`);
    }

    return response.json();
  }

  static async getConversations(): Promise<ConversationResponse[]> {
    const response = await fetch(`${API_BASE}/chat/conversations`, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch conversations: ${response.statusText}`);
    }

    return response.json();
  }

  static async getConversation(id: string): Promise<ConversationResponse> {
    const response = await fetch(`${API_BASE}/chat/conversations/${id}`, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch conversation: ${response.statusText}`);
    }

    return response.json();
  }

  static async getMessages(conversationId: string): Promise<MessageResponse[]> {
    const response = await fetch(`${API_BASE}/chat/conversations/${conversationId}/messages`, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch messages: ${response.statusText}`);
    }

    return response.json();
  }

  static async sendMessage(request: SendMessageRequest): Promise<MessageResponse> {
    const response = await fetch(`${API_BASE}/chat/messages`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.statusText}`);
    }

    return response.json();
  }

  static async markMessageAsRead(conversationId: string, messageId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/chat/conversations/${conversationId}/messages/${messageId}/read`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to mark message as read: ${response.statusText}`);
    }
  }

  static async acceptOffer(conversationId: string): Promise<ConversationResponse> {
    const response = await fetch(`${API_BASE}/chat/conversations/${conversationId}/offer/accept`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to accept offer: ${response.statusText}`);
    }

    return response.json();
  }

  static async rejectOffer(conversationId: string): Promise<ConversationResponse> {
    const response = await fetch(`${API_BASE}/chat/conversations/${conversationId}/offer/reject`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to reject offer: ${response.statusText}`);
    }

    return response.json();
  }

  static async findConversationByBoat(boatId: string, participantAddress: string): Promise<ConversationResponse | null> {
    const response = await fetch(`${API_BASE}/chat/conversations/search?boatId=${boatId}&participant=${participantAddress}`, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    if (response.status === 404) {
      return null; // No existing conversation
    }

    if (!response.ok) {
      throw new Error(`Failed to search conversation: ${response.statusText}`);
    }

    return response.json();
  }

  static async sendOfferMessage(conversationId: string, offer: { priceInEth: number; message: string }): Promise<MessageResponse> {
    const response = await fetch(`${API_BASE}/chat/conversations/${conversationId}/offer`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(offer),
    });

    if (!response.ok) {
      throw new Error(`Failed to send offer: ${response.statusText}`);
    }

    return response.json();
  }
}
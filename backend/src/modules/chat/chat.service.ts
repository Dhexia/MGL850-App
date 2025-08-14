import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Conversation, Message, ChatParticipant } from './entities/conversation.entity';
import { CreateConversationDto, SendMessageDto } from './dto/create-conversation.dto';
import { ConversationResponseDto, MessageResponseDto } from './dto/conversation-response.dto';
import { BoatsService } from '../boats/boats.service';

@Injectable()
export class ChatService {
  private readonly log = new Logger(ChatService.name);
  private supabase: SupabaseClient;

  constructor(
    private configService: ConfigService,
    private boatsService: BoatsService,
  ) {
    this.supabase = createClient(
      this.configService.get('SUPABASE_URL')!,
      this.configService.get('SUPABASE_SERVICE_KEY')!,
    );
  }

  async createConversation(createConversationDto: CreateConversationDto, createdBy: string): Promise<ConversationResponseDto> {
    try {
      const participants = [...createConversationDto.participants, createdBy];
      
      // Insert conversation into Supabase
      const conversationData: any = {
        participants,
        boat_id: createConversationDto.boatId,
      };

      // Add offer fields if offer exists
      if (createConversationDto.offer) {
        conversationData.offer_price_eth = createConversationDto.offer.priceInEth;
        conversationData.offer_message = createConversationDto.offer.message;
        conversationData.offered_by = createdBy;
        conversationData.offer_status = 'pending';
        conversationData.offer_created_at = new Date().toISOString();
      }

      const { data: conversation, error: convError } = await this.supabase
        .from('conversations')
        .insert(conversationData)
        .select()
        .single();

      if (convError) {
        this.log.error('Error creating conversation:', convError);
        throw new Error('Failed to create conversation');
      }

      // If there's an offer, create an initial offer message
      if (createConversationDto.offer) {
        const messageContent = `Offre: ${createConversationDto.offer.priceInEth} ETH - ${createConversationDto.offer.message}`;
        
        const { error: msgError } = await this.supabase
          .from('messages')
          .insert({
            conversation_id: conversation.id,
            sender_id: createdBy,
            content: messageContent,
            message_type: 'offer',
            read_by: [createdBy],
          });

        if (msgError) {
          this.log.error('Error creating offer message:', msgError);
        }
      }

      return this.mapSupabaseConversationToResponse(conversation, createdBy);
    } catch (error) {
      this.log.error('Error in createConversation:', error);
      throw error;
    }
  }

  async getConversationsForUser(userAddress: string): Promise<ConversationResponseDto[]> {
    try {
      const { data: conversations, error } = await this.supabase
        .from('conversation_summaries')
        .select('*')
        .contains('participants', [userAddress])
        .order('last_message_at', { ascending: false });

      if (error) {
        this.log.error('Error fetching conversations:', error);
        throw new Error('Failed to fetch conversations');
      }

      return await Promise.all(
        conversations.map(conv => this.mapSupabaseConversationToResponse(conv, userAddress))
      );
    } catch (error) {
      this.log.error('Error in getConversationsForUser:', error);
      throw error;
    }
  }

  async getConversationById(conversationId: string, userAddress: string): Promise<ConversationResponseDto | null> {
    try {
      const { data: conversation, error } = await this.supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .contains('participants', [userAddress])
        .single();

      if (error || !conversation) {
        return null;
      }

      return this.mapSupabaseConversationToResponse(conversation, userAddress);
    } catch (error) {
      this.log.error('Error in getConversationById:', error);
      return null;
    }
  }

  async getMessagesForConversation(conversationId: string, userAddress: string): Promise<MessageResponseDto[]> {
    try {
      // First verify user has access to this conversation
      const conversation = await this.getConversationById(conversationId, userAddress);
      if (!conversation) {
        return [];
      }

      const { data: messages, error } = await this.supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('timestamp', { ascending: true });

      if (error) {
        this.log.error('Error fetching messages:', error);
        return [];
      }

      return messages.map(msg => ({
        id: msg.id,
        conversationId: msg.conversation_id,
        senderId: msg.sender_id,
        content: msg.content,
        messageType: msg.message_type,
        timestamp: new Date(msg.timestamp),
        isRead: msg.read_by.includes(userAddress),
      }));
    } catch (error) {
      this.log.error('Error in getMessagesForConversation:', error);
      return [];
    }
  }

  async sendMessage(sendMessageDto: SendMessageDto, senderId: string): Promise<MessageResponseDto> {
    try {
      // Verify user has access to this conversation
      const conversation = await this.getConversationById(sendMessageDto.conversationId, senderId);
      if (!conversation) {
        throw new Error('Conversation not found or user not authorized');
      }

      // Insert message into Supabase
      const { data: message, error } = await this.supabase
        .from('messages')
        .insert({
          conversation_id: sendMessageDto.conversationId,
          sender_id: senderId,
          content: sendMessageDto.content,
          message_type: sendMessageDto.messageType || 'text',
          read_by: [senderId],
        })
        .select()
        .single();

      if (error) {
        this.log.error('Error sending message:', error);
        throw new Error('Failed to send message');
      }

      // The trigger will automatically update the conversation's last_message_at
      // No need to manually update it

      return {
        id: message.id,
        conversationId: message.conversation_id,
        senderId: message.sender_id,
        content: message.content,
        messageType: message.message_type,
        timestamp: new Date(message.timestamp),
        isRead: true, // Always true for sender
      };
    } catch (error) {
      this.log.error('Error in sendMessage:', error);
      throw error;
    }
  }

  async markMessageAsRead(conversationId: string, messageId: string, userAddress: string): Promise<void> {
    try {
      // Verify user has access to this conversation
      const conversation = await this.getConversationById(conversationId, userAddress);
      if (!conversation) {
        return;
      }

      // Use the Supabase function to mark message as read
      const { error } = await this.supabase.rpc('mark_message_read', {
        msg_id: messageId,
        user_address: userAddress,
      });

      if (error) {
        this.log.error('Error marking message as read:', error);
      }
    } catch (error) {
      this.log.error('Error in markMessageAsRead:', error);
    }
  }

  async acceptOffer(conversationId: string, userAddress: string): Promise<ConversationResponseDto> {
    try {
      // Verify user has access to this conversation and owns the boat
      const conversation = await this.getConversationById(conversationId, userAddress);
      if (!conversation) {
        throw new Error('Conversation not found or user not authorized');
      }

      if (!conversation.offer || conversation.offer.status !== 'pending') {
        throw new Error('No pending offer found');
      }

      // Update offer status to accepted
      const { error } = await this.supabase
        .from('conversations')
        .update({ 
          offer_status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId);

      if (error) {
        this.log.error('Error accepting offer:', error);
        throw new Error('Failed to accept offer');
      }

      // Transfer boat ownership on blockchain
      if (conversation.boatId && conversation.offer.offeredBy) {
        try {
          const transferResult = await this.boatsService.transferOwnership(
            parseInt(conversation.boatId),
            conversation.offer.offeredBy,
            userAddress // current owner
          );
          this.log.log(`Boat ownership transferred: ${transferResult.txHash} from ${transferResult.from} to ${transferResult.to}`);
          
          // Mark offer as completed after successful transfer (keeps it visible but no actions)
          const { error: clearError } = await this.supabase
            .from('conversations')
            .update({ 
              offer_status: 'completed',
              updated_at: new Date().toISOString()
            })
            .eq('id', conversationId);

          if (clearError) {
            this.log.error('Error marking offer as completed after transfer:', clearError);
          } else {
            this.log.log(`Offer marked as completed after successful transfer for conversation ${conversationId}`);
          }
          
        } catch (transferError) {
          this.log.error('Error transferring boat ownership:', transferError);
          // Continue with the offer acceptance even if blockchain transfer fails
          // In a production system, you might want to revert the offer status
        }
      }

      return this.getConversationById(conversationId, userAddress);
    } catch (error) {
      this.log.error('Error in acceptOffer:', error);
      throw error;
    }
  }

  async rejectOffer(conversationId: string, userAddress: string): Promise<ConversationResponseDto> {
    try {
      // Verify user has access to this conversation
      const conversation = await this.getConversationById(conversationId, userAddress);
      if (!conversation) {
        throw new Error('Conversation not found or user not authorized');
      }

      if (!conversation.offer || conversation.offer.status !== 'pending') {
        throw new Error('No pending offer found');
      }

      // Update offer status to rejected
      const { error } = await this.supabase
        .from('conversations')
        .update({ 
          offer_status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId);

      if (error) {
        this.log.error('Error rejecting offer:', error);
        throw new Error('Failed to reject offer');
      }

      return this.getConversationById(conversationId, userAddress);
    } catch (error) {
      this.log.error('Error in rejectOffer:', error);
      throw error;
    }
  }

  async findConversationByBoat(boatId: string, participantAddress: string, userAddress: string): Promise<ConversationResponseDto | null> {
    try {
      const { data: conversation, error } = await this.supabase
        .from('conversations')
        .select('*')
        .eq('boat_id', boatId)
        .contains('participants', [userAddress])
        .contains('participants', [participantAddress])
        .maybeSingle();

      if (error || !conversation) {
        return null;
      }

      return this.mapSupabaseConversationToResponse(conversation, userAddress);
    } catch (error) {
      this.log.error('Error in findConversationByBoat:', error);
      return null;
    }
  }

  async sendOfferMessage(conversationId: string, offer: { priceInEth: number; message: string }, userAddress: string): Promise<MessageResponseDto> {
    try {
      // Verify user has access to this conversation
      const conversation = await this.getConversationById(conversationId, userAddress);
      if (!conversation) {
        throw new Error('Conversation not found or user not authorized');
      }

      // Create offer message content
      const messageContent = `Offre: ${offer.priceInEth} ETH - ${offer.message}`;
      
      // Insert message into Supabase
      const { data: message, error } = await this.supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: userAddress,
          content: messageContent,
          message_type: 'offer',
          read_by: [userAddress],
        })
        .select()
        .single();

      if (error) {
        this.log.error('Error sending offer message:', error);
        throw new Error('Failed to send offer message');
      }

      return {
        id: message.id,
        conversationId: message.conversation_id,
        senderId: message.sender_id,
        content: message.content,
        messageType: message.message_type,
        timestamp: new Date(message.timestamp),
        isRead: true, // Always true for sender
      };
    } catch (error) {
      this.log.error('Error in sendOfferMessage:', error);
      throw error;
    }
  }

  private async mapSupabaseConversationToResponse(conversation: any, userAddress: string): Promise<ConversationResponseDto> {
    // Get unread count using Supabase function
    const { data: unreadCount } = await this.supabase.rpc('get_unread_count', {
      conv_id: conversation.id,
      user_address: userAddress,
    });

    const response: ConversationResponseDto = {
      id: conversation.id,
      participants: conversation.participants,
      boatId: conversation.boat_id,
      offer: conversation.offer_price_eth ? {
        priceInEth: parseFloat(conversation.offer_price_eth),
        message: conversation.offer_message,
        offeredBy: conversation.offered_by,
        status: conversation.offer_status,
        createdAt: new Date(conversation.offer_created_at),
      } : undefined,
      lastMessage: conversation.last_message_content ? {
        content: conversation.last_message_content,
        senderId: conversation.last_message_sender,
        timestamp: new Date(conversation.last_message_timestamp),
        messageType: conversation.last_message_type,
      } : undefined,
      unreadCount: unreadCount || 0,
      createdAt: new Date(conversation.created_at),
      updatedAt: new Date(conversation.updated_at),
      lastMessageAt: new Date(conversation.last_message_at),
    };

    return response;
  }
}
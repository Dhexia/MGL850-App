import { Controller, Get, Post, Body, Param, UseGuards, Request, Query, NotFoundException } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateConversationDto, SendMessageDto } from './dto/create-conversation.dto';
import { ConversationResponseDto, MessageResponseDto } from './dto/conversation-response.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('conversations')
  async createConversation(
    @Body() createConversationDto: CreateConversationDto,
    @Request() req: any,
  ): Promise<ConversationResponseDto> {
    const userAddress = req.user.address;
    return this.chatService.createConversation(createConversationDto, userAddress);
  }

  @Get('conversations')
  async getConversations(@Request() req: any): Promise<ConversationResponseDto[]> {
    const userAddress = req.user.address;
    return this.chatService.getConversationsForUser(userAddress);
  }

  @Get('conversations/search')
  async findConversation(
    @Query('boatId') boatId: string,
    @Query('participant') participantAddress: string,
    @Request() req: any,
  ): Promise<ConversationResponseDto> {
    const userAddress = req.user.address;
    const conversation = await this.chatService.findConversationByBoat(boatId, participantAddress, userAddress);
    
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }
    
    return conversation;
  }

  @Get('conversations/:id')
  async getConversation(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<ConversationResponseDto> {
    const userAddress = req.user.address;
    const conversation = await this.chatService.getConversationById(id, userAddress);
    
    if (!conversation) {
      throw new Error('Conversation not found or access denied');
    }
    
    return conversation;
  }

  @Get('conversations/:id/messages')
  async getMessages(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<MessageResponseDto[]> {
    const userAddress = req.user.address;
    return this.chatService.getMessagesForConversation(id, userAddress);
  }

  @Post('messages')
  async sendMessage(
    @Body() sendMessageDto: SendMessageDto,
    @Request() req: any,
  ): Promise<MessageResponseDto> {
    const userAddress = req.user.address;
    return this.chatService.sendMessage(sendMessageDto, userAddress);
  }

  @Post('conversations/:conversationId/messages/:messageId/read')
  async markMessageAsRead(
    @Param('conversationId') conversationId: string,
    @Param('messageId') messageId: string,
    @Request() req: any,
  ): Promise<{ success: boolean }> {
    const userAddress = req.user.address;
    await this.chatService.markMessageAsRead(conversationId, messageId, userAddress);
    return { success: true };
  }

  @Post('conversations/:conversationId/offer/accept')
  async acceptOffer(
    @Param('conversationId') conversationId: string,
    @Request() req: any,
  ): Promise<ConversationResponseDto> {
    const userAddress = req.user.address;
    return this.chatService.acceptOffer(conversationId, userAddress);
  }

  @Post('conversations/:conversationId/offer/reject')
  async rejectOffer(
    @Param('conversationId') conversationId: string,
    @Request() req: any,
  ): Promise<ConversationResponseDto> {
    const userAddress = req.user.address;
    return this.chatService.rejectOffer(conversationId, userAddress);
  }

  @Post('conversations/:conversationId/offer')
  async sendOffer(
    @Param('conversationId') conversationId: string,
    @Body() offer: { priceInEth: number; message: string },
    @Request() req: any,
  ): Promise<MessageResponseDto> {
    const userAddress = req.user.address;
    return this.chatService.sendOfferMessage(conversationId, offer, userAddress);
  }
}
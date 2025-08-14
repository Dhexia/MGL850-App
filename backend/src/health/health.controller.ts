import { Controller, Get, Post, Delete } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { Public } from '../modules/auth/public.decorator';

@Controller('health')
@Public()
export class HealthController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      contracts: {
        boatPassport: this.configService.get<string>('BOAT_PASSPORT_ADDRESS'),
        roleRegistry: this.configService.get<string>('ROLE_REGISTRY_ADDRESS'),
        boatEvents: this.configService.get<string>('BOAT_EVENTS_ADDRESS'),
        boatCertificate: this.configService.get<string>('BOAT_CERTIFICATE_ADDRESS'),
      },
      rpc: {
        sepolia: this.configService.get<string>('SEPOLIA_RPC_URL'),
        websocket: this.configService.get<string>('WEBSOCKET_RPC'),
      }
    };
  }

  @Delete('corrupted-boats')
  async deleteCorruptedBoats() {
    const supa = createClient(
      this.configService.get('SUPABASE_URL')!,
      this.configService.get('SUPABASE_SERVICE_KEY')!,
    );

    try {
      // Supprimer les bateaux corrompus #22, #23, #24
      const corruptedBoatIds = [22, 23, 24];
      
      const { data, error } = await supa
        .from('boats')
        .delete()
        .in('id', corruptedBoatIds);

      if (error) {
        throw error;
      }

      return {
        status: 'success',
        message: 'Corrupted boats deleted from database',
        deletedIds: corruptedBoatIds,
        result: data
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to delete corrupted boats',
        error: error.message
      };
    }
  }

  @Delete('all-boats')
  async deleteAllBoats() {
    const supa = createClient(
      this.configService.get('SUPABASE_URL')!,
      this.configService.get('SUPABASE_SERVICE_KEY')!,
    );

    try {
      // Get all boat IDs first
      const { data: boats, error: fetchError } = await supa
        .from('boats')
        .select('id');

      if (fetchError) {
        throw fetchError;
      }

      const boatIds = boats?.map((boat) => boat.id) || [];

      if (boatIds.length === 0) {
        return {
          status: 'success',
          message: 'No boats found in database',
          deletedIds: [],
        };
      }

      // Delete all boats
      const { data, error } = await supa
        .from('boats')
        .delete()
        .in('id', boatIds);

      if (error) {
        throw error;
      }

      return {
        status: 'success',
        message: `All ${boatIds.length} boats deleted from database`,
        deletedIds: boatIds,
        result: data,
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to delete all boats',
        error: error.message,
      };
    }
  }

  @Get('cursor')
  async getCursor() {
    const supa = createClient(
      this.configService.get('SUPABASE_URL')!,
      this.configService.get('SUPABASE_SERVICE_KEY')!,
    );

    try {
      const { data, error } = await supa
        .from('cursor')
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      return {
        status: 'success',
        cursor: data,
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to get cursor',
        error: error.message,
      };
    }
  }

  @Post('cursor/reset')
  async resetCursor() {
    const supa = createClient(
      this.configService.get('SUPABASE_URL')!,
      this.configService.get('SUPABASE_SERVICE_KEY')!,
    );

    try {
      // Get current block number from RPC
      const response = await fetch(this.configService.get('SEPOLIA_RPC_URL')!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_blockNumber',
          params: [],
          id: 1,
        }),
      });

      const rpcResult = await response.json();
      const currentBlock = parseInt(rpcResult.result, 16);

      // Update cursor to current block
      const { data, error } = await supa
        .from('cursor')
        .update({ last_block: currentBlock })
        .eq('id', 1);

      if (error) {
        throw error;
      }

      return {
        status: 'success',
        message: `Cursor reset to current block ${currentBlock}`,
        previousBlock: data,
        newBlock: currentBlock,
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to reset cursor',
        error: error.message,
      };
    }
  }

  @Delete('chat-messages')
  async deleteAllChatMessages() {
    const supa = createClient(
      this.configService.get('SUPABASE_URL')!,
      this.configService.get('SUPABASE_SERVICE_KEY')!,
    );

    try {
      // Get count of messages first
      const { count: messageCount } = await supa
        .from('messages')
        .select('*', { count: 'exact', head: true });

      // Delete all messages
      const { error: messagesError } = await supa
        .from('messages')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

      if (messagesError) {
        throw messagesError;
      }

      return {
        status: 'success',
        message: `Deleted ${messageCount || 0} chat messages`,
        deletedCount: messageCount || 0,
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to delete chat messages',
        error: error.message,
      };
    }
  }

  @Delete('chat-conversations')
  async deleteAllChatConversations() {
    const supa = createClient(
      this.configService.get('SUPABASE_URL')!,
      this.configService.get('SUPABASE_SERVICE_KEY')!,
    );

    try {
      // Get count of conversations first
      const { count: conversationCount } = await supa
        .from('conversations')
        .select('*', { count: 'exact', head: true });

      // Delete all conversations
      const { error: conversationsError } = await supa
        .from('conversations')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

      if (conversationsError) {
        throw conversationsError;
      }

      return {
        status: 'success',
        message: `Deleted ${conversationCount || 0} chat conversations`,
        deletedCount: conversationCount || 0,
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to delete chat conversations',
        error: error.message,
      };
    }
  }

  @Delete('chat-all')
  async deleteAllChatData() {
    const supa = createClient(
      this.configService.get('SUPABASE_URL')!,
      this.configService.get('SUPABASE_SERVICE_KEY')!,
    );

    try {
      // Get counts first
      const { count: messageCount } = await supa
        .from('messages')
        .select('*', { count: 'exact', head: true });

      const { count: conversationCount } = await supa
        .from('conversations')
        .select('*', { count: 'exact', head: true });

      // Delete messages first (foreign key constraint)
      const { error: messagesError } = await supa
        .from('messages')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (messagesError) {
        throw messagesError;
      }

      // Then delete conversations
      const { error: conversationsError } = await supa
        .from('conversations')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (conversationsError) {
        throw conversationsError;
      }

      return {
        status: 'success',
        message: `Deleted all chat data: ${messageCount || 0} messages and ${conversationCount || 0} conversations`,
        deletedMessages: messageCount || 0,
        deletedConversations: conversationCount || 0,
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to delete all chat data',
        error: error.message,
      };
    }
  }

  @Get('chat-stats')
  async getChatStats() {
    const supa = createClient(
      this.configService.get('SUPABASE_URL')!,
      this.configService.get('SUPABASE_SERVICE_KEY')!,
    );

    try {
      // Get message count
      const { count: messageCount } = await supa
        .from('messages')
        .select('*', { count: 'exact', head: true });

      // Get conversation count
      const { count: conversationCount } = await supa
        .from('conversations')
        .select('*', { count: 'exact', head: true });

      // Get conversations with offers
      const { count: offerCount } = await supa
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .not('offer_price_eth', 'is', null);

      return {
        status: 'success',
        stats: {
          messages: messageCount || 0,
          conversations: conversationCount || 0,
          conversationsWithOffers: offerCount || 0,
        },
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to get chat stats',
        error: error.message,
      };
    }
  }
}
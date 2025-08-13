import { Controller, Get, Post, Delete } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';

@Controller('health')
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
}
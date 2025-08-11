import { Controller, Get, Delete } from '@nestjs/common';
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
}
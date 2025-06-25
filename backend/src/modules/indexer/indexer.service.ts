import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';

@Injectable()
export class IndexerService {
  private readonly log = new Logger(IndexerService.name);

  constructor(private cfg: ConfigService) {}

  async start() {
    /* clients */
    const supa = createClient(
      this.cfg.get('SUPABASE_URL'),
      this.cfg.get('SUPABASE_SERVICE_KEY'),
    );
    const provider = new ethers.WebSocketProvider(
      this.cfg.get('WEBSOCKET_RPC'),
    );

    /* bloc de reprise */
    const { data } = await supa.from('cursor').select('last_block').single();
    let fromBlock = data?.last_block ?? (await provider.getBlockNumber());
    this.log.log(`Indexer starts at block ${fromBlock}`);

    /* filtre event */
    const iface = new ethers.Interface([
      'event BoatEventLogged(uint256,uint8,address,string)',
    ]);
    const filter = {
      address: this.cfg.get('BOAT_EVENTS_ADDRESS'),
      topics: [iface.getEvent('BoatEventLogged').topicHash],
      fromBlock,
    };

    /* écoute */
    provider.on(filter, async (raw) => {
      const [boatId, kind, author, ipfsHash] = iface.parseLog(raw).args;
      await supa.from('events').insert({
        boat_id: boatId,
        kind,
        ts: new Date(raw.blockTimestamp * 1000),
        author,
        ipfs_hash: ipfsHash,
        tx_hash: raw.transactionHash,
        block_number: raw.blockNumber,
      });

      /* maj curseur tous les 10 blocs */
      if (raw.blockNumber - fromBlock >= 10) {
        fromBlock = raw.blockNumber;
        await supa.from('cursor').update({ last_block: fromBlock }).eq('id', 1);
      }
      this.log.verbose(
        `Boat ${boatId} – kind ${kind} – block ${raw.blockNumber}`,
      );
    });

    provider.websocket.onclose = () => {
      this.log.warn('WS closed, reconnecting in 5 s');
      setTimeout(() => this.start(), 5_000);
    };
  }
}

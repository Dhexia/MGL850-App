/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { ethers, ZeroAddress } from 'ethers';

@Injectable()
export class IndexerService {
  private readonly log = new Logger(IndexerService.name);

  constructor(private cfg: ConfigService) {}

  async start() {
    const supa = createClient(
      this.cfg.get('SUPABASE_URL')!,
      this.cfg.get('SUPABASE_SERVICE_KEY')!,
    );
    const provider = new ethers.WebSocketProvider(
      this.cfg.get('WEBSOCKET_RPC')!,
    );

    // point de reprise
    const { data } = await supa.from('cursor').select('last_block').single();
    let fromBlock = data?.last_block ?? (await provider.getBlockNumber());
    this.log.log(`Indexer starts at block ${fromBlock}`);

    /* ============== BoatEventLogged (déjà présent) ================= */
    const boatEventsIface = new ethers.Interface([
      'event BoatEventLogged(uint256,uint8,address,string)',
    ]);
    const boatEventsAddress = this.cfg.get('BOAT_EVENTS_ADDRESS')!;
    const boatEventsFilter = {
      address: boatEventsAddress,
      topics: [boatEventsIface.getEvent('BoatEventLogged').topicHash],
      fromBlock,
    };

    provider.on(boatEventsFilter, async (raw) => {
      try {
        const parsed = boatEventsIface.parseLog(raw);
        const boatId = Number(parsed.args[0]);
        const kind = Number(parsed.args[1]);
        const author = (parsed.args[2] as string).toLowerCase();
        const ipfsHash = parsed.args[3] as string;

        // timestamp: fallback si non fourni
        let tsMs: number;
        // @ts-ignore: certains providers enrichissent le log
        if (raw.blockTimestamp) {
          // @ts-ignore
          tsMs = Number(raw.blockTimestamp) * 1000;
        } else {
          const blk = await provider.getBlock(raw.blockNumber);
          tsMs = Number(blk?.timestamp ?? Date.now() / 1000) * 1000;
        }

        await supa.from('events').insert({
          boat_id: boatId,
          kind,
          ts: new Date(tsMs),
          author,
          ipfs_hash: ipfsHash,
          tx_hash: raw.transactionHash,
          block_number: raw.blockNumber,
        });

        if (raw.blockNumber - fromBlock >= 10) {
          fromBlock = raw.blockNumber;
          await supa
            .from('cursor')
            .update({ last_block: fromBlock })
            .eq('id', 1);
        }
        this.log.verbose(
          `Boat ${boatId} – kind ${kind} – block ${raw.blockNumber}`,
        );
      } catch (e) {
        this.log.warn(
          `BoatEventLogged parse/insert error: ${(e as Error).message}`,
        );
      }
    });

    /* ============== ERC-721 Transfer (BoatPassport) ================= */
    const passportAddress = this.cfg.get('BOAT_PASSPORT_ADDRESS')!;
    const erc721Iface = new ethers.Interface([
      'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
      'function tokenURI(uint256) view returns (string)',
    ]);
    const tfTopic = erc721Iface.getEvent('Transfer').topicHash;

    // ÉTAPE 1: Rattraper les anciens événements Transfer
    this.log.log(`Catching up Transfer events from block ${fromBlock}...`);
    const transferContract = new ethers.Contract(
      passportAddress,
      erc721Iface,
      provider,
    );

    // Traitement par batch de 400 blocs pour éviter la limite RPC de 500 blocs
    const currentBlock = await provider.getBlockNumber();
    const BATCH_SIZE = 400;
    const oldEvents = [];

    for (let start = fromBlock; start <= currentBlock; start += BATCH_SIZE) {
      const end = Math.min(start + BATCH_SIZE - 1, currentBlock);
      this.log.verbose(
        `Processing Transfer events from block ${start} to ${end}`,
      );

      try {
        const batchEvents = await transferContract.queryFilter(
          transferContract.filters.Transfer(),
          start,
          end,
        );
        oldEvents.push(...batchEvents);
      } catch (error) {
        this.log.warn(
          `Failed to fetch Transfer events for blocks ${start}-${end}: ${error.message}`,
        );
      }
    }

    this.log.log(`Found ${oldEvents.length} Transfer events to process`);

    for (const event of oldEvents) {
      try {
        if (!('args' in event)) continue; // Skip non-EventLog entries
        const from = (event.args[0] as string).toLowerCase();
        const to = (event.args[1] as string).toLowerCase();
        const tokenId = event.args[2].toString();

        // tokenURI au mint
        let tokenUri: string | null = null;
        if (from === ZeroAddress) {
          try {
            tokenUri = await transferContract.tokenURI(tokenId);
          } catch {}
        }

        // upsert dans boats
        await supa.from('boats').upsert(
          {
            id: Number(tokenId),
            owner: to,
            token_uri: tokenUri ?? undefined,
            minted_at: new Date(),
            block_number: event.blockNumber,
            tx_hash: event.transactionHash,
          },
          { onConflict: 'id' },
        );

        this.log.verbose(
          `Transfer ${from === ZeroAddress ? 'MINT' : 'MOVE'} #${tokenId} → ${to} (block ${event.blockNumber})`,
        );

        // Update cursor every 10 events
        if (event.blockNumber - fromBlock >= 10) {
          fromBlock = event.blockNumber;
          await supa
            .from('cursor')
            .update({ last_block: fromBlock })
            .eq('id', 1);
        }
      } catch (e) {
        this.log.warn(`Transfer catchup error: ${(e as Error).message}`);
      }
    }

    // ÉTAPE 2: Écouter les nouveaux événements en temps réel
    provider.on(
      { address: passportAddress, topics: [tfTopic] },
      async (raw) => {
        try {
          const parsed = erc721Iface.parseLog(raw);
          const from = (parsed.args[0] as string).toLowerCase();
          const to = (parsed.args[1] as string).toLowerCase();
          const tokenId = parsed.args[2].toString();

          // tokenURI au mint
          let tokenUri: string | null = null;
          if (from === ZeroAddress) {
            try {
              const read = new ethers.Contract(
                passportAddress,
                erc721Iface,
                provider,
              );
              tokenUri = await read.tokenURI(tokenId);
            } catch {}
          }

          // upsert dans boats
          await supa.from('boats').upsert(
            {
              id: Number(tokenId),
              owner: to,
              token_uri: tokenUri ?? undefined,
              minted_at: new Date(),
              block_number: raw.blockNumber,
              tx_hash: raw.transactionHash,
            },
            { onConflict: 'id' },
          );

          this.log.verbose(
            `Transfer ${from === ZeroAddress ? 'MINT' : 'MOVE'} #${tokenId} → ${to} (block ${raw.blockNumber})`,
          );
        } catch (e) {
          this.log.warn(`Transfer parse/upsert error: ${(e as Error).message}`);
        }
      },
    );

    // Reconnexion WS simple
    // @ts-ignore: propriété spécifique de la lib ws sous-jacente
    provider.websocket.onclose = () => {
      this.log.warn('WS closed, reconnecting in 5 s');
      setTimeout(() => this.start(), 5_000);
    };
  }
}

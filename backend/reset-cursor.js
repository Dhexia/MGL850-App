const { createClient } = require('@supabase/supabase-js');
const https = require('https');

// Configuration depuis .env
const SUPABASE_URL = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'YOUR_SERVICE_KEY';
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || 'YOUR_RPC_URL';

async function resetCursor() {
  try {
    // 1. Get current block from Sepolia
    const rpcData = JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_blockNumber',
      params: [],
      id: 1,
    });

    const response = await fetch(SEPOLIA_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: rpcData,
    });

    const rpcResult = await response.json();
    const currentBlock = parseInt(rpcResult.result, 16);

    console.log(`Current Sepolia block: ${currentBlock}`);

    // 2. Connect to Supabase
    const supa = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // 3. Get current cursor
    const { data: oldCursor, error: fetchError } = await supa
      .from('cursor')
      .select('*')
      .single();

    if (fetchError) {
      console.error('Error fetching cursor:', fetchError);
      return;
    }

    console.log(`Old cursor block: ${oldCursor.last_block}`);

    // 4. Update cursor to current block
    const { data, error } = await supa
      .from('cursor')
      .update({ last_block: currentBlock })
      .eq('id', 1);

    if (error) {
      console.error('Error updating cursor:', error);
      return;
    }

    console.log(`✅ Cursor updated from ${oldCursor.last_block} to ${currentBlock}`);
    console.log('IndexerService will now skip old corrupted boat NFTs!');

  } catch (error) {
    console.error('Error:', error);
  }
}

resetCursor();
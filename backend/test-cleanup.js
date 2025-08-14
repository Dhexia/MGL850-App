const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function getStats() {
  console.log('📊 Getting current chat stats...');
  
  const { count: messageCount } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true });

  const { count: conversationCount } = await supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true });

  const { count: offerCount } = await supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true })
    .not('offer_price_eth', 'is', null);

  console.log(`Messages: ${messageCount || 0}`);
  console.log(`Conversations: ${conversationCount || 0}`);  
  console.log(`Conversations with offers: ${offerCount || 0}`);
  
  return { messageCount, conversationCount, offerCount };
}

async function cleanupAll() {
  console.log('\n🧹 Starting full cleanup...');
  
  // Delete messages first (foreign key constraint)
  console.log('Deleting all messages...');
  const { error: messagesError } = await supabase
    .from('messages')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (messagesError) {
    console.error('❌ Error deleting messages:', messagesError);
    return;
  }

  // Delete conversations
  console.log('Deleting all conversations...');
  const { error: conversationsError } = await supabase
    .from('conversations')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (conversationsError) {
    console.error('❌ Error deleting conversations:', conversationsError);
    return;
  }

  console.log('✅ All chat data deleted successfully!');
}

async function main() {
  console.log('='.repeat(50));
  console.log('CHAT DATA CLEANUP TOOL');
  console.log('='.repeat(50));
  
  // Show stats before
  console.log('\n--- BEFORE CLEANUP ---');
  const before = await getStats();
  
  // Cleanup
  await cleanupAll();
  
  // Show stats after
  console.log('\n--- AFTER CLEANUP ---');
  const after = await getStats();
  
  console.log('\n--- SUMMARY ---');
  console.log(`Deleted ${before.messageCount || 0} messages`);
  console.log(`Deleted ${before.conversationCount || 0} conversations`);
  console.log('\n🎉 Cleanup completed!');
}

main().catch(console.error).finally(() => process.exit(0));
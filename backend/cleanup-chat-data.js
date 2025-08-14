const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function cleanupChatData() {
  console.log('🧹 Starting chat data cleanup...');
  
  try {
    // Delete all messages first (due to foreign key constraint)
    console.log('Deleting all messages...');
    const { data: messagesData, error: messagesError } = await supabase
      .from('messages')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

    if (messagesError) {
      console.error('❌ Error deleting messages:', messagesError);
      return;
    }
    console.log(`✅ Deleted ${messagesData?.length || 0} messages`);

    // Delete all conversations
    console.log('Deleting all conversations...');
    const { data: conversationsData, error: conversationsError } = await supabase
      .from('conversations')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

    if (conversationsError) {
      console.error('❌ Error deleting conversations:', conversationsError);
      return;
    }
    console.log(`✅ Deleted ${conversationsData?.length || 0} conversations`);

    console.log('🎉 Chat data cleanup completed successfully!');
    
  } catch (error) {
    console.error('💥 Unexpected error during cleanup:', error);
  }
}

// Run the cleanup
cleanupChatData().then(() => {
  console.log('Script finished');
  process.exit(0);
});
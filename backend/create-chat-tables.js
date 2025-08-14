const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function createTables() {
  console.log('=== Chat Tables Creation Guide ===');
  console.log('\nThe chat tables need to be created manually in the Supabase Dashboard.');
  console.log('\nSteps to create the tables:');
  console.log('1. Go to: https://supabase.com/dashboard/project/sboodhnbqcparduhlaix');
  console.log('2. Click on "SQL Editor" in the sidebar');
  console.log('3. Click "New Query" and paste the following SQL:\n');
  
  console.log(`-- Chat Tables Schema
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participants TEXT[] NOT NULL,
  boat_id TEXT,
  offer_price_eth DECIMAL(18,8),
  offer_message TEXT,
  offered_by TEXT,
  offer_status TEXT CHECK (offer_status IN ('pending', 'accepted', 'rejected', 'expired')) DEFAULT 'pending',
  offer_created_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT CHECK (message_type IN ('text', 'offer', 'system')) DEFAULT 'text',
  read_by TEXT[] DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_conversations_participants ON conversations USING GIN (participants);
CREATE INDEX idx_messages_conversation_id ON messages (conversation_id, timestamp DESC);

-- View for easier querying
CREATE VIEW conversation_summaries AS
SELECT 
  c.id,
  c.participants,
  c.boat_id,
  c.offer_price_eth,
  c.offer_message,
  c.offered_by,
  c.offer_status,
  c.offer_created_at,
  c.created_at,
  c.updated_at,
  c.last_message_at,
  m.content as last_message_content,
  m.sender_id as last_message_sender,
  m.message_type as last_message_type,
  m.timestamp as last_message_timestamp
FROM conversations c
LEFT JOIN LATERAL (
  SELECT content, sender_id, message_type, timestamp
  FROM messages 
  WHERE conversation_id = c.id 
  ORDER BY timestamp DESC 
  LIMIT 1
) m ON true;

-- Function to get unread count
CREATE OR REPLACE FUNCTION get_unread_count(
  conv_id UUID,
  user_address TEXT
)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM messages 
    WHERE conversation_id = conv_id 
    AND sender_id != user_address
    AND NOT (user_address = ANY(read_by))
  );
END;
$$ LANGUAGE plpgsql;

-- Function to mark message as read
CREATE OR REPLACE FUNCTION mark_message_read(
  msg_id UUID,
  user_address TEXT
)
RETURNS VOID AS $$
BEGIN
  UPDATE messages 
  SET read_by = array_append(read_by, user_address)
  WHERE id = msg_id 
  AND NOT (user_address = ANY(read_by));
END;
$$ LANGUAGE plpgsql;`);

  console.log('\n4. Click "RUN" to execute the SQL');
  console.log('5. The tables should be created successfully');
  console.log('\nOnce created, the chat functionality will work properly.');
}

createTables();
-- ====================================
-- CHAT SYSTEM TABLES FOR SUPABASE
-- ====================================

-- Table: conversations
-- Stores chat conversations between users
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participants TEXT[] NOT NULL, -- Array of wallet addresses
  boat_id TEXT, -- Optional reference to boat
  offer_price_eth DECIMAL(18,8), -- ETH amount offered
  offer_message TEXT, -- Message accompanying the offer
  offered_by TEXT, -- Wallet address of person making offer
  offer_status TEXT CHECK (offer_status IN ('pending', 'accepted', 'rejected', 'expired')) DEFAULT 'pending',
  offer_created_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: messages
-- Stores individual messages within conversations
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL, -- Wallet address of sender
  content TEXT NOT NULL,
  message_type TEXT CHECK (message_type IN ('text', 'offer', 'system')) DEFAULT 'text',
  read_by TEXT[] DEFAULT '{}', -- Array of wallet addresses who read this message
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Table: chat_participants (optional - for storing user display info)
-- Stores display information for chat participants
CREATE TABLE chat_participants (
  address TEXT PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  is_online BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================
-- INDEXES FOR PERFORMANCE
-- ====================================

-- Index for finding conversations by participant
CREATE INDEX idx_conversations_participants ON conversations USING GIN (participants);

-- Index for finding conversations by boat
CREATE INDEX idx_conversations_boat_id ON conversations (boat_id);

-- Index for ordering conversations by last message
CREATE INDEX idx_conversations_last_message_at ON conversations (last_message_at DESC);

-- Index for finding messages by conversation
CREATE INDEX idx_messages_conversation_id ON messages (conversation_id, timestamp DESC);

-- Index for finding messages by sender
CREATE INDEX idx_messages_sender_id ON messages (sender_id);

-- Index for message read status queries
CREATE INDEX idx_messages_read_by ON messages USING GIN (read_by);

-- ====================================
-- RLS (Row Level Security) POLICIES
-- ====================================

-- Enable RLS on all tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see conversations they participate in
CREATE POLICY "Users can view their own conversations"
ON conversations FOR SELECT
USING (
  -- Check if current user's address is in participants array
  -- Note: You'll need to implement JWT parsing to get user address
  true -- Placeholder - implement proper auth check
);

-- Policy: Users can only create conversations they participate in
CREATE POLICY "Users can create conversations they participate in"
ON conversations FOR INSERT
WITH CHECK (
  -- Check if current user's address is in participants array
  true -- Placeholder - implement proper auth check
);

-- Policy: Users can update conversations they participate in
CREATE POLICY "Users can update their own conversations"
ON conversations FOR UPDATE
USING (
  -- Check if current user's address is in participants array
  true -- Placeholder - implement proper auth check
);

-- Policy: Users can only see messages from their conversations
CREATE POLICY "Users can view messages from their conversations"
ON messages FOR SELECT
USING (
  conversation_id IN (
    SELECT id FROM conversations 
    WHERE true -- Placeholder - check if user participates
  )
);

-- Policy: Users can only send messages to their conversations
CREATE POLICY "Users can send messages to their conversations"
ON messages FOR INSERT
WITH CHECK (
  conversation_id IN (
    SELECT id FROM conversations 
    WHERE true -- Placeholder - check if user participates
  )
);

-- Policy: Users can update their own messages (for read status)
CREATE POLICY "Users can update messages for read status"
ON messages FOR UPDATE
USING (
  conversation_id IN (
    SELECT id FROM conversations 
    WHERE true -- Placeholder - check if user participates
  )
);

-- Policy: Users can manage their own participant info
CREATE POLICY "Users can manage their own participant info"
ON chat_participants FOR ALL
USING (
  address = 'current_user_address' -- Placeholder - implement proper auth check
);

-- ====================================
-- TRIGGERS FOR AUTO-UPDATING TIMESTAMPS
-- ====================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for conversations table
CREATE TRIGGER update_conversations_updated_at 
  BEFORE UPDATE ON conversations 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for chat_participants table
CREATE TRIGGER update_chat_participants_updated_at 
  BEFORE UPDATE ON chat_participants 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update last_message_at when new message is added
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations 
  SET last_message_at = NEW.timestamp,
      updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update conversation when message is added
CREATE TRIGGER update_conversation_on_new_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

-- ====================================
-- SAMPLE DATA (Optional - for testing)
-- ====================================

-- Insert sample participants
INSERT INTO chat_participants (address, display_name, avatar_url, is_online) VALUES
('0x1234567890abcdef1234567890abcdef12345678', 'Louise', 'https://randomuser.me/api/portraits/women/1.jpg', true),
('0xabcdef1234567890abcdef1234567890abcdef12', 'Maxime Dubois', 'https://randomuser.me/api/portraits/men/2.jpg', false),
('0x9876543210fedcba9876543210fedcba98765432', 'MarineTech', 'https://randomuser.me/api/portraits/women/3.jpg', true);

-- Insert sample conversation with offer
INSERT INTO conversations (
  id,
  participants, 
  boat_id, 
  offer_price_eth, 
  offer_message, 
  offered_by, 
  offer_status,
  offer_created_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  ARRAY['0x1234567890abcdef1234567890abcdef12345678', '0xabcdef1234567890abcdef1234567890abcdef12'],
  'boat_001',
  2.5,
  'Intéressé par l''achat de votre magnifique yacht!',
  '0xabcdef1234567890abcdef1234567890abcdef12',
  'pending',
  NOW()
);

-- Insert sample messages
INSERT INTO messages (conversation_id, sender_id, content, message_type, read_by) VALUES
('550e8400-e29b-41d4-a716-446655440001', '0xabcdef1234567890abcdef1234567890abcdef12', 'Bonjour! Je suis intéressé par votre bateau.', 'text', ARRAY['0xabcdef1234567890abcdef1234567890abcdef12']),
('550e8400-e29b-41d4-a716-446655440001', '0x1234567890abcdef1234567890abcdef12345678', 'Salut! Merci pour votre intérêt. Que voulez-vous savoir?', 'text', ARRAY['0x1234567890abcdef1234567890abcdef12345678', '0xabcdef1234567890abcdef1234567890abcdef12']),
('550e8400-e29b-41d4-a716-446655440001', '0xabcdef1234567890abcdef1234567890abcdef12', 'Offre: 2.5 ETH - Intéressé par l''achat de votre magnifique yacht!', 'offer', ARRAY['0xabcdef1234567890abcdef1234567890abcdef12']);

-- ====================================
-- VIEWS FOR EASIER QUERYING
-- ====================================

-- View: conversation_summaries
-- Provides a summary of each conversation with last message info
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

-- ====================================
-- FUNCTIONS FOR COMMON OPERATIONS
-- ====================================

-- Function: get_unread_count
-- Returns unread message count for a user in a conversation
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

-- Function: mark_message_read
-- Marks a message as read by a user
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
$$ LANGUAGE plpgsql;

-- ====================================
-- COMMENTS
-- ====================================

COMMENT ON TABLE conversations IS 'Stores chat conversations between users, optionally linked to boat purchases';
COMMENT ON TABLE messages IS 'Stores individual messages within conversations';
COMMENT ON TABLE chat_participants IS 'Stores display information and online status for chat participants';

COMMENT ON COLUMN conversations.participants IS 'Array of wallet addresses participating in the conversation';
COMMENT ON COLUMN conversations.boat_id IS 'Optional reference to the boat being discussed';
COMMENT ON COLUMN conversations.offer_price_eth IS 'ETH amount offered for the boat';
COMMENT ON COLUMN conversations.offer_message IS 'Message accompanying the purchase offer';
COMMENT ON COLUMN conversations.offered_by IS 'Wallet address of the person making the offer';
COMMENT ON COLUMN conversations.offer_status IS 'Status of the purchase offer: pending, accepted, rejected, expired';

COMMENT ON COLUMN messages.read_by IS 'Array of wallet addresses who have read this message';
COMMENT ON COLUMN messages.message_type IS 'Type of message: text, offer, or system notification';
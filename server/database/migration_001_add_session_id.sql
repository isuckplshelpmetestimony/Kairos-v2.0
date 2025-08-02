-- Migration 001: Add session_id column to crisis_chat_conversations table
-- This fixes the critical issue causing runtime crashes in chat functionality

-- Step 1: Check if crisis_chat_conversations table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'crisis_chat_conversations') THEN
        RAISE EXCEPTION 'Table crisis_chat_conversations does not exist. Please run the crisis_intelligence_schema.sql first.';
    END IF;
END $$;

-- Step 2: Add session_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'crisis_chat_conversations' 
        AND column_name = 'session_id'
    ) THEN
        ALTER TABLE crisis_chat_conversations 
        ADD COLUMN session_id VARCHAR(255);
        
        RAISE NOTICE 'Added session_id column to crisis_chat_conversations table';
    ELSE
        RAISE NOTICE 'session_id column already exists in crisis_chat_conversations table';
    END IF;
END $$;

-- Step 3: Create index for session_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_indexes 
        WHERE tablename = 'crisis_chat_conversations' 
        AND indexname = 'idx_crisis_chat_conversations_session'
    ) THEN
        CREATE INDEX idx_crisis_chat_conversations_session 
        ON crisis_chat_conversations(session_id);
        
        RAISE NOTICE 'Created index on session_id column';
    ELSE
        RAISE NOTICE 'Index on session_id already exists';
    END IF;
END $$;

-- Step 4: Verify the migration
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'crisis_chat_conversations' 
AND column_name = 'session_id'; 
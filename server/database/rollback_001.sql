-- Rollback 001: Remove session_id column from crisis_chat_conversations table
-- Use this only if the migration causes issues

-- Step 1: Check if session_id column exists
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'crisis_chat_conversations' 
        AND column_name = 'session_id'
    ) THEN
        -- Step 2: Drop the index first
        DROP INDEX IF EXISTS idx_crisis_chat_conversations_session;
        
        -- Step 3: Remove the session_id column
        ALTER TABLE crisis_chat_conversations 
        DROP COLUMN session_id;
        
        RAISE NOTICE 'Successfully removed session_id column and index from crisis_chat_conversations table';
    ELSE
        RAISE NOTICE 'session_id column does not exist in crisis_chat_conversations table';
    END IF;
END $$;

-- Step 4: Verify the rollback
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'crisis_chat_conversations' 
AND column_name = 'session_id'; 
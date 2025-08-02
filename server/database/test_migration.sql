-- Test Migration: Validation queries for session_id column migration
-- Run these queries to verify the migration was successful

-- 1. Check if crisis_chat_conversations table exists
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'crisis_chat_conversations';

-- 2. Check if session_id column exists and its properties
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'crisis_chat_conversations' 
AND column_name = 'session_id';

-- 3. Check if the index exists
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'crisis_chat_conversations' 
AND indexname = 'idx_crisis_chat_conversations_session';

-- 4. Check table structure (all columns)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'crisis_chat_conversations'
ORDER BY ordinal_position;

-- 5. Check if there's any data in the table
SELECT 
    COUNT(*) as total_rows,
    COUNT(session_id) as rows_with_session_id,
    COUNT(*) - COUNT(session_id) as rows_without_session_id
FROM crisis_chat_conversations;

-- 6. Test inserting a record with session_id
INSERT INTO crisis_chat_conversations (
    company_id, 
    user_id, 
    message_content, 
    message_type, 
    session_id
) VALUES (
    1, 
    1, 
    'Test message for migration validation', 
    'user_question', 
    'test-session-123'
) ON CONFLICT DO NOTHING;

-- 7. Verify the test record was inserted
SELECT 
    id,
    company_id,
    user_id,
    message_content,
    message_type,
    session_id,
    created_at
FROM crisis_chat_conversations 
WHERE session_id = 'test-session-123';

-- 8. Clean up test data
DELETE FROM crisis_chat_conversations 
WHERE session_id = 'test-session-123';

-- 9. Check table constraints
SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'crisis_chat_conversations';

-- 10. Verify foreign key relationships
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'crisis_chat_conversations'; 
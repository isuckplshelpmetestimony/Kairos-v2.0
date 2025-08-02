# Database Migration Execution Steps

## Phase 1: Database Schema Emergency Fix - Day 1

### Pre-Migration Checklist
- [ ] Database connection is working
- [ ] Backup of current database state
- [ ] Application is stopped to prevent data corruption
- [ ] All team members notified of maintenance window

### Step 1: Verify Current Database State
```bash
# Connect to database and run validation queries
psql $DATABASE_URL -f test_migration.sql
```

**Expected Results:**
- crisis_chat_conversations table should exist
- session_id column should NOT exist (this is what we're fixing)
- No errors should occur during validation

### Step 2: Create Database Backup
```bash
# Create backup before migration
pg_dump $DATABASE_URL > backup_before_migration_001.sql
```

### Step 3: Apply the Migration
```bash
# Run the migration script
psql $DATABASE_URL -f migration_001_add_session_id.sql
```

**Expected Output:**
- "Added session_id column to crisis_chat_conversations table"
- "Created index on session_id column"
- Verification query should show session_id column details

### Step 4: Validate the Migration
```bash
# Run comprehensive validation
psql $DATABASE_URL -f test_migration.sql
```

**Validation Checklist:**
- [ ] crisis_chat_conversations table exists
- [ ] session_id column exists with VARCHAR(255) type
- [ ] session_id column allows NULL values
- [ ] Index on session_id exists
- [ ] Test insert/delete operations work
- [ ] Foreign key relationships are intact

### Step 5: Test Application Functionality
```bash
# Start the application
npm start

# Test chat functionality
# Navigate to crisis intelligence page
# Try sending a message in chat
# Verify no runtime crashes occur
```

### Step 6: Monitor for Issues
- Watch application logs for errors
- Monitor database performance
- Check if chat functionality works correctly
- Verify all existing data is intact

### Rollback Plan (if needed)
If issues occur:
```bash
# Stop the application
# Run rollback script
psql $DATABASE_URL -f rollback_001.sql

# Restore from backup if necessary
psql $DATABASE_URL < backup_before_migration_001.sql
```

### Post-Migration Verification
- [ ] Chat functionality works without errors
- [ ] All existing data is intact
- [ ] Application starts successfully
- [ ] No performance degradation
- [ ] Session management works correctly

### Documentation
- [ ] Update schema documentation
- [ ] Record migration in deployment log
- [ ] Update team on successful completion
- [ ] Schedule follow-up monitoring

## Success Criteria
- ✅ session_id column added to crisis_chat_conversations
- ✅ Chat functionality works without runtime crashes
- ✅ All existing data preserved
- ✅ Application performance maintained
- ✅ No breaking changes to existing functionality

## Next Steps
After successful migration:
1. Monitor application for 24 hours
2. Plan Phase 2: Schema consolidation
3. Address remaining technical debt items
4. Implement comprehensive testing strategy 
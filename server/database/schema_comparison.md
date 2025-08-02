# Schema Comparison Analysis

## Overview
This document compares the three schema files in the Kairos project to identify inconsistencies and missing elements.

## Files Analyzed
1. `schema.sql` - Original schema (39 lines)
2. `schema_updated.sql` - Updated schema (65 lines) 
3. `crisis_intelligence_schema.sql` - Crisis intelligence schema (88 lines)

## Key Differences Found

### 1. Missing Tables in schema.sql
- `crisis_companies` table (exists in both updated schemas)
- `crisis_signals` table (exists in crisis_intelligence_schema.sql)
- `company_decision_makers` table (exists in crisis_intelligence_schema.sql)
- `crisis_chat_conversations` table (exists in crisis_intelligence_schema.sql)
- `conversation_states` table (exists in crisis_intelligence_schema.sql)

### 2. Missing Columns in schema_updated.sql
- `crisis_chat_conversations` table is missing entirely
- `conversation_states` table is missing entirely
- `crisis_signals` table is missing entirely
- `company_decision_makers` table is missing entirely

### 3. Column Differences in crisis_companies
**schema_updated.sql:**
- `crisis_category VARCHAR(100)` (no constraints)
- `decision_maker_name VARCHAR(255)`
- `decision_maker_title VARCHAR(255)`
- `decision_maker_email VARCHAR(255)`
- `decision_maker_phone VARCHAR(50)`
- `decision_maker_seniority VARCHAR(100)`
- `decision_authority_level INTEGER`

**crisis_intelligence_schema.sql:**
- `crisis_category VARCHAR(30) CHECK (crisis_category IN ('active_challenges', 'exploring_solutions', 'planning_transformation'))`
- No decision maker columns (separate table)

### 4. Critical Issue: Missing session_id Column
The `crisis_chat_conversations` table in crisis_intelligence_schema.sql has:
```sql
session_id VARCHAR(255),
```

But this column may be missing from the actual database, causing runtime crashes.

### 5. Admin User Differences
- `schema.sql`: `'your-admin-email@gmail.com'` (placeholder)
- `schema_updated.sql`: `'seanmacalintal0409@gmail.com'` (actual email)

## Recommended Actions

### Priority 1: Critical Fix
1. Add missing `session_id` column to `crisis_chat_conversations` table
2. Verify all required tables exist in database
3. Ensure proper constraints and indexes are in place

### Priority 2: Schema Consolidation
1. Merge the three schema files into one comprehensive schema
2. Remove duplicate table definitions
3. Standardize column types and constraints

### Priority 3: Data Migration
1. Migrate existing data to new schema structure
2. Update application code to use consistent schema
3. Add proper foreign key relationships

## Validation Checklist
- [ ] crisis_chat_conversations table exists
- [ ] session_id column exists in crisis_chat_conversations
- [ ] All required indexes exist
- [ ] Chat functionality works without errors
- [ ] All existing data is intact 
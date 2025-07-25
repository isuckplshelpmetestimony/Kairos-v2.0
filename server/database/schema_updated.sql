-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'free' CHECK (role IN ('admin', 'premium', 'free')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'pending', 'expired')),
    premium_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment submissions table
CREATE TABLE payment_submissions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    amount DECIMAL(10, 2) DEFAULT 3000.00,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP,
    approved_by INTEGER REFERENCES users(id)
);

-- Sessions table (for JWT blacklisting)
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add view mode to user_sessions
ALTER TABLE user_sessions
ADD COLUMN current_view_mode VARCHAR(20) DEFAULT 'events'
CHECK (current_view_mode IN ('events', 'intelligence'));

-- Crisis Companies table for Crisis Intelligence data
CREATE TABLE crisis_companies (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    company_domain VARCHAR(255),
    industry_sector VARCHAR(255),
    employee_count INTEGER,
    annual_revenue BIGINT,
    headquarters_location VARCHAR(255),
    crisis_score INTEGER,
    crisis_category VARCHAR(100),
    primary_crisis_signals TEXT,
    decision_maker_name VARCHAR(255),
    decision_maker_title VARCHAR(255),
    decision_maker_email VARCHAR(255),
    decision_maker_phone VARCHAR(50),
    decision_maker_seniority VARCHAR(100),
    decision_authority_level INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert admin user with correct credentials
INSERT INTO users (email, phone, password_hash, role, status)
VALUES ('seanmacalintal0409@gmail.com', '09291860540', '$2b$10$FGyFhUbxKx1jA/fabLUg2e/F72jGiAzWLJXGmFcaRE3rVjg6njHfS', 'admin', 'active'); 

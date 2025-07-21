-- Companies master table (following your SERIAL PRIMARY KEY pattern)
CREATE TABLE crisis_companies (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  company_domain VARCHAR(255) UNIQUE,
  industry_sector VARCHAR(100) NOT NULL,
  employee_count INTEGER,
  annual_revenue BIGINT,
  headquarters_location VARCHAR(255),
  crisis_score INTEGER CHECK (crisis_score >= 1 AND crisis_score <= 10),
  crisis_category VARCHAR(30) CHECK (crisis_category IN ('active_challenges', 'exploring_solutions', 'planning_transformation')),
  crisis_confidence_level DECIMAL(3,2) CHECK (crisis_confidence_level >= 0 AND crisis_confidence_level <= 1),
  last_intelligence_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crisis signals table
CREATE TABLE crisis_signals (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES crisis_companies(id) ON DELETE CASCADE,
  signal_type VARCHAR(50) CHECK (signal_type IN ('financial_distress', 'leadership_change', 'layoffs', 'budget_cuts', 'website_redesign', 'job_postings', 'press_releases', 'conference_speaking', 'event_attendance', 'vendor_evaluation', 'solution_research', 'regulatory_change', 'competitor_threat', 'market_disruption')),
  signal_title VARCHAR(500) NOT NULL,
  signal_description TEXT NOT NULL,
  signal_source VARCHAR(255) NOT NULL,
  signal_url TEXT,
  signal_date DATE NOT NULL,
  impact_weight DECIMAL(3,2) CHECK (impact_weight >= 0 AND impact_weight <= 1),
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  temporal_relevance DECIMAL(3,2) CHECK (temporal_relevance >= 0 AND temporal_relevance <= 1),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Decision makers table
CREATE TABLE company_decision_makers (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES crisis_companies(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  job_title VARCHAR(255) NOT NULL,
  department VARCHAR(100),
  seniority_level VARCHAR(30) CHECK (seniority_level IN ('c_suite', 'vp_level', 'director_level', 'manager_level', 'individual_contributor')),
  email_address VARCHAR(255),
  phone_number VARCHAR(50),
  linkedin_profile VARCHAR(500),
  decision_authority_level INTEGER CHECK (decision_authority_level >= 1 AND decision_authority_level <= 5),
  transformation_influence_score DECIMAL(3,2) CHECK (transformation_influence_score >= 0 AND transformation_influence_score <= 1),
  last_contact_attempt TIMESTAMP,
  contact_success_rate DECIMAL(3,2) DEFAULT 0,
  is_primary_contact BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat conversations table
CREATE TABLE crisis_chat_conversations (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES crisis_companies(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  message_content TEXT NOT NULL,
  message_type VARCHAR(20) CHECK (message_type IN ('user_question', 'ai_response', 'system_notification')),
  ai_context_used TEXT,
  response_time_ms INTEGER,
  user_satisfaction_rating INTEGER CHECK (user_satisfaction_rating >= 1 AND user_satisfaction_rating <= 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_crisis_companies_category ON crisis_companies(crisis_category);
CREATE INDEX idx_crisis_companies_score ON crisis_companies(crisis_score DESC);
CREATE INDEX idx_crisis_signals_company ON crisis_signals(company_id, signal_date DESC);
CREATE INDEX idx_crisis_signals_type ON crisis_signals(signal_type);
CREATE INDEX idx_decision_makers_company ON company_decision_makers(company_id);
CREATE INDEX idx_chat_conversations_company ON crisis_chat_conversations(company_id, created_at DESC); 
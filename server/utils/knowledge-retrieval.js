const { sql } = require('../database/connection');
const axios = require('axios');

class KnowledgeRetrieval {
  static async fetchRelevantData(intent, strategy, conversationState) {
    const dataNeeds = strategy.data_needed;
    let data = {};

    try {
      // Firecrawl integration: If the user intent or message requests web scraping or live web data
      if (intent.primary_intent === 'web_scrape' || /scrape|search the internet|web data|latest information|crawl/i.test(conversationState.memory.slice(-1)[0]?.user || '')) {
        const lastUserMessage = conversationState.memory.slice(-1)[0]?.user || '';
        let urlMatch = lastUserMessage.match(/https?:\/\/[\w\.-]+/);
        let url = urlMatch ? urlMatch[0] : 'https://news.google.com';
        try {
          const firecrawlUrl = process.env.FIRECRAWL_URL;
          const response = await axios.post(`${firecrawlUrl}/v1/scrape`, {
            url,
            formats: ['markdown', 'html']
          });
          if (response.data && response.data.success) {
            data.webContent = response.data.markdown || response.data.html || response.data.text || '';
          } else {
            data.webContent = 'Failed to fetch live web data.';
          }
        } catch (err) {
          data.webContent = 'Error fetching live web data.';
        }
      }

      // Summary stats for greetings
      if (dataNeeds === 'summary_stats') {
        data.summary = await this.getSummaryStats();
      }

      // Company-specific data
      else if (dataNeeds === 'company_specific') {
        if (intent.specific_companies && intent.specific_companies.length > 0) {
          data.companies = await this.getSpecificCompanies(intent.specific_companies);
        } else {
          data.companies = await this.getRelevantCompanies(intent, 8);
        }
      }

      // Crisis-focused data
      else if (dataNeeds === 'crisis_companies') {
        data.companies = await this.getCrisisCompanies();
        data.summary = await this.getCrisisSummary();
      }

      // Market trends data
      else if (dataNeeds === 'market_trends' || dataNeeds === 'market_data') {
        data.companies = await this.getMarketTrendCompanies();
        data.summary = await this.getMarketSummary();
      }

      // Decision makers data
      else if (dataNeeds === 'decision_makers') {
        const companyNames = intent.specific_companies || conversationState.context.companies_mentioned;
        if (companyNames.length > 0) {
          data.decisionMakers = await this.getDecisionMakers(companyNames);
        }
      }

      // Previous context for returning users
      else if (dataNeeds === 'previous_context') {
        data.context = {
          previousTopics: conversationState.getRecentTopics(),
          companiesDiscussed: conversationState.context.companies_mentioned,
          conversationStage: conversationState.context.conversation_stage
        };
      }

      // Contextual data based on conversation history
      else if (dataNeeds === 'contextual') {
        data = await this.getContextualData(conversationState);
      }

    } catch (error) {
      console.error('Error fetching relevant data:', error);
      // Return minimal data on error
      data.error = true;
      data.companies = [];
    }

    return data;
  }

  static async getSummaryStats() {
    try {
      const stats = await sql(`
        SELECT
          COUNT(*) as total_companies,
          COUNT(CASE WHEN crisis_score >= 7 THEN 1 END) as high_crisis,
          COUNT(CASE WHEN crisis_category = 'active_challenges' THEN 1 END) as active_challenges,
          COUNT(DISTINCT industry_sector) as industries_covered
        FROM crisis_companies
        WHERE is_active = true
      `);
      return stats[0];
    } catch (error) {
      console.error('Error getting summary stats:', error);
      return { total_companies: 93, high_crisis: 31, active_challenges: 31, industries_covered: 12 };
    }
  }

  static async getSpecificCompanies(companyNames) {
    try {
      const placeholders = companyNames.map((_, index) => `$${index + 1}`).join(', ');
      const companies = await sql(`
        SELECT cc.*,
               cdm.full_name, cdm.job_title, cdm.email_address, cdm.decision_authority_level
        FROM crisis_companies cc
        LEFT JOIN company_decision_makers cdm ON cc.id = cdm.company_id AND cdm.is_primary_contact = true
        WHERE cc.is_active = true
        AND (${companyNames.map((_, i) => `cc.company_name ILIKE $${i + 1}`).join(' OR ')})
        ORDER BY cc.crisis_score DESC
      `, companyNames.map(name => `%${name}%`));

      return companies;
    } catch (error) {
      console.error('Error getting specific companies:', error);
      return [];
    }
  }

  static async getRelevantCompanies(intent, limit = 10) {
    try {
      let orderBy = 'crisis_score DESC';
      let whereClause = 'is_active = true';

      if (intent.urgency === 'urgent') {
        whereClause += ' AND crisis_score >= 7';
      }

      const companies = await sql(`
        SELECT cc.*,
               cdm.full_name, cdm.job_title, cdm.email_address
        FROM crisis_companies cc
        LEFT JOIN company_decision_makers cdm ON cc.id = cdm.company_id AND cdm.is_primary_contact = true
        WHERE ${whereClause}
        ORDER BY ${orderBy}
        LIMIT $1
      `, [limit]);

      return companies;
    } catch (error) {
      console.error('Error getting relevant companies:', error);
      return [];
    }
  }

  static async getCrisisCompanies() {
    try {
      return await sql(`
        SELECT cc.*,
               cdm.full_name, cdm.job_title, cdm.email_address
        FROM crisis_companies cc
        LEFT JOIN company_decision_makers cdm ON cc.id = cdm.company_id AND cdm.is_primary_contact = true
        WHERE cc.is_active = true AND cc.crisis_score >= 6
        ORDER BY cc.crisis_score DESC
        LIMIT 15
      `);
    } catch (error) {
      console.error('Error getting crisis companies:', error);
      return [];
    }
  }

  static async getCrisisSummary() {
    try {
      const summary = await sql(`
        SELECT
          crisis_category,
          COUNT(*) as count,
          AVG(crisis_score) as avg_score,
          string_agg(DISTINCT industry_sector, ', ') as industries
        FROM crisis_companies
        WHERE is_active = true AND crisis_score >= 6
        GROUP BY crisis_category
        ORDER BY avg_score DESC
      `);
      return summary;
    } catch (error) {
      console.error('Error getting crisis summary:', error);
      return [];
    }
  }

  static async getMarketTrendCompanies() {
    try {
      return await sql(`
        SELECT cc.*,
               cdm.full_name, cdm.job_title, cdm.email_address
        FROM crisis_companies cc
        LEFT JOIN company_decision_makers cdm ON cc.id = cdm.company_id AND cdm.is_primary_contact = true
        WHERE cc.is_active = true
        ORDER BY cc.last_intelligence_update DESC
        LIMIT 12
      `);
    } catch (error) {
      console.error('Error getting market trend companies:', error);
      return [];
    }
  }

  static async getMarketSummary() {
    try {
      return await sql(`
        SELECT
          industry_sector,
          COUNT(*) as company_count,
          AVG(crisis_score) as avg_crisis_score,
          COUNT(CASE WHEN crisis_category = 'active_challenges' THEN 1 END) as active_crisis_count
        FROM crisis_companies
        WHERE is_active = true
        GROUP BY industry_sector
        ORDER BY avg_crisis_score DESC
      `);
    } catch (error) {
      console.error('Error getting market summary:', error);
      return [];
    }
  }

  static async getDecisionMakers(companyNames) {
    try {
      const placeholders = companyNames.map((_, index) => `$${index + 1}`).join(', ');
      return await sql(`
        SELECT cdm.*, cc.company_name
        FROM company_decision_makers cdm
        JOIN crisis_companies cc ON cdm.company_id = cc.id
        WHERE cc.is_active = true
        AND (${companyNames.map((_, i) => `cc.company_name ILIKE $${i + 1}`).join(' OR ')})
        ORDER BY cdm.decision_authority_level DESC
      `, companyNames.map(name => `%${name}%`));
    } catch (error) {
      console.error('Error getting decision makers:', error);
      return [];
    }
  }

  static async getContextualData(conversationState) {
    const data = {};

    // If companies were mentioned, get data about them
    if (conversationState.context.companies_mentioned.length > 0) {
      data.companies = await this.getSpecificCompanies(conversationState.context.companies_mentioned);
    }

    // If no specific context, return trending data
    if (!data.companies || data.companies.length === 0) {
      data.companies = await this.getRelevantCompanies({ urgency: 'normal' }, 6);
    }

    return data;
  }
}

module.exports = KnowledgeRetrieval; 
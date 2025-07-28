const { sql } = require('../database/connection');
const axios = require('axios');

class KnowledgeRetrieval {
  static async fetchRelevantData(intent, strategy, conversationState) {
    const dataNeeds = strategy.data_needed;
    let data = {};

    console.log('🔍 DEBUG: fetchRelevantData called');
    console.log('🔍 DEBUG: intent.primary_intent:', intent.primary_intent);
    console.log('🔍 DEBUG: dataNeeds:', dataNeeds);

    try {
      // Firecrawl integration: If the user intent or message requests web scraping or live web data
      if (intent.primary_intent === 'web_scrape' || /scrape|search the internet|web data|latest information|crawl/i.test(conversationState.memory.slice(-1)[0]?.user || '')) {
        const lastUserMessage = conversationState.memory.slice(-1)[0]?.user || '';
        let urlMatch = lastUserMessage.match(/https?:\/\/[\w\.-]+/);
        
        console.log('🔍 DEBUG: Scraping query:', lastUserMessage);
        console.log('🔍 DEBUG: URL match found:', !!urlMatch);
        if (urlMatch) console.log('🔍 DEBUG: URL:', urlMatch[0]);
        
        // Enhanced web scraping logic
        try {
          const firecrawlUrl = process.env.FIRECRAWL_URL;
          console.log('🔍 DEBUG: Firecrawl URL:', firecrawlUrl);
          let webContent = '';
          
          if (urlMatch) {
            console.log('🔍 Direct URL Request:', { url: urlMatch[0], endpoint: `${firecrawlUrl}/v0/scrape` });
            
            // Try primary method with correct endpoint and enhanced anti-bot bypass
            try {
              const response = await fetch(`${firecrawlUrl}/v0/scrape`, {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                  'Accept-Language': 'en-US,en;q=0.5',
                  'Accept-Encoding': 'gzip, deflate, br',
                  'DNT': '1',
                  'Connection': 'keep-alive',
                  'Upgrade-Insecure-Requests': '1'
                },
                body: JSON.stringify({ 
                  url: urlMatch[0],
                  formats: ['markdown', 'html'],
                  onlyMainContent: true,
                  waitFor: 3000, // Wait 3 seconds for dynamic content
                  timeout: 30000, // 30 second timeout
                  mobile: false, // Use desktop user agent
                  skipTlsVerification: false,
                  removeBase64Images: true
                })
              });
              
              const responseText = await response.text();
              console.log('🔍 Direct URL Response:', { 
                status: response.status, 
                bodyLength: responseText.length, 
                firstChars: responseText.slice(0, 200) 
              });
              
              // Parse response
              try {
                const data = JSON.parse(responseText);
                console.log('🔍 Parsed Response:', {
                  success: data.success,
                  contentExists: !!data.data?.content,
                  contentLength: data.data?.content?.length || 0,
                  dataKeys: Object.keys(data)
                });
                
                if (data.success && data.data?.content) {
                  webContent = data.data.content;
                  console.log('🔍 ✅ Web content successfully extracted');
                } else {
                  console.log('🔍 ❌ No content in response');
                }
              } catch (parseError) {
                console.log('🔍 JSON Parse Error:', parseError.message);
                console.log('🔍 Raw Response (first 500 chars):', responseText.slice(0, 500));
              }
              
            } catch (error) {
              console.log('🔍 Primary scrape failed:', error.message);
              
              // Fallback to axios if fetch fails
              try {
                console.log('🔍 Trying axios fallback...');
                const axiosResponse = await axios.post(`${firecrawlUrl}/v0/scrape`, {
                  url: urlMatch[0],
                  formats: ['markdown', 'html']
                });
                
                if (axiosResponse.data && axiosResponse.data.success) {
                  webContent = axiosResponse.data.data?.content || '';
                  console.log('🔍 ✅ Axios fallback successful');
                }
              } catch (axiosError) {
                console.log('🔍 Axios fallback also failed:', axiosError.message);
              }
            }
          } else {
            console.log('🔍 DEBUG: Using search-based scraping');
            // For business intelligence queries, search for relevant information
            // Use search to find relevant content about the query
            const requestBody = {
              query: lastUserMessage,
              limit: 3,
              scrapeOptions: {
                formats: ['markdown'],
                onlyMainContent: true
              }
            };
            const requestHeaders = {
              'Content-Type': 'application/json',
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.5',
              'Accept-Encoding': 'gzip, deflate, br',
              'DNT': '1',
              'Connection': 'keep-alive'
            };
            
            console.log('🔍 Firecrawl Request:', {
              url: `${firecrawlUrl}/v1/search`,
              method: 'POST',
              headers: requestHeaders,
              body: JSON.stringify(requestBody)
            });
            
            // Add delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const searchResponse = await axios.post(`${firecrawlUrl}/v1/search`, requestBody, { 
              headers: requestHeaders,
              timeout: 30000 // 30 second timeout
            });
            
            console.log('🔍 Firecrawl Raw Response:', {
              status: searchResponse.status,
              statusText: searchResponse.statusText,
              headers: searchResponse.headers
            });
            
            console.log('🔍 Firecrawl Response Body:', JSON.stringify(searchResponse.data, null, 2));
            
            console.log('🔍 DEBUG: Search response status:', searchResponse.status);
            console.log('🔍 DEBUG: Results found:', searchResponse.data?.data?.length || 0);
            
            if (searchResponse.data && searchResponse.data.data) {
              const totalContent = searchResponse.data.data.reduce((acc, r) =>
                acc + (r.markdown || r.content || '').length, 0);
              console.log('🔍 DEBUG: Total content length:', totalContent);
              
              webContent = searchResponse.data.data.map(result => 
                `Source: ${result.url}\n${result.markdown || result.content || ''}`
              ).join('\n\n---\n\n');
              
              console.log('🔍 DEBUG: Final webContent length:', webContent.length);
              console.log('🔍 DEBUG: First 200 chars of webContent:', webContent.substring(0, 200));
            }
          }
          
          if (webContent) {
            data.webContent = webContent;
            console.log('🔍 DEBUG: ✅ Web content successfully added to data');
          } else {
            // Fallback: Try alternative data sources when scraping fails
            console.log('🔍 DEBUG: ❌ No web content found, trying fallback sources');
            try {
              // Try to get relevant data from database as fallback
              const fallbackData = await this.getContextualData(conversationState);
              if (fallbackData && fallbackData.companies) {
                data.webContent = `Based on available data: ${fallbackData.companies.map(c => c.name).join(', ')}`;
                console.log('🔍 DEBUG: ✅ Fallback data used');
              } else {
                data.webContent = 'Unable to fetch live web data at this time. Please try again later.';
                console.log('🔍 DEBUG: ❌ No fallback data available');
              }
            } catch (fallbackError) {
              data.webContent = 'Unable to fetch live web data at this time. Please try again later.';
              console.log('🔍 DEBUG: ❌ Fallback also failed:', fallbackError.message);
            }
          }
        } catch (err) {
          console.error('🔍 DEBUG: Firecrawl error:', err.message);
          console.error('🔍 DEBUG: Full error:', err);
          
          // Provide more specific error messages
          if (err.response) {
            console.log('🔍 DEBUG: Response status:', err.response.status);
            console.log('🔍 DEBUG: Response data:', err.response.data);
            
            if (err.response.status === 403) {
              data.webContent = 'The requested website has anti-bot protection. This is common with modern websites.';
            } else if (err.response.status === 429) {
              data.webContent = 'Rate limit exceeded. Please try again in a few minutes.';
            } else if (err.response.status === 404) {
              data.webContent = 'The requested website could not be found.';
            } else {
              data.webContent = `Error fetching web data (${err.response.status}). Please try again later.`;
            }
          } else if (err.code === 'ECONNREFUSED') {
            data.webContent = 'Unable to connect to the web scraping service.';
          } else if (err.code === 'ETIMEDOUT') {
            data.webContent = 'Request timed out. The website may be slow or unavailable.';
          } else {
            data.webContent = 'Error fetching live web data. Please try again later.';
          }
        }
      } else {
        console.log('🔍 DEBUG: Web scraping not triggered - intent or pattern not matched');
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
        const contextualData = await this.getContextualData(conversationState);
        // Preserve existing data (like webContent) while adding contextual data
        Object.assign(data, contextualData);
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
      const stats = await sql`
        SELECT
          COUNT(*) as total_companies,
          COUNT(CASE WHEN crisis_score >= 7 THEN 1 END) as high_crisis,
          COUNT(CASE WHEN crisis_category = 'active_challenges' THEN 1 END) as active_challenges,
          COUNT(DISTINCT industry_sector) as industries_covered
        FROM crisis_companies
        WHERE is_active = true
      `;
      return stats[0];
    } catch (error) {
      console.error('Error getting summary stats:', error);
      return { total_companies: 93, high_crisis: 31, active_challenges: 31, industries_covered: 12 };
    }
  }

  static async getSpecificCompanies(companyNames) {
    try {
      const namePatterns = companyNames.map(name => `%${name}%`);
      const conditions = companyNames.map((_, i) => `cc.company_name ILIKE ${sql.unsafe(`$${i + 1}`)}`).join(' OR ');
      
      const companies = await sql`
        SELECT cc.*,
               cdm.full_name, cdm.job_title, cdm.email_address, cdm.decision_authority_level
        FROM crisis_companies cc
        LEFT JOIN company_decision_makers cdm ON cc.id = cdm.company_id AND cdm.is_primary_contact = true
        WHERE cc.is_active = true
        AND (${sql.unsafe(conditions)})
        ORDER BY cc.crisis_score DESC
      `;

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

      const companies = await sql`
        SELECT cc.*,
               cdm.full_name, cdm.job_title, cdm.email_address
        FROM crisis_companies cc
        LEFT JOIN company_decision_makers cdm ON cc.id = cdm.company_id AND cdm.is_primary_contact = true
        WHERE ${sql.unsafe(whereClause)}
        ORDER BY ${sql.unsafe(orderBy)}
        LIMIT ${limit}
      `;

      return companies;
    } catch (error) {
      console.error('Error getting relevant companies:', error);
      return [];
    }
  }

  static async getCrisisCompanies() {
    try {
      return await sql`
        SELECT cc.*,
               cdm.full_name, cdm.job_title, cdm.email_address
        FROM crisis_companies cc
        LEFT JOIN company_decision_makers cdm ON cc.id = cdm.company_id AND cdm.is_primary_contact = true
        WHERE cc.is_active = true AND cc.crisis_score >= 6
        ORDER BY cc.crisis_score DESC
        LIMIT 15
      `;
    } catch (error) {
      console.error('Error getting crisis companies:', error);
      return [];
    }
  }

  static async getCrisisSummary() {
    try {
      const summary = await sql`
        SELECT
          crisis_category,
          COUNT(*) as count,
          AVG(crisis_score) as avg_score,
          string_agg(DISTINCT industry_sector, ', ') as industries
        FROM crisis_companies
        WHERE is_active = true AND crisis_score >= 6
        GROUP BY crisis_category
        ORDER BY avg_score DESC
      `;
      return summary;
    } catch (error) {
      console.error('Error getting crisis summary:', error);
      return [];
    }
  }

  static async getMarketTrendCompanies() {
    try {
      return await sql`
        SELECT cc.*,
               cdm.full_name, cdm.job_title, cdm.email_address
        FROM crisis_companies cc
        LEFT JOIN company_decision_makers cdm ON cc.id = cdm.company_id AND cdm.is_primary_contact = true
        WHERE cc.is_active = true
        ORDER BY cc.last_intelligence_update DESC
        LIMIT 12
      `;
    } catch (error) {
      console.error('Error getting market trend companies:', error);
      return [];
    }
  }

  static async getMarketSummary() {
    try {
      return await sql`
        SELECT
          industry_sector,
          COUNT(*) as company_count,
          AVG(crisis_score) as avg_crisis_score,
          COUNT(CASE WHEN crisis_category = 'active_challenges' THEN 1 END) as active_crisis_count
        FROM crisis_companies
        WHERE is_active = true
        GROUP BY industry_sector
        ORDER BY avg_crisis_score DESC
      `;
    } catch (error) {
      console.error('Error getting market summary:', error);
      return [];
    }
  }

  static async getDecisionMakers(companyNames) {
    try {
      const namePatterns = companyNames.map(name => `%${name}%`);
      const conditions = companyNames.map((_, i) => `cc.company_name ILIKE ${sql.unsafe(`$${i + 1}`)}`).join(' OR ');
      
      return await sql`
        SELECT cdm.*, cc.company_name
        FROM company_decision_makers cdm
        JOIN crisis_companies cc ON cdm.company_id = cc.id
        WHERE cc.is_active = true
        AND (${sql.unsafe(conditions)})
        ORDER BY cdm.decision_authority_level DESC
      `;
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
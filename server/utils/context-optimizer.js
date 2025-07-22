class ContextOptimizer {
  static optimizeForFreeGemini(companyData, webData, userMessage) {
    // Gemini free tier has context limits, so we need to be smart
    const contextBudget = 30000; // Characters (conservative estimate)
    let optimizedContext = {};

    // Prioritize based on user query relevance
    const relevantCompanies = this.findRelevantCompanies(companyData, userMessage);
    const relevantWebData = this.findRelevantWebData(webData, userMessage);

    // Build context within limits
    optimizedContext.companies = relevantCompanies.slice(0, 15); // Top 15 most relevant
    optimizedContext.webData = relevantWebData.slice(0, 5); // Top 5 web sources

    // Calculate context size and trim if needed
    const contextSize = JSON.stringify(optimizedContext).length;
    if (contextSize > contextBudget) {
      optimizedContext = this.trimContext(optimizedContext, contextBudget);
    }

    return optimizedContext;
  }

  static findRelevantCompanies(companyData, userMessage) {
    if (!companyData?.companies) return [];

    return companyData.companies
      .map(company => ({
        ...company,
        relevanceScore: this.calculateRelevance(company, userMessage)
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .map(({ relevanceScore, ...company }) => company);
  }

  static calculateRelevance(company, userMessage) {
    let score = 0;
    const lowerMessage = userMessage.toLowerCase();
    const lowerCompanyName = company.name.toLowerCase();
    const lowerIndustry = company.industry.toLowerCase();
    const lowerSignals = company.crisis_signals.toLowerCase();

    // Exact company name match
    if (lowerMessage.includes(lowerCompanyName)) score += 100;

    // Industry match
    if (lowerMessage.includes(lowerIndustry)) score += 50;

    // Crisis category match
    if (lowerMessage.includes(company.crisis_category.replace('_', ' '))) score += 30;

    // Signal keywords match
    const signalKeywords = ['layoff', 'ceo', 'digital', 'transformation', 'crisis'];
    signalKeywords.forEach(keyword => {
      if (lowerMessage.includes(keyword) && lowerSignals.includes(keyword)) {
        score += 20;
      }
    });

    // High crisis score bonus for urgent queries
    if (lowerMessage.includes('urgent') || lowerMessage.includes('crisis')) {
      score += company.crisis_score * 5;
    }

    return score;
  }

  static findRelevantWebData(webData, userMessage) {
    if (!webData || webData.length === 0) return [];

    return webData
      .filter(item => item.success && item.data?.content)
      .map(item => ({
        ...item,
        relevanceScore: this.calculateWebRelevance(item, userMessage)
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .map(({ relevanceScore, ...item }) => item);
  }

  static calculateWebRelevance(webItem, userMessage) {
    const content = webItem.data?.content?.toLowerCase() || '';
    const lowerMessage = userMessage.toLowerCase();

    let score = 0;
    const keywords = lowerMessage.split(' ').filter(word => word.length > 3);

    keywords.forEach(keyword => {
      const occurrences = (content.match(new RegExp(keyword, 'g')) || []).length;
      score += occurrences * 10;
    });

    return score;
  }

  static trimContext(context, budgetLimit) {
    // Recursively trim context to fit within budget
    while (JSON.stringify(context).length > budgetLimit) {
      if (context.companies.length > 5) {
        context.companies = context.companies.slice(0, -1);
      } else if (context.webData.length > 2) {
        context.webData = context.webData.slice(0, -1);
      } else {
        // Trim content from existing items
        context.companies.forEach(company => {
          if (company.crisis_signals.length > 300) {
            company.crisis_signals = company.crisis_signals.substring(0, 300) + '...';
          }
        });
        break;
      }
    }

    return context;
  }
}

module.exports = ContextOptimizer; 
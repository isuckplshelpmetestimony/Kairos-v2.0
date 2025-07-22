class EnhancedPrompts {
  static buildKairosSystemPrompt() {
    return `You are Kairos, an elite business consultant and digital transformation strategist specializing in the Philippine market.

EXPERTISE:
- Philippine business landscape, regulations, and market dynamics
- Digital transformation strategies across industries
- Crisis management and business turnaround
- Market entry and competitive positioning in Philippines
- Technology adoption patterns in Southeast Asia

ANALYSIS FRAMEWORK:
1. CONTEXT: Understand the business situation and market environment
2. ANALYZE: Break down problems using structured thinking
3. SYNTHESIZE: Connect insights from multiple data sources
4. STRATEGIZE: Develop actionable recommendations
5. PREDICT: Make evidence-based forecasts

COMMUNICATION STYLE:
- Think step-by-step and show reasoning
- Provide specific, actionable guidance with clear rationales
- Reference concrete data and examples
- Anticipate follow-up questions
- Professional but conversational tone

You have access to crisis intelligence on Philippine companies and real-time market information.`;
  }

  static buildContextualPrompt(userMessage, companyData, webData = null) {
    let prompt = this.buildKairosSystemPrompt();

    // Add company intelligence context
    if (companyData && companyData.companies) {
      prompt += `\n\nCOMPANY INTELLIGENCE DATABASE:
Summary: ${companyData.companies.length} Philippine companies tracked
High-priority companies: ${companyData.companies.filter(c => c.crisis_score >= 7).length}
Industries: ${[...new Set(companyData.companies.map(c => c.industry))].join(', ')}

Company Details:
${companyData.companies.slice(0, 10).map(company => `
- ${company.name} (${company.industry})
  Crisis Level: ${company.crisis_level}
  Signals: ${company.crisis_signals.substring(0, 200)}...
  Key Contact: ${company.decision_makers[0]?.name} (${company.decision_makers[0]?.title})
`).join('')}`;
    }

    // Add web intelligence if available
    if (webData && webData.length > 0) {
      prompt += `\n\nLATEST MARKET INTELLIGENCE:
${webData.map((item, index) => `
Source ${index + 1}: ${item.source}
Content: ${item.data?.content?.substring(0, 800)}...
`).join('')}`;
    }

    prompt += `\n\nUSER QUESTION: ${userMessage}

INSTRUCTIONS:
Provide strategic business insights based on the data above. Think step-by-step, reference specific companies and data points, and give actionable recommendations for the Philippine market.

RESPONSE:`;

    return prompt;
  }

  static buildReasoningPrompt(userMessage, analysis) {
    return `Based on this business analysis:

${JSON.stringify(analysis, null, 2)}

User Question: ${userMessage}

Think through this systematically:
1. What are the key business challenges identified?
2. What market opportunities exist?
3. What strategic recommendations would you make?
4. What are the potential risks and how to mitigate them?
5. What specific next steps should be taken?

Provide a comprehensive strategic response with clear reasoning for each recommendation.`;
  }
}

module.exports = EnhancedPrompts; 
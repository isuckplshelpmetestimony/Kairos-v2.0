// Maps old company stages to new readiness levels
export function mapCompanyStageToReadiness(oldStages: string[]): string {
  // Recognize both emoji and plain text readiness values
  const readinessLevels = [
    '🚨 Needs Immediate Help',
    '🔍 Exploring Solutions',
    '📋 Planning Transformation',
    'Needs Immediate Help',
    'Exploring Solutions',
    'Planning Transformation'
  ];
  const directMatch = oldStages.find(stage => readinessLevels.includes(stage));
  if (directMatch) {
    switch (directMatch) {
      case 'Needs Immediate Help': return '🚨 Needs Immediate Help';
      case 'Exploring Solutions': return '🔍 Exploring Solutions';
      case 'Planning Transformation': return '📋 Planning Transformation';
      default: return directMatch;
    }
  }

  // If stages include early-stage companies (high urgency)
  if (oldStages.some(stage =>
    ['Pre-seed Startups', 'Seed Stage', 'Series A'].includes(stage)
  )) {
    return '🚨 Needs Immediate Help';
  }

  // If stages include growth companies (exploring solutions)
  if (oldStages.some(stage =>
    ['Series B+', 'Growth Stage'].includes(stage)
  )) {
    return '🔍 Exploring Solutions';
  }

  // If stages include established companies (have budget)
  if (oldStages.some(stage =>
    ['Large Enterprises', 'Multinational Corporations'].includes(stage)
  )) {
    return '📋 Planning Transformation';
  }

  // Default for SMEs or unclear cases
  return '🔍 Exploring Solutions';
} 
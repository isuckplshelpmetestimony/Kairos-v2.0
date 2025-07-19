// Maps old company stages to new readiness levels
export function mapCompanyStageToReadiness(oldStages: string[]): string {
  // Recognize both emoji and plain text readiness values
  const readinessLevels = [
    '🔥 Active Challenges (problems happening now)',
    '🔍 Exploring Solutions (aware and researching)',
    '📋 Planning Transformation (ready to execute)',
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
      case 'Needs Immediate Help': return '🔥 Active Challenges (problems happening now)';
      case 'Exploring Solutions': return '🔍 Exploring Solutions (aware and researching)';
      case 'Planning Transformation': return '📋 Planning Transformation (ready to execute)';
      case '🚨 Needs Immediate Help': return '🔥 Active Challenges (problems happening now)';
      case '🔍 Exploring Solutions': return '🔍 Exploring Solutions (aware and researching)';
      case '📋 Planning Transformation': return '📋 Planning Transformation (ready to execute)';
      default: return directMatch;
    }
  }

  // If stages include early-stage companies (high urgency)
  if (oldStages.some(stage =>
    ['Pre-seed Startups', 'Seed Stage', 'Series A'].includes(stage)
  )) {
    return '🔥 Active Challenges (problems happening now)';
  }

  // If stages include growth companies (exploring solutions)
  if (oldStages.some(stage =>
    ['Series B+', 'Growth Stage'].includes(stage)
  )) {
    return '🔍 Exploring Solutions (aware and researching)';
  }

  // If stages include established companies (have budget)
  if (oldStages.some(stage =>
    ['Large Enterprises', 'Multinational Corporations'].includes(stage)
  )) {
    return '📋 Planning Transformation (ready to execute)';
  }

  // Default for SMEs or unclear cases
  return '🔍 Exploring Solutions (aware and researching)';
} 
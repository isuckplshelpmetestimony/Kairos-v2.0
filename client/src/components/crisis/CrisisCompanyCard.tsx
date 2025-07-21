import React from 'react';
import type { CrisisCompany } from '../../../../shared/schema';

interface CrisisCompanyCardProps {
  company: CrisisCompany;
  topSignals?: string[];
  onClick?: () => void;
}

const CrisisCompanyCard: React.FC<CrisisCompanyCardProps> = ({ company, topSignals = [], onClick }) => {
  return (
    <div
      className="bg-gradient-to-br from-purple-800/60 to-blue-800/60 rounded-lg p-6 shadow-md text-white cursor-pointer hover:scale-[1.025] hover:shadow-xl transition-transform duration-150"
      onClick={onClick}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${company.company_name}`}
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold truncate" title={company.company_name}>{company.company_name}</h2>
        <span className="bg-blue-700/80 text-xs px-3 py-1 rounded-full font-semibold ml-2">
          Score: {company.crisis_score}
        </span>
      </div>
      <div className="text-sm text-blue-200 mb-2">{company.industry_sector}</div>
      <div className="mb-3">
        <div className="text-xs text-gray-300 mb-1">Top Crisis Signals:</div>
        <ul className="space-y-1">
          {topSignals.length > 0 ? (
            topSignals.map((signal, idx) => (
              <li key={idx} className="bg-black/30 rounded px-2 py-1 text-xs text-purple-200">
                {signal}
              </li>
            ))
          ) : (
            <li className="text-gray-500 italic">No signals</li>
          )}
        </ul>
      </div>
      <div className="text-xs text-gray-400 mt-2">Last updated: {new Date(company.last_intelligence_update).toLocaleDateString()}</div>
    </div>
  );
};

export default CrisisCompanyCard;

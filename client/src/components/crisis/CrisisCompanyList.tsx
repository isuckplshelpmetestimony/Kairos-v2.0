import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api';
import CrisisCompanyCard from './CrisisCompanyCard';
import type { CrisisCompany } from '../../../../shared/schema';

const CrisisCompanyList: React.FC = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['crisis-companies'],
    queryFn: () => apiClient.getCrisisCompanies({ limit: 12, offset: 0 }),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <span className="text-gray-300 text-lg animate-pulse">Loading companies...</span>
      </div>
    );
  }

  if (isError || data?.error) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <span className="text-red-400 text-lg">Error loading companies. Please try again later.</span>
      </div>
    );
  }

  const companies = data?.data?.companies || [];

  if (companies.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <span className="text-gray-400 text-lg">No companies found.</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {companies.map((company) => (
        <CrisisCompanyCard
          key={company.id}
          company={company}
          topSignals={(company as any).primary_crisis_signals || []}
        />
      ))}
    </div>
  );
};

export default CrisisCompanyList;

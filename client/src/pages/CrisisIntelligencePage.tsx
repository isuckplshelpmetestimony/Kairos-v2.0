import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import CrisisCompanyList from '../components/crisis/CrisisCompanyList';

const CrisisIntelligencePage: React.FC = () => {
  const { isPremium } = useAuth();

  if (!isPremium()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-blue-950 to-purple-950">
        <div className="bg-black/60 p-8 rounded-xl text-white text-center shadow-xl">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="mb-4">This page is for premium users only.</p>
          <a href="/upgrade" className="text-blue-400 underline">Upgrade your account</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-purple-950 py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">Crisis Intelligence</h1>
        <CrisisCompanyList />
      </div>
    </div>
  );
};

export default CrisisIntelligencePage;

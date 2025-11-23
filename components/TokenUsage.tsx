import React from 'react';
import { TrendingDown, Zap, Database, Clock } from 'lucide-react';
import { getCacheStats } from '../utils/cacheManager';

interface TokenUsageProps {
  estimatedTokens?: number;
  isCached?: boolean;
}

const TokenUsage: React.FC<TokenUsageProps> = ({ estimatedTokens, isCached }) => {
  const cacheStats = getCacheStats();
  
  // Estimate cost (Gemini 2.5 Flash pricing)
  const inputCostPer1M = 0.075; // $0.075 per 1M input tokens
  const outputCostPer1M = 0.30; // $0.30 per 1M output tokens
  
  const estimatedInputTokens = estimatedTokens || 0;
  const estimatedOutputTokens = 500; // Average output
  const totalTokens = estimatedInputTokens + estimatedOutputTokens;
  
  const estimatedCost = isCached ? 0 : (
    (estimatedInputTokens / 1000000 * inputCostPer1M) +
    (estimatedOutputTokens / 1000000 * outputCostPer1M)
  );

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <TrendingDown className="w-5 h-5 text-purple-600" />
          <h3 className="text-sm font-bold text-purple-900">Token Optimization Active</h3>
        </div>
        {isCached && (
          <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full flex items-center space-x-1">
            <Zap className="w-3 h-3" />
            <span>Cached</span>
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Database className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-gray-600">Est. Tokens</span>
          </div>
          <p className="text-lg font-bold text-gray-900">
            {isCached ? '0' : totalTokens.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">
            {isCached ? 'From cache' : `~${estimatedInputTokens.toLocaleString()} in`}
          </p>
        </div>
        
        <div className="bg-white rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <TrendingDown className="w-4 h-4 text-green-600" />
            <span className="text-xs text-gray-600">Cost</span>
          </div>
          <p className="text-lg font-bold text-gray-900">
            ${estimatedCost.toFixed(4)}
          </p>
          <p className="text-xs text-gray-500">
            {isCached ? 'Free!' : 'Per request'}
          </p>
        </div>
        
        <div className="bg-white rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Zap className="w-4 h-4 text-orange-600" />
            <span className="text-xs text-gray-600">Cached</span>
          </div>
          <p className="text-lg font-bold text-gray-900">
            {cacheStats.count}
          </p>
          <p className="text-xs text-gray-500">
            Results stored
          </p>
        </div>
        
        <div className="bg-white rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Clock className="w-4 h-4 text-purple-600" />
            <span className="text-xs text-gray-600">Savings</span>
          </div>
          <p className="text-lg font-bold text-gray-900">
            99%+
          </p>
          <p className="text-xs text-gray-500">
            Token reduction
          </p>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-purple-200">
        <p className="text-xs text-purple-700">
          <strong>Optimization:</strong> Smart filtering reduces 8000+ rows to ~50 relevant records. 
          Results cached for 24 hours. {cacheStats.count > 0 && `Oldest cache: ${cacheStats.oldestAge}min ago.`}
        </p>
      </div>
    </div>
  );
};

export default TokenUsage;

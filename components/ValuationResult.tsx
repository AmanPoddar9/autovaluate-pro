import React from 'react';
import { ValuationResult } from '../types';
import { TrendingUp, ExternalLink, AlertCircle, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ValuationResultProps {
  result: ValuationResult | null;
}

const ValuationResultView: React.FC<ValuationResultProps> = ({ result }) => {
  if (!result) return null;

  const formatCurrency = (val: number, currency: string) => {
    // Special handling for INR to show Lakhs correctly if needed, 
    // but 'en-IN' locale usually handles comma separation for Lakhs/Crores automatically.
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      
      {/* Price Band Card */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <TrendingUp className="w-32 h-32 text-white" />
        </div>
        
        <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">Recommended Buy Price</h3>
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:space-x-2">
          <span className="text-3xl md:text-4xl font-bold tracking-tight text-emerald-400">
            {formatCurrency(result.priceBand.min, result.priceBand.currency)}
          </span>
          <span className="hidden sm:inline text-gray-400 text-xl">-</span>
          <span className="text-3xl md:text-4xl font-bold tracking-tight text-emerald-400">
            {formatCurrency(result.priceBand.max, result.priceBand.currency)}
          </span>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div>
              <span className="block text-xs text-gray-500 uppercase">Original MSRP (Approx)</span>
              <span className="text-lg font-medium text-gray-200">{result.originalMsrp}</span>
           </div>
           <div className="flex items-center space-x-2 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-medium text-emerald-300">Market Adjusted</span>
           </div>
        </div>
      </div>

      {/* Historical Margin Indicator */}
      {result.historicalMargin && (
        <div className={`rounded-2xl p-5 shadow-sm border-2 ${
          result.historicalMargin.percentage > 15 
            ? 'bg-green-50 border-green-200' 
            : result.historicalMargin.percentage > 8
            ? 'bg-yellow-50 border-yellow-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-start justify-between">
            <div>
              <h4 className={`text-sm font-semibold uppercase tracking-wide mb-1 ${
                result.historicalMargin.percentage > 15 
                  ? 'text-green-700' 
                  : result.historicalMargin.percentage > 8
                  ? 'text-yellow-700'
                  : 'text-red-700'
              }`}>
                Historical Profit Margin
              </h4>
              <p className={`text-xs mb-2 ${
                result.historicalMargin.percentage > 15 
                  ? 'text-green-600' 
                  : result.historicalMargin.percentage > 8
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`}>
                {result.historicalMargin.description}
              </p>
            </div>
            <div className={`text-right px-4 py-2 rounded-xl ${
              result.historicalMargin.percentage > 15 
                ? 'bg-green-100' 
                : result.historicalMargin.percentage > 8
                ? 'bg-yellow-100'
                : 'bg-red-100'
            }`}>
              <div className={`text-3xl font-bold ${
                result.historicalMargin.percentage > 15 
                  ? 'text-green-700' 
                  : result.historicalMargin.percentage > 8
                  ? 'text-yellow-700'
                  : 'text-red-700'
              }`}>
                {result.historicalMargin.percentage.toFixed(1)}%
              </div>
              <div className={`text-xs font-medium ${
                result.historicalMargin.percentage > 15 
                  ? 'text-green-600' 
                  : result.historicalMargin.percentage > 8
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`}>
                Net Margin
              </div>
            </div>
          </div>
          <div className={`mt-3 pt-3 border-t text-xs ${
            result.historicalMargin.percentage > 15 
              ? 'border-green-200 text-green-700' 
              : result.historicalMargin.percentage > 8
              ? 'border-yellow-200 text-yellow-700'
              : 'border-red-200 text-red-700'
          }`}>
            {result.historicalMargin.percentage > 15 
              ? '✓ Good margin. Room for competitive offers while maintaining profit.'
              : result.historicalMargin.percentage > 8
              ? '⚠ Moderate margin. Price carefully to ensure profitability.'
              : '⚠ Low margin. Be very conservative with offers.'}
          </div>
        </div>
      )}

      {/* AI Reasoning */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center space-x-2 mb-4">
          <AlertCircle className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-bold text-gray-800">Analysis & Reasoning</h3>
        </div>
        <div className="prose prose-sm prose-indigo text-gray-600 max-w-none">
          <ReactMarkdown>{result.reasoning}</ReactMarkdown>
        </div>
      </div>

      {/* Sources */}
      {result.groundingSources.length > 0 && (
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Market Sources</h3>
          <div className="space-y-2">
            {result.groundingSources.map((source, index) => {
              // Sometimes the source might be empty or missing title/uri
              if (!source.web?.title || !source.web?.uri) return null;
              
              return (
                <a 
                  key={index} 
                  href={source.web.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-start p-3 bg-white rounded-lg hover:shadow-md transition-shadow group border border-gray-200"
                >
                  <ExternalLink className="w-4 h-4 text-gray-400 mt-1 mr-3 flex-shrink-0 group-hover:text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600 truncate max-w-[250px] md:max-w-md">
                      {source.web.title}
                    </p>
                    <p className="text-xs text-gray-400 truncate max-w-[250px] md:max-w-md">
                      {source.web.uri}
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ValuationResultView;
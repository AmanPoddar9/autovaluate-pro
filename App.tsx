import React, { useState } from 'react';
import { CarDetails, ValuationResult } from './types';
import CarForm from './components/CarForm';
import HistoryUpload from './components/HistoryUpload';
import ValuationResultView from './components/ValuationResult';
import { analyzeCarValue } from './services/geminiService';
import { Zap } from 'lucide-react';

export default function App() {
  const [historyData, setHistoryData] = useState<string>('');
  const [valuationResult, setValuationResult] = useState<ValuationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (carData: CarDetails) => {
    setIsLoading(true);
    setValuationResult(null);
    setError(null);
    try {
      const result = await analyzeCarValue(carData, historyData);
      setValuationResult(result);
    } catch (err: any) {
      setError(err.message || 'Something went wrong during analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-orange-600 p-1.5 rounded-lg">
               <Zap className="w-5 h-5 text-white" fill="currentColor" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
              AutoValuate<span className="font-light text-gray-400">Pro India</span>
            </h1>
          </div>
          <div className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            Beta v1.2 (India)
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Input */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
              <h3 className="text-sm font-bold text-orange-800 mb-1">AI-Powered Valuation</h3>
              <p className="text-xs text-orange-700 leading-relaxed">
                We search major Indian marketplaces (CarWale, CarDekho, etc.) and combine it with your business history to give you a precise buy price.
              </p>
            </div>
            
            <HistoryUpload onDataChange={setHistoryData} />
            <CarForm onSubmit={handleAnalyze} isLoading={isLoading} />
          </div>

          {/* Right Column: Output */}
          <div className="lg:col-span-7">
             {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {!valuationResult && !isLoading && !error && (
               <div className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50 min-h-[400px]">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Zap className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Ready to Valuate</h3>
                  <p className="text-gray-500 text-sm mt-2 max-w-xs">
                    Connect your Google Sheet and enter vehicle details to start scanning the Indian market.
                  </p>
               </div>
            )}

            {valuationResult && (
              <ValuationResultView result={valuationResult} />
            )}
            
            {/* Loading Skeleton */}
             {isLoading && (
              <div className="space-y-6 animate-pulse">
                <div className="h-48 bg-gray-200 rounded-2xl w-full"></div>
                <div className="h-64 bg-gray-200 rounded-2xl w-full"></div>
                <div className="h-32 bg-gray-200 rounded-2xl w-full"></div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
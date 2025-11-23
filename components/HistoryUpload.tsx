import React, { useState } from 'react';
import { Database, FileText, Link, Check, AlertCircle, Shield, Trash2 } from 'lucide-react';

interface HistoryUploadProps {
  onDataChange: (data: string) => void;
}

const HistoryUpload: React.FC<HistoryUploadProps> = ({ onDataChange }) => {
  const [data, setData] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'paste' | 'sheet'>('sheet');
  const [sheetUrl, setSheetUrl] = useState('');
  const [fetchStatus, setFetchStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setData(val);
    onDataChange(val);
  };

  const handleSheetFetch = async () => {
    if (!sheetUrl) return;
    setFetchStatus('loading');
    try {
      const response = await fetch(sheetUrl);
      if (!response.ok) throw new Error('Failed to fetch');
      const text = await response.text();
      setData(text);
      onDataChange(text);
      setFetchStatus('success');
    } catch (e) {
      console.error(e);
      setFetchStatus('error');
    }
  };

  const placeholder = `Brand,Model,Year,BoughtPrice,SoldPrice
Maruti,Swift,2018,450000,520000
Hyundai,i20,2019,550000,610000
Honda,City,2017,600000,680000`;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <Database className="text-indigo-600 w-6 h-6" />
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Business Data</h2>
            <p className="text-xs text-gray-500">Connect your Google Sheet sales history</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-orange-600 transition-colors text-sm font-medium">
          {isExpanded ? 'Hide' : 'Expand'}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Privacy Warning */}
          <div className="bg-green-50 border border-green-200 p-3 rounded-lg mb-4">
            <div className="flex items-start">
              <Shield className="w-4 h-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="text-xs text-green-800 leading-relaxed">
                  <strong>Privacy Protected:</strong> Your P&L data is encrypted locally and never stored on servers. 
                  We only send anonymized insights (not raw prices/margins) to the AI for analysis.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-4 border-b border-gray-200 mb-4">
            <button 
              onClick={() => setActiveTab('sheet')}
              className={`pb-2 text-sm font-medium transition-colors ${activeTab === 'sheet' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Connect Google Sheet
            </button>
            <button 
              onClick={() => setActiveTab('paste')}
              className={`pb-2 text-sm font-medium transition-colors ${activeTab === 'paste' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Paste CSV
            </button>
          </div>

          {activeTab === 'sheet' ? (
            <div className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700 leading-relaxed">
                <span className="font-bold">How to connect:</span>
                <ol className="list-decimal ml-4 mt-1 space-y-1">
                  <li>Open your Google Sheet</li>
                  <li>Go to <strong>File &gt; Share &gt; Publish to web</strong></li>
                  <li>Select "Entire Document" and format as <strong>"Comma-separated values (.csv)"</strong></li>
                  <li>Click Publish and paste the link below</li>
                </ol>
              </div>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Link className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                  <input 
                    type="url" 
                    placeholder="https://docs.google.com/spreadsheets/d/e/.../pub?output=csv"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    value={sheetUrl}
                    onChange={(e) => setSheetUrl(e.target.value)}
                  />
                </div>
                <button 
                  onClick={handleSheetFetch}
                  disabled={fetchStatus === 'loading' || !sheetUrl}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:bg-gray-300 transition-colors"
                >
                  {fetchStatus === 'loading' ? 'Fetching...' : 'Connect'}
                </button>
              </div>
              
              {fetchStatus === 'success' && (
                <div className="flex items-center text-emerald-600 text-sm bg-emerald-50 p-2 rounded">
                  <Check className="w-4 h-4 mr-2" />
                  Successfully loaded {data.split('\n').length} rows of history.
                </div>
              )}
              {fetchStatus === 'error' && (
                <div className="flex items-center text-red-600 text-sm bg-red-50 p-2 rounded">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Failed to fetch. Ensure the link is a "Published to Web" CSV link.
                </div>
              )}
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Manually paste your sales data (CSV format)
              </p>
              <div className="relative">
                 <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <textarea
                  className="w-full h-32 pl-10 p-3 text-xs font-mono bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-y custom-scrollbar"
                  placeholder={placeholder}
                  value={data}
                  onChange={handleTextChange}
                />
              </div>
            </div>
          )}
          
          {/* Data Status and Clear Button */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-gray-400">
              {data.length > 0 ? `${data.split('\n').length} rows loaded` : 'No data loaded'}
            </p>
            {data.length > 0 && (
              <button
                onClick={() => {
                  setData('');
                  onDataChange('');
                  setSheetUrl('');
                  setFetchStatus('idle');
                }}
                className="flex items-center space-x-1 text-xs text-red-600 hover:text-red-700 font-medium"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear Data</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryUpload;
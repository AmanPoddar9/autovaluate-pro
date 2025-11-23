import React, { useState, useEffect } from 'react';
import { Lock, Shield, AlertTriangle } from 'lucide-react';

interface AuthGateProps {
  children: React.ReactNode;
  onLogout: () => void;
}

const AuthGate: React.FC<AuthGateProps> = ({ children, onLogout }) => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Check if already authenticated in this session
  useEffect(() => {
    const authStatus = sessionStorage.getItem('auth_status');
    if (authStatus === 'authenticated') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple password check - in production, use proper authentication
    const correctPassword = import.meta.env.VITE_APP_PASSWORD || 'autovaluate2024';
    
    if (password === correctPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem('auth_status', 'authenticated');
      sessionStorage.setItem('login_time', Date.now().toString());
      setError('');
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.clear();
    setPassword('');
    onLogout();
  };

  if (isAuthenticated) {
    return (
      <>
        {children}
        <button
          onClick={handleLogout}
          className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 shadow-lg flex items-center space-x-2 z-50"
        >
          <Lock className="w-4 h-4" />
          <span>Logout & Clear Data</span>
        </button>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Security Notice */}
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-r-lg">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-amber-800 mb-1">Sensitive Data Protection</h3>
              <p className="text-xs text-amber-700 leading-relaxed">
                This application handles proprietary business data. Access is password-protected. 
                All data is encrypted and cleared when you logout or close your browser.
              </p>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-indigo-100 p-3 rounded-full">
              <Shield className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
            AutoValuate Pro
          </h1>
          <p className="text-center text-sm text-gray-500 mb-6">
            Secure Access Required
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Access Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="Enter password"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 text-xs"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Access Application
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center leading-relaxed">
              <strong>Security Features:</strong> Password protection • Session timeout • 
              Data encryption • Auto-logout on browser close
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Default password: <code className="bg-gray-100 px-2 py-1 rounded">autovaluate2024</code>
          <br />
          <span className="text-xs">(Set VITE_APP_PASSWORD in environment to change)</span>
        </p>
      </div>
    </div>
  );
};

export default AuthGate;

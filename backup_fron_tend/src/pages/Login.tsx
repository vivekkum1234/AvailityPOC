import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface LoginProps {
  onLogin: (user: { email: string; name: string; userType: 'payer' | 'availity' }) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Mock users for login (matching our database users)
  const mockUsers = [
    { email: 'John.smith@aetnademo.com', name: 'John Smith', userType: 'payer' as const, organization: 'Aetna' },
    { email: 'Mike.davis@aetnademo.com', name: 'Mike Davis', userType: 'payer' as const, organization: 'Aetna' },
    { email: 'admin@availity.com', name: 'Lisa Wilson', userType: 'availity' as const, organization: 'Availity' },
    { email: 'David.brown@aetnademo.com', name: 'David Brown', userType: 'payer' as const, organization: 'Aetna' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Basic validation
      if (!email || !password) {
        setError('Please enter both email and password.');
        return;
      }

      // Find user by email
      const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!user) {
        setError('Invalid email or password. Please try again.');
        return;
      }

      // Simple password validation (for demo - accept any password with at least 3 characters)
      if (password.length < 3) {
        setError('Password must be at least 3 characters long.');
        return;
      }

      // Call the onLogin callback with user data
      onLogin({
        email: user.email,
        name: user.name,
        userType: user.userType
      });

      // Navigate to main page
      navigate('/');
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (user: typeof mockUsers[0]) => {
    setEmail(user.email);
    setPassword('demo123'); // Set a demo password
    // Auto-submit after setting email and password
    setTimeout(() => {
      onLogin({
        email: user.email,
        name: user.name,
        userType: user.userType
      });
      navigate('/');
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-2 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <img
            src="/availity.jpeg"
            alt="Availity Logo"
            className="w-20 h-20 object-contain"
          />
        </div>
        <h2 className="mt-4 text-center text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          Availity Digital Questionnaire Platform
        </h2>
      </div>

      {/* Login Form */}
      <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 px-4 shadow-soft sm:rounded-2xl sm:px-10 border border-gray-200">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-availity-500 hover:from-primary-600 hover:to-availity-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

          {/* Quick Login Options */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Quick login for demo</span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Payer Users
              </div>
              {mockUsers.filter(u => u.userType === 'payer').map((user) => (
                <button
                  key={user.email}
                  onClick={() => handleQuickLogin(user)}
                  className="w-full flex items-center justify-between px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-xs font-medium text-blue-600">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.organization}</div>
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}

              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 mt-3">
                Availity Users
              </div>
              {mockUsers.filter(u => u.userType === 'availity').map((user) => (
                <button
                  key={user.email}
                  onClick={() => handleQuickLogin(user)}
                  className="w-full flex items-center justify-between px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-xs font-medium text-purple-600">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.organization}</div>
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          This is a proof-of-concept demo environment
        </p>
      </div>
    </div>
  );
};

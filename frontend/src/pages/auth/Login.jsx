/**
 * Login Page Component
 * Staff authentication form with role-based redirection
 */

import React, { useState, useEffect } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, LogIn, ArrowLeft } from 'lucide-react';

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  
  const { login, isAuthenticated, isLoading, error, clearError, isAdmin } = useAuth();
  const location = useLocation();

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Redirect if already authenticated
  if (isAuthenticated) {
    const destination = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={destination} replace />;
  }

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (error) {
      clearError();
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!credentials.email || !credentials.password) {
      return;
    }

    const result = await login(credentials);
    
    if (result.success) {
      // Navigation will be handled by the redirect logic above
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070")',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-blue-800/85 to-teal-900/90"></div>
      </div>

      <div className="relative max-w-md w-full">
        {/* Back to Home Link */}
        <div className="mb-4">
          <Link
            to="/"
            className="inline-flex items-center text-white hover:text-blue-200 font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>

        {/* Header with SkyNest Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img 
              src="/images/skynest-logo.svg" 
              alt="SkyNest Logo" 
              className="h-24 w-24"
            />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome Back
          </h2>
          <p className="text-blue-100">
            Sign in to your staff account to continue
          </p>
        </div>

        {/* Login form */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={credentials.email}
                  onChange={handleChange}
                  required
                  className="input-field pl-10"
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={credentials.password}
                  onChange={handleChange}
                  required
                  className="input-field pl-10"
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading || !credentials.email || !credentials.password}
              className="w-full btn-primary flex items-center justify-center space-x-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h3 className="text-sm font-semibold text-blue-900 mb-3">🔑 Demo Credentials:</h3>
            <div className="text-xs text-gray-700 space-y-2">
              <div className="bg-white p-2 rounded border border-blue-100">
                <p className="font-semibold text-blue-700 mb-1">Admin Accounts:</p>
                <p>• Colombo: admin@colombo.skynest.lk</p>
                <p>• Kandy: admin@kandy.skynest.lk</p>
                <p>• Galle: admin@galle.skynest.lk</p>
              </div>
              <div className="bg-white p-2 rounded border border-blue-100">
                <p className="font-semibold text-green-700 mb-1">Staff Accounts:</p>
                <p>• Colombo: sanduni@colombo.skynest.lk</p>
                <p>• Kandy: tharindu@kandy.skynest.lk</p>
                <p>• Galle: dilini@galle.skynest.lk</p>
              </div>
              <p className="text-center text-gray-600 font-medium pt-1">Password: password123</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-white/90">
          <p>&copy; 2025 SkyNest Management System. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
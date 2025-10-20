/**
 * Login Page Component
 * Staff authentication form with role-based redirection
 */

import React, { useState, useEffect } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Building2, Mail, Lock, LogIn, ArrowLeft } from 'lucide-react';

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
    <div className="min-h-screen relative flex items-center justify-center p-4 lg:p-8">
      {/* Full Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070")',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/95 via-blue-800/90 to-teal-900/95"></div>
      </div>

      {/* Back to Home Button - Fixed Position */}
      <Link
        to="/"
        className="fixed top-6 left-6 z-50 inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-full font-medium transition-all duration-300 border border-white/20 hover:border-white/40 shadow-lg"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Home
      </Link>

      {/* Two Column Container - Centered */}
      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-5 ">
          
          {/* Left Column - Welcome Section */}
          <div className="text-white space-y-8 lg:pr-8 items-center py-10   ">
            {/* Logo with Animation */}
            <div className="flex justify-center lg:justify-center">
              <div className="transform hover:scale-105 transition-transform duration-300 bg-white/10 p-2 pb-5 shadow-lg">
                <img 
                  src="/images/skynest-logo.svg" 
                  alt="SkyNest Logo" 
                  className="h-48 w-48 lg:h-56 lg:w-56 drop-shadow-2xl"
                />
              </div>
            </div>
            
            {/* Welcome Text */}
            <div className="text-center lg:text-center">
              <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                Welcome Back to <br />
                <span className="bg-gradient-to-r from-white via-blue-100 to-teal-100 bg-clip-text text-transparent">
                  SkyNest
                </span>
              </h1>
              <p className="text-lg lg:text-xl text-blue-100 leading-relaxed">
                Your premium hotel management platform designed for excellence and efficiency
              </p>
            </div>
            

            {/* Quote */}
            <div className="text-center lg:text-center pt-4">
              <p className="text-blue-200 italic text-base">
                "Beyond the Sky, Beyond Excellence"
              </p>
            </div>
          </div>

          {/* Right Column - Login Section */}
          <div className="w-full">
            {/* Login Card */}
            <div className="bg-white/90  rounded-3xl shadow-2xl p-8 lg:p-10 border border-white/30">
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Sign In</h2>
                <p className="text-gray-900">Enter your credentials to access your account</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email field */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={credentials.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    placeholder="your.email@skynest.lk"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={credentials.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    placeholder="Enter your password"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start space-x-2">
                  <span className="font-semibold">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading || !credentials.email || !credentials.password}
                className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
            <div className="mt-8 p-5 bg-gradient-to-br from-blue-50 to-teal-50 rounded-2xl border-2 border-blue-100">
              
              <div className="text-xs space-y-3">
                <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-sm">
                  <p className="font-bold text-blue-700 mb-2">👔 Admin Accounts:</p>
                  <div className="space-y-1 text-gray-700">
                    <p>• <span className="font-mono text-blue-600">admin@colombo.skynest.lk</span></p>
                    <p>• <span className="font-mono text-blue-600">admin@kandy.skynest.lk</span></p>
                    <p>• <span className="font-mono text-blue-600">admin@galle.skynest.lk</span></p>
                  </div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-teal-100 shadow-sm">
                  <p className="font-bold text-teal-700 mb-2">👤 Staff Accounts:</p>
                  <div className="space-y-1 text-gray-700">
                    <p>• <span className="font-mono text-teal-600">sanduni@colombo.skynest.lk</span></p>
                    <p>• <span className="font-mono text-teal-600">tharindu@kandy.skynest.lk</span></p>
                    <p>• <span className="font-mono text-teal-600">dilini@galle.skynest.lk</span></p>
                  </div>
                </div>
                <p className="text-center text-gray-700 font-bold pt-1 bg-yellow-100 py-2 rounded-lg">
                  🔐 Password: <span className="font-mono">password123</span>
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 text-sm text-white/90">
            <p>&copy; 2025 SkyNest Management System. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Login;
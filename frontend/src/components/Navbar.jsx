/**
 * Navbar Component
 * Top navigation bar with user info and logout functionality
 */

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Building2 } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and title */}
          <div className="flex items-center">
            <Building2 className="h-8 w-8 text-primary-600 mr-3" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Hotel Management System
              </h1>
              <p className="text-xs text-gray-500">
                {isAdmin() ? 'Admin Dashboard' : 'Staff Dashboard'}
              </p>
            </div>
          </div>

          {/* User info and actions */}
          <div className="flex items-center space-x-4">
            {/* User info */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.Name}</p>
                <p className="text-xs text-gray-500">
                  {user?.Role} • {user?.BranchCity}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                <User className="h-5 w-5 text-primary-600" />
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:block">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
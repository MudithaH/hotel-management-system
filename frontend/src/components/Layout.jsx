/**
 * Layout Component
 * Main layout wrapper with sidebar and navbar
 */

import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top navbar */}
      <Navbar />
      
      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="flex-shrink-0 relative">
          <Sidebar />
        </div>
        
        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
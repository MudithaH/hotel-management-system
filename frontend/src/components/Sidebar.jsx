/**
 * Sidebar Component
 * Side navigation with role-based menu items
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  BedDouble,
  Calendar,
  UserPlus,
  Receipt,
  Settings,
  ClipboardList,
  LogIn
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const { isAdmin } = useAuth();

  // Admin menu items
  const adminMenuItems = [
    {
      path: '/admin/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard',
      description: 'Overview and statistics'
    },
    {
      path: '/admin/staff',
      icon: Users,
      label: 'Staff Management',
      description: 'Manage staff members'
    },
    {
      path: '/admin/rooms',
      icon: BedDouble,
      label: 'Room Management',
      description: 'Manage rooms and types'
    }
  ];

  // Staff menu items
  const staffMenuItems = [
    {
      path: '/staff/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard',
      description: 'Quick actions'
    },
    {
      path: '/staff/guests',
      icon: UserPlus,
      label: 'Guest Management',
      description: 'Add and manage guests'
    },
    {
      path: '/staff/bookings',
      icon: Calendar,
      label: 'Bookings',
      description: 'Manage reservations'
    },
    {
      path: '/staff/operations',
      icon: LogIn,
      label: 'Check-in/out',
      description: 'Check-in and check-out'
    },
    {
      path: '/staff/services',
      icon: ClipboardList,
      label: 'Services',
      description: 'Add services to bookings'
    },
    {
      path: '/staff/billing',
      icon: Receipt,
      label: 'Billing',
      description: 'Generate bills and payments'
    }
  ];

  const menuItems = isAdmin() ? adminMenuItems : staffMenuItems;

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200 h-full">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          {isAdmin() ? 'Admin Menu' : 'Staff Menu'}
        </h2>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors group ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-primary-600' : 'text-gray-500 group-hover:text-gray-700'}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isActive ? 'text-primary-700' : 'text-gray-900'}`}>
                    {item.label}
                  </p>
                  <p className={`text-xs ${isActive ? 'text-primary-600' : 'text-gray-500'}`}>
                    {item.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-center">
          <p className="text-xs text-gray-500">Hotel Management System</p>
          <p className="text-xs text-gray-400">Version 1.0.0</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
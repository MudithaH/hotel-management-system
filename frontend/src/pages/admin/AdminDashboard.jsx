/**
 * Admin Dashboard Component
 * Overview page with statistics and quick actions for administrators
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../api';
import {
  Users,
  BedDouble,
  Calendar,
  DollarSign,
  TrendingUp,
  Building2,
  UserCheck,
  Home
} from 'lucide-react';
import Layout from '../../components/Layout';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await adminAPI.getDashboardStats();
        setStats(response.data.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        toast.error('Failed to load dashboard data');
        // Set empty stats to prevent component from breaking
        setStats({
          totalBookings: 0,
          totalRevenue: 0,
          totalRooms: 0,
          availableRooms: 0,
          occupiedRooms: 0,
          totalStaff: 0
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Stats cards configuration
  const statsCards = [
    {
      title: 'Total Bookings',
      value: stats?.totalBookings || 0,
      icon: Calendar,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      title: 'Total Revenue',
      value: `$${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
    {
      title: 'Total Rooms',
      value: stats?.totalRooms || 0,
      icon: BedDouble,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    },
    {
      title: 'Available Rooms',
      value: stats?.availableRooms || 0,
      icon: Home,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-700'
    },
    {
      title: 'Occupied Rooms',
      value: stats?.occupiedRooms || 0,
      icon: UserCheck,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700'
    },
    {
      title: 'Total Staff',
      value: stats?.totalStaff || 0,
      icon: Users,
      color: 'bg-pink-500',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-700'
    }
  ];

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.Name}!
            </h1>
            <p className="text-gray-600">
              Here's what's happening at your hotel branch today.
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Building2 className="h-4 w-4" />
            <span>{user?.BranchCity} Branch</span>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statsCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div key={index} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${card.bgColor}`}>
                    <Icon className={`h-6 w-6 ${card.textColor}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Room Occupancy Overview */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Room Occupancy Overview
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Occupancy Rate</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats?.totalRooms > 0 
                    ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100)
                    : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: stats?.totalRooms > 0 
                      ? `${(stats.occupiedRooms / stats.totalRooms) * 100}%`
                      : '0%'
                  }}
                ></div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-lg font-bold text-green-700">{stats?.availableRooms || 0}</p>
                  <p className="text-xs text-green-600">Available</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-lg font-bold text-red-700">{stats?.occupiedRooms || 0}</p>
                  <p className="text-xs text-red-600">Occupied</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Branch Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Branch Location</span>
                <span className="text-sm font-medium text-gray-900">{user?.BranchCity}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Your Role</span>
                <span className="text-sm font-medium text-gray-900">{user?.Role}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Total Staff</span>
                <span className="text-sm font-medium text-gray-900">{stats?.totalStaff || 0}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Total Rooms</span>
                <span className="text-sm font-medium text-gray-900">{stats?.totalRooms || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Insight */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Overview</h3>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900 mb-2">
                ${(stats?.totalRevenue || 0).toLocaleString()}
              </p>
              <p className="text-gray-600">Total Revenue Generated</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
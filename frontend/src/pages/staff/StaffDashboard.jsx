/**
 * Staff Dashboard Component
 * Dashboard for staff members with quick actions and overview
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { staffAPI } from '../../api';
import {
  UserPlus,
  Calendar,
  ClipboardList,
  Receipt,
  Users,
  BedDouble,
  Clock,
  CheckCircle
} from 'lucide-react';
import Layout from '../../components/Layout';

const StaffDashboard = () => {
  const { user } = useAuth();
  const [recentBookings, setRecentBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRecentBookings();
  }, []);

  const fetchRecentBookings = async () => {
    try {
      setIsLoading(true);
      const response = await staffAPI.getBookings();
      // Get only the 5 most recent bookings
      const recent = (response.data.data || []).slice(0, 5);
      setRecentBookings(recent);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Add New Guest',
      description: 'Register a new guest in the system',
      icon: UserPlus,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      link: '/staff/guests',
      action: 'Create'
    },
    {
      title: 'New Booking',
      description: 'Create a new room reservation',
      icon: Calendar,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      link: '/staff/bookings',
      action: 'Book'
    },
    {
      title: 'Add Services',
      description: 'Add services to existing bookings',
      icon: ClipboardList,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      link: '/staff/services',
      action: 'Add'
    },
    {
      title: 'Generate Bill',
      description: 'Create bills and process payments',
      icon: Receipt,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      link: '/staff/billing',
      action: 'Bill'
    }
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'checked-in':
        return 'bg-green-100 text-green-800';
      case 'checked-out':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl text-white p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">
                Welcome back, {user?.Name}!
              </h1>
              <p className="text-primary-100">
                Ready to assist guests and manage bookings today?
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-primary-200">Your Role</p>
              <p className="text-lg font-semibold">{user?.Role}</p>
              <p className="text-sm text-primary-200">{user?.BranchCity} Branch</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link
                  key={index}
                  to={action.link}
                  className="group card hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className={`p-2 sm:p-3 rounded-lg ${action.bgColor}`}>
                      <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${action.textColor}`} />
                    </div>
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${action.textColor} ${action.bgColor}`}>
                      {action.action}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 group-hover:text-primary-600 transition-colors text-sm sm:text-base">
                    {action.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">{action.description}</p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Recent Bookings */}
          <div className="lg:col-span-2 card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
              <Link 
                to="/staff/bookings" 
                className="text-sm text-primary-600 hover:text-primary-800 font-medium"
              >
                View All
              </Link>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="spinner mx-auto mb-2"></div>
                <p className="text-gray-600">Loading bookings...</p>
              </div>
            ) : recentBookings.length > 0 ? (
              <div className="space-y-3">
                {recentBookings.map((booking) => (
                  <div key={booking.BookingID} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{booking.GuestName}</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(booking.CheckInDate)} - {formatDate(booking.CheckOutDate)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.BookingStatus)}`}>
                        {booking.BookingStatus}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        Booking ID: {booking.BookingID}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No recent bookings found</p>
                <Link 
                  to="/staff/bookings" 
                  className="text-sm text-primary-600 hover:text-primary-800 font-medium mt-2 inline-block"
                >
                  Create your first booking
                </Link>
              </div>
            )}
          </div>

          {/* Today's Tasks */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Tasks</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Check-ins</p>
                  <p className="text-xs text-gray-600">Process guest arrivals</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <Clock className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Check-outs</p>
                  <p className="text-xs text-gray-600">Process departures</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                <BedDouble className="h-5 w-5 text-purple-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Room Status</p>
                  <p className="text-xs text-gray-600">Update room availability</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tips and Shortcuts */}
        <div className="card bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <ClipboardList className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">💡 Quick Tips</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Always verify guest information before creating bookings</li>
                <li>• Check room availability for the entire stay duration</li>
                <li>• Add services during check-in to enhance guest experience</li>
                <li>• Generate bills before check-out for smooth departures</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StaffDashboard;
/**
 * Room Occupancy Report Component
 * Displays room occupancy statistics for a selected date range
 */

import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import { Calendar, Building2, Users, Bed, Clock, Filter, Download } from 'lucide-react';
import toast from 'react-hot-toast';

  const OccupancyReport = () => {
  const { user } = useAuth();
  const [reportData, setReportData] = useState([]);
  const [branches, setBranches] = useState([]);
  const [filters, setFilters] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Next week
    branchId: ''
  });
  const [loading, setLoading] = useState(false);
  const [summaryStats, setSummaryStats] = useState({
    totalRooms: 0,
    occupiedRooms: 0,
    availableRooms: 0,
    occupancyRate: 0,
    totalBookings: 0
  });

  // Fetch branches for filter dropdown
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await adminAPI.getBranches();
        setBranches(response.data.data || []);
      } catch (error) {
        console.error('Failed to fetch branches:', error);
        toast.error('Failed to load branches');
      }
    };

    fetchBranches();
  }, []);

  // Fetch report data
  const fetchReport = async () => {
    if (!filters.startDate || !filters.endDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    if (new Date(filters.startDate) > new Date(filters.endDate)) {
      toast.error('Start date cannot be after end date');
      return;
    }

    setLoading(true);
    try {
      const params = {
        startDate: filters.startDate,
        endDate: filters.endDate
      };
      
      if (filters.branchId) {
        params.branchId = filters.branchId;
      }

      const response = await adminAPI.getRoomOccupancyReport(params);
      const data = response.data.data || [];
      setReportData(data);

      // Calculate summary statistics
      const totalRooms = data.length;
      const occupiedRooms = data.filter(room => room.OccupancyStatus === 'Occupied').length;
      const availableRooms = totalRooms - occupiedRooms;
      const occupancyRate = totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(1) : 0;
      const totalBookings = data.reduce((sum, room) => sum + (room.BookingsInPeriod || 0), 0);

      setSummaryStats({
        totalRooms,
        occupiedRooms,
        availableRooms,
        occupancyRate,
        totalBookings
      });

      toast.success('Report generated successfully');
    } catch (error) {
      console.error('Failed to fetch occupancy report:', error);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  // Export to CSV
  const exportToCSV = () => {
    if (reportData.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = ['Branch', 'Room Number', 'Room Type', 'Capacity', 'Daily Rate', 'Status', 'Bookings in Period', 'Occupied Days', 'Total Days'];
    const csvContent = [
      headers.join(','),
      ...reportData.map(room => [
        room.BranchCity,
        room.RoomNumber,
        room.RoomType,
        room.Capacity,
        room.DailyRate,
        room.OccupancyStatus,
        room.BookingsInPeriod,
        room.OccupiedDays,
        room.TotalDaysInPeriod
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `room_occupancy_report_${filters.startDate}_to_${filters.endDate}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Bed className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Room Occupancy Report</h1>
              <p className="text-gray-600">Track room occupancy rates and availability</p>
            </div>
          </div>
          {reportData.length > 0 && (
            <button
              onClick={exportToCSV}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Filter className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Report Filters</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
              <input
                type="text"
                value={user?.BranchCity ? `${user.BranchCity}` : 'Your Branch'}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={fetchReport}
                disabled={loading}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        {reportData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Rooms</p>
                  <p className="text-2xl font-bold text-gray-900">{summaryStats.totalRooms}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="bg-red-100 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Occupied</p>
                  <p className="text-2xl font-bold text-gray-900">{summaryStats.occupiedRooms}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Bed className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Available</p>
                  <p className="text-2xl font-bold text-gray-900">{summaryStats.availableRooms}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{summaryStats.occupancyRate}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{summaryStats.totalBookings}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Report Table */}
        {reportData.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Room Details</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Daily Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bookings</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Occupied Days</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilization</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.map((room, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-gray-900">{room.RoomNumber}</div>
                          <div className="text-sm text-gray-500">{room.BranchCity}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{room.RoomType}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{room.Capacity} guests</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${room.DailyRate}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          room.OccupancyStatus === 'Occupied' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {room.OccupancyStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{room.BookingsInPeriod}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{room.OccupiedDays} / {room.TotalDaysInPeriod}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-900">
                            {room.TotalDaysInPeriod > 0 ? ((room.OccupiedDays / room.TotalDaysInPeriod) * 100).toFixed(1) : 0}%
                          </span>
                          <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ 
                                width: `${room.TotalDaysInPeriod > 0 ? (room.OccupiedDays / room.TotalDaysInPeriod) * 100 : 0}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && reportData.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Bed className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-500">Select a date range and click "Generate Report" to view occupancy data.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default OccupancyReport;

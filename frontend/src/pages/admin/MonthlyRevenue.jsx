/**
 * Monthly Revenue Report Component
 * Displays monthly revenue breakdown per branch with charts
 */

import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import Layout from '../../components/Layout';
import { DollarSign, TrendingUp, Calendar, Building2, Filter, Download, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

const MonthlyRevenue = () => {
  const [reportData, setReportData] = useState([]);
  const [branches, setBranches] = useState([]);
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    branchId: ''
  });
  const [loading, setLoading] = useState(false);
  const [summaryStats, setSummaryStats] = useState({
    totalRevenue: 0,
    roomRevenue: 0,
    serviceRevenue: 0,
    collectedRevenue: 0,
    outstandingRevenue: 0,
    averageMonthlyRevenue: 0
  });
  const [chartData, setChartData] = useState([]);

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
    setLoading(true);
    try {
      const params = {
        year: filters.year
      };
      
      if (filters.branchId) params.branchId = filters.branchId;

      const response = await adminAPI.getMonthlyRevenueReport(params);
      const data = response.data.data || [];
      setReportData(data);

      // Calculate summary statistics
      const totalRevenue = data.reduce((sum, item) => sum + (parseFloat(item.TotalRevenue) || 0), 0);
      const roomRevenue = data.reduce((sum, item) => sum + (parseFloat(item.RoomRevenue) || 0), 0);
      const serviceRevenue = data.reduce((sum, item) => sum + (parseFloat(item.ServiceRevenue) || 0), 0);
      const collectedRevenue = data.reduce((sum, item) => sum + (parseFloat(item.CollectedRevenue) || 0), 0);
      const outstandingRevenue = data.reduce((sum, item) => sum + (parseFloat(item.OutstandingRevenue) || 0), 0);
      const averageMonthlyRevenue = data.length > 0 ? totalRevenue / data.length : 0;

      setSummaryStats({
        totalRevenue,
        roomRevenue,
        serviceRevenue,
        collectedRevenue,
        outstandingRevenue,
        averageMonthlyRevenue
      });

      // Prepare chart data
      const months = Array.from({length: 12}, (_, i) => {
        const month = i + 1;
        const monthData = data.find(item => item.RevenueMonth === month);
        return {
          month: month,
          monthName: new Date(0, i).toLocaleString('default', { month: 'short' }),
          totalRevenue: monthData ? parseFloat(monthData.TotalRevenue) : 0,
          roomRevenue: monthData ? parseFloat(monthData.RoomRevenue) : 0,
          serviceRevenue: monthData ? parseFloat(monthData.ServiceRevenue) : 0
        };
      });
      setChartData(months);

      toast.success('Report generated successfully');
    } catch (error) {
      console.error('Failed to fetch monthly revenue report:', error);
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

    const headers = ['Branch', 'Year', 'Month', 'Month Name', 'Total Bills', 'Total Bookings', 'Room Revenue', 'Service Revenue', 'Total Revenue', 'Collected Revenue', 'Outstanding Revenue', 'Avg Revenue per Booking'];
    const csvContent = [
      headers.join(','),
      ...reportData.map(item => [
        `"${item.BranchCity}"`,
        item.RevenueYear,
        item.RevenueMonth,
        item.MonthName,
        item.TotalBills,
        item.TotalBookings,
        item.RoomRevenue,
        item.ServiceRevenue,
        item.TotalRevenue,
        item.CollectedRevenue,
        item.OutstandingRevenue,
        item.AverageRevenuePerBooking
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `monthly_revenue_report_${filters.year}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount) => {
    return `LKR ${(amount || 0).toLocaleString()}`;
  };

  // Simple bar chart component
  const SimpleBarChart = ({ data, title }) => {
    const maxValue = Math.max(...data.map(d => d.totalRevenue));
    
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-12 text-sm text-gray-600 font-medium">
                {item.monthName}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-4 relative overflow-hidden">
                    <div 
                      className="bg-blue-600 h-4 rounded-full transition-all duration-300" 
                      style={{ width: `${maxValue > 0 ? (item.totalRevenue / maxValue) * 100 : 0}%` }}
                    ></div>
                    {/* Room revenue layer */}
                    <div 
                      className="bg-green-500 h-4 rounded-full absolute top-0 left-0 transition-all duration-300" 
                      style={{ width: `${maxValue > 0 ? (item.roomRevenue / maxValue) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <div className="w-20 text-sm text-gray-900 font-medium text-right">
                    {formatCurrency(item.totalRevenue)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-gray-600">Room Revenue</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-600 rounded"></div>
            <span className="text-gray-600">Total Revenue</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Monthly Revenue Report</h1>
              <p className="text-gray-600">Track monthly revenue trends from rooms and services</p>
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <input
                type="number"
                min="2020"
                max={new Date().getFullYear() + 5}
                value={filters.year}
                onChange={(e) => handleFilterChange('year', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
              <select
                value={filters.branchId}
                onChange={(e) => handleFilterChange('branchId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Branches</option>
                {branches.map(branch => (
                  <option key={branch.BranchID} value={branch.BranchID}>
                    {branch.City} - {branch.Address}
                  </option>
                ))}
              </select>
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
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(summaryStats.totalRevenue)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Building2 className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Room Revenue</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(summaryStats.roomRevenue)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Service Revenue</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(summaryStats.serviceRevenue)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="bg-emerald-100 p-3 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Collected</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(summaryStats.collectedRevenue)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="bg-red-100 p-3 rounded-lg">
                  <Calendar className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Outstanding</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(summaryStats.outstandingRevenue)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Monthly</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(summaryStats.averageMonthlyRevenue)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Revenue Chart */}
        {chartData.length > 0 && (
          <SimpleBarChart 
            data={chartData} 
            title={`${filters.year} Monthly Revenue Trend${filters.branchId ? ' - Selected Branch' : ' - All Branches'}`} 
          />
        )}

        {/* Report Table */}
        {reportData.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Monthly Revenue Details</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bills</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bookings</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Collected</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Outstanding</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg/Booking</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.MonthName}</div>
                        <div className="text-sm text-gray-500">{item.RevenueYear}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.BranchCity}</div>
                        <div className="text-sm text-gray-500">{item.BranchAddress}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.TotalBills}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.TotalBookings}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.RoomRevenue)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.ServiceRevenue)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(item.TotalRevenue)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">{formatCurrency(item.CollectedRevenue)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${
                          parseFloat(item.OutstandingRevenue) > 0 ? 'text-red-600' : 'text-gray-900'
                        }`}>
                          {formatCurrency(item.OutstandingRevenue)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.AverageRevenuePerBooking)}</td>
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
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Revenue Data Available</h3>
            <p className="text-gray-500">No revenue information found for the selected year and branch.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MonthlyRevenue;

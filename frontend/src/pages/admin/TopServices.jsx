/**
 * Top Services Report Component
 * Displays top-used services and customer preference trends
 */

import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import Layout from '../../components/Layout';
import { Trophy, TrendingUp, Users, Wrench, Filter, Download, Star, BarChart3, Target } from 'lucide-react';
import toast from 'react-hot-toast';

const TopServices = () => {
  const [reportData, setReportData] = useState([]);
  const [branches, setBranches] = useState([]);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    branchId: '',
    limit: 10
  });
  const [loading, setLoading] = useState(false);
  const [summaryStats, setSummaryStats] = useState({
    totalServices: 0,
    totalUsages: 0,
    totalRevenue: 0,
    topService: '',
    averageUsagePercentage: 0
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
    setLoading(true);
    try {
      const params = {
        limit: filters.limit
      };
      
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.branchId) params.branchId = filters.branchId;

      const response = await adminAPI.getTopServicesReport(params);
      const data = response.data.data || [];
      setReportData(data);

      // Calculate summary statistics
      const totalServices = data.length;
      const totalUsages = data.reduce((sum, service) => sum + (parseInt(service.TotalUsages) || 0), 0);
      const totalRevenue = data.reduce((sum, service) => sum + (parseFloat(service.TotalRevenue) || 0), 0);
      const topService = data.length > 0 ? data[0].ServiceName : 'N/A';
      const averageUsagePercentage = totalServices > 0 ? 
        data.reduce((sum, service) => sum + (parseFloat(service.UsagePercentage) || 0), 0) / totalServices : 0;

      setSummaryStats({
        totalServices,
        totalUsages,
        totalRevenue,
        topService,
        averageUsagePercentage
      });

      toast.success('Report generated successfully');
    } catch (error) {
      console.error('Failed to fetch top services report:', error);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchReport();
  }, []);

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

    const headers = ['Rank', 'Service Name', 'Base Price', 'Total Usages', 'Total Quantity', 'Unique Bookings', 'Unique Guests', 'Total Revenue', 'Average Price', 'Usage Percentage', 'Demand Level'];
    const csvContent = [
      headers.join(','),
      ...reportData.map((service, index) => [
        index + 1,
        `"${service.ServiceName}"`,
        service.BasePrice,
        service.TotalUsages,
        service.TotalQuantity,
        service.UniqueBookings,
        service.UniqueGuests,
        service.TotalRevenue,
        service.AveragePrice,
        service.UsagePercentage,
        service.DemandLevel
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `top_services_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount) => {
    return `LKR ${(amount || 0).toLocaleString()}`;
  };

  // Get demand level color
  const getDemandLevelColor = (level) => {
    switch (level) {
      case 'High Demand':
        return 'bg-red-100 text-red-800';
      case 'Medium Demand':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low Demand':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get rank badge color
  const getRankBadgeColor = (rank) => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (rank <= 3) return 'bg-gray-100 text-gray-800 border-gray-200';
    if (rank <= 5) return 'bg-bronze-100 text-bronze-800 border-bronze-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  // Simple horizontal bar chart for top services
  const ServicesChart = ({ data, title }) => {
    const maxUsages = Math.max(...data.map(d => parseInt(d.TotalUsages) || 0));
    
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="space-y-3">
          {data.slice(0, 10).map((service, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-8 text-sm text-gray-600 font-medium text-center">
                #{index + 1}
              </div>
              <div className="w-32 text-sm text-gray-900 font-medium truncate" title={service.ServiceName}>
                {service.ServiceName}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-4 relative overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-500" 
                      style={{ width: `${maxUsages > 0 ? (parseInt(service.TotalUsages) / maxUsages) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <div className="w-16 text-sm text-gray-900 font-medium text-right">
                    {service.TotalUsages}
                  </div>
                  <div className="w-20 text-sm text-gray-600 text-right">
                    {formatCurrency(service.TotalRevenue)}
                  </div>
                </div>
              </div>
            </div>
          ))}
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
            <div className="bg-yellow-100 p-2 rounded-lg">
              <Trophy className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Top Services Report</h1>
              <p className="text-gray-600">Analyze most popular services and customer preferences</p>
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
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Top Results</label>
              <select
                value={filters.limit}
                onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={5}>Top 5</option>
                <option value={10}>Top 10</option>
                <option value={20}>Top 20</option>
                <option value={50}>Top 50</option>
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Wrench className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Services</p>
                  <p className="text-2xl font-bold text-gray-900">{summaryStats.totalServices}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Usages</p>
                  <p className="text-2xl font-bold text-gray-900">{summaryStats.totalUsages.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(summaryStats.totalRevenue)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <Trophy className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Top Service</p>
                  <p className="text-lg font-bold text-gray-900 truncate" title={summaryStats.topService}>
                    {summaryStats.topService}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="bg-indigo-100 p-3 rounded-lg">
                  <Target className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Usage %</p>
                  <p className="text-2xl font-bold text-gray-900">{summaryStats.averageUsagePercentage.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Services Chart */}
        {reportData.length > 0 && (
          <ServicesChart 
            data={reportData} 
            title={`Top ${filters.limit} Services by Usage`} 
          />
        )}

        {/* Report Table */}
        {reportData.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Service Rankings & Details</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usages</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customers</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Market Share</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Demand Level</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.map((service, index) => {
                    const rank = index + 1;
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full border-2 font-bold text-sm ${getRankBadgeColor(rank)}`}>
                            {rank === 1 && <Trophy className="h-4 w-4" />}
                            {rank !== 1 && rank}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                                <Wrench className="h-5 w-5 text-indigo-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{service.ServiceName}</div>
                              <div className="text-sm text-gray-500">ID: {service.ServiceID}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(service.BasePrice)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex flex-col">
                            <span className="font-medium">{service.TotalUsages}</span>
                            <span className="text-xs text-gray-500">{service.UniqueBookings} bookings</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{service.TotalQuantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <Users className="h-4 w-4 mr-1 text-gray-400" />
                            {service.UniqueGuests}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(service.TotalRevenue)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(service.AveragePrice)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">
                              {parseFloat(service.UsagePercentage).toFixed(1)}%
                            </span>
                            <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${Math.min(parseFloat(service.UsagePercentage), 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDemandLevelColor(service.DemandLevel)}`}>
                            {service.DemandLevel}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && reportData.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Service Data Available</h3>
            <p className="text-gray-500">No service usage information found for the selected criteria.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TopServices;

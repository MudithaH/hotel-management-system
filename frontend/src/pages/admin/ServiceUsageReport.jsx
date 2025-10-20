/**
 * Service Usage Report Component
 * Displays service usage breakdown per room and service type
 */

import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import { Wrench, TrendingUp, BarChart3, Filter, Download, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

  const ServiceUsageReport = () => {
  const { user } = useAuth();
  const [reportData, setReportData] = useState([]);
  const [branches, setBranches] = useState([]);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    branchId: ''
  });
  const [loading, setLoading] = useState(false);
  const [summaryStats, setSummaryStats] = useState({
    totalServices: 0,
    totalUsages: 0,
    totalRevenue: 0,
    averageUsagePerRoom: 0,
    mostUsedService: ''
  });
  const [groupBy, setGroupBy] = useState('service'); // 'service' or 'room'

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
      const params = {};
      
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.branchId) params.branchId = filters.branchId;

      const response = await adminAPI.getServiceUsageReport(params);
      const data = response.data.data || [];
      setReportData(data);

      // Calculate summary statistics
      const totalServices = new Set(data.map(item => item.ServiceName)).size;
      const totalUsages = data.reduce((sum, item) => sum + (parseInt(item.UsageCount) || 0), 0);
      const totalRevenue = data.reduce((sum, item) => sum + (parseFloat(item.TotalRevenue) || 0), 0);
      const totalRooms = new Set(data.map(item => `${item.BranchCity}-${item.RoomNumber}`)).size;
      const averageUsagePerRoom = totalRooms > 0 ? (totalUsages / totalRooms).toFixed(1) : 0;
      
      // Find most used service
      const serviceUsageMap = {};
      data.forEach(item => {
        const serviceName = item.ServiceName;
        serviceUsageMap[serviceName] = (serviceUsageMap[serviceName] || 0) + (parseInt(item.UsageCount) || 0);
      });
      const mostUsedService = Object.keys(serviceUsageMap).reduce((a, b) => 
        serviceUsageMap[a] > serviceUsageMap[b] ? a : b, '') || 'N/A';

      setSummaryStats({
        totalServices,
        totalUsages,
        totalRevenue,
        averageUsagePerRoom,
        mostUsedService
      });

      toast.success('Report generated successfully');
    } catch (error) {
      console.error('Failed to fetch service usage report:', error);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };



  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  // Group data by service or room
  const getGroupedData = () => {
    if (groupBy === 'service') {
      const serviceMap = {};
      reportData.forEach(item => {
        const key = item.ServiceName;
        if (!serviceMap[key]) {
          serviceMap[key] = {
            ServiceName: key,
            ServiceBasePrice: item.ServiceBasePrice,
            TotalUsageCount: 0,
            TotalQuantity: 0,
            TotalRevenue: 0,
            RoomCount: 0,
            rooms: new Set()
          };
        }
        serviceMap[key].TotalUsageCount += parseInt(item.UsageCount) || 0;
        serviceMap[key].TotalQuantity += parseInt(item.TotalQuantity) || 0;
        serviceMap[key].TotalRevenue += parseFloat(item.TotalRevenue) || 0;
        serviceMap[key].rooms.add(`${item.BranchCity}-${item.RoomNumber}`);
        serviceMap[key].RoomCount = serviceMap[key].rooms.size;
      });
      return Object.values(serviceMap).sort((a, b) => b.TotalRevenue - a.TotalRevenue);
    } else {
      const roomMap = {};
      reportData.forEach(item => {
        const key = `${item.BranchCity}-${item.RoomNumber}`;
        if (!roomMap[key]) {
          roomMap[key] = {
            BranchCity: item.BranchCity,
            RoomNumber: item.RoomNumber,
            RoomType: item.RoomType,
            ServiceCount: 0,
            TotalUsageCount: 0,
            TotalQuantity: 0,
            TotalRevenue: 0,
            services: new Set()
          };
        }
        roomMap[key].TotalUsageCount += parseInt(item.UsageCount) || 0;
        roomMap[key].TotalQuantity += parseInt(item.TotalQuantity) || 0;
        roomMap[key].TotalRevenue += parseFloat(item.TotalRevenue) || 0;
        roomMap[key].services.add(item.ServiceName);
        roomMap[key].ServiceCount = roomMap[key].services.size;
      });
      return Object.values(roomMap).sort((a, b) => b.TotalRevenue - a.TotalRevenue);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    if (reportData.length === 0) {
      toast.error('No data to export');
      return;
    }

    let headers, rows;
    
    if (groupBy === 'service') {
      const groupedData = getGroupedData();
      headers = ['Service Name', 'Base Price', 'Total Usages', 'Total Quantity', 'Total Revenue', 'Rooms Used'];
      rows = groupedData.map(item => [
        `"${item.ServiceName}"`,
        item.ServiceBasePrice,
        item.TotalUsageCount,
        item.TotalQuantity,
        item.TotalRevenue.toFixed(2),
        item.RoomCount
      ]);
    } else {
      const groupedData = getGroupedData();
      headers = ['Branch', 'Room Number', 'Room Type', 'Services Count', 'Total Usages', 'Total Quantity', 'Total Revenue'];
      rows = groupedData.map(item => [
        item.BranchCity,
        item.RoomNumber,
        item.RoomType,
        item.ServiceCount,
        item.TotalUsageCount,
        item.TotalQuantity,
        item.TotalRevenue.toFixed(2)
      ]);
    }

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `service_usage_report_${groupBy}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount) => {
    return `LKR ${(amount || 0).toLocaleString()}`;
  };

  const groupedData = getGroupedData();

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Wrench className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Service Usage Report</h1>
              <p className="text-gray-600">Analyze service usage patterns by room and service type</p>
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
            <h2 className="text-lg font-semibold text-gray-900">Report Filters & Options</h2>
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
              <input
                type="text"
                value={user?.BranchCity ? `${user.BranchCity}` : 'Your Branch'}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Group By</label>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="service">By Service</option>
                <option value="room">By Room</option>
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
                  <p className="text-2xl font-bold text-gray-900">{summaryStats.totalUsages}</p>
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
                <div className="bg-orange-100 p-3 rounded-lg">
                  <Building2 className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Usage/Room</p>
                  <p className="text-2xl font-bold text-gray-900">{summaryStats.averageUsagePerRoom}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="bg-red-100 p-3 rounded-lg">
                  <Wrench className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Top Service</p>
                  <p className="text-lg font-bold text-gray-900 truncate" title={summaryStats.mostUsedService}>
                    {summaryStats.mostUsedService}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Report Table */}
        {groupedData.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Service Usage Details - {groupBy === 'service' ? 'Grouped by Service' : 'Grouped by Room'}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {groupBy === 'service' ? (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Usages</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Quantity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Revenue</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rooms Used</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg per Room</th>
                      </>
                    ) : (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Services Used</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Usages</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Quantity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Revenue</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg per Service</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {groupedData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      {groupBy === 'service' ? (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{item.ServiceName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(item.ServiceBasePrice)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.TotalUsageCount}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.TotalQuantity}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(item.TotalRevenue)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.RoomCount}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.RoomCount > 0 ? formatCurrency(item.TotalRevenue / item.RoomCount) : '$0.00'}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{item.RoomNumber}</div>
                            <div className="text-sm text-gray-500">{item.BranchCity}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.RoomType}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.ServiceCount}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.TotalUsageCount}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.TotalQuantity}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(item.TotalRevenue)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.ServiceCount > 0 ? formatCurrency(item.TotalRevenue / item.ServiceCount) : '$0.00'}
                          </td>
                        </>
                      )}
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
            <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Service Usage Data</h3>
            <p className="text-gray-500">No service usage information found for the selected criteria.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ServiceUsageReport;

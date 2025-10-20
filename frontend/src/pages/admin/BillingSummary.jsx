/**
 * Guest Billing Summary Report Component
 * Displays guest billing information including unpaid balances
 */

import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import { CreditCard, AlertTriangle, CheckCircle, DollarSign, Users, Filter, Download, Mail, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

  const BillingSummary = () => {
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
    totalGuests: 0,
    totalBillAmount: 0,
    totalPaidAmount: 0,
    totalUnpaidAmount: 0,
    guestsWithOutstanding: 0
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
      const params = {};
      
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.branchId) params.branchId = filters.branchId;

      const response = await adminAPI.getGuestBillingSummary(params);
      const data = response.data.data || [];
      setReportData(data);

      // Calculate summary statistics
      const totalGuests = data.length;
      const totalBillAmount = data.reduce((sum, guest) => sum + (parseFloat(guest.TotalBillAmount) || 0), 0);
      const totalPaidAmount = data.reduce((sum, guest) => sum + (parseFloat(guest.TotalPaidAmount) || 0), 0);
      const totalUnpaidAmount = data.reduce((sum, guest) => sum + (parseFloat(guest.UnpaidBalance) || 0), 0);
      const guestsWithOutstanding = data.filter(guest => parseFloat(guest.UnpaidBalance) > 0).length;

      setSummaryStats({
        totalGuests,
        totalBillAmount,
        totalPaidAmount,
        totalUnpaidAmount,
        guestsWithOutstanding
      });

      toast.success('Report generated successfully');
    } catch (error) {
      console.error('Failed to fetch billing summary:', error);
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

    const headers = ['Guest Name', 'Email', 'Phone', 'Total Bookings', 'Room Charges', 'Service Charges', 'Total Bill', 'Total Paid', 'Unpaid Balance', 'Status', 'Last Bill Date'];
    const csvContent = [
      headers.join(','),
      ...reportData.map(guest => [
        `"${guest.GuestName}"`,
        guest.Email,
        guest.Phone,
        guest.TotalBookings,
        guest.TotalRoomCharges,
        guest.TotalServiceCharges,
        guest.TotalBillAmount,
        guest.TotalPaidAmount,
        guest.UnpaidBalance,
        guest.PaymentStatus,
        guest.LastBillDate ? new Date(guest.LastBillDate).toLocaleDateString() : ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `guest_billing_summary_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount) => {
    return `LKR ${(amount || 0).toLocaleString()}`;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <CreditCard className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Guest Billing Summary</h1>
              <p className="text-gray-600">Monitor guest billing status and outstanding balances</p>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date (Optional)</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date (Optional)</label>
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
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Guests</p>
                  <p className="text-2xl font-bold text-gray-900">{summaryStats.totalGuests}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Bills</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(summaryStats.totalBillAmount)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Paid</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(summaryStats.totalPaidAmount)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="bg-red-100 p-3 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Outstanding</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(summaryStats.totalUnpaidAmount)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <CreditCard className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">With Outstanding</p>
                  <p className="text-2xl font-bold text-gray-900">{summaryStats.guestsWithOutstanding}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Report Table */}
        {reportData.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Guest Billing Details</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bookings</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room Charges</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Charges</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Bill</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Outstanding</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.map((guest, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{guest.GuestName}</div>
                        {guest.LastBillDate && (
                          <div className="text-sm text-gray-500">
                            Last bill: {new Date(guest.LastBillDate).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center text-sm text-gray-900">
                            <Mail className="h-3 w-3 mr-1 text-gray-400" />
                            {guest.Email}
                          </div>
                          <div className="flex items-center text-sm text-gray-900">
                            <Phone className="h-3 w-3 mr-1 text-gray-400" />
                            {guest.Phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{guest.TotalBookings}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(guest.TotalRoomCharges)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(guest.TotalServiceCharges)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(guest.TotalBillAmount)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">{formatCurrency(guest.TotalPaidAmount)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${
                          parseFloat(guest.UnpaidBalance) > 0 ? 'text-red-600' : 'text-gray-900'
                        }`}>
                          {formatCurrency(guest.UnpaidBalance)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          guest.PaymentStatus === 'Outstanding' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {guest.PaymentStatus}
                        </span>
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
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Billing Data Available</h3>
            <p className="text-gray-500">No guest billing information found for the selected criteria.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BillingSummary;

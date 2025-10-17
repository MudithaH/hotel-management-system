/**
 * Billing Management Component (Staff)
 * Generate bills and process payments for bookings
 */

import React, { useState, useEffect } from 'react';
import { staffAPI } from '../../api';
import { 
  Receipt, 
  Search, 
  Eye, 
  DollarSign, 
  CreditCard,
  FileText,
  X,
  Calendar,
  User,
  MapPin
} from 'lucide-react';
import Layout from '../../components/Layout';
import toast from 'react-hot-toast';

const BillingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [bills, setBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [serviceDetails, setServiceDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showBillModal, setShowBillModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    paymentMethod: 'cash',
    amount: 0,
    paymentDate: new Date().toISOString().split('T')[0]
  });
  const [activeTab, setActiveTab] = useState('pending'); // pending, partially, paid, all

  // Fetch data on component mount
  useEffect(() => {
    Promise.all([
      fetchBookings(),
      fetchBills()
    ]);
  }, []);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const response = await staffAPI.getBookings();
      setBookings(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBills = async () => {
    try {
      const response = await staffAPI.getBills();
      setBills(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch bills:', error);
      toast.error('Failed to load bills');
    }
  };

  // Generate bill for a booking
  const generateBill = async (bookingId) => {
    try {
      const response = await staffAPI.generateBill(bookingId, {
        discount: 0,
        taxRate: 0.0  // Set to 0% tax rate since your example shows $0.00 tax
      });
      toast.success('Bill generated successfully');
      await fetchBills(); // Refresh bills
    } catch (error) {
      console.error('Failed to generate bill:', error);
    }
  };

  // Process payment
  const processPayment = async (e) => {
    e.preventDefault();
    
    try {
      await staffAPI.processPayment({
        billId: selectedBill.BillID,
        paymentMethod: paymentData.paymentMethod,
        amount: parseFloat(paymentData.amount),
        paymentDate: paymentData.paymentDate
      });
      toast.success('Payment processed successfully');
      setShowPaymentModal(false);
      await fetchBills(); // Refresh bills
      resetPaymentForm();
    } catch (error) {
      console.error('Failed to process payment:', error);
    }
  };

  // Fetch service details for a booking
  const fetchServiceDetails = async (bookingId) => {
    try {
      const response = await staffAPI.getServiceUsage(bookingId);
      setServiceDetails(response.data.data.services || []);
    } catch (error) {
      console.error('Failed to fetch service details:', error);
      setServiceDetails([]);
    }
  };

  // Reset payment form
  const resetPaymentForm = () => {
    setPaymentData({
      paymentMethod: 'cash',
      amount: 0,
      paymentDate: new Date().toISOString().split('T')[0]
    });
    setSelectedBill(null);
  };

  // Handle payment form changes
  const handlePaymentInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Open payment modal
  const handleProcessPayment = (bill) => {
    setSelectedBill(bill);
    const toNumber = (v) => {
      const n = parseFloat(v);
      return Number.isFinite(n) ? n : 0;
    };

    const remaining = bill.RemainingAmount !== undefined ? toNumber(bill.RemainingAmount) : (toNumber(bill.TotalAmount) - toNumber(bill.PaidAmount));
    setPaymentData({
      paymentMethod: 'cash',
      amount: remaining > 0 ? remaining : 0,
      paymentDate: new Date().toISOString().split('T')[0]
    });
    setShowPaymentModal(true);
  };

  // View bill details
  const handleViewBill = async (bill) => {
    setSelectedBill(bill);
    await fetchServiceDetails(bill.BookingID);
    setShowBillModal(true);
  };

  // Filter bills based on tab and search
  const filteredBills = bills.filter(bill => {
    const matchesSearch = 
      bill.GuestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.BookingID?.toString().includes(searchTerm) ||
      bill.BillID?.toString().includes(searchTerm);

    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'pending' && bill.PaymentStatus === 'pending') ||
      (activeTab === 'partially' && bill.PaymentStatus === 'partially_paid') ||
      (activeTab === 'paid' && bill.PaymentStatus === 'paid');

    return matchesSearch && matchesTab;
  });

  // Get bills that can be generated (bookings without bills)
  const billableBookings = bookings.filter(booking => {
    const hasBill = bills.some(bill => bill.BookingID === booking.BookingID);
    return !hasBill && booking.BookingStatus === 'checked-out';
  });

  // Format currency
  const formatCurrency = (amount) => {
    return `LKR ${(amount || 0).toLocaleString()}`;
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate stats
  const toNumber = (v) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  };

  const stats = {
    totalBills: bills.length,
    // Pending amount includes full pending bills + remaining amounts for partially paid bills
    pendingAmount:
      bills
        .filter((bill) => bill.PaymentStatus === 'pending')
        .reduce((sum, bill) => sum + toNumber(bill.TotalAmount), 0) +
      bills
        .filter((bill) => bill.PaymentStatus === 'partially_paid')
        .reduce((sum, bill) => sum + toNumber(bill.RemainingAmount), 0),
    // Paid amount includes fully paid bills + already-paid portion of partially paid bills
    paidAmount:
      bills
        .filter((bill) => bill.PaymentStatus === 'paid')
        .reduce((sum, bill) => sum + toNumber(bill.TotalAmount), 0) +
      bills
        .filter((bill) => bill.PaymentStatus === 'partially_paid')
        .reduce((sum, bill) => sum + toNumber(bill.PaidAmount), 0),
    billableBookings: billableBookings.length
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Loading billing data...</p>
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
          <div className="flex items-center space-x-3">
            <Receipt className="h-8 w-8 text-primary-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Billing Management</h1>
              <p className="text-gray-600">Generate bills and process payments</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card text-center">
            <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.totalBills}</p>
            <p className="text-sm text-gray-600">Total Bills</p>
          </div>
          <div className="card text-center">
            <DollarSign className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.pendingAmount)}</p>
            <p className="text-sm text-gray-600">Pending Amount</p>
          </div>
          <div className="card text-center">
            <CreditCard className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.paidAmount)}</p>
            <p className="text-sm text-gray-600">Paid Amount</p>
          </div>
          <div className="card text-center">
            <Receipt className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.billableBookings}</p>
            <p className="text-sm text-gray-600">Billable Bookings</p>
          </div>
        </div>

        {/* Billable Bookings */}
        {billableBookings.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ready to Bill</h3>
            <div className="space-y-3">
              {billableBookings.slice(0, 5).map((booking) => (
                <div key={booking.BookingID} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium text-gray-900">Booking #{booking.BookingID}</p>
                        <p className="text-sm text-gray-600">{booking.GuestName}</p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(booking.CheckInDate)} - {formatDate(booking.CheckOutDate)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => generateBill(booking.BookingID)}
                    className="btn-primary text-sm"
                  >
                    Generate Bill
                  </button>
                </div>
              ))}
              {billableBookings.length > 5 && (
                <p className="text-sm text-gray-500 text-center">
                  And {billableBookings.length - 5} more bookings ready for billing
                </p>
              )}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search bills by guest name, booking ID, or bill ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'pending'
                  ? 'bg-red-100 text-red-700 border border-red-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending ({bills.filter(b => b.PaymentStatus === 'pending').length})
            </button>
            <button
              onClick={() => setActiveTab('partially')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'partially'
                  ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Partially Paid ({bills.filter(b => b.PaymentStatus === 'partially_paid').length})
            </button>
            <button
              onClick={() => setActiveTab('paid')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'paid'
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Paid ({bills.filter(b => b.PaymentStatus === 'paid').length})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'all'
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({bills.length})
            </button>
          </div>
        </div>

        {/* Bills Table */}
        <div className="card p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bill Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guest & Booking
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Generated Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBills.map((bill) => (
                  <tr key={bill.BillID} className="table-row">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          Bill #{bill.BillID}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{bill.GuestName}</div>
                        <div className="text-sm text-gray-500">Booking #{bill.BookingID}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {bill.PaymentStatus === 'partially_paid' ? (
                          <>
                            <div>{formatCurrency(bill.TotalAmount)}</div>
                            <div className="text-sm text-gray-500">Paid: {formatCurrency(bill.PaidAmount || 0)}</div>
                            <div className="text-sm text-gray-500">Remaining: {formatCurrency(bill.RemainingAmount || 0)}</div>
                          </>
                        ) : (
                          <div>{formatCurrency(bill.TotalAmount)}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        bill.PaymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                        bill.PaymentStatus === 'partially_paid' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {bill.PaymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {formatDate(bill.BillDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleViewBill(bill)}
                          className="btn-secondary text-sm flex items-center space-x-1"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View</span>
                        </button>
                        {(bill.PaymentStatus === 'pending' || bill.PaymentStatus === 'partially_paid') && (
                          <button
                            onClick={() => handleProcessPayment(bill)}
                            className="btn-primary text-sm flex items-center space-x-1"
                          >
                            <CreditCard className="h-4 w-4" />
                            <span>Pay</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredBills.length === 0 && (
              <div className="text-center py-12">
                <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {searchTerm 
                    ? 'No bills found matching your search.' 
                    : `No ${activeTab === 'all' ? '' : activeTab + ' '}bills found.`}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bill Details Modal */}
        {showBillModal && selectedBill && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Bill Details</h2>
                  <button
                    onClick={() => setShowBillModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Bill Header */}
                <div className="border-b border-gray-200 pb-6 mb-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Bill Information</h3>
                      <div className="space-y-2">
                        <p><span className="font-medium">Bill ID:</span> #{selectedBill.BillID}</p>
                        <p><span className="font-medium">Booking ID:</span> #{selectedBill.BookingID}</p>
                        <p><span className="font-medium">Bill Date:</span> {formatDate(selectedBill.BillDate)}</p>
                        <p>
                          <span className="font-medium">Status:</span>
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                            selectedBill.PaymentStatus === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {selectedBill.PaymentStatus}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Guest Information</h3>
                      <div className="space-y-2">
                        <p><span className="font-medium">Name:</span> {selectedBill.GuestName}</p>
                        <p><span className="font-medium">Email:</span> {selectedBill.GuestEmail}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bill Breakdown */}
                <div className="space-y-6">
                  {/* Room Charges */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Room Charges</h4>
                    <div className="flex justify-between">
                      <span>Room charges</span>
                      <span>{formatCurrency(selectedBill.RoomCharges)}</span>
                    </div>
                  </div>

                  {/* Service Details */}
                  {serviceDetails.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="text-md font-semibold text-gray-900 mb-3">Services Used</h4>
                      <div className="space-y-2">
                        {serviceDetails.map((service, index) => (
                          <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{service.ServiceName}</p>
                              <p className="text-sm text-gray-500">
                                {service.Description} • Used on {formatDate(service.UsageDate)}
                              </p>
                              <p className="text-sm text-gray-600">
                                Qty: {service.Quantity} × {formatCurrency(service.PriceAtUsage)}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="font-medium">{formatCurrency(service.TotalCost)}</span>
                            </div>
                          </div>
                        ))}
                        <div className="flex justify-between font-medium pt-2 border-t border-gray-200">
                          <span>Total Service Charges:</span>
                          <span>{formatCurrency(selectedBill.ServiceCharges)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bill Summary */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Bill Summary</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Room Charges:</span>
                        <span>{formatCurrency(selectedBill.RoomCharges)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Service Charges:</span>
                        <span>{formatCurrency(selectedBill.ServiceCharges)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Discount:</span>
                        <span>-{formatCurrency(selectedBill.Discount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax:</span>
                        <span>{formatCurrency(selectedBill.Tax)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                        <span>Total Amount:</span>
                        <span>{formatCurrency(selectedBill.TotalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bill Total */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                    <span className="text-2xl font-bold text-primary-600">
                      {formatCurrency(selectedBill.TotalAmount)}
                    </span>
                  </div>
                </div>

                {(selectedBill.PaymentStatus === 'pending' || selectedBill.PaymentStatus === 'partially_paid') && (
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => {
                        setShowBillModal(false);
                        handleProcessPayment(selectedBill);
                      }}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <CreditCard className="h-5 w-5" />
                      <span>Process Payment</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && selectedBill && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full">
              <form onSubmit={processPayment} className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Process Payment</h2>
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">Bill #{selectedBill.BillID}</p>
                  <p className="text-sm text-blue-700">{selectedBill.GuestName}</p>
                  <p className="text-lg font-bold text-blue-900 mt-2">
                    Amount Due: {formatCurrency(selectedBill.RemainingAmount !== undefined ? selectedBill.RemainingAmount : selectedBill.TotalAmount)}
                  </p>
                  {selectedBill.PaymentStatus === 'partially_paid' && (
                    <p className="text-sm text-gray-600">Paid: {formatCurrency(selectedBill.PaidAmount || 0)}</p>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method *
                    </label>
                    <select
                      name="paymentMethod"
                      value={paymentData.paymentMethod}
                      onChange={handlePaymentInputChange}
                      required
                      className="input-field"
                    >
                      <option value="cash">Cash</option>
                      <option value="credit_card">Credit Card</option>
                      <option value="debit_card">Debit Card</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="check">Check</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Amount *
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={paymentData.amount}
                      onChange={handlePaymentInputChange}
                      step="0.01"
                      min="0.01"
                      max={(selectedBill.RemainingAmount !== undefined ? selectedBill.RemainingAmount : selectedBill.TotalAmount) || selectedBill.TotalAmount}
                      required
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Date *
                    </label>
                    <input
                      type="date"
                      name="paymentDate"
                      value={paymentData.paymentDate}
                      onChange={handlePaymentInputChange}
                      required
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-6 border-t border-gray-200 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 btn-primary">
                    Process Payment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BillingManagement;
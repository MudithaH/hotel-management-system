/**
 * Booking Operations Component (Staff)
 * Dedicated page for check-in, check-out operations
 */

import React, { useState, useEffect } from 'react';
import { staffAPI } from '../../api';
import { 
  Calendar, 
  Search, 
  LogIn,
  LogOut,
  User,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader,
  XCircle
} from 'lucide-react';
import Layout from '../../components/Layout';
import toast from 'react-hot-toast';

const BookingOperations = () => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [processingId, setProcessingId] = useState(null);

  // Fetch bookings on component mount
  useEffect(() => {
    fetchBookings();
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

  // Handle check-in
  const handleCheckIn = async (bookingId, guestName) => {
    try {
      setProcessingId(bookingId);
      await staffAPI.checkInBooking(bookingId);
      toast.success(`${guestName} checked in successfully`);
      await fetchBookings(); // Refresh the list
    } catch (error) {
      console.error('Check-in failed:', error);
      const message = error.response?.data?.message || 'Check-in failed';
      toast.error(message);
    } finally {
      setProcessingId(null);
    }
  };

  // Handle check-out
  const handleCheckOut = async (bookingId, guestName) => {
    try {
      setProcessingId(bookingId);
      const response = await staffAPI.checkOutBooking(bookingId);
      
      // Check if it's an early checkout with detailed response
      const data = response.data?.data;
      
      if (data?.isEarlyCheckout) {
        // Early checkout - show detailed information
        const refundAmount = data.refundAmount ? parseFloat(data.refundAmount) : 0;
        
        if (refundAmount > 0) {
          // Guest overpaid - show refund message
          toast.success(
            `Early Checkout Completed!\n\n` +
            `Guest: ${guestName}\n` +
            `Originally booked: ${data.bookedDays} days\n` +
            `Actually stayed: ${data.actualDaysStayed} days\n` +
            `Adjusted bill: LKR ${data.finalTotalAmount}\n\n` +
            `⚠️ REFUND DUE: LKR ${refundAmount.toFixed(2)}\n` +
            `Please process refund to guest.`,
            { duration: 8000 }
          );
        } else {
          // Normal early checkout
          toast.success(
            `Early Checkout Completed!\n\n` +
            `Guest: ${guestName}\n` +
            `Originally booked: ${data.bookedDays} days\n` +
            `Actually stayed: ${data.actualDaysStayed} days\n` +
            `Final bill: LKR ${data.finalTotalAmount}`,
            { duration: 6000 }
          );
        }
      } else {
        // Normal checkout
        toast.success(`${guestName} checked out successfully`);
      }
      
      await fetchBookings(); // Refresh the list
    } catch (error) {
      console.error('Check-out failed:', error);
      const errorData = error.response?.data?.data;
      
      // Show detailed error with remaining amount if available
      if (errorData?.remainingAmount) {
        // Add backdrop blur effect
        const backdrop = document.createElement('div');
        backdrop.id = 'checkout-error-backdrop';
        backdrop.className = 'fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-40';
        backdrop.style.transition = 'opacity 0.3s ease-in-out';
        document.body.appendChild(backdrop);
        
        // Custom error toast with navigation buttons - use toast.custom to avoid default error behavior
        toast.custom(
          (t) => (
            <div className="bg-white shadow-2xl rounded-lg p-5 w-full max-w-md border border-gray-300">
              <div className="flex flex-col space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <XCircle className="h-6 w-6 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-base text-gray-900">Checkout Failed - Payment Required</div>
                  </div>
                </div>
                <div className="text-sm space-y-1">
                  <div className="text-gray-700">Cannot check-out: Bill not fully paid.</div>
                  <div className="font-semibold text-red-700">
                    Remaining amount: LKR {errorData.remainingAmount}
                  </div>
                </div>
                <div className="text-sm bg-gray-50 p-3 rounded space-y-1 border border-gray-200">
                  <div className="font-medium text-gray-700">Bill Details:</div>
                  <div className="text-gray-600">Total Amount: LKR {errorData.totalAmount}</div>
                  <div className="text-gray-600">Already Paid: LKR {errorData.totalPaid}</div>
                  <div className="font-semibold text-gray-900">Remaining: LKR {errorData.remainingAmount}</div>
                  {errorData.isEarlyCheckout && (
                    <div className="text-orange-600 italic mt-1">
                      Early checkout: {errorData.actualDaysStayed} of {errorData.bookedDays} days
                    </div>
                  )}
                </div>
                <div className="flex space-x-2 pt-2">
                  <button
                    onClick={() => {
                      const backdropEl = document.getElementById('checkout-error-backdrop');
                      if (backdropEl) backdropEl.remove();
                      toast.dismiss(t.id);
                      window.location.href = '/staff/billing';
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Make the Payment
                  </button>
                  <button
                    onClick={() => {
                      const backdropEl = document.getElementById('checkout-error-backdrop');
                      if (backdropEl) backdropEl.remove();
                      toast.dismiss(t.id);
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ),
          { 
            duration: Infinity, // Don't auto-dismiss
            position: 'top-right',
            style: {
              marginTop: '80px',
              marginLeft: '20px',
              zIndex: 50
            }
          }
        );
      } else {
        // Simple error message for other errors
        const message = error.response?.data?.message || 'Check-out failed';
        toast.error(message);
      }
    } finally {
      setProcessingId(null);
    }
  };


  // Filter bookings based on search term and status
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.GuestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.BookingID?.toString().includes(searchTerm) ||
      booking.GuestEmail?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === 'all' || booking.BookingStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'checked-in':
        return 'bg-green-100 text-green-800';
      case 'checked-out':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  // Get appropriate action buttons - always show both Check In and Check Out buttons
  const getActionButton = (booking) => {
    const isProcessing = processingId === booking.BookingID;
    const isBooked = booking.BookingStatus === 'confirmed';
    const isCheckedIn = booking.BookingStatus === 'checked-in';
    const isCheckedOut = booking.BookingStatus === 'checked-out';
    const isCancelled = booking.BookingStatus === 'cancelled';
    
    // Check if bill exists and is fully paid
    const hasBill = booking.BillID != null;
    const billPaid = booking.BillStatus === 'paid';
    const remainingAmount = booking.RemainingAmount || 0;

    // For cancelled bookings, show status only
    if (isCancelled) {
      return (
        <span className="flex items-center space-x-1 text-sm text-red-500">
          <XCircle className="h-4 w-4" />
          <span>Cancelled</span>
        </span>
      );
    }

    // For checked-out bookings, show completed status only (no buttons)
    if (isCheckedOut) {
      return (
        <span className="flex items-center space-x-1 text-sm text-gray-500">
          <CheckCircle className="h-4 w-4" />
          <span>Completed</span>
        </span>
      );
    }

    // For active bookings (confirmed or checked-in), show both buttons vertically
    return (
      <div className="flex flex-col items-end space-y-2">
        {/* Check In Button - enabled only when status is 'confirmed' */}
        <button
          onClick={() => handleCheckIn(booking.BookingID, booking.GuestName)}
          disabled={!isBooked || isProcessing}
          className={`px-3 py-2 rounded-lg text-sm flex items-center space-x-1 transition-colors min-w-[120px] ${
            isBooked && !isProcessing
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
          }`}
        >
          {isProcessing && isBooked ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            <LogIn className="h-4 w-4" />
          )}
          <span>Check In</span>
        </button>

        {/* Check Out Button - enabled for all checked-in bookings (early checkout allowed) */}
        <button
          onClick={() => handleCheckOut(booking.BookingID, booking.GuestName)}
          disabled={!isCheckedIn || isProcessing}
          className={`px-3 py-2 rounded-lg text-sm flex items-center space-x-1 transition-colors min-w-[120px] ${
            isCheckedIn && !isProcessing
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
          }`}
        >
          {isProcessing && isCheckedIn ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
          <span>Check Out</span>
        </button>
      </div>
    );
  };

  // Calculate stats
  const stats = {
    total: bookings.length,
    confirmed: bookings.filter(b => b.BookingStatus === 'confirmed').length,
    checkedIn: bookings.filter(b => b.BookingStatus === 'checked-in').length,
    checkedOut: bookings.filter(b => b.BookingStatus === 'checked-out').length
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Loading booking operations...</p>
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
            <Calendar className="h-8 w-8 text-primary-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Booking Operations</h1>
              <p className="text-gray-600">Check-in and check-out management</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card text-center">
            <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-600">Total Bookings</p>
          </div>
          <div className="card text-center">
            <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.confirmed}</p>
            <p className="text-sm text-gray-600">Ready for Check-in</p>
          </div>
          <div className="card text-center">
            <LogIn className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.checkedIn}</p>
            <p className="text-sm text-gray-600">Checked In</p>
          </div>
          <div className="card text-center">
            <LogOut className="h-8 w-8 text-gray-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.checkedOut}</p>
            <p className="text-sm text-gray-600">Checked Out</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by guest name, booking ID, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setStatusFilter('confirmed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'confirmed'
                  ? 'bg-orange-100 text-orange-700 border border-orange-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Ready for Check-in ({stats.confirmed})
            </button>
            <button
              onClick={() => setStatusFilter('checked-in')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'checked-in'
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Checked In ({stats.checkedIn})
            </button>
            <button
              onClick={() => setStatusFilter('checked-out')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'checked-out'
                  ? 'bg-gray-100 text-gray-700 border border-gray-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Checked Out ({stats.checkedOut})
            </button>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="card p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guest Information
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check-in / Check-out
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rooms
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr key={booking.BookingID} className="table-row">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          Booking #{booking.BookingID}
                        </div>
                        <div className="text-sm text-gray-500">
                          Created {formatDate(booking.CheckInDate)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <User className="h-8 w-8 text-gray-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {booking.GuestName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.GuestEmail}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.GuestPhone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <LogIn className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-gray-900">
                            {formatDate(booking.CheckInDate)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <LogOut className="h-4 w-4 text-red-600" />
                          <span className="text-sm text-gray-900">
                            {formatDate(booking.CheckOutDate)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {booking.rooms?.map((room, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              Room {room.RoomNumber} ({room.TypeName})
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.BookingStatus)}`}>
                        {booking.BookingStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {/* Existing dynamic button */}
                      {getActionButton(booking)}

                      {/* Always-visible small vertical buttons */}
                      <div className="flex flex-col items-end space-y-2 mt-2">
                        <button
                          onClick={() => handleCheckIn(booking.BookingID, booking.GuestName)}
                          disabled={processingId === booking.BookingID}
                          className="btn-primary text-xs px-2 py-1 flex items-center space-x-1"
                        >
                          {processingId === booking.BookingID ? (
                            <Loader className="h-3 w-3 animate-spin" />
                          ) : (
                            <LogIn className="h-3 w-3" />
                          )}
                          <span>Check In</span>
                        </button>

                        <button
                          onClick={() => handleCheckOut(booking.BookingID, booking.GuestName)}
                          disabled={processingId === booking.BookingID}
                          className="btn-secondary text-xs px-2 py-1 flex items-center space-x-1"
                        >
                          {processingId === booking.BookingID ? (
                            <Loader className="h-3 w-3 animate-spin" />
                          ) : (
                            <LogOut className="h-3 w-3" />
                          )}
                          <span>Check Out</span>
                        </button>
                      </div>
                    </td>


                  </tr>
                ))}
              </tbody>
            </table>

            {filteredBookings.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {searchTerm 
                    ? 'No bookings found matching your search.' 
                    : `No ${statusFilter === 'all' ? '' : statusFilter + ' '}bookings found.`}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BookingOperations;
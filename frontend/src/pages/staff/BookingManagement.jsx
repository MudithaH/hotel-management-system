/**
 * Booking Management Component (Staff)
 * Create and manage room bookings
 */

import React, { useState, useEffect } from 'react';
import { staffAPI } from '../../api';
import { 
  Calendar, 
  Plus, 
  Search, 
  Users, 
  BedDouble, 
  Clock,
  CheckCircle,
  X,
  MapPin
} from 'lucide-react';
import Layout from '../../components/Layout';
import toast from 'react-hot-toast';

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [guests, setGuests] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    guestId: '',
    checkInDate: '',
    checkOutDate: '',
    roomIds: []
  });

  // Fetch data on component mount
  useEffect(() => {
    Promise.all([
      fetchBookings(),
      fetchGuests()
    ]);
  }, []);

  // Fetch available rooms when dates change
  useEffect(() => {
    if (formData.checkInDate && formData.checkOutDate) {
      fetchAvailableRooms();
    }
  }, [formData.checkInDate, formData.checkOutDate]);

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

  const fetchGuests = async () => {
    try {
      const response = await staffAPI.getGuests();
      setGuests(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch guests:', error);
    }
  };

  const fetchAvailableRooms = async () => {
    try {
      const response = await staffAPI.getAvailableRooms({
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate
      });
      setAvailableRooms(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch available rooms:', error);
      toast.error('Failed to fetch available rooms');
    }
  };

  // Filter bookings based on search term
  const filteredBookings = bookings.filter(booking =>
    booking.GuestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.BookingID.toString().includes(searchTerm)
  );

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle room selection
  const handleRoomSelect = (roomId) => {
    setFormData(prev => ({
      ...prev,
      roomIds: prev.roomIds.includes(roomId)
        ? prev.roomIds.filter(id => id !== roomId)
        : [...prev.roomIds, roomId]
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.roomIds.length === 0) {
      toast.error('Please select at least one room');
      return;
    }

    try {
      await staffAPI.createBooking(formData);
      toast.success('Booking created successfully');
      setShowModal(false);
      setFormData({
        guestId: '',
        checkInDate: '',
        checkOutDate: '',
        roomIds: []
      });
      fetchBookings();
    } catch (error) {
      console.error('Failed to create booking:', error);
    }
  };

  // Open modal for creating new booking
  const handleCreateNew = () => {
    setFormData({
      guestId: '',
      checkInDate: '',
      checkOutDate: '',
      roomIds: []
    });
    setAvailableRooms([]);
    setShowModal(true);
  };

  // Format date display
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

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Loading bookings...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
              <p className="text-gray-600">Create and manage room reservations</p>
            </div>
          </div>
          <button
            onClick={handleCreateNew}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>New Booking</span>
          </button>
        </div>

        {/* Search and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search bookings by guest name or booking ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-primary-600">{bookings.length}</p>
            <p className="text-sm text-gray-600">Total Bookings</p>
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
                    Dates & Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rooms
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
                          Created: {formatDate(booking.CheckInDate)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                          <Users className="h-5 w-5 text-primary-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{booking.GuestName}</div>
                          <div className="text-sm text-gray-500">{booking.GuestEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-gray-900">
                            Check-in: {formatDate(booking.CheckInDate)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-red-600" />
                          <span className="text-sm text-gray-900">
                            Check-out: {formatDate(booking.CheckOutDate)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.BookingStatus)}`}>
                        {booking.BookingStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {booking.rooms && booking.rooms.length > 0 ? (
                          booking.rooms.map((room, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <BedDouble className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-900">
                                Room {room.RoomNumber} ({room.TypeName})
                              </span>
                            </div>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">No rooms assigned</span>
                        )}
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
                  {searchTerm ? 'No bookings found matching your search.' : 'No bookings created yet.'}
                </p>
                <button
                  onClick={handleCreateNew}
                  className="mt-4 btn-primary inline-flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create First Booking</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal for New Booking */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-screen overflow-y-auto">
              <form onSubmit={handleSubmit} className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Create New Booking</h2>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Guest Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Guest *
                    </label>
                    <select
                      name="guestId"
                      value={formData.guestId}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                    >
                      <option value="">Choose a guest</option>
                      {guests.map((guest) => (
                        <option key={guest.GuestID} value={guest.GuestID}>
                          {guest.Name} - {guest.Email}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date Selection */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Check-in Date *
                      </label>
                      <input
                        type="datetime-local"
                        name="checkInDate"
                        value={formData.checkInDate}
                        onChange={handleInputChange}
                        required
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Check-out Date *
                      </label>
                      <input
                        type="datetime-local"
                        name="checkOutDate"
                        value={formData.checkOutDate}
                        onChange={handleInputChange}
                        required
                        className="input-field"
                      />
                    </div>
                  </div>

                  {/* Available Rooms */}
                  {availableRooms.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Rooms * (Available rooms for selected dates)
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                        {availableRooms.map((room) => (
                          <label
                            key={room.RoomID}
                            className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                              formData.roomIds.includes(room.RoomID)
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={formData.roomIds.includes(room.RoomID)}
                              onChange={() => handleRoomSelect(room.RoomID)}
                              className="mr-3"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-900">
                                  Room {room.RoomNumber}
                                </span>
                                <span className="text-primary-600 font-bold">
                                  ${room.DailyRate}
                                </span>
                              </div>
                              <div className="text-sm text-gray-500">
                                {room.TypeName} • {room.Capacity} guests
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {formData.checkInDate && formData.checkOutDate && availableRooms.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <BedDouble className="h-12 w-12 mx-auto mb-2" />
                      <p>No rooms available for the selected dates</p>
                    </div>
                  )}
                </div>

                <div className="flex space-x-3 pt-6 border-t border-gray-200 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 btn-primary"
                    disabled={formData.roomIds.length === 0}
                  >
                    Create Booking
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

export default BookingManagement;
/**
 * Service Management Component (Staff)
 * Add services to existing bookings
 */

import React, { useState, useEffect } from 'react';
import { staffAPI } from '../../api';
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Calendar,
  DollarSign,
  X,
  ShoppingCart
} from 'lucide-react';
import Layout from '../../components/Layout';
import toast from 'react-hot-toast';

const ServiceManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [formData, setFormData] = useState({
    bookingId: '',
    serviceId: '',
    quantity: 1,
    usageDate: new Date().toISOString().split('T')[0]
  });

  // Fetch data on component mount
  useEffect(() => {
    Promise.all([
      fetchBookings(),
      fetchServices()
    ]);
  }, []);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const response = await staffAPI.getBookings();
      // Filter only active bookings (confirmed or checked-in)
      const activeBookings = (response.data.data || []).filter(
        booking => ['confirmed', 'checked-in'].includes(booking.BookingStatus)
      );
      setBookings(activeBookings);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await staffAPI.getServices();
      setServices(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch services:', error);
      toast.error('Failed to load services');
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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await staffAPI.addServiceUsage({
        bookingId: formData.bookingId,
        serviceId: formData.serviceId,
        quantity: parseInt(formData.quantity),
        usageDate: formData.usageDate
      });
      toast.success('Service added to booking successfully');
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Failed to add service:', error);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      bookingId: '',
      serviceId: '',
      quantity: 1,
      usageDate: new Date().toISOString().split('T')[0]
    });
    setSelectedBooking(null);
  };

  // Open modal for adding service to specific booking
  const handleAddService = (booking) => {
    setSelectedBooking(booking);
    setFormData({
      bookingId: booking.BookingID,
      serviceId: '',
      quantity: 1,
      usageDate: new Date().toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  // Open modal for general service addition
  const handleCreateNew = () => {
    setSelectedBooking(null);
    resetForm();
    setShowModal(true);
  };

  // Format date display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get selected service details
  const selectedService = services.find(service => service.ServiceID === parseInt(formData.serviceId));

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Loading services...</p>
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
            <ClipboardList className="h-8 w-8 text-primary-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Service Management</h1>
              <p className="text-gray-600">Add services to active bookings</p>
            </div>
          </div>
          <button
            onClick={handleCreateNew}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add Service</span>
          </button>
        </div>

        {/* Available Services Overview */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Services</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <div key={service.ServiceID} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{service.ServiceName}</h4>
                  <span className="text-lg font-bold text-primary-600">
                    ${service.Price}
                  </span>
                </div>
                <p className="text-sm text-gray-500">Service ID: {service.ServiceID}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Search and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search active bookings by guest name or booking ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-primary-600">{bookings.length}</p>
            <p className="text-sm text-gray-600">Active Bookings</p>
          </div>
        </div>

        {/* Active Bookings Table */}
        <div className="card p-0">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Active Bookings</h3>
            <p className="text-sm text-gray-600">Bookings that can receive services</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guest
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
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
                          {booking.rooms?.length || 0} room(s) booked
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{booking.GuestName}</div>
                        <div className="text-sm text-gray-500">{booking.GuestEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-sm text-gray-900">
                          Check-in: {formatDate(booking.CheckInDate)}
                        </div>
                        <div className="text-sm text-gray-900">
                          Check-out: {formatDate(booking.CheckOutDate)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        booking.BookingStatus === 'confirmed' 
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {booking.BookingStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleAddService(booking)}
                        className="btn-primary text-sm flex items-center space-x-1 ml-auto"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        <span>Add Service</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredBookings.length === 0 && (
              <div className="text-center py-12">
                <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {searchTerm 
                    ? 'No active bookings found matching your search.' 
                    : 'No active bookings available to add services.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal for Add Service */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full">
              <form onSubmit={handleSubmit} className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Add Service to Booking</h2>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {selectedBooking && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">
                      Adding service to Booking #{selectedBooking.BookingID}
                    </p>
                    <p className="text-sm text-blue-700">Guest: {selectedBooking.GuestName}</p>
                  </div>
                )}

                <div className="space-y-4">
                  {!selectedBooking && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Booking *
                      </label>
                      <select
                        name="bookingId"
                        value={formData.bookingId}
                        onChange={handleInputChange}
                        required
                        className="input-field"
                      >
                        <option value="">Choose a booking</option>
                        {bookings.map((booking) => (
                          <option key={booking.BookingID} value={booking.BookingID}>
                            Booking #{booking.BookingID} - {booking.GuestName}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Service *
                    </label>
                    <select
                      name="serviceId"
                      value={formData.serviceId}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                    >
                      <option value="">Choose a service</option>
                      {services.map((service) => (
                        <option key={service.ServiceID} value={service.ServiceID}>
                          {service.ServiceName} - ${service.Price}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      min="1"
                      required
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Date *
                    </label>
                    <input
                      type="date"
                      name="usageDate"
                      value={formData.usageDate}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                    />
                  </div>

                  {selectedService && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-900">Total Cost:</span>
                        <span className="text-lg font-bold text-green-700">
                          ${(selectedService.Price * formData.quantity).toFixed(2)}
                        </span>
                      </div>
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
                  <button type="submit" className="flex-1 btn-primary">
                    Add Service
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

export default ServiceManagement;
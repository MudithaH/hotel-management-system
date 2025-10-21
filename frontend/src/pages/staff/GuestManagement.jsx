/**
 * Guest Management Component (Staff)
 * Create and manage guests for the hotel
 */

import React, { useState, useEffect } from 'react';
import { staffAPI } from '../../api';
import { 
  UserPlus, 
  Users, 
  Search, 
  Mail, 
  Phone, 
  Edit,
  Plus,
  X
} from 'lucide-react';
import Layout from '../../components/Layout';
import toast from 'react-hot-toast';

const GuestManagement = () => {
  const [guests, setGuests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingGuest, setEditingGuest] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Fetch guests on component mount
  useEffect(() => {
    fetchGuests();
  }, []);

  const fetchGuests = async () => {
    try {
      setIsLoading(true);
      const response = await staffAPI.getGuests();
      setGuests(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch guests:', error);
      toast.error('Failed to load guests');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter guests based on search term
  const filteredGuests = guests.filter(guest =>
    guest.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.Phone.includes(searchTerm)
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
      if (editingGuest) {
        // Update existing guest
        await staffAPI.updateGuest(editingGuest.GuestID, formData);
        toast.success('Guest updated successfully');
      } else {
        // Create new guest
        await staffAPI.createGuest(formData);
        toast.success('Guest created successfully');
      }
      
      handleCloseModal();
      fetchGuests();
    } catch (error) {
      console.error('Failed to save guest:', error);
      const errorMessage = editingGuest ? 'Failed to update guest' : 'Failed to create guest';
      toast.error(errorMessage);
    }
  };

  // Open modal for creating new guest
  const handleCreateNew = () => {
    setEditingGuest(null);
    setFormData({ name: '', email: '', phone: '' });
    setShowModal(true);
  };

  // Open modal for editing existing guest
  const handleEditGuest = (guest) => {
    setEditingGuest(guest);
    setFormData({
      name: guest.Name,
      email: guest.Email,
      phone: guest.Phone
    });
    setShowModal(true);
  };

  // Close modal and reset state
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingGuest(null);
    setFormData({ name: '', email: '', phone: '' });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Loading guests...</p>
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
            <Users className="h-8 w-8 text-primary-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Guest Management</h1>
              <p className="text-gray-600">Register and manage hotel guests</p>
            </div>
          </div>
          <button
            onClick={handleCreateNew}
            className="btn-primary flex items-center space-x-2"
          >
            <UserPlus className="h-5 w-5" />
            <span>Add Guest</span>
          </button>
        </div>

        {/* Search and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search guests by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-primary-600">{guests.length}</p>
            <p className="text-sm text-gray-600">Total Guests</p>
          </div>
        </div>

        {/* Guests Table */}
        <div className="card p-0">
          <div className="overflow-x-auto">
            <table className="w-full table-mobile">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guest Information
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guest ID
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGuests.map((guest) => (
                  <tr key={guest.GuestID} className="table-row">
                    <td className="px-4 py-2 sm:px-6 sm:py-4" data-label="Guest Information">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center mr-4">
                          <span className="text-primary-600 font-medium">
                            {guest.Name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{guest.Name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2 sm:px-6 sm:py-4" data-label="Contact Details">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{guest.Email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{guest.Phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2 sm:px-6 sm:py-4" data-label="Guest ID">
                      <span className="text-sm font-mono text-gray-900">#{guest.GuestID}</span>
                    </td>
                    <td className="px-4 py-2 sm:px-6 sm:py-4 text-right" data-label="Actions">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => handleEditGuest(guest)}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Edit guest"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredGuests.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {searchTerm ? 'No guests found matching your search.' : 'No guests registered yet.'}
                </p>
                <button
                  onClick={handleCreateNew}
                  className="mt-4 btn-primary inline-flex items-center space-x-2"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Add First Guest</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal for Add Guest */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full">
              <form onSubmit={handleSubmit} className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingGuest ? 'Edit Guest' : 'Add New Guest'}
                  </h2>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                      placeholder="Enter guest's full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                      placeholder="Enter email address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-6">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 btn-primary">
                    {editingGuest ? 'Update Guest' : 'Create Guest'}
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

export default GuestManagement;
/**
 * Room Management Component (Admin)
 * Manage hotel rooms and their status for the branch
 */

import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import { 
  BedDouble, 
  Search, 
  Filter,
  MapPin,
  Users,
  DollarSign,
  Eye,
  Edit3,
  CheckCircle,
  XCircle,
  Home,
  Wifi,
  Car,
  Coffee
} from 'lucide-react';
import Layout from '../../components/Layout';
import toast from 'react-hot-toast';

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    Promise.all([
      fetchRooms(),
      fetchRoomTypes()
    ]);
  }, []);

  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      const response = await adminAPI.getRooms();
      setRooms(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
      toast.error('Failed to load rooms');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoomTypes = async () => {
    try {
      const response = await adminAPI.getRoomTypes();
      setRoomTypes(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch room types:', error);
      toast.error('Failed to load room types');
    }
  };

  // Filter rooms based on search and filters
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = 
      room.RoomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.TypeName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || room.Status === statusFilter;
    const matchesType = typeFilter === 'all' || room.RoomTypeID === parseInt(typeFilter);
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Get room status statistics
  const roomStats = {
    total: rooms.length,
    available: rooms.filter(room => room.Status === 'available').length,
    occupied: rooms.filter(room => room.Status === 'occupied').length,
    maintenance: rooms.filter(room => room.Status === 'maintenance').length,
    outOfOrder: rooms.filter(room => room.Status === 'out-of-order').length
  };

  // Handle room details modal
  const handleViewRoom = (room) => {
    setSelectedRoom(room);
    setShowDetailsModal(true);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `LKR ${(amount || 0).toLocaleString()}`;
  };

  // Get status color classes
  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'occupied':
        return 'bg-red-100 text-red-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'out-of-order':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Parse amenities (JSON string to array)
  const parseAmenities = (amenitiesString) => {
    try {
      return JSON.parse(amenitiesString || '[]');
    } catch (error) {
      return [];
    }
  };

  // Get amenity icon
  const getAmenityIcon = (amenity) => {
    const iconMap = {
      'WiFi': Wifi,
      'Wi-Fi': Wifi,
      'Internet': Wifi,
      'Parking': Car,
      'Coffee': Coffee,
      'Breakfast': Coffee,
      'Room Service': Home,
      'Balcony': Home,
      'AC': Home,
      'TV': Home
    };
    
    const IconComponent = iconMap[amenity] || Home;
    return <IconComponent className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Loading room data...</p>
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
            <BedDouble className="h-8 w-8 text-primary-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Room Management</h1>
              <p className="text-gray-600">Manage rooms and their availability status</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="card text-center">
            <Home className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{roomStats.total}</p>
            <p className="text-sm text-gray-600">Total Rooms</p>
          </div>
          <div className="card text-center">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{roomStats.available}</p>
            <p className="text-sm text-gray-600">Available</p>
          </div>
          <div className="card text-center">
            <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{roomStats.occupied}</p>
            <p className="text-sm text-gray-600">Occupied</p>
          </div>
          <div className="card text-center">
            <Edit3 className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{roomStats.maintenance}</p>
            <p className="text-sm text-gray-600">Maintenance</p>
          </div>
          <div className="card text-center">
            <XCircle className="h-8 w-8 text-gray-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{roomStats.outOfOrder}</p>
            <p className="text-sm text-gray-600">Out of Order</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search rooms by number or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="maintenance">Maintenance</option>
                <option value="out-of-order">Out of Order</option>
              </select>
            </div>
            
            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="input-field"
              >
                <option value="all">All Room Types</option>
                {roomTypes.map((type) => (
                  <option key={type.RoomTypeID} value={type.RoomTypeID}>
                    {type.TypeName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Room Types Overview */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Room Types Available</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roomTypes.map((type) => (
              <div key={type.RoomTypeID} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{type.TypeName}</h4>
                  <span className="text-lg font-bold text-primary-600">
                    {formatCurrency(type.DailyRate)}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{type.Capacity} guests</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <BedDouble className="h-4 w-4" />
                    <span>
                      {rooms.filter(room => room.RoomTypeID === type.RoomTypeID).length} rooms
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {parseAmenities(type.Amenities).slice(0, 3).map((amenity, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                    >
                      {getAmenityIcon(amenity)}
                      <span>{amenity}</span>
                    </span>
                  ))}
                  {parseAmenities(type.Amenities).length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{parseAmenities(type.Amenities).length - 3} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rooms Table */}
        <div className="card p-0">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Rooms ({filteredRooms.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full table-mobile">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Room
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type & Capacity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Daily Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amenities
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRooms.map((room) => (
                  <tr key={room.RoomID} className="table-row">
                    <td className="px-4 py-2 sm:px-6 sm:py-4" data-label="Room">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary-50 rounded-lg">
                          <BedDouble className="h-5 w-5 text-primary-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            Room {room.RoomNumber}
                          </div>
                          <div className="text-sm text-gray-500">ID: {room.RoomID}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2 sm:px-6 sm:py-4" data-label="Type & Capacity">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{room.TypeName}</div>
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Users className="h-4 w-4" />
                          <span>Up to {room.Capacity} guests</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2 sm:px-6 sm:py-4" data-label="Daily Rate">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(room.DailyRate)}
                      </div>
                      <div className="text-sm text-gray-500">per night</div>
                    </td>
                    <td className="px-4 py-2 sm:px-6 sm:py-4" data-label="Status">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(room.Status)}`}>
                        {room.Status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-2 sm:px-6 sm:py-4" data-label="Amenities">
                      <div className="flex flex-wrap gap-1">
                        {parseAmenities(room.Amenities).slice(0, 2).map((amenity, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                          >
                            {getAmenityIcon(amenity)}
                            <span className="hidden sm:inline">{amenity}</span>
                          </span>
                        ))}
                        {parseAmenities(room.Amenities).length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{parseAmenities(room.Amenities).length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2 sm:px-6 sm:py-4 text-right" data-label="Actions">
                      <button
                        onClick={() => handleViewRoom(room)}
                        className="btn-secondary text-sm flex items-center space-x-1 ml-auto"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="hidden sm:inline">View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredRooms.length === 0 && (
              <div className="text-center py-12">
                <BedDouble className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                    ? 'No rooms found matching your filters.'
                    : 'No rooms available in this branch.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Room Details Modal */}
        {showDetailsModal && selectedRoom && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Room {selectedRoom.RoomNumber} Details
                  </h2>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Room Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Room Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Room Number:</span>
                        <span className="font-medium">{selectedRoom.RoomNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Room Type:</span>
                        <span className="font-medium">{selectedRoom.TypeName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Capacity:</span>
                        <span className="font-medium">{selectedRoom.Capacity} guests</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Daily Rate:</span>
                        <span className="font-medium">{formatCurrency(selectedRoom.DailyRate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedRoom.Status)}`}>
                          {selectedRoom.Status.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {parseAmenities(selectedRoom.Amenities).map((amenity, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 p-2 bg-blue-50 text-blue-700 rounded-lg"
                        >
                          {getAmenityIcon(amenity)}
                          <span className="text-sm">{amenity}</span>
                        </div>
                      ))}
                    </div>
                    {parseAmenities(selectedRoom.Amenities).length === 0 && (
                      <p className="text-gray-500 text-sm">No amenities listed</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RoomManagement;
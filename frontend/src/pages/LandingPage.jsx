/**
 * Landing Page Component
 * Public-facing homepage showcasing hotel features and amenities
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Wifi, 
  Utensils, 
  Waves, 
  Dumbbell, 
  Car, 
  LogIn,
  CheckCircle,
  MapPin,
  Phone,
  Mail,
  Star,
  Coffee,
  Wind
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  // Scroll to contact section
  const scrollToContact = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const features = [
    {
      icon: <Wifi className="h-6 w-6" />,
      title: 'Free High-Speed WiFi',
      description: 'Stay connected with complimentary high-speed internet access throughout all our hotel locations.'
    },
    {
      icon: <Utensils className="h-6 w-6" />,
      title: 'Fine Dining',
      description: 'Experience exquisite cuisine at our in-house restaurants. Room service available 24/7 for your convenience.'
    },
    {
      icon: <Waves className="h-6 w-6" />,
      title: 'Pool & Spa',
      description: 'Relax and rejuvenate in our luxurious swimming pools and full-service spa facilities.'
    },
    {
      icon: <Dumbbell className="h-6 w-6" />,
      title: 'Fitness Center',
      description: 'Maintain your fitness routine with our state-of-the-art gym equipment and facilities.'
    },
    {
      icon: <Car className="h-6 w-6" />,
      title: 'Free Parking',
      description: 'Complimentary secure parking available for all guests with 24/7 security surveillance.'
    },
    {
      icon: <Wind className="h-6 w-6" />,
      title: 'Climate Controlled',
      description: 'All rooms feature modern air conditioning and heating systems for your optimal comfort.'
    }
  ];

  const stats = [
    { value: '3', label: 'Premium Locations' },
    { value: '30+', label: 'Luxury Rooms' },
    { value: '10+', label: 'Guest Services' },
    { value: '24/7', label: 'Concierge Service' }
  ];

  const benefits = [
    'Luxurious rooms with modern amenities',
    'Prime locations in Colombo, Kandy, and Galle',
    'Complimentary breakfast buffet',
    'Professional concierge services',
    'Airport shuttle service available',
    'Business center and meeting rooms',
    'Pet-friendly accommodations',
    'Late checkout options available'
  ];

  const roomTypes = [
    {
      name: 'Standard Single',
      capacity: '1 Guest',
      price: 'LKR 12,500',
      features: ['Single bed', 'Private bathroom', 'Free WiFi', 'Smart TV']
    },
    {
      name: 'Standard Double',
      capacity: '2 Guests',
      price: 'LKR 18,000',
      features: ['Double bed', 'Private bathroom', 'Free WiFi', 'Mini-fridge']
    },
    {
      name: 'Deluxe Suite',
      capacity: '4 Guests',
      price: 'LKR 35,000',
      features: ['King bed', 'Living area', 'WiFi', 'Mini-bar', 'Balcony']
    },
    {
      name: 'Presidential Suite',
      capacity: '6 Guests',
      price: 'LKR 70,000',
      features: ['Master bedroom', 'Living room', 'Kitchenette', 'Jacuzzi', 'Terrace']
    }
  ];

  const locations = [
    {
      city: 'Colombo',
      name: 'Sky Nest Colombo',
      address: 'Galle Road, Colombo 03',
      phone: '+94 11 234 5678',
      email: 'colombo@skynest.lk'
    },
    {
      city: 'Kandy',
      name: 'Sky Nest Kandy',
      address: 'Peradeniya Road, Kandy',
      phone: '+94 81 223 4567',
      email: 'kandy@skynest.lk'
    },
    {
      city: 'Galle',
      name: 'Sky Nest Galle',
      address: 'Beach Road, Galle Fort',
      phone: '+94 91 222 3456',
      email: 'galle@skynest.lk'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <nav className="bg-blue-200 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-3 px-2 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-2">
              <img 
                src="/images/skynest-logo.svg" 
                alt="Sky Nest Logo" 
                className="h-16 w-16"
              />
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">Sky Nest</span>
                <p className="text-xs text-gray-500">Beyond The Sky</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="btn-secondary flex items-center space-x-2 text-sm"
            >
              <LogIn className="h-4 w-4" />
              <span>Staff Portal</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section with Background Image */}
      <section className="relative py-20 overflow-hidden min-h-[500px] flex items-center">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-sky-900/80 via-blue-900/75 to-indigo-900/80"></div>
        </div>
        
        <div className="max-w-7xl  mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="text-center text-white">
            <div className="flex justify-center mb-4">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl shadow-2xl">
                <img 
                  src="/images/skynest-logo.svg" 
                  alt="Sky Nest" 
                  className="h-20 w-20"
                />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.5)' }}>
              Experience Luxury
              <span className="block mt-3 text-sky-200">
                At Sky Nest Hotels
              </span>
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-sky-100 mb-10 max-w-3xl mx-auto leading-relaxed" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.5)' }}>
              Discover unparalleled comfort and elegance at Sri Lanka's premier hotels across 
              Colombo, Kandy, and Galle. Your perfect stay awaits.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 items-center">
              <button
                onClick={scrollToContact}
                className="bg-white text-sky-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-sky-50 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105 w-full sm:w-auto"
              >
                Book Now
              </button>
              <a
                href="#rooms"
                className="bg-sky-700/80 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-sky-800/80 transition-all duration-200 border-2 border-white/30 shadow-xl w-full sm:w-auto text-center"
              >
                View Rooms
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Room Types Section */}
      <section id="rooms" className="py-20 bg-white relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-15">
          <div className="absolute inset-0" style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Luxury Rooms & Suites
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose from our carefully designed rooms to suit your needs and preferences.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {roomTypes.map((room, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-200 transform hover:scale-105"
              >
                <div className="bg-gradient-to-br from-sky-500 to-blue-600 p-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">{room.name}</h3>
                  <p className="text-sky-100">{room.capacity}</p>
                </div>
                <div className="p-6">
                  <div className="text-3xl font-bold text-sky-600 mb-4">
                    {room.price}
                    <span className="text-sm text-gray-500 font-normal">/night</span>
                  </div>
                  <ul className="space-y-2">
                    {room.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-gray-700">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={scrollToContact}
                    className="w-full mt-6 bg-sky-600 text-white py-3 rounded-lg font-semibold hover:bg-sky-700 transition-colors duration-200 shadow-md hover:shadow-lg"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2080&q=80')`
          }}
        >
          <div className="absolute inset-0 bg-white/90"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              World-Class Amenities
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience exceptional comfort with our premium facilities and services designed for your perfect stay.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-sky-100 transform hover:scale-105"
              >
                <div className="bg-gradient-to-br from-sky-100 to-blue-100 text-sky-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Why Choose Sky Nest?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Experience the perfect blend of Sri Lankan hospitality, luxury, and comfort at our 
                premium locations. We're committed to making your stay memorable.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl p-8">
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
                  <div className="flex items-center space-x-3 mb-3">
                    <Coffee className="h-8 w-8 text-sky-600" />
                    <h3 className="text-xl font-semibold text-gray-900">Complimentary Breakfast</h3>
                  </div>
                  <p className="text-gray-600">
                    Start your day with a delicious Sri Lankan and continental breakfast buffet included with every stay.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
                  <div className="flex items-center space-x-3 mb-3">
                    <MapPin className="h-8 w-8 text-sky-600" />
                    <h3 className="text-xl font-semibold text-gray-900">Prime Locations</h3>
                  </div>
                  <p className="text-gray-600">
                    Strategically located in the heart of Colombo, cultural Kandy, and historic Galle.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
                  <div className="flex items-center space-x-3 mb-3">
                    <Star className="h-8 w-8 text-sky-600" />
                    <h3 className="text-xl font-semibold text-gray-900">5-Star Service</h3>
                  </div>
                  <p className="text-gray-600">
                    Exceptional Sri Lankan hospitality with attention to every detail of your comfort.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Locations Section */}
      <section className="py-20 relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`
          }}
        >
          <div className="absolute inset-0 bg-gray-50/85"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Locations in Sri Lanka
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Find us in three of Sri Lanka's most beautiful destinations, each offering unique experiences.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {locations.map((location, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <div className="bg-gradient-to-br from-sky-500 to-blue-600 p-6 text-white">
                  <MapPin className="h-8 w-8 mb-3" />
                  <h3 className="text-2xl font-bold mb-2">{location.city}</h3>
                  <p className="text-sky-100">{location.name}</p>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-sky-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{location.address}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-sky-600" />
                      <span className="text-gray-700">{location.phone}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-sky-600" />
                      <span className="text-gray-700 text-sm">{location.email}</span>
                    </div>
                  </div>
                  <button
                    onClick={scrollToContact}
                    className="w-full mt-6 bg-sky-600 text-white py-3 rounded-lg font-semibold hover:bg-sky-700 transition-colors duration-200 shadow-md hover:shadow-lg"
                  >
                    Book This Location
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-sky-900/85 via-blue-900/85 to-indigo-900/85"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Experience Luxury at Sky Nest?
          </h2>
          <p className="text-xl text-sky-100 mb-8">
            Book your stay at any of our premium Sri Lankan locations and discover the perfect blend 
            of comfort, elegance, and exceptional hospitality.
          </p>
          <button
            onClick={scrollToContact}
            className="bg-white text-sky-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-sky-50 transition-all duration-200 inline-flex items-center space-x-2 shadow-2xl transform hover:scale-105"
          >
            <Phone className="h-6 w-6" />
            <span>Contact Us to Book</span>
          </button>
          <p className="text-sky-100 mt-6 text-sm">
            Call us at +94 11 234 5678 for reservations and inquiries
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Contact Us
            </h2>
            <p className="text-xl text-gray-600">
              Get in touch with us for reservations, inquiries, or special requests
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center p-6 bg-sky-50 rounded-xl">
              <div className="bg-sky-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Call Us</h3>
              <p className="text-gray-600 text-sm mb-2">Colombo: +94 11 234 5678</p>
              <p className="text-gray-600 text-sm mb-2">Kandy: +94 81 223 4567</p>
              <p className="text-gray-600 text-sm">Galle: +94 91 222 3456</p>
            </div>

            <div className="text-center p-6 bg-sky-50 rounded-xl">
              <div className="bg-sky-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Email Us</h3>
              <p className="text-gray-600 text-sm mb-2">info@skynest.lk</p>
              <p className="text-gray-600 text-sm mb-2">reservations@skynest.lk</p>
              <p className="text-gray-600 text-sm">support@skynest.lk</p>
            </div>

            <div className="text-center p-6 bg-sky-50 rounded-xl">
              <div className="bg-sky-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Visit Us</h3>
              <p className="text-gray-600 text-sm mb-2">Colombo 03</p>
              <p className="text-gray-600 text-sm mb-2">Kandy City</p>
              <p className="text-gray-600 text-sm">Galle Fort</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Office Hours</h3>
            <p className="text-gray-700 mb-2">Reservations & Inquiries: 24/7</p>
            <p className="text-gray-700 mb-2">Check-in: 2:00 PM | Check-out: 11:00 AM</p>
            <p className="text-gray-600 text-sm mt-4">Late check-out available upon request</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src="/images/skynest-logo.svg" 
                  alt="Sky Nest Logo" 
                  className="h-12 w-12"
                />
                <div>
                  <span className="text-lg font-bold text-white">Sky Nest</span>
                  <p className="text-xs text-gray-400">Beyond The Sky</p>
                </div>
              </div>
              <p className="text-sm">
                Experience world-class Sri Lankan hospitality at our premium hotel locations across the island.
              </p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Our Hotels</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Colombo - Sky Nest Colombo</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Kandy - Sky Nest Kandy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Galle - Sky Nest Galle</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#rooms" className="hover:text-white transition-colors">Rooms & Suites</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Amenities</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="/login" className="hover:text-white transition-colors">Staff Portal</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Contact Us</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>+94 11 234 5678</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>info@skynest.lk</span>
                </li>
                <li className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>Colombo, Kandy, Galle</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2024 Sky Nest Hotels. All rights reserved.</p>
            <p className="mt-2">Your comfort is our priority | Premium Sri Lankan hospitality</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

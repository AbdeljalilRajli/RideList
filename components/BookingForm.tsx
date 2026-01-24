"use client";

import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CarProps } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import LoginModal from './auth/LoginModal';

interface BookingFormProps {
  car: CarProps;
  isOpen: boolean;
  onClose: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ car, isOpen, onClose }) => {
  const { user } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    pickupDate: '',
    returnDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill form with user data if authenticated
  React.useEffect(() => {
    if (user && isOpen) {
      setFormData(prev => ({
        ...prev,
        customerName: user.displayName || '',
        customerEmail: user.email || '',
      }));
    }
  }, [user, isOpen]);

  const calculateTotalDays = () => {
    if (formData.pickupDate && formData.returnDate) {
      const pickup = new Date(formData.pickupDate);
      const returnDate = new Date(formData.returnDate);
      const diffTime = Math.abs(returnDate.getTime() - pickup.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return 0;
  };

  const totalDays = calculateTotalDays();
  const totalPrice = totalDays * car.price_per_day;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Validate dates
      const pickup = new Date(formData.pickupDate);
      const returnDate = new Date(formData.returnDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (pickup < today) {
        throw new Error('Pickup date cannot be in the past');
      }

      if (returnDate <= pickup) {
        throw new Error('Return date must be after pickup date');
      }

      // Create booking document with user ID
      const bookingData = {
        carId: `${car.make}-${car.model}-${car.year}`,
        carMake: car.make,
        carModel: car.model,
        carYear: car.year,
        userId: user.uid,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        pickupDate: formData.pickupDate,
        returnDate: formData.returnDate,
        totalDays,
        totalPrice,
        status: 'pending',
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'bookings'), bookingData);
      
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setFormData({
          customerName: '',
          customerEmail: '',
          customerPhone: '',
          pickupDate: '',
          returnDate: '',
        });
      }, 2000);
    } catch (error: any) {
      console.error('Booking error:', {
        error,
        code: error?.code,
        message: error?.message,
        user: user ? { uid: user.uid, email: user.email } : null,
      });

      if (error?.code === 'permission-denied') {
        setError('Permission denied. Please make sure Firestore rules allow creating bookings for signed-in users.');
      } else {
        setError(error?.message || 'Failed to create booking');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      pickupDate: '',
      returnDate: '',
    });
    setError('');
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  // Show login prompt if user is not authenticated
  if (!user) {
    return (
      <>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
            <div className="w-16 h-16 bg-primary-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Sign In Required</h3>
            <p className="text-gray-600 mb-6">
              You need to create an account or sign in to make a booking. This helps us manage your reservations and provide better service.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="w-full bg-primary-blue text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-blue/90 transition-colors"
              >
                Sign In / Create Account
              </button>
              <button
                onClick={handleClose}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
        <LoginModal 
          isOpen={isLoginModalOpen} 
          onClose={() => setIsLoginModalOpen(false)} 
        />
      </>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {success ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h3>
            <p className="text-gray-600">
              Your booking request has been submitted successfully. We'll contact you soon to confirm the details.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="relative bg-gradient-to-r from-primary-blue to-indigo-600 text-white p-6 rounded-t-2xl">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V7a2 2 0 012-2h4a2 2 0 012 2v0M8 7v10a2 2 0 002 2h4a2 2 0 002-2V7M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-2">Book Your Ride</h2>
                <p className="text-white/80">
                  {car.make} {car.model} - ${car.price_per_day}/day
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-colors bg-gray-50"
                      placeholder="Enter your full name"
                      required
                      disabled={!!user?.displayName}
                    />
                    {user?.displayName && (
                      <p className="text-xs text-gray-500 mt-1">Using your account name</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="customerEmail"
                      value={formData.customerEmail}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-colors bg-gray-50"
                      placeholder="Enter your email"
                      required
                      disabled={!!user?.email}
                    />
                    {user?.email && (
                      <p className="text-xs text-gray-500 mt-1">Using your account email</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="customerPhone"
                      value={formData.customerPhone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-colors"
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                </div>

                {/* Rental Dates */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Rental Dates</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pickup Date *
                      </label>
                      <input
                        type="date"
                        name="pickupDate"
                        value={formData.pickupDate}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Return Date *
                      </label>
                      <input
                        type="date"
                        name="returnDate"
                        value={formData.returnDate}
                        onChange={handleInputChange}
                        min={formData.pickupDate || new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-colors"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Booking Summary */}
                {totalDays > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Booking Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rental Duration:</span>
                        <span className="font-medium">{totalDays} day{totalDays !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Daily Rate:</span>
                        <span className="font-medium">${car.price_per_day}/day</span>
                      </div>
                      <div className="border-t border-gray-200 pt-2 mt-2">
                        <div className="flex justify-between">
                          <span className="text-lg font-semibold text-gray-900">Total Cost:</span>
                          <span className="text-lg font-bold text-primary-blue">${totalPrice}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || totalDays === 0}
                  className="w-full bg-primary-blue text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Processing...' : `Book Now - $${totalPrice}`}
                </button>
              </form>

              <p className="text-xs text-gray-500 text-center mt-4">
                By booking, you agree to our terms and conditions. We'll contact you to confirm your booking.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BookingForm;

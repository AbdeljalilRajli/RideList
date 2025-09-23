"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Booking {
  id: string;
  carId: string;
  carMake: string;
  carModel: string;
  carYear?: number;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  pickupDate: string;
  returnDate: string;
  totalDays: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: Date;
}

const UserDashboard = () => {
  return (
    <ProtectedRoute>
      <UserDashboardContent />
    </ProtectedRoute>
  );
};

const UserDashboardContent = () => {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchUserBookings();
    }
  }, [user]);

  const fetchUserBookings = async () => {
    try {
      console.log('Fetching bookings for user:', user?.uid, user?.email);
      
      // Try to fetch by userId first
      let bookingsQuery = query(
        collection(db, 'bookings'),
        where('userId', '==', user?.uid)
      );
      
      let snapshot = await getDocs(bookingsQuery);
      let bookingsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Booking[];
      
      console.log('Bookings found by userId:', bookingsData.length);
      
      // If no bookings found by userId, try by email (for backward compatibility)
      if (bookingsData.length === 0 && user?.email) {
        console.log('Trying to fetch by email:', user.email);
        bookingsQuery = query(
          collection(db, 'bookings'),
          where('customerEmail', '==', user.email)
        );
        
        snapshot = await getDocs(bookingsQuery);
        bookingsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        })) as Booking[];
        
        console.log('Bookings found by email:', bookingsData.length);
      }
      
      // Sort by creation date (newest first)
      bookingsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-gray-100 pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-blue"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-gray-100 pt-20">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-white via-blue-50/30 to-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-100/40 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-16 -left-24 w-64 h-64 bg-indigo-100/30 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-width padding-x py-12">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-primary-blue rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {user.displayName?.charAt(0) || user.email?.charAt(0)}
              </span>
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900">
                Welcome back, <span className="text-primary-blue">{user.displayName}</span>
              </h1>
              <p className="text-xl text-gray-600 mt-2">
                Manage your bookings and profile
              </p>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg className="relative block w-full h-8" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" className="fill-gray-50"></path>
          </svg>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-width padding-x py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Stats Cards */}
          <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-3xl font-bold text-gray-900">{bookings.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Bookings</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {bookings.filter(b => b.status === 'confirmed').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-3xl font-bold text-gray-900">
                    ${bookings.reduce((total, booking) => total + booking.totalPrice, 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Bookings List */}
          <div className="lg:col-span-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900">Your Bookings</h2>
                <p className="text-gray-600 mt-1">Manage and track your car rentals</p>
              </div>

              {loadingBookings ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mx-auto"></div>
                  <p className="text-gray-600 mt-4">Loading bookings...</p>
                </div>
              ) : bookings.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                  <p className="text-gray-600 mb-2">
                    We couldn't find any bookings for your account.
                  </p>
                  <div className="text-sm text-gray-500 mb-4 p-3 bg-gray-50 rounded-lg">
                    <p><strong>Debug Info:</strong></p>
                    <p>User ID: {user?.uid}</p>
                    <p>Email: {user?.email}</p>
                    <p>Check browser console for more details</p>
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={() => router.push('/fleet')}
                      className="bg-primary-blue text-white px-6 py-3 rounded-full font-medium hover:bg-primary-blue/90 transition-colors"
                    >
                      Browse Cars
                    </button>
                    <p className="text-xs text-gray-500">
                      If you made bookings before creating an account, they may need to be migrated. Check the console for migration instructions.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {booking.carMake} {booking.carModel}
                            </h3>
                            <p className="text-gray-600">
                              {new Date(booking.pickupDate).toLocaleDateString()} - {new Date(booking.returnDate).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-500">
                              {booking.totalDays} days • ${booking.totalPrice}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                          <p className="text-sm text-gray-500 mt-2">
                            Booked {booking.createdAt.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;

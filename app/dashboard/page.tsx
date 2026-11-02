"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import Image from 'next/image';
import ProtectedRoute from '@/components/ProtectedRoute';
import { cars } from '@/constants';
import { getCarImage } from '@/lib/utils';

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
  const [activeTab, setActiveTab] = useState<'all' | 'confirmed' | 'pending' | 'completed'>('all');
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);

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

      if (bookingsData.length === 0 && user?.email) {
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
      }

      bookingsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoadingBookings(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F8FB] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3730A3]"></div>
      </div>
    );
  }

  if (!user) return null;

  const activeBooking = bookings.find(b => b.status === 'confirmed' || b.status === 'pending');
  const totalSpent = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const filteredBookings = bookings.filter(b => {
    if (activeTab === 'all') return true;
    return b.status === activeTab;
  });

  return (
    <main className="min-h-screen bg-[#F8F8FB] text-[#0F0F1A] pt-24 pb-20">
      {/* Digital Key Modal */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F0F1A]/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl relative border border-[#E5E7EB]">
            <button
              onClick={() => setIsKeyModalOpen(false)}
              className="absolute top-6 right-6 w-9 h-9 rounded-full bg-[#F8F8FB] border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:text-[#0F0F1A]"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-[#EEEDF9] text-[#3730A3] flex items-center justify-center">
                <span className="material-symbols-outlined">smartphone</span>
              </div>
              <div>
                <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Touchless Concourse Access</span>
                <h3 className="text-xl font-bold text-[#0F0F1A]">Digital Keyless Pass</h3>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#F8F8FB] border border-[#E5E7EB] flex flex-col items-center justify-center text-center mb-6">
              <div className="w-36 h-36 bg-white p-3 rounded-xl border border-[#E5E7EB] flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-6xl text-[#3730A3]">qr_code_2</span>
              </div>
              <p className="font-extrabold text-lg text-[#0F0F1A] tracking-wider">RL-{user.uid.slice(0, 8).toUpperCase()}</p>
              <p className="text-xs text-[#6B7280] mt-1">Scan at Express Concourse Reader or SFO Terminal Gate</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-xs">
                <span className="text-[#6B7280] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#3730A3]">bluetooth</span> NFC Proximity Unlock
                </span>
                <span className="font-bold text-[#0F0F1A]">Armed & Ready</span>
              </div>
            </div>

            <button
              onClick={() => setIsKeyModalOpen(false)}
              className="w-full h-12 rounded-full bg-[#3730A3] hover:bg-[#312E81] text-white font-bold text-sm transition-all"
            >
              Close Pass
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-[1280px] mx-auto px-6 flex flex-col gap-10">
        {/* 1. Top Profile & Tier Header */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2 border-b border-[#E5E7EB]">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-full bg-[#3730A3] text-white flex items-center justify-center text-3xl font-extrabold shadow-md">
                {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#3730A3] border-2 border-white flex items-center justify-center text-white" title="Verified Member">
                <span className="material-symbols-outlined text-[16px]">verified</span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F0F1A] tracking-tight">
                  {user.displayName || "RideList Member"}
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#1E1B4B] text-white text-xs font-bold tracking-wide">
                  <span className="material-symbols-outlined text-[14px] text-indigo-300">stars</span>
                  {userData?.role === 'admin' ? "ADMINISTRATOR TIER" : "EXECUTIVE TIER"}
                </span>
              </div>
              <p className="text-sm text-[#6B7280] flex flex-wrap items-center gap-x-4 gap-y-1">
                <span>{user.email}</span>
                <span className="w-1 h-1 rounded-full bg-[#E5E7EB]"></span>
                <span className="font-semibold text-[#0F0F1A]">#RL-MBR-{user.uid.slice(0, 6).toUpperCase()}</span>
              </p>
            </div>
          </div>

          {/* Tier Benefits Ribbon */}
          <div className="flex flex-wrap items-center gap-2 p-2 rounded-full bg-white border border-[#E5E7EB] self-start lg:self-center shadow-sm">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F8F8FB] text-[#0F0F1A] text-xs font-semibold">
              <span className="material-symbols-outlined text-[16px] text-[#3730A3]">group_add</span>
              Complimentary 2nd Driver
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F8F8FB] text-[#0F0F1A] text-xs font-semibold">
              <span className="material-symbols-outlined text-[16px] text-[#3730A3]">key</span>
              Touchless Express Pass
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F8F8FB] text-[#0F0F1A] text-xs font-semibold">
              <span className="material-symbols-outlined text-[16px] text-[#3730A3]">percent</span>
              10% Bonus Credits
            </div>
          </div>
        </header>

        {/* 2. KPI Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Active Bookings</span>
              <div className="w-10 h-10 rounded-full bg-[#EEEDF9] text-[#3730A3] flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">directions_car</span>
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-[#0F0F1A]">
                  {bookings.filter(b => b.status === 'confirmed').length} Active
                </span>
              </div>
              <p className="text-xs text-[#6B7280] mt-1">Ready for scheduled dispatch</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Trip Velocity</span>
              <div className="w-10 h-10 rounded-full bg-[#EEEDF9] text-[#3730A3] flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">route</span>
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-[#0F0F1A]">{bookings.length} Trips</span>
                <span className="text-xs font-semibold text-emerald-600">100% On-time</span>
              </div>
              <p className="text-xs text-[#6B7280] mt-1">Lifetime booking ledger</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Total Investment</span>
              <div className="w-10 h-10 rounded-full bg-[#EEEDF9] text-[#3730A3] flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">stars</span>
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-[#0F0F1A]">${totalSpent}</span>
                <span className="text-xs font-bold text-[#3730A3]">USD</span>
              </div>
              <p className="text-xs text-[#6B7280] mt-1">Direct corporate savings enabled</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Account Clearance</span>
              <div className="w-10 h-10 rounded-full bg-[#DCFCE7] text-emerald-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">verified</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold text-[#0F0F1A]">Verified</span>
                <span className="material-symbols-outlined text-[20px] text-emerald-600">check_circle</span>
              </div>
              <p className="text-xs text-[#6B7280] mt-1">License & payment profile active</p>
            </div>
          </div>
        </div>

        {/* 3. Active Reservation Focus Card (if one exists) */}
        {activeBooking && (
          <div className="w-full bg-white rounded-3xl border border-[#E5E7EB] shadow-md overflow-hidden relative p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E7EB]">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1E1B4B] text-white text-xs font-bold tracking-wide">
                  <span className="w-2 h-2 rounded-full bg-[#3730A3] animate-ping"></span>
                  CURRENT ACTIVE RESERVATION
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEEDF9] text-[#3730A3] text-xs font-bold">
                  <span className="material-symbols-outlined text-[15px]">check_circle</span>
                  Status: {activeBooking.status.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#6B7280]">Booking Ref:</span>
                <code className="px-2.5 py-1 rounded-full bg-[#F8F8FB] border border-[#E5E7EB] text-xs font-bold text-[#0F0F1A]">
                  RL-{activeBooking.id.slice(0, 8).toUpperCase()}
                </code>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-6">
              <div className="lg:col-span-5 flex flex-col gap-3">
                <h2 className="text-2xl font-extrabold text-[#0F0F1A]">
                  {activeBooking.carMake} {activeBooking.carModel}
                </h2>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#6B7280]">Total Duration: {activeBooking.totalDays} Days</span>
                  <span className="text-xl font-extrabold text-[#3730A3]">${activeBooking.totalPrice}</span>
                </div>
              </div>

              <div className="lg:col-span-7 flex flex-col gap-4">
                <div className="p-4 rounded-2xl bg-[#F8F8FB] border border-[#E5E7EB] grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider block mb-1">Pick-up</span>
                    <p className="text-sm font-bold text-[#0F0F1A]">{activeBooking.pickupDate}</p>
                    <p className="text-xs text-[#6B7280]">Express Airport Terminal</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider block mb-1">Return</span>
                    <p className="text-sm font-bold text-[#0F0F1A]">{activeBooking.returnDate}</p>
                    <p className="text-xs text-[#6B7280]">Standard return concourse</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsKeyModalOpen(true)}
                    className="h-12 px-6 rounded-full bg-[#3730A3] hover:bg-[#312E81] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
                    Digital Key & Kiosk Pass
                  </button>
                  <Link
                    href="/fleet"
                    className="h-12 px-5 rounded-full bg-[#F8F8FB] border border-[#E5E7EB] text-[#0F0F1A] hover:bg-white font-semibold text-xs flex items-center justify-center transition-colors"
                  >
                    Book Additional Vehicle
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. Rental History Ledger */}
        <section className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E5E7EB] shadow-sm flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Trip Archives</span>
              <h3 className="text-2xl font-bold text-[#0F0F1A]">Rental History</h3>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-[#F8F8FB] border border-[#E5E7EB] rounded-full self-start sm:self-auto">
              {[
                { label: `All Trips (${bookings.length})`, value: 'all' },
                { label: 'Confirmed', value: 'confirmed' },
                { label: 'Pending', value: 'pending' },
                { label: 'Completed', value: 'completed' },
              ].map(tab => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value as any)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    activeTab === tab.value
                      ? 'bg-white text-[#0F0F1A] shadow-sm border border-[#E5E7EB]'
                      : 'text-[#6B7280] hover:text-[#0F0F1A]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {loadingBookings ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3730A3] mx-auto mb-2"></div>
              <p className="text-xs text-[#6B7280]">Loading booking ledger...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-16 bg-[#F8F8FB] rounded-2xl border border-[#E5E7EB] p-8">
              <div className="w-14 h-14 rounded-full bg-[#EEEDF9] text-[#3730A3] flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-2xl">receipt_long</span>
              </div>
              <h4 className="text-lg font-bold text-[#0F0F1A] mb-1">No Bookings In This Category</h4>
              <p className="text-xs text-[#6B7280] max-w-sm mx-auto mb-4">
                You haven&apos;t made any reservations matching this filter yet. Explore our curated fleet to book your next trip.
              </p>
              <Link
                href="/fleet"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#3730A3] text-white text-xs font-bold hover:bg-[#312E81] transition-all shadow-sm"
              >
                Explore Fleet
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredBookings.map(booking => (
                <div
                  key={booking.id}
                  className="p-5 rounded-2xl bg-[#F8F8FB] border border-[#E5E7EB] hover:border-[#3730A3]/40 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center text-[#3730A3] shrink-0">
                      <span className="material-symbols-outlined text-2xl">directions_car</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-[#0F0F1A]">
                          {booking.carMake} {booking.carModel}
                        </h4>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                          booking.status === 'confirmed'
                            ? 'bg-[#DCFCE7] text-emerald-700'
                            : booking.status === 'pending'
                            ? 'bg-[#EEEDF9] text-[#3730A3]'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                      <span className="text-xs text-[#6B7280]">
                        {booking.pickupDate} – {booking.returnDate} • {booking.totalDays} Days Rental
                      </span>
                      <span className="text-sm font-extrabold text-[#0F0F1A] block mt-1">
                        ${booking.totalPrice} Total
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <Link
                      href="/fleet"
                      className="h-9 px-4 rounded-full bg-[#3730A3] text-white text-xs font-bold hover:bg-[#312E81] transition-all flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[15px]">replay</span>
                      Book Again
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default UserDashboard;

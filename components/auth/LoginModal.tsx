"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { signIn, signUp } = useAuth();

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      if (isLogin) {
        const { isAdmin } = await signIn(email, password);
        handleClose();
        if (isAdmin) {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      } else {
        const { needsConfirmation } = await signUp(email, password, displayName);
        if (needsConfirmation) {
          setSuccessMessage(
            'Account created! A confirmation email has been sent. Please confirm your email before signing in.'
          );
        } else {
          handleClose();
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setError('');
    setSuccessMessage('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 font-['Work_Sans',sans-serif]"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto relative border border-[#E5E7EB]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-[#5937E0] text-white p-6 rounded-t-3xl">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="text-center">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-1">
              {isLogin ? 'Welcome to RideList' : 'Create an Account'}
            </h2>
            <p className="text-white/80 text-xs">
              {isLogin ? 'Sign in to access your reservations' : 'Optional customer account for faster bookings'}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 sm:p-8">
          {successMessage ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                ✓
              </div>
              <p className="text-sm font-semibold text-emerald-800 leading-relaxed">
                {successMessage}
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setSuccessMessage('');
                }}
                className="w-full py-2.5 rounded-full bg-[#5937E0] text-white text-xs font-bold"
              >
                Go to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-xs font-semibold text-black mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full h-11 px-4 border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:border-[#5937E0] bg-[#F8F8FB]"
                    placeholder="e.g. Youssef El Amrani"
                    required={!isLogin}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-black mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 px-4 border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:border-[#5937E0] bg-[#F8F8FB]"
                  placeholder="name@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-black mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 px-4 border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:border-[#5937E0] bg-[#F8F8FB]"
                  placeholder="••••••••••••"
                  required
                  minLength={6}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-xs font-semibold">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#5937E0] hover:bg-[#4A2CC7] text-white rounded-full font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : isLogin ? (
                  'Sign In'
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
          )}

          {/* Toggle Login / Signup */}
          {!successMessage && (
            <div className="mt-6 text-center">
              <p className="text-xs text-[#6C757D]">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                  }}
                  className="ml-1.5 text-[#5937E0] font-bold hover:underline"
                >
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>
          )}

          {/* Admin link */}
          <div className="mt-4 pt-4 border-t border-[#E5E7EB] text-center">
            <Link
              href="/admin/login"
              onClick={handleClose}
              className="text-xs font-semibold text-[#6C757D] hover:text-[#5937E0] transition-colors"
            >
              Sign in as Administrator →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

export default LoginModal;

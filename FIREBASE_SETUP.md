# Firebase Authentication & Booking System Setup

## 🚀 Features Implemented

### Authentication System
- ✅ Firebase Authentication with email/password
- ✅ User registration and login
- ✅ Role-based access control (Admin/User)
- ✅ Protected routes
- ✅ Persistent authentication state

### User Dashboard
- ✅ View personal bookings
- ✅ Booking history and status
- ✅ Profile management
- ✅ Statistics overview

### Admin Dashboard
- ✅ Manage all bookings
- ✅ Update booking status
- ✅ View revenue and statistics
- ✅ User management capabilities

### Booking System
- ✅ Booking form on car detail pages
- ✅ Date validation and pricing calculation
- ✅ Firestore integration for booking storage
- ✅ Real-time booking status updates

## 🔧 Setup Instructions

### 1. Firebase Configuration
The Firebase configuration is already set up in `/lib/firebase.ts` with your provided credentials.

### 2. Create First Admin User

**Option A: Through Firebase Console**
1. Sign up for a new account using the website
2. Go to [Firebase Console](https://console.firebase.google.com/)
3. Navigate to your project > Firestore Database
4. Find the user document in the 'users' collection
5. Edit the document and change `role` from `"user"` to `"admin"`

**Option B: Using Browser Console**
1. Sign up for a new account
2. Open browser developer tools (F12)
3. In the console, run:
```javascript
// Replace 'your-user-id' with your actual Firebase user ID
import { makeUserAdmin } from './lib/adminSetup';
makeUserAdmin('your-user-id-here');
```

### 3. Firestore Security Rules
Make sure your Firestore has these security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Bookings rules
    match /bookings/{bookingId} {
      // Users can create bookings
      allow create: if request.auth != null;
      // Users can read their own bookings
      allow read: if request.auth != null && 
        (resource.data.customerEmail == request.auth.token.email ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      // Only admins can update bookings
      allow update: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## 📱 Usage Guide

### For Users:
1. **Sign Up/Login**: Click "Sign In" in the navbar
2. **Browse Cars**: Navigate to Fleet page
3. **Book a Car**: Click on any car → "Book Now" button
4. **View Bookings**: Access your dashboard to see booking history

### For Admins:
1. **Access Admin Panel**: Login and navigate to Admin Dashboard
2. **Manage Bookings**: View all bookings, update status (pending → confirmed → completed)
3. **View Statistics**: Monitor total bookings, revenue, and active rentals

## 🔐 Authentication Flow

1. **Registration**: New users are created with `role: 'user'` by default
2. **Login**: Persistent authentication across browser sessions
3. **Route Protection**: Dashboards require authentication, admin routes require admin role
4. **Logout**: Clears authentication state and redirects to home

## 📊 Database Structure

### Users Collection (`/users/{userId}`)
```javascript
{
  uid: string,
  email: string,
  displayName: string,
  role: 'admin' | 'user',
  createdAt: Date
}
```

### Bookings Collection (`/bookings/{bookingId}`)
```javascript
{
  carId: string,
  carMake: string,
  carModel: string,
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  pickupDate: string,
  returnDate: string,
  totalDays: number,
  totalPrice: number,
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled',
  createdAt: Date
}
```

## 🎨 UI Components

All components follow the existing design system:
- **Modern gradients and glass-morphism effects**
- **Consistent color scheme with primary-blue (#3730a3)**
- **Responsive design with Tailwind CSS**
- **Smooth animations and transitions**

## 🚀 Ready to Use!

The system is now fully functional with:
- ✅ Complete authentication system
- ✅ Role-based dashboards
- ✅ Booking management
- ✅ Modern, consistent UI
- ✅ Firebase integration
- ✅ Protected routes

Start by creating your admin account and begin managing the car rental business!

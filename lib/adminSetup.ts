// Admin Setup Utility
// This file contains instructions and utility functions for setting up the first admin user

import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

/**
 * ADMIN SETUP INSTRUCTIONS:
 * 
 * 1. First, create a regular user account through the Sign Up form
 * 2. Go to Firebase Console > Firestore Database
 * 3. Find the user document in the 'users' collection
 * 4. Edit the document and change the 'role' field from 'user' to 'admin'
 * 
 * OR use the function below after signing up:
 */

export const makeUserAdmin = async (userId: string) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      role: 'admin'
    });
    console.log('User successfully made admin');
  } catch (error) {
    console.error('Error making user admin:', error);
  }
};

/**
 * To use this function:
 * 1. Sign up for an account
 * 2. Get your user ID from the browser console or Firebase Auth
 * 3. Call makeUserAdmin(yourUserId) in the browser console
 * 
 * Example:
 * makeUserAdmin('your-firebase-user-id-here')
 */

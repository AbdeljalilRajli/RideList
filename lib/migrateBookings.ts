// Booking Migration Utility
// This script helps migrate existing bookings to include userId field

import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { db } from './firebase';

/**
 * MIGRATION INSTRUCTIONS:
 * 
 * This function will help connect existing bookings to user accounts.
 * Run this in the browser console after logging in as the user whose bookings need to be migrated.
 * 
 * Steps:
 * 1. Login as the user whose bookings are missing
 * 2. Open browser console (F12)
 * 3. Copy and paste this function
 * 4. Call: migrateUserBookings()
 */

export const migrateUserBookings = async () => {
  try {
    // Get current user from auth context (you'll need to get this from your auth context)
    const user = (window as any).currentUser; // This would need to be set from your auth context
    
    if (!user) {
      console.error('No user logged in');
      return;
    }

    console.log('Migrating bookings for user:', user.email);

    // Find all bookings with this user's email but no userId
    const bookingsQuery = query(
      collection(db, 'bookings'),
      where('customerEmail', '==', user.email)
    );

    const snapshot = await getDocs(bookingsQuery);
    const bookingsToUpdate = [];

    snapshot.docs.forEach(docSnapshot => {
      const data = docSnapshot.data();
      if (!data.userId) {
        bookingsToUpdate.push({
          id: docSnapshot.id,
          data: data
        });
      }
    });

    console.log(`Found ${bookingsToUpdate.length} bookings to migrate`);

    // Update each booking to include the userId
    for (const booking of bookingsToUpdate) {
      await updateDoc(doc(db, 'bookings', booking.id), {
        userId: user.uid
      });
      console.log(`Updated booking ${booking.id}`);
    }

    console.log('Migration completed successfully!');
    
    // Refresh the page to see updated bookings
    window.location.reload();
    
  } catch (error) {
    console.error('Error migrating bookings:', error);
  }
};

/**
 * Alternative: Manual migration via Firebase Console
 * 
 * 1. Go to Firebase Console > Firestore Database
 * 2. Find the 'bookings' collection
 * 3. For each booking document that belongs to a user:
 *    - Add a new field: 'userId'
 *    - Set the value to the user's Firebase Auth UID
 * 
 * You can find the user's UID in the 'users' collection or Firebase Auth panel
 */

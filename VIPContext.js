import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from './services/firebaseConfig'; // Assuming firebaseConfig is accessible from the root
import { doc, getDoc, updateDoc } from 'firebase/firestore';

// 1. Create the Context
const VIPContext = createContext({
    isVIP: false,
    loading: true,
    enableVIP: () => {}, // Placeholder function
});

// 2. Create the Custom Hook for easy access
export const useVIPStatus = () => useContext(VIPContext);

// 3. Create the Provider Component
export const VIPProvider = ({ children }) => {
  // State to hold the VIP status
  const [isVIP, setIsVIP] = useState(false);
  const [loading, setLoading] = useState(true);

  // Use onAuthStateChanged to ensure we fetch VIP status only when authenticated
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
        if (user) {
            fetchVIPStatus(user.uid);
        } else {
            // Not authenticated, assume not VIP for now
            setIsVIP(false);
            setLoading(false);
        }
    });
    return unsubscribe; // Cleanup subscription
  }, []);


  // Function to fetch VIP status from Firestore
  const fetchVIPStatus = async (uid) => {
    try {
      setLoading(true);
      const userRef = doc(db, 'users', uid);
      const docSnap = await getDoc(userRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setIsVIP(data.isVIP || false); // Set state based on Firestore value
      } else {
        // User document might not exist yet, default to false
        setIsVIP(false);
      }
    } catch (error) {
      console.error("Error fetching VIP status:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to update VIP status in state AND Firestore
  const enableVIP = async () => {
    const user = auth.currentUser;
    if (!user) {
      // In a real app, you'd navigate to login/sign up
      console.log("User must be logged in to enable VIP.");
      return;
    }
    
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        isVIP: true,
      });
      setIsVIP(true); // Update local state immediately
      // Do not use alert() in React Native, use a custom modal or toast notification
      console.log("VIP Status Enabled!");
    } catch (error) {
      console.error("Error enabling VIP status:", error);
    }
  };

  const contextValue = {
    isVIP,
    loading,
    enableVIP, 
  };

  return (
    <VIPContext.Provider value={contextValue}>
      {children}
    </VIPContext.Provider>
  );
};
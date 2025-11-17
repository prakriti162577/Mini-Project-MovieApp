import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useFonts, Pacifico_400Regular } from '@expo-google-fonts/pacifico';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

// Import the new VIP Context Provider
import { VIPProvider } from './VIPContext'; 

// --- ADMIN SCREEN IMPORTS ADDED HERE ---
import AdminAuthScreen from './screens/admin/AdminAuthScreen'; 
import AdminPanelScreen from './screens/admin/AdminPanelScreen';
// ----------------------------------------

import StartScreen from './screens/StartScreen';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import HomeScreen from './screens/HomeScreen';
import GenrePreferencesScreen from './screens/GenrePreferencesScreen';
import DiscoverScreen from './screens/DiscoverScreen';
import SearchandExplore from './screens/SearchandExplore';
import ProfileScreen from './screens/ProfileScreen';
import FavouritesScreen from './screens/FavouritesScreen';
import VIPScreen from './screens/VIPScreen';
import TrailerPlayerScreen from './screens/TrailerPlayerScreen';
import WelcomeScreen from './screens/WelcomeScreen';

const Stack = createStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({ Pacifico_400Regular });

  if (!fontsLoaded) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  // Use the VIPProvider to wrap the entire navigation stack
  return (
    <VIPProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Start" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Start" component={StartScreen} />
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          {/* Note: We remove the props {vipStatus, setVipStatus} from all screen definitions */}
          <Stack.Screen name="Login" component={LoginScreen} /> 
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="GenrePreferences" component={GenrePreferencesScreen} />
          <Stack.Screen name="Discover" component={DiscoverScreen} />
          <Stack.Screen name="Favourites" component={FavouritesScreen} />
          <Stack.Screen name="Search" component={SearchandExplore} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="VIP" component={VIPScreen} />
          <Stack.Screen name="TrailerPlayerScreen" component={TrailerPlayerScreen} />

          {/* --- NEW ADMIN ROUTES ADDED HERE --- */}
          <Stack.Screen 
              name="AdminAuth" 
              component={AdminAuthScreen} 
              options={{ headerShown: false }} 
          />
          <Stack.Screen 
              name="AdminPanel" 
              component={AdminPanelScreen} 
              options={{ 
                title: 'Master Control', 
                headerShown: true, 
                headerStyle: { backgroundColor: '#1C1C2B' }, 
                headerTintColor: '#FFD700' 
              }} 
          />
          {/* ------------------------------------- */}
        </Stack.Navigator>
      </NavigationContainer>
    </VIPProvider>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#D0E8F2',
  },
});
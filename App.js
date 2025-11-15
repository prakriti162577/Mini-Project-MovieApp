import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useFonts, Pacifico_400Regular } from '@expo-google-fonts/pacifico';
import { View, ActivityIndicator } from 'react-native';

import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import HomeScreen from './screens/HomeScreen';
import GenrePreferencesScreen from './screens/GenrePreferencesScreen';
import DiscoverScreen from './screens/DiscoverScreen';
import WatchedScreen from './screens/WatchedScreen';
import ProfileScreen from './screens/ProfileScreen';
import FavouritesScreen from './screens/FavouritesScreen';
import VIPScreen from './screens/VIPScreen';
import SimpleSearchScreen from './screens/SimpleSearchScreen';



const Stack = createStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({ Pacifico_400Regular });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="GenrePreferences" component={GenrePreferencesScreen} />
        <Stack.Screen name="Discover" component={DiscoverScreen} />
        <Stack.Screen name="Favourites" component={FavouritesScreen} />
        <Stack.Screen name="Watched" component={WatchedScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="VIP" component={VIPScreen} />
        <Stack.Screen name="SimpleSearchScreen" component={SimpleSearchScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
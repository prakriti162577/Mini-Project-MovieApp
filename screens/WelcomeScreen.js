import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useFonts, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { ActivityIndicator } from 'react-native';

export default function WelcomeScreen({ navigation }) {
  const [fontsLoaded] = useFonts({
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1e3a8a" />
      </View>
    );
  }

  return (
    <ImageBackground
      source={require('../assets/movie-bg.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Image
          source={require('../assets/splash-icon (2).png')}
          style={styles.logo}
        />
        <Text style={styles.title}>CineCloud</Text>
        <Text style={styles.subtitle}>Your drama universe awaits 🎬</Text>

        {/* Get Started → Login */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>

        {/* Explore as Guest → Home */}
        <TouchableOpacity
  style={styles.buttonOutline}
  onPress={() => {
    console.log('Navigating to Discover');
    navigation.navigate('Discover',{guest:true});
  }}
>
  <Text style={styles.buttonOutlineText}>Explore as Guest</Text>
</TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    margin: 20,
    padding: 25,
    borderRadius: 20,
    shadowColor: '#1e3a8a',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 15,
    borderRadius: 20,
  },
  title: {
    fontSize: 38,
    color: '#1e3a8a',
    fontFamily: 'Poppins_700Bold',
    marginBottom: 10,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#1e3a8a',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#1e3a8a',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
  },
  buttonText: {
    color: '#dbeafe',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonOutline: {
    borderWidth: 2,
    borderColor: '#1e3a8a',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
  },
  buttonOutlineText: {
    color: '#1e3a8a',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
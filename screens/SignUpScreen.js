import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Image,
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import { useGoogleSignIn } from '../services/googleAuth';
import { useFonts, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { Ionicons } from '@expo/vector-icons';

export default function SignUpScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const { promptAsync, request } = useGoogleSignIn();

  const [fontsLoaded] = useFonts({ Poppins_700Bold });
  if (!fontsLoaded) return null;

  const handleEmailSignUp = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setError('');
      navigation.navigate('Home');
    } catch (err) {
      setError(err.message);
    }
  };

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
        <Text style={styles.title}>Lights, Camera, Action! Sign Up</Text>

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          style={styles.input}
          placeholderTextColor="#93c5fd"
        />

        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            style={styles.passwordInput}
            placeholderTextColor="#93c5fd"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? 'eye' : 'eye-off'}
              size={22}
              color="#1e3a8a"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            style={styles.passwordInput}
            placeholderTextColor="#93c5fd"
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Ionicons
              name={showConfirmPassword ? 'eye' : 'eye-off'}
              size={22}
              color="#1e3a8a"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleEmailSignUp}>
          <Text style={styles.buttonText}>Sign Up with Email</Text>
        </TouchableOpacity>

        <TouchableOpacity
          disabled={!request}
          style={styles.googleButton}
          onPress={() => promptAsync()}
        >
          <View style={styles.googleContent}>
            <Image
              source={require('../assets/google-icon.png')}
              style={styles.googleIcon}
            />
            <Text style={styles.googleText}>Sign Up with Google</Text>
          </View>
        </TouchableOpacity>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Already have an account? Log in</Text>
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
    fontSize: 26,
    color: '#1e3a8a',
    fontFamily: 'Poppins_700Bold',
    marginBottom: 25,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#93c5fd',
    padding: 12,
    marginBottom: 15,
    borderRadius: 10,
    color: '#1e3a8a',
    backgroundColor: 'rgba(255,255,255,0.9)',
    width: '100%',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#93c5fd',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    marginBottom: 15,
    width: '100%',
  },
  passwordInput: {
    flex: 1,
    color: '#1e3a8a',
    paddingVertical: 12,
  },
  button: {
    backgroundColor: '#1e3a8a',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  buttonText: {
    color: '#dbeafe',
    fontWeight: 'bold',
  },
  googleButton: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 10,
    width: '100%',
    marginBottom: 10,
  },
  googleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  googleText: {
    color: '#1e3a8a',
    fontWeight: 'bold',
    fontSize: 16,
  },
  error: {
    color: '#ef4444',
    marginTop: 10,
    textAlign: 'center',
  },
  link: {
    color: '#1e3a8a',
    textAlign: 'center',
    marginTop: 15,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

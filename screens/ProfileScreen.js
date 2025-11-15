import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Switch,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  Animated,
  Easing,
  Alert,
  ImageBackground,
  ScrollView,
} from 'react-native';
import { auth, db, storage } from '../services/firebaseConfig';
import { signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, arrayUnion } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useFonts, Pacifico_400Regular } from '@expo-google-fonts/pacifico';
import CustomTabBar from '../components/CustomTabBar';
import { LinearGradient } from 'expo-linear-gradient';
import { updateDoc } from 'firebase/firestore';

export default function ProfileScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [fontsLoaded] = useFonts({ Pacifico_400Regular });
  const [nameError, setNameError] = useState('');
  const [ageError, setAgeError] = useState('');
  const [showSavedBadge, setShowSavedBadge] = useState(false);
  const [isVIP, setIsVIP] = useState(false);

useEffect(() => {
  const fetchUserData = async () => {
    const uid = auth.currentUser?.uid;
    if (uid) {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserData(docSnap.data());
        setIsVIP(docSnap.data().premium === true);
      }
    }
    setLoading(false);
  };
  fetchUserData();
}, []);

  const glowAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchUserData = async () => {
      const uid = auth.currentUser?.uid;
      if (uid) {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      }
      setLoading(false);
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    if (userData?.premium) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      Animated.loop(
        Animated.sequence([
          Animated.timing(textAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: false,
          }),
          Animated.timing(textAnim, {
            toValue: 0.5,
            duration: 800,
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, [userData?.premium]);

  const animatedGlowStyle = {
    shadowRadius: glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [6, 12],
    }),
    shadowOpacity: glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.5, 0.9],
    }),
  };

  const animatedTextStyle = {
    opacity: textAnim,
    transform: [
      {
        scale: textAnim.interpolate({
          inputRange: [0.5, 1],
          outputRange: [1, 1.1],
        }),
      },
    ],
  };
  const handleFakePayment = async () => {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  try {
    await setDoc(doc(db, 'users', uid), {
      premium: true,
      updatedAt: new Date(),
    }, { merge: true });

    setUserData({ ...userData, premium: true });
    setShowPaymentModal(false);
    Alert.alert('VIP Activated', 'You are now a premium user!');
  } catch (error) {
    console.error('Error upgrading to VIP:', error);
    Alert.alert('Upgrade Failed', 'Could not activate VIP status.');
  }
};
  const handleUpdate = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert('Error', 'User not authenticated.');
      return;
    }

    if (!userData?.name || userData.name.trim().length === 0) {
      setNameError('Name is required');
      return;
    } else {
      setNameError('');
    }

    const age = parseInt(userData?.age);
    if (!age || isNaN(age) || age < 1 || age > 120) {
      setAgeError('Enter age between 1–120');
      return;
    } else {
      setAgeError('');
    }

    try {
      await setDoc(doc(db, 'users', uid), {
        name: userData.name.trim(),
        age: age,
        updatedAt: new Date(),
      }, { merge: true });

      const updatedSnap = await getDoc(doc(db, 'users', uid));
      if (updatedSnap.exists()) {
        setUserData(updatedSnap.data());
        setShowSavedBadge(true);
        setTimeout(() => setShowSavedBadge(false), 3000);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Update Failed', 'Something went wrong while saving your profile.');
    }
  };

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    if (userData?.premium) {
      navigation.replace('VIP');
    } else {
      await signOut(auth);
      navigation.replace('Login');
    }
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;

      const manipulated = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 300, height: 300 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      const uid = auth.currentUser?.uid;
      const filename = `avatar_${Date.now()}.jpg`;
      const response = await fetch(manipulated.uri);
      const blob = await response.blob();
      const storageRef = ref(storage, `profile_pictures/${uid}/${filename}`);
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      setUserData({ ...userData, photoURL: downloadURL });

      try {
        await setDoc(doc(db, 'users', uid), {
          photoURL: downloadURL,
          photos: arrayUnion(downloadURL),
        }, { merge: true });

        Alert.alert('Upload Successful', 'Your profile picture has been saved!');
      } catch (error) {
        console.error('Error updating Firestore:', error);
        Alert.alert('Upload Failed', 'Could not save your profile picture.');
      }
    }
  };

  const handleRemovePhoto = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    try {
      await setDoc(doc(db, 'users', uid), {
        photoURL: null,
      }, { merge: true });

      setUserData({ ...userData, photoURL: null });
      Alert.alert('Photo Removed', 'Your profile picture has been cleared.');
    } catch (error) {
      console.error('Error removing photo:', error);
      Alert.alert('Failed', 'Could not remove your profile picture.');
    }
  };

  if (!fontsLoaded || loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  const theme = {
    background: isDarkMode ? '#1E1E2F' : '#D0E8F2',
    text: isDarkMode ? '#FFFFFF' : '#007BFF',
    input: isDarkMode ? '#333' : '#FFF',
    border: isDarkMode ? '#555' : '#CCC',
  };
  const handleDisableVIP = async () => {
  try {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('User not signed in');
    const docRef = doc(db, 'users', uid);
    await updateDoc(docRef, { premium: false });
    setIsVIP(false);
    Alert.alert('VIP Disabled', 'You are no longer a VIP user.');
  } catch (error) {
    console.error('Error disabling VIP:', error);
    Alert.alert('Error', 'Could not disable VIP. Please try again.');
  }
};

return (
  <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={{ flex: 1 }}>
        {/* Title with glow and curved underline */}
        <View style={styles.titleWrapper}>
          <Text style={[styles.title, { color: theme.text }]}>Profile</Text>
          <View style={styles.curvedUnderline} />
        </View>

        {/* Avatar */}
        <View style={styles.avatarWrapper}>
          <TouchableOpacity onPress={pickImage}>
            {userData?.photoURL ? (
              <Animated.Image
                source={{ uri: userData.photoURL }}
                style={[
                  styles.avatar,
                  userData?.premium && styles.glow,
                  userData?.premium && animatedGlowStyle,
                ]}
              />
            ) : (
              <LinearGradient colors={['#6EC6FF', '#2196F3']} style={styles.avatar}>
                <Animated.Text style={[styles.tapText, animatedTextStyle]}>
                  Tap to add{'\n'}photo
                </Animated.Text>
              </LinearGradient>
            )}
          </TouchableOpacity>

          {/* Remove Photo Button */}
          {userData?.photoURL && (
            <TouchableOpacity
              style={[styles.button, { marginTop: 8, backgroundColor: '#FF6B6B' }]}
              onPress={handleRemovePhoto}
            >
              <Text style={styles.buttonText}>Remove Photo</Text>
            </TouchableOpacity>
          )}

          {/* VIP Badge */}
          {userData?.premium && (
            <View style={styles.starBadge}>
              <Text style={styles.star}>⭐</Text>
            </View>
          )}
        </View>

        {/* Welcome Message */}
        <Text style={[styles.welcome, { color: theme.text }]}>
          Welcome{'\n'}{auth.currentUser?.email}
        </Text>

        {/* Name Input */}
        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.input, borderColor: theme.border },
            nameError && { borderColor: '#FF6B6B' },
          ]}
          placeholder="Enter your Name"
          placeholderTextColor="#888"
          value={userData?.name || ''}
          onChangeText={(text) => {
            setUserData({ ...userData, name: text });
            setNameError(text.trim().length === 0 ? 'Name is required' : '');
          }}
        />
        {nameError ? <Text style={styles.error}>{nameError}</Text> : null}

        {/* Age Input */}
        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.input, borderColor: theme.border },
            ageError && { borderColor: '#FF6B6B' },
          ]}
          placeholder="Enter your Age"
          placeholderTextColor="#888"
          keyboardType="numeric"
          value={userData?.age?.toString() || ''}
          onChangeText={(text) => {
            const age = parseInt(text);
            setUserData({ ...userData, age });
            setAgeError(!age || age < 1 || age > 120 ? 'Enter age between 1–120' : '');
          }}
        />
        {ageError ? <Text style={styles.error}>{ageError}</Text> : null}

        {/* VIP Status */}
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.text }]}>VIP Status:</Text>
          <Text style={[styles.label, { color: theme.text }]}>
            {userData?.premium ? 'Active' : 'Not Active'}
          </Text>
        </View>

        <View style={styles.vipSection}>
  <Text style={styles.vipLabel}>VIP Status: {isVIP ? 'Enabled' : 'Disabled'}</Text>
  {isVIP && (
    <TouchableOpacity style={styles.vipToggle} onPress={handleDisableVIP}>
      <Text style={styles.vipToggleText}>Disable VIP</Text>
    </TouchableOpacity>
  )}
</View>

        {/* Upgrade Button */}
        {!userData?.premium && (
          <TouchableOpacity style={styles.button} onPress={() => setShowPaymentModal(true)}>
            <Text style={styles.buttonText}>Upgrade to VIP</Text>
          </TouchableOpacity>
        )}

        {/* Theme Toggle */}
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.text }]}>
            {isDarkMode ? 'Dark Mode' : 'Light Mode'}
          </Text>
          <Switch value={isDarkMode} onValueChange={() => setIsDarkMode(!isDarkMode)} />
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.button} onPress={handleUpdate}>
          <Text style={styles.buttonText}>Save Changes</Text>
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.button, styles.logout]}
          onPress={() => setShowLogoutConfirm(true)}
        >
          <Text style={styles.buttonText}>Log Out</Text>
        </TouchableOpacity>

        {/* Payment Modal */}
        <Modal visible={showPaymentModal} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>VIP Upgrade</Text>
              <Text style={styles.modalText}>Enjoy premium features and glowing status!</Text>
              <TouchableOpacity style={styles.button} onPress={handleFakePayment}>
                <Text style={styles.buttonText}>Pay ₹0 and Upgrade</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.logout]}
                onPress={() => setShowPaymentModal(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Logout Confirmation Modal */}
        <Modal visible={showLogoutConfirm} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Confirm Logout</Text>
              <Text style={styles.modalText}>Are you sure you want to log out?</Text>
              <TouchableOpacity style={styles.button} onPress={handleLogout}>
                <Text style={styles.buttonText}>Yes, Log Me Out</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.logout]}
                onPress={() => setShowLogoutConfirm(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>

    {/* Custom Tab Bar pinned to bottom */}
    <CustomTabBar active="Profile" isVIP={userData?.premium} />

    {/* Saved Badge Overlay */}
    {showSavedBadge && (
      <View style={styles.savedBadge}>
        <ImageBackground
          source={require('../assets/movie-bg.png')}
          style={styles.savedImage}
          resizeMode="cover"
        >
          <Text style={styles.savedText}>Saved!</Text>
        </ImageBackground>
      </View>
    )}
  </SafeAreaView>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 40,
    fontFamily: 'Pacifico_400Regular',
    marginTop: 40,
    marginBottom: 10,
    textAlign: 'center',
    color: '#007BFF',
    borderBottomWidth: 2,
    borderBottomColor: '#B0D4E3',
    paddingBottom: 6,
  },
  titleWrapper: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 10,
  },
  avatarWrapper: {
    alignItems: 'center',
    marginTop: 10,
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  glow: {
    shadowColor: '#FFD700',
  },
  starBadge: {
    position: 'absolute',
    bottom: 0,
    right: 20,
    backgroundColor: '#FFD700',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  star: {
    fontSize: 16,
    color: '#fff',
  },
  welcome: {
    fontSize: 25,
    fontWeight: '500',
    marginTop: 10,
    textAlign: 'center',
    fontFamily: 'Pacifico_400Regular',
  },
  tapText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  input: {
    marginHorizontal: 20,
    marginTop: 10,
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
  },
  label: {
    fontSize: 14,
    marginHorizontal: 20,
    marginTop: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 10,
  },
  button: {
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: '#007BFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  logout: {
    backgroundColor: '#FF6B6B',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    width: '85%',
    padding: 24,
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#007BFF',
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  curvedUnderline: {
    width: 120,
    height: 12,
    backgroundColor: '#B0D4E3',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignSelf: 'center',
    marginTop: -6,
  },
  error: {
    color: '#FF6B6B',
    fontSize: 12,
    marginHorizontal: 20,
    marginTop: 4,
  },
  savedBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  savedImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  savedText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
    borderRadius: 20,
    fontFamily: 'Pacifico_400Regular',
  },
  scrollContent: {
    paddingBottom: 120,
  },
  vipSection: {
  marginTop: 20,
  alignItems: 'center',
},
vipLabel: {
  fontSize: 16,
  fontWeight: 'bold',
  color: '#007BFF',
},
vipToggle: {
  marginTop: 10,
  backgroundColor: '#FF5C5C',
  paddingVertical: 8,
  paddingHorizontal: 20,
  borderRadius: 8,
},
vipToggleText: {
  color: '#fff',
  fontSize: 14,
  fontWeight: 'bold',
},
});

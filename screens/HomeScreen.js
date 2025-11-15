import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import {
  useFonts,
  Poppins_700Bold
} from '@expo-google-fonts/poppins';
import { Pacifico_400Regular } from '@expo-google-fonts/pacifico';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const posters = [
  {
    image: require('../assets/movie-poster.png'),
    title: 'Summer Strike',
    subtitle: 'Download and watch offline wherever you are',
    genres: ['Slice of Life', 'Healing'],
  },
  {
    image: require('../assets/moonlight-romance.png'),
    title: 'Moonlight Romance',
    subtitle: 'Love blooms under the quiet sky',
    genres: ['Romance', 'Fantasy'],
  },
  {
    image: require('../assets/little-forest.png'),
    title: 'Little Forest',
    subtitle: 'Nature heals in the quietest ways',
    genres: ['Food', 'Countryside'],
  },
  {
    image: require('../assets/hidden-love.png'),
    title: 'Hidden Love',
    subtitle: 'Some feelings are meant to be discovered slowly',
    genres: ['Youth', 'Romance'],
  },
  {
    image: require('../assets/first-frost.png'),
    title: 'The First Frost',
    subtitle: 'When winter whispers, memories awaken',
    genres: ['Melodrama', 'Coming of Age'],
  },
];

export default function HomeScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef(null);
  const autoplayRef = useRef(null);
  const isUserInteracting = useRef(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [fontsLoaded] = useFonts({
    Poppins_700Bold,
    Pacifico_400Regular,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigation.replace('Login');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    let autoplayIndex = currentIndex;

    autoplayRef.current = setInterval(() => {
      if (!isUserInteracting.current) {
        autoplayIndex = (autoplayIndex + 1) % posters.length;
        scrollRef.current?.scrollTo({ x: autoplayIndex * width, animated: true });
        setCurrentIndex(autoplayIndex);
      }
    }, 5000);

    return () => clearInterval(autoplayRef.current);
  }, []);

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [currentIndex]);

  const handleLogout = async () => {
    await signOut(auth);
    navigation.replace('Login');
  };

  if (!fontsLoaded || loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#15c8faff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.logoutIcon} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={28} color="#ffffff" />
      </TouchableOpacity>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        scrollEventThrottle={16}
        onTouchStart={() => (isUserInteracting.current = true)}
        onTouchEnd={() => (isUserInteracting.current = false)}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      >
        {posters.map((poster, index) => (
          <ImageBackground
            key={index}
            source={poster.image}
            style={styles.background}
            resizeMode="cover"
          >
            <LinearGradient
              colors={['transparent', '#fefce8']}
              style={styles.gradient}
            />
            <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
              <Text style={styles.title}>{poster.title}</Text>
              <Text style={styles.subtitle}>{poster.subtitle}</Text>
              <View style={styles.genreRow}>
                {poster.genres.map((genre, i) => (
                  <View key={i} style={styles.genreBadge}>
                    <Text style={styles.genreText}>{genre}</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity
                    style={styles.enterButton}
                    onPress={() => navigation.navigate('GenrePreferences')}
              >
                    <Text style={styles.enterText}>Check out more</Text>
              </TouchableOpacity>
            </Animated.View>
          </ImageBackground>
        ))}
      </ScrollView>
    </View>
  );
}

// 🧭 Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutIcon: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  scrollView: {
    flex: 1,
  },
  background: {
    width: width,
    height: height,
    justifyContent: 'flex-end',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    height: height * 0.4,
    width: '100%',
  },
  overlay: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 36,
    color: '#ffffffff',
    fontFamily: 'Pacifico_400Regular',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#334155',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'Poppins_700Bold',
  },
  genreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  genreBadge: {
    backgroundColor: '#2369aaff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginHorizontal: 5,
    marginVertical: 3,
  },
  genreText: {
    color: '#ffffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  enterButton: {
    backgroundColor: '#023d89ff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
  },
  enterText: {
    color: '#f7f8f8ff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
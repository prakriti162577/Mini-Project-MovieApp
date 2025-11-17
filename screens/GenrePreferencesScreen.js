import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, Alert, ActivityIndicator,
} from 'react-native';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../services/firebaseConfig';
import Toast from 'react-native-toast-message';
import AnimatedEntry from 'react-native-reanimated';
import { FadeInDown } from 'react-native-reanimated';

const genreCategories = {
  'Main Genres': ['Action', 'Adventure', 'Comedy', 'Crime', 'Drama', 'Fantasy', 'Historical', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller', 'War', 'Western'],
  'Family & Music': ['Family', 'Music', 'Animation', 'Documentary', 'Sports', 'Supernatural'],
  'Asian Drama Themes': ['Slice of Life', 'School', 'Medical', 'Legal', 'Business', 'Revenge', 'Friendship', 'Coming of Age', 'Time Travel', 'Parallel Worlds', 'Reincarnation', 'Martial Arts', 'Wuxia', 'Xianxia', 'Josei', 'Shoujo', 'Shounen'],
  'Mood & Style': ['Feel-Good', 'Melodrama', 'Suspense', 'Dark Comedy', 'Satire', 'Psychological', 'Tragedy', 'Uplifting', 'Slow Burn', 'Epic', 'Mystical'],
  'Themes & Identity': ['Politics', 'Technology', 'Survival', 'Conspiracy', 'Mythology', 'Religion', 'LGBTQ+', 'Gender Identity', 'Family Secrets', 'Forbidden Love'],
};

export default function GenrePreferencesScreen({ navigation }) {
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [loadingGenres, setLoadingGenres] = useState(true);
  const [saving, setSaving] = useState(false);
  const scaleAnim = useRef({}).current;
  const saveAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const preloadGenres = async () => {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      try {
        // 🌟 FIX: Use the 'user_preferences' collection to align with DiscoverScreen
        const docRef = doc(db, 'user_preferences', userId); 
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          // 🌟 FIX: Fetch the array of strings from the 'preferredGenres' field
          const savedGenres = data.preferredGenres || []; 
          setSelectedGenres(savedGenres);
          console.log('✅ Preloaded genres:', savedGenres);
        }
      } catch (error) {
        console.error('❌ Error loading saved genres:', error);
      } finally {
        setLoadingGenres(false);
      }
    };

    preloadGenres();
  }, []);

  const toggleGenre = (genre) => {
    setSelectedGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : [...prev, genre]
    );
    animateChip(genre);
  };

  const animateChip = (key) => {
    if (!scaleAnim[key]) {
      scaleAnim[key] = new Animated.Value(1);
    }
    Animated.sequence([
      Animated.timing(scaleAnim[key], {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim[key], {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSavePress = async () => {
    Animated.sequence([
      Animated.timing(saveAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(saveAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    const userId = auth.currentUser?.uid;
    if (!userId) {
      Alert.alert('Error', 'User not logged in');
      return;
    }

    try {
      setSaving(true);
      // 🌟 FIX: Prepare to save the simple array of strings
      const genresToSave = selectedGenres; 

      // 🌟 FIX: Use the correct collection name 'user_preferences' and save under 'preferredGenres'
      await setDoc(doc(db, 'user_preferences', userId), {
        preferredGenres: genresToSave,
        updatedAt: new Date(),
      });

      console.log('✅ Preferences saved to Firestore:', genresToSave);

      Toast.show({
        type: 'success',
        text1: 'Preferences saved!',
        text2: 'Your genre choices are stored.',
      });

      // No need to pass genres via navigation, DiscoverScreen fetches it.
      navigation.navigate('Discover'); 
    } catch (error) {
      console.error('❌ Error saving preferences:', error);
      Alert.alert('Error', error.message || 'Failed to save preferences.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatedEntry.View entering={FadeInDown.duration(500)} style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {loadingGenres ? (
          <ActivityIndicator size="large" color="#1e3a8a" style={{ marginTop: 60 }} />
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.header}>Choose Your Favorite Genres</Text>

            {Object.entries(genreCategories).map(([category, genres]) => (
              <View key={category} style={styles.categorySection}>
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryTitle}>{category}</Text>
                </View>
                <View style={styles.genreContainer}>
                  {genres.map((genre) => {
                    const isSelected = selectedGenres.includes(genre);
                    const anim = scaleAnim[genre] || new Animated.Value(1);
                    scaleAnim[genre] = anim;

                    return (
                      <Animated.View key={genre} style={{ transform: [{ scale: anim }] }}>
                        <TouchableOpacity
                          style={[
                            styles.genreButton,
                            isSelected && styles.genreButtonSelected,
                          ]}
                          onPress={() => toggleGenre(genre)}
                        >
                          <Text
                            style={[
                              styles.genreText,
                              isSelected && styles.genreTextSelected,
                            ]}
                          >
                            {genre}
                          </Text>
                        </TouchableOpacity>
                      </Animated.View>
                    );
                  })}
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSavePress}
          style={styles.floatingButtonWrapper}
          disabled={saving}
        >
          <Animated.View style={[styles.saveButton, { transform: [{ scale: saveAnim }] }]}>
            {saving ? (
              <ActivityIndicator size="small" color="#fefce8" />
            ) : (
              <Text style={styles.saveText}>Save Preferences</Text>
            )}
          </Animated.View>
        </TouchableOpacity>
      </View>
    </AnimatedEntry.View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 100,
    backgroundColor: '#fefce8',
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
    marginTop: 40,
    marginBottom: 20,
    color: '#1e3a8a',
    textAlign: 'center',
    // fontFamily: 'Pacifico_400Regular', // ⚠️ Check if this font is loaded in App.js
  },
  categorySection: {
    marginBottom: 30,
    width: '100%',
  },
  categoryHeader: {
    backgroundColor: '#e0e7ff',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignSelf: 'center',
    marginBottom: 10,
  },
  categoryTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1e3a8a',
    textAlign: 'center',
  },
  genreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  genreButton: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    margin: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  genreButtonSelected: {
    backgroundColor: '#1e3a8a',
  },
  genreText: {
    color: '#1e3a8a',
    fontWeight: '600',
    fontSize: 14,
  },
  genreTextSelected: {
    color: '#fefce8',
  },
  floatingButtonWrapper: {
    position: 'absolute',
    bottom: 70, // overlaps navigation bar
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
    paddingHorizontal: 20,
  },
  saveButton: {
    height: 50,
    width: 200,
    backgroundColor: '#1e3a8a',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  saveText: {
    color: '#fefce8',
    fontWeight: 'bold',
    fontSize: 16,
    // fontFamily: 'Pacifico_400Regular', // ⚠️ Check if this font is loaded in App.js
    textAlign: 'center',
  },
});
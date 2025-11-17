import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  Pressable,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../services/firebaseConfig';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import CustomTabBar from '../components/CustomTabBar';

const { width } = Dimensions.get('window');

const IMAGE_SIZE = 120;
const CARD_HEIGHT = 140;

const FavouritesScreen = ({ vipStatus }) => {
  const [favourites, setFavourites] = useState([]);
  const [selectedDrama, setSelectedDrama] = useState(null);

  useEffect(() => {
    fetchFavourites();
  }, []);

  const fetchFavourites = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      const favRef = collection(db, 'users', uid, 'favourites');
      const snapshot = await getDocs(favRef);
      const favs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFavourites(favs);
    } catch (error) {
      console.error('Error fetching favourites:', error);
    }
  };

  const toggleFavouriteStatus = async (dramaId) => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      await deleteDoc(doc(db, 'users', uid, 'favourites', dramaId));
      setFavourites(prev => prev.filter(item => item.id !== dramaId));

      if (selectedDrama && selectedDrama.id === dramaId) {
        setSelectedDrama(null);
      }
    } catch (error) {
      console.error('Error deleting favourite (un-favoriting):', error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.cardContainer}>
      <Pressable style={styles.card} onPress={() => setSelectedDrama(item)}>
        {item.image ? (
          <Image
            source={
              typeof item.image === 'string'
                ? { uri: item.image }
                : require('../assets/placeholder.png')
            }
            style={styles.image}
          />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}

        <View style={styles.details}>
          <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.genre}>{item.genre}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.platform}</Text>
          </View>
        </View>
      </Pressable>

      <Pressable
        style={styles.deleteIcon}
        onPress={() => toggleFavouriteStatus(item.id)}
      >
        <Ionicons name="heart-dislike" size={24} color="#fff" />
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Ionicons name="heart" size={28} color="#FF5C5C" />
        <Text style={styles.headerText}>My Favourites</Text>
      </View>

      <View style={styles.contentArea}>
        {favourites.length === 0 ? (
          <Text style={styles.emptyText}>You haven’t added any favourites yet. ❤️</Text>
        ) : (
          <FlatList 
            data={favourites}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
          />
        )}
      </View>

      {selectedDrama && (
        <Modal visible transparent animationType="fade">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {selectedDrama.image ? (
                <Image
                  source={
                    selectedDrama?.image && typeof selectedDrama.image === 'string'
                      ? { uri: selectedDrama.image }
                      : require('../assets/placeholder.png')
                  }
                  style={styles.modalImage}
                />
              ) : (
                <View style={[styles.modalImage, styles.imagePlaceholder]}>
                  <Text style={styles.placeholderText}>No Image</Text>
                </View>
              )}
              <Text style={styles.modalTitle}>{selectedDrama.title}</Text>
              <Text style={styles.modalGenre}>{selectedDrama.genre}</Text>
              <Text style={styles.modalCast}>🎭 {selectedDrama.cast}</Text>
              <Text style={styles.modalRating}>⭐ {selectedDrama.rating} / 10</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{selectedDrama.platform}</Text>
              </View>
              <Text style={styles.modalDescription}>{selectedDrama.description}</Text>
              <Pressable style={styles.closeButton} onPress={() => setSelectedDrama(null)}>
                <Text style={styles.closeText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}

      <View style={styles.tabBarWrapper}>
        <CustomTabBar active="Favourites" isVIP={vipStatus} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D0E8F2',
  },
  contentArea: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#fff',
    paddingBottom: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 3,
  },
  headerText: {
    fontSize: 28,
    color: '#007BFF',
    fontFamily: 'Pacifico_400Regular',
    marginLeft: 10,
  },
  list: {
    paddingHorizontal: 10,
    paddingBottom: 100,
    paddingTop: 10,
  },
  cardContainer: {
    marginBottom: 15,
    marginHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    height: CARD_HEIGHT,
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
  },
  image: {
    width: IMAGE_SIZE,
    height: CARD_HEIGHT,
    resizeMode: 'cover',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  imagePlaceholder: {
    backgroundColor: '#E0F0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#888',
    fontSize: 12,
  },
  details: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  genre: {
    fontSize: 13,
    color: '#666',
    marginBottom: 5,
  },
  emptyText: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
    marginTop: 40,
    fontFamily: 'Pacifico_400Regular',
  },
  deleteIcon: {
    backgroundColor: '#FF5C5C',
    height: '100%',
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.85,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 15,
    color: '#333',
    textAlign: 'center',
  },
  modalGenre: {
    fontSize: 15,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  modalCast: {
    fontSize: 14,
    color: '#444',
    marginTop: 8,
    textAlign: 'center',
      },
  modalCast: {
    fontSize: 14,
    color: '#444',
    marginTop: 8,
    textAlign: 'center',
  },
  modalRating: {
    fontSize: 14,
    color: '#444',
    marginTop: 4,
    textAlign: 'center',
  },
  badge: {
    marginTop: 8,
    backgroundColor: '#E0F0FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    color: '#007BFF',
    fontWeight: '600',
  },
  modalDescription: {
    fontSize: 14,
    color: '#555',
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 20,
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 25,
  },
  closeText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  tabBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});

export default FavouritesScreen;
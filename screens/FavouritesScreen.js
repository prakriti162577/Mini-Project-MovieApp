import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  Pressable,
  Modal,
  Dimensions,
} from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../services/firebaseConfig';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import CustomTabBar from '../components/CustomTabBar';

const { width } = Dimensions.get('window');
const CARD_WIDTH = 160;
const CARD_HEIGHT = 240;

const FavouritesScreen = () => {
  const [favourites, setFavourites] = useState([]);
  const [selectedDrama, setSelectedDrama] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

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

  const deleteFavourite = async (dramaId) => {
    try {
      const uid = auth.currentUser?.uid;
      await deleteDoc(doc(db, 'users', uid, 'favourites', dramaId));
      setFavourites(prev => prev.filter(item => item.id !== dramaId));
    } catch (error) {
      console.error('Error deleting favourite:', error);
    }
  };

  const renderItem = ({ item }) => (
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
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.genre}>{item.genre}</Text>
    </Pressable>
  );

  const renderHiddenItem = (data) => (
    <Pressable
      style={styles.deleteButton}
      onPress={() => deleteFavourite(data.item.id)}
    >
      <Ionicons name="trash" size={24} color="#fff" />
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Ionicons name="heart" size={28} color="#FF5C5C" />
        <Text style={styles.headerText}>Favourites</Text>
      </View>

      {favourites.length === 0 ? (
        <Text style={styles.emptyText}>You haven’t added any favourites yet.</Text>
      ) : (
        <SwipeListView
          data={favourites}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderHiddenItem={renderHiddenItem}
          rightOpenValue={-75}
          contentContainerStyle={styles.list}
        />
      )}

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
      {confirmDelete && (
  <Modal transparent animationType="fade">
    <View style={styles.modalContainer}>
      <View style={styles.confirmBox}>
        <Text style={styles.confirmText}>
          Remove "{confirmDelete.title}" from favourites?
        </Text>
        <View style={styles.confirmActions}>
          <Pressable
            style={styles.confirmButton}
            onPress={() => {
              deleteFavourite(confirmDelete.id);
              setConfirmDelete(null);
            }}
          >
            <Text style={styles.confirmButtonText}>Yes</Text>
          </Pressable>
          <Pressable
            style={[styles.confirmButton, { backgroundColor: '#ccc' }]}
            onPress={() => setConfirmDelete(null)}
          >
            <Text style={[styles.confirmButtonText, { color: '#333' }]}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </View>
  </Modal>
)}

      <View style={styles.tabBarWrapper}>
        <CustomTabBar active="Favourites" />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D0E8F2',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  headerText: {
    fontSize: 28,
    color: '#007BFF',
    fontFamily: 'Pacifico_400Regular',
    marginLeft: 10,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  card: {
    width: CARD_WIDTH,
    margin: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#007BFF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0F0FF',
  },
  image: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    resizeMode: 'cover',
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
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 6,
  },
  genre: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginTop: 40,
    fontFamily: 'Pacifico_400Regular',
  },
  deleteButton: {
    backgroundColor: '#FF5C5C',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 20,
    borderRadius: 12,
    height: CARD_HEIGHT + 60,
    margin: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.8,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    resizeMode: 'contain',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
    color: '#333',
    textAlign: 'center',
  },
  modalGenre: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  modalCast: {
    fontSize: 13,
    color: '#444',
    marginTop: 6,
    textAlign: 'center',
  },
  modalRating: {
    fontSize: 13,
    color: '#444',
    marginTop: 2,
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
    fontSize: 13,
    color: '#555',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 18,
  },
  closeButton: {
    marginTop: 12,
    backgroundColor: '#007BFF',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  closeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  tabBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  confirmBox: {
  backgroundColor: '#fff',
  padding: 20,
  borderRadius: 12,
  width: width * 0.8,
  alignItems: 'center',
},
confirmText: {
  fontSize: 16,
  color: '#333',
  marginBottom: 12,
  textAlign: 'center',
},
confirmActions: {
  flexDirection: 'row',
  gap: 12,
},
confirmButton: {
  backgroundColor: '#FF5C5C',
  paddingVertical: 8,
  paddingHorizontal: 20,
  borderRadius: 8,
},
confirmButtonText: {
  color: '#fff',
  fontWeight: 'bold',
},
});

export default FavouritesScreen;
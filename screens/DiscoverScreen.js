import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Animated,
  Image,
  Dimensions,
  Modal,
  Pressable,
  TextInput,
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import CustomTabBar from '../components/CustomTabBar';
import { auth, db } from '../services/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { setDoc, deleteDoc } from 'firebase/firestore';


const toggleFavourite = async (drama) => {
  const uid = auth.currentUser?.uid;
  const favRef = doc(db, 'users', uid, 'favourites', drama.id);

  if (favourites.includes(drama.id)) {
    await deleteDoc(favRef);
    setFavourites(prev => prev.filter(id => id !== drama.id));
  } else {
    await setDoc(favRef, {
  id: drama.id,
  title: drama.title,
  genre: drama.genre,
  image: typeof drama.image === 'string' ? drama.image : '',
  cast: drama.cast || '',
  rating: drama.rating || '',
  platform: drama.platform || '',
  description: drama.description || '',
});

    setFavourites(prev => [...prev, drama.id]);
  }
};


const { width } = Dimensions.get('window');
const CARD_WIDTH = 180;
const CARD_HEIGHT = 278;
const SPACING = 16;

const dramaData = [
  {
    id: '1',
    title: 'Alchemy of Souls',
    genre: 'Fantasy, Romance',
    cast: 'Lee Jae-wook, Jung So-min',
    rating: '8.7',
    platform: 'Netflix',
    image: require('../assets/alchemy.png'),
    description: 'In a fictional kingdom, a powerful sorceress trapped in a blind woman’s body encounters a nobleman with a tragic past. Together, they navigate fate, forbidden magic, and love in a world of shifting souls and ancient secrets.'
  },
  {
    id: '2',
    title: 'Twenty-Five Twenty-One',
    genre: 'Coming-of-age, Sports',
    cast: 'Kim Tae-ri, Nam Joo-hyuk',
    rating: '8.9',
    platform: 'Netflix',
    image: require('../assets/2521.png'),
    description: 'Set during the 1998 financial crisis, a passionate teen fencer and a struggling young man form a deep bond as they chase their dreams and navigate love, loss, and growing up.'
  },
  {
    id: '3',
    title: 'Extraordinary Attorney Woo',
    genre: 'Legal, Slice of Life',
    cast: 'Park Eun-bin, Kang Tae-oh',
    rating: '9.0',
    platform: 'Netflix',
    image: require('../assets/woo.png'),
    description: 'Woo Young-woo, a brilliant rookie attorney with autism, tackles complex legal cases with her unique perspective while learning to navigate relationships, prejudice, and her own emotional growth.'
  },
  {
  id: '4',
  title: 'My Mister',
  genre: 'Drama, Healing',
  cast: 'Lee Sun-kyun, IU',
  rating: '9.1',
  platform: 'Netflix',
  image: require('../assets/mister.png'),
  description: 'A middle-aged engineer and a young woman burdened by debt form an unlikely bond. Through quiet resilience and emotional honesty, they help each other heal from life’s harsh realities.'
},
{
  id: '5',
  title: 'The Untamed',
  genre: 'Xianxia, Mystery',
  cast: 'Xiao Zhan, Wang Yibo',
  rating: '8.8',
  platform: 'Viki',
  image: require('../assets/untamed.png'),
  description: 'In a world of cultivation and ancient clans, two soulmates uncover dark secrets and confront forbidden magic. Their journey spans lifetimes, loyalty, and love that defies fate.'
},
{
  id: '6',
  title: 'Genie, Make a Wish',
  genre: 'Fantasy, Comedy',
  cast: 'Wang Zi Qi, Yukee Chen',
  rating: '7.9',
  platform: 'iQIYI',
  image: require('../assets/genie.png'),
  description: 'A quirky genie appears to grant wishes to a struggling woman, but chaos and romance ensue. As their worlds collide, they discover that true happiness may not need magic.'
},
{
  id: '7',
  title: 'Dear X',
  genre: 'Thriller, Noir',
  cast: 'Hsieh Ying-xuan, Joseph Huang',
  rating: '8.2',
  platform: 'Netflix',
  image: require('../assets/dearx.png'),
  description: 'A widow, her son, and her late husband’s lover become entangled in a twisted inheritance battle. Secrets unravel in this gripping Taiwanese noir about grief, greed, and identity.'
},
{
  id: '8',
  title: 'Squid Game',
  genre: 'Survival, Thriller',
  cast: 'Lee Jung-jae, Park Hae-soo',
  rating: '8.0',
  platform: 'Netflix',
  image: require('../assets/squid.png'),
  description: 'Hundreds of desperate contestants risk their lives in deadly children’s games for a massive cash prize. Beneath the bloodshed lies a haunting critique of inequality and human nature.'
},
{
  id: '9',
  title: 'Frankenstein',
  genre: 'Horror, Classic',
  cast: 'Boris Karloff, Colin Clive',
  rating: '7.8',
  platform: 'Prime Video',
  image: require('../assets/frankenstein.png'),
  description: 'In this iconic tale, a scientist defies nature by creating life from death. But his monstrous creation, yearning for acceptance, spirals into tragedy and terror. A timeless gothic masterpiece.'
},
{
  id: '10',
  title: 'Inside Out 2',
  genre: 'Animation, Family',
  cast: 'Amy Poehler, Maya Hawke',
  rating: '8.5',
  platform: 'Disney+',
  image: require('../assets/insideout2.png'),
  description: 'As Riley enters her teenage years, new emotions join the mix—like Anxiety and Envy. Joy and her crew must navigate the chaos of growing up in this heartfelt Pixar sequel.'
},
{
  id: '11',
  title: 'Regretting You',
  genre: 'Romance, Family',
  cast: 'Fictional adaptation',
  rating: '8.3',
  platform: 'CineCloud',
  image: require('../assets/regretting.png'),
  description: 'A mother and daughter struggle to reconnect after a tragic accident and hidden secrets. Based on Colleen Hoover’s novel, this emotional drama explores forgiveness, love, and second chances.'
},
{
  id: '12',
  title: 'Modern Family',
  genre: 'Sitcom, Comedy',
  cast: 'Ed O’Neill, Sofía Vergara',
  rating: '8.4',
  platform: 'Disney+ Hotstar',
  image: require('../assets/modernfamily.png'),
  description: 'Three diverse families hilariously navigate parenting, relationships, and generational clashes. With heart and humor, this Emmy-winning sitcom redefines what it means to be a modern family.'
}
];

const DiscoverScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [selectedDrama, setSelectedDrama] = useState(null);
  const [showSearchPage, setShowSearchPage] = useState(false);
  const [favourites, setFavourites] = useState([]);

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
  const fetchFavourites = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const favRef = collection(db, 'users', uid, 'favourites');
    const snapshot = await getDocs(favRef);
    const favs = snapshot.docs.map(doc => doc.id);
    setFavourites(favs);
  };
  fetchFavourites();
}, []);

const toggleFavourite = async (drama) => {
  const uid = auth.currentUser?.uid;
  const favRef = doc(db, 'users', uid, 'favourites', drama.id);

  if (favourites.includes(drama.id)) {
    await deleteDoc(favRef);
    setFavourites(prev => prev.filter(id => id !== drama.id));
  } else {
    await setDoc(favRef, drama);
    setFavourites(prev => [...prev, drama.id]);
  }
};

  useEffect(() => {
  let position = 0;
  const interval = setInterval(() => {
    if (scrollRef.current) {
      position += CARD_WIDTH + SPACING;
      scrollRef.current.scrollTo({ x: position, animated: true });

      if (position >= (CARD_WIDTH + SPACING) * dramaData.length) {
        position = 0;
        scrollRef.current.scrollTo({ x: 0, animated: false });
      }
    }
  }, 2500);

  return () => clearInterval(interval);
}, []);

  const handleSearch = () => {
    console.log('Searching for:', searchQuery);
  };

  const renderDramaCards = () => (
    <Animated.ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      scrollEventThrottle={16}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
        { useNativeDriver: true }
      )}
      contentContainerStyle={{
        paddingHorizontal: (width - CARD_WIDTH) / 2,
        paddingTop: 20,
        paddingBottom: 40,
      }}
    >
      {dramaData.map((item, index) => {
        const inputRange = [
          (CARD_WIDTH + SPACING) * (index - 1),
          (CARD_WIDTH + SPACING) * index,
          (CARD_WIDTH + SPACING) * (index + 1),
        ];

        const scale = scrollX.interpolate({
          inputRange,
          outputRange: [0.9, 1.05, 0.9],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={item.id}
            style={[
              styles.verticalCard,
              { transform: [{ scale }], marginVertical: 10 },
            ]}
          >
            <Pressable onPress={() => setSelectedDrama(item)}>
  <Image source={item.image} style={styles.verticalImage} />
  <Text style={styles.cardTitle}>{item.title}</Text>
  <Text style={styles.cardGenre}>{item.genre}</Text>
</Pressable>

<Pressable onPress={() => toggleFavourite(item)} style={styles.heartIcon}>
  <Ionicons
    name={favourites.includes(item.id) ? 'heart' : 'heart-outline'}
    size={22}
    color="#FF5C5C"
  />
</Pressable>
          </Animated.View>
        );
      })}
    </Animated.ScrollView>
  );

  const renderModal = () => (
    <Modal visible={!!selectedDrama} transparent animationType="fade">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Image source={selectedDrama?.image} style={styles.modalImage} />
          <Text style={styles.modalTitle}>{selectedDrama?.title}</Text>
          <Text style={styles.modalGenre}>{selectedDrama?.genre}</Text>
          <Text style={styles.modalCast}>🎭 {selectedDrama?.cast}</Text>
          <Text style={styles.modalRating}>⭐ {selectedDrama?.rating} / 10</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{selectedDrama?.platform}</Text>
          </View>
          <Text style={styles.modalDescription}>{selectedDrama?.description}</Text>
          <Pressable style={styles.trailerButton} onPress={() => console.log('Watch Trailer')}>
            <Text style={styles.trailerText}>▶ Watch Trailer</Text>
          </Pressable>
          <Pressable onPress={() => setSelectedDrama(null)} style={styles.closeButton}>
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>CineCloud</Text>

        {!showSearchPage ? (
  <Pressable style={styles.searchBarContainer} onPress={() => setShowSearchPage(true)}>
    <Ionicons name="search" size={20} color="#007BFF" style={styles.searchIcon} />
    <Text style={styles.searchPlaceholder}>Search</Text>
  </Pressable>
) : (
  <View style={styles.searchActiveContainer}>
    <Pressable onPress={() => setShowSearchPage(false)}>
      <Ionicons name="arrow-back" size={24} color="#007BFF" style={styles.backIcon} />
    </Pressable>

    <TextInput
      style={styles.searchInput}
      placeholder="Search"
      placeholderTextColor="#7DAAC3"
      value={searchQuery}
      onChangeText={setSearchQuery}
      onSubmitEditing={() => console.log('Searching for:', searchQuery)}
      returnKeyType="search"
      autoFocus
      selectionColor="#007BFF"
    />

    <Pressable onPress={() => console.log('Searching for:', searchQuery)}>
      <Ionicons name="search" size={22} color="#007BFF" style={styles.searchIconRight} />
    </Pressable>
  </View>
)}

        {showSearchPage && (
          <View style={{ marginTop: 20 }}>
            <Text style={styles.helperText}>Type your query and press enter to search</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Type your query..."
              placeholderTextColor="#7DAAC3"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              autoFocus
              selectionColor="#007BFF"
            />
            <Pressable onPress={() => setShowSearchPage(false)} style={styles.backButton}>
              <Text style={styles.backText}>← Back</Text>
            </Pressable>
          </View>
        )}

        {!showSearchPage && renderDramaCards()}
        {!showSearchPage && renderModal()}
      </View>
      <CustomTabBar active="Discover" isVIP={userData?.premium} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D0E8F2',
    justifyContent: 'space-between',
  },
  content: {
    alignItems: 'center',
    paddingTop: 40,
  },
  title: {
    fontSize: 36,
    color: '#007BFF',
    fontFamily: 'Pacifico_400Regular',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verticalCard: {
  width: CARD_WIDTH,
  marginRight: SPACING,
  borderRadius: 12,
  overflow: 'hidden',
  backgroundColor: '#fff',
  elevation: 8, // Android shadow
  shadowColor: '#007BFF', // iOS blue shadow
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.7,
  shadowRadius: 6,
  alignItems: 'center',
  borderWidth: 3,
  borderColor: '#E0F0FF',
},
  verticalImage: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    resizeMode: 'cover',
  },
  cardTitle: {
    paddingTop: 8,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  cardGenre: {
    paddingBottom: 8,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
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
  modalDescription: {
  fontSize: 13,
  color: '#555',
  marginTop: 8,
  textAlign: 'center',
  lineHeight: 18,
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
  trailerButton: {
    marginTop: 16,
    backgroundColor: '#FF5C5C',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  trailerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 12,
    backgroundColor: '#007BFF',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  closeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  searchBarContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#E3F2FD',
  borderRadius: 12,
  paddingHorizontal: 12,
  paddingVertical: 6,
  marginHorizontal: 20,
  marginTop: 20,
  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
},

searchPlaceholder: {
  fontSize: 16,
  color: '#7DAAC3',
  fontFamily: 'Pacifico_400Regular',
  marginLeft: 8,
},

searchActiveContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#E3F2FD',
  borderRadius: 12,
  paddingHorizontal: 12,
  paddingVertical: 6,
  marginHorizontal: 20,
  marginTop: 20,
  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
},

backIcon: {
  marginRight: 10,
},

searchInput: {
  flex: 1,
  fontSize: 16,
  color: '#007BFF',
  fontFamily: 'Pacifico_400Regular',
},

searchIconRight: {
  marginLeft: 10,
},
heartIcon: {
  position: 'absolute',
  top: 10,
  right: 10,
  backgroundColor: '#fff',
  borderRadius: 20,
  padding: 6,
  elevation: 4,
},
});

export default DiscoverScreen;
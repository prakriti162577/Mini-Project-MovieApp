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
    ScrollView,
    TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomTabBar from '../components/CustomTabBar';
// Assuming firebaseConfig.js, auth, and db are imported correctly
import { auth, db } from '../services/firebaseConfig';
import { doc, getDoc, collection, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import {useRoute, useNavigation } from '@react-navigation/native';
import SearchBar from '../components/SearchBar'; // adjust path if needed
import LottieView from 'lottie-react-native';

// --- Constants & Data ---
const { width } = Dimensions.get('window');
const CARD_WIDTH = 180;
const SPACING = 16;
const CARD_HEIGHT = 278;
const VERTICAL_ITEM_WIDTH = (width - SPACING * 3) / 2;
const VERTICAL_ITEM_HEIGHT = VERTICAL_ITEM_WIDTH * 1.5;

// Pagination constants
const INITIAL_LOAD_COUNT = 4; // Start with 4 cards per vertical section
const LOAD_MORE_COUNT = 4;    // Load 4 more cards on scroll end

// Consolidated Drama Data
const dramaData = [
    {
        id: '1',
        title: 'Alchemy of Souls',
        genre: 'Fantasy, Romance',
        cast: 'Lee Jae-wook, Jung So-min',
        rating: '8.7',
        platform: 'Netflix',
        image: require('../assets/alchemy.png'),
        description: 'In a fictional kingdom, a powerful sorceress trapped in a blind woman’s body encounters a nobleman with a tragic past.',
        is2025Release: false
    },
    {
        id: '2',
        title: 'Twenty-Five Twenty-One',
        genre: 'Coming-of-age, Sports',
        cast: 'Kim Tae-ri, Nam Joo-hyuk',
        rating: '8.9',
        platform: 'Netflix',
        image: require('../assets/2521.png'),
        description: 'Set during the 1998 financial crisis, a passionate teen fencer and a struggling young man form a deep bond.',
        is2025Release: false
    },
    {
        id: '3',
        title: 'Extraordinary Attorney Woo',
        genre: 'Legal, Slice of Life',
        cast: 'Park Eun-bin, Kang Tae-oh',
        rating: '9.0',
        platform: 'Netflix',
        image: require('../assets/woo.png'),
        description: 'Woo Young-woo, a brilliant rookie attorney with autism, tackles complex legal cases with her unique perspective.',
        is2025Release: false
    },
    {
        id: '4',
        title: 'My Mister',
        genre: 'Drama, Healing',
        cast: 'Lee Sun-kyun, IU',
        rating: '9.1',
        platform: 'Netflix',
        image: require('../assets/mister.png'),
        description: 'A middle-aged engineer and a young woman burdened by debt form an unlikely bond.',
        is2025Release: false
    },
    {
        id: '5',
        title: 'The Untamed',
        genre: 'Xianxia, Mystery',
        cast: 'Xiao Zhan, Wang Yibo',
        rating: '8.8',
        platform: 'Viki',
        image: require('../assets/untamed.png'),
        description: 'In a world of cultivation and ancient clans, two soulmates uncover dark secrets and confront forbidden magic.',
        is2025Release: false
    },
    {
        id: '6',
        title: 'Genie, Make a Wish',
        genre: 'Fantasy, Comedy',
        cast: 'Wang Zi Qi, Yukee Chen',
        rating: '7.9',
        platform: 'iQIYI',
        image: require('../assets/genie.png'),
        description: 'A quirky genie appears to grant wishes to a struggling woman, but chaos and romance ensue.',
        is2025Release: false
    },
    {
        id: '7',
        title: 'Dear X',
        genre: 'Thriller, Noir',
        cast: 'Hsieh Ying-xuan, Joseph Huang',
        rating: '8.2',
        platform: 'Netflix',
        image: require('../assets/dearx.png'),
        description: 'A widow, her son, and her late husband’s lover become entangled in a twisted inheritance battle.',
        is2025Release: false
    },
    {
        id: '8',
        title: 'Squid Game',
        genre: 'Survival, Thriller',
        cast: 'Lee Jung-jae, Park Hae-soo',
        rating: '8.0',
        platform: 'Netflix',
        image: require('../assets/squid.png'),
        description: 'Hundreds of desperate contestants risk their lives in deadly children’s games for a massive cash prize.',
        is2025Release: false
    },
    {
        id: '9',
        title: 'Frankenstein',
        genre: 'Horror, Classic',
        cast: 'Boris Karloff, Colin Clive',
        rating: '7.8',
        platform: 'Prime Video',
        image: require('../assets/frankenstein.png'),
        description: 'In this iconic tale, a scientist defies nature by creating life from death. But his monstrous creation spirals into tragedy and terror.',
        is2025Release: false
    },
    {
        id: '10',
        title: 'Inside Out 2',
        genre: 'Animation, Family',
        cast: 'Amy Poehler, Maya Hawke',
        rating: '8.5',
        platform: 'Disney+',
        image: require('../assets/insideout2.png'),
        description: 'As Riley enters her teenage years, new emotions join the mix—like Anxiety and Envy.',
        is2025Release: false
    },
    {
        id: '11',
        title: 'Regretting You',
        genre: 'Romance, Family',
        cast: 'Fictional adaptation',
        rating: '8.3',
        platform: 'CineCloud',
        image: require('../assets/regretting.png'),
        description: 'A mother and daughter struggle to reconnect after a tragic accident and hidden secrets.',
        is2025Release: false
    },
    {
        id: '12',
        title: 'Modern Family',
        genre: 'Sitcom, Comedy',
        cast: 'Ed O’Neill, Sofía Vergara',
        rating: '8.4',
        platform: 'Disney+ Hotstar',
        image: require('../assets/modernfamily.png'),
        description: 'Three diverse families hilariously navigate parenting, relationships, and generational clashes.',
        is2025Release: false
    },
    // --- 🌟 NEW 2025 FEATURED TITLES ---
    {
        id: '201',
        title: 'Squid Game 2',
        genre: 'Thriller, Survival',
        cast: 'Lee Jung-jae, Lee Byung-hun',
        rating: 'N/A',
        platform: 'Netflix',
        image: require('../assets/squidgame2.png'), // Placeholder image required
        description: 'The global phenomenon returns. New game, new contestants, and a deeper dive into the organization behind the brutal challenge.',
        is2025Release: true
    },
    {
        id: '202',
        title: 'Ask the Stars',
        genre: 'Sci-Fi, Rom-Com',
        cast: 'Gong Hyo-jin, Lee Min-ho',
        rating: 'N/A',
        platform: 'tvN',
        image: require('../assets/askthestars.png'), // Placeholder image required
        description: 'A romantic comedy set on a space station, following a Korean-American astronaut and a genius gynecologist who meets her.',
        is2025Release: true
    },
    {
        id: '203',
        title: 'One Piece (S2)',
        genre: 'Adventure, Fantasy',
        cast: 'Iñaki Godoy, Mackenyu',
        rating: 'N/A',
        platform: 'Netflix',
        image: require('../assets/onepiece2.png'), // Placeholder image required
        description: 'The Straw Hat Pirates continue their journey into the Grand Line, facing new, powerful enemies and mysteries.',
        is2025Release: true
    },
    {
        id: '204',
        title: 'All of Us Are Dead S2',
        genre: 'Zombie, Horror',
        cast: 'Park Ji-hu, Yoon Chan-young',
        rating: 'N/A',
        platform: 'Netflix',
        image: require('../assets/allofusaredead2.png'), // Placeholder image required
        description: 'The second season continues the story of the survivors, exploring the permanent consequences of the zombie virus outbreak.',
        is2025Release: true
    },
    {
        id: '205',
        title: 'The White Olive Tree',
        genre: 'Military, Romance, Action',
        cast: 'Chen Zhe Yuan, Liang Jie',
        rating: 'N/A',
        platform: 'iQIYI',
        image: require('../assets/whiteolivetree.png'), // Placeholder image required
        description: 'A military reporter and a bomb disposal engineer meet while covering a peacekeeping mission in a volatile region. Based on the novel.',
        is2025Release: true
    },
];

// Data segregation
const featured2025Dramas = dramaData.filter(d => d.is2025Release);
const nonFeaturedDramas = dramaData.filter(d => !d.is2025Release);


// --- Toggle Favourite Function ---
const toggleFavouriteHelper = async (drama, favourites, setFavourites) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const favRef = doc(db, 'users', uid, 'favourites', drama.id);

    if (favourites.includes(drama.id)) {
        await deleteDoc(favRef);
        setFavourites(prev => prev.filter(id => id !== drama.id));
    } else {
        await setDoc(favRef, drama);
        setFavourites(prev => [...prev, drama.id]);
    }
};

// --- DiscoverScreen Component ---
const DiscoverScreen = () => {
    const route = useRoute();
    const isGuest = route.params?.guest;
    
    const [searchQuery, setSearchQuery] = useState('');
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef(null);
    const scrollX = useRef(new Animated.Value(0)).current;
    const [selectedDrama, setSelectedDrama] = useState(null);
    const [showSearchPage, setShowSearchPage] = useState(false);
    const [favourites, setFavourites] = useState([]);
    const navigation = useNavigation(); // <-- Navigation hook is available

    // States for the vertical scroll sections
    const [section1Dramas, setSection1Dramas] = useState([]);
    const [section2Dramas, setSection2Dramas] = useState([]);
    const [section3Dramas, setSection3Dramas] = useState([]);
    
    const [section1Title, setSection1Title] = useState('New Discoveries'); 
    const [section2Title, setSection2Title] = useState('Global Hits'); 
    const [section3Title, setSection3Title] = useState('Top Rated'); 

    // States for Pagination limits
    const [limit1, setLimit1] = useState(INITIAL_LOAD_COUNT);
    const [limit2, setLimit2] = useState(INITIAL_LOAD_COUNT);
    const [limit3, setLimit3] = useState(INITIAL_LOAD_COUNT);

    // --- Handle Load More Logic ---
    const handleLoadMore = (section, currentLimit, setLimit) => {
        let maxIndex = 0;
        if (section === 1) maxIndex = section1Dramas.length;
        if (section === 2) maxIndex = section2Dramas.length;
        if (section === 3) maxIndex = section3Dramas.length;

        const newLimit = Math.min(currentLimit + LOAD_MORE_COUNT, maxIndex);
        setLimit(newLimit);
    };

    // --- Genre Filtering Function ---
    const filterDramasByGenre = (preferredGenres) => {
        const defaultGenres = ['Romance', 'Fantasy', 'Thriller']; // Fallback genres
        
        const genresToFilter = preferredGenres && preferredGenres.length > 0
            ? preferredGenres
            : defaultGenres;

        // Helper function to safely filter and fallback
        const safeFilter = (targetGenre, fallbackSliceStart, fallbackSliceEnd) => {
            let dramas = nonFeaturedDramas.filter(d => 
                d.genre.toLowerCase().includes(targetGenre.toLowerCase())
            );
            // Ensure there are enough items for the vertical sections
            if (dramas.length < 4) {
                 // Fallback to general, non-featured items
                 dramas = nonFeaturedDramas.slice(fallbackSliceStart, fallbackSliceEnd);
            }
            return dramas;
        };

        // 1. Section 1 (User's Top Genre)
        const targetGenre1 = genresToFilter[0] || defaultGenres[0];
        setSection1Dramas(safeFilter(targetGenre1, 0, 4));
        setSection1Title(`Picks for You: ${targetGenre1}`);

        // 2. Section 2 (User's Second Genre or Default)
        const targetGenre2 = genresToFilter[1] || defaultGenres[1];
        setSection2Dramas(safeFilter(targetGenre2, 4, 8)); 
        setSection2Title(`Explore ${targetGenre2} Content`);

        // 3. Section 3 (User's Third Genre or Default)
        const targetGenre3 = genresToFilter[2] || defaultGenres[2];
        setSection3Dramas(safeFilter(targetGenre3, 8, 12));
        setSection3Title(`Binge-Worthy ${targetGenre3}`);
        
        // Reset limits when new sections are loaded
        setLimit1(INITIAL_LOAD_COUNT);
        setLimit2(INITIAL_LOAD_COUNT);
        setLimit3(INITIAL_LOAD_COUNT);
    };
    
    // --- Data Fetching Logic (User Data & Favourites) ---
    useEffect(() => {
        const fetchUserData = async () => {
            const uid = auth.currentUser?.uid;
            let fetchedUserData = null;

            if (uid) {
                const userDocRef = doc(db, 'users', uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    fetchedUserData = userDocSnap.data();
                    setUserData(fetchedUserData);
                }
                
                // Fetch Favourites
                const favRef = collection(db, 'users', uid, 'favourites');
                const snapshot = await getDocs(favRef);
                const favs = snapshot.docs.map(doc => doc.id);
                setFavourites(favs);
            }
            
            // Filter dramas based on fetched genre preferences
            filterDramasByGenre(fetchedUserData?.preferredGenres);

            setLoading(false);
        };
        fetchUserData();
    }, []);

    // --- Auto-Scroll Logic (UPDATED for featured2025Dramas) ---
    useEffect(() => {
        let position = 0;
        const interval = setInterval(() => {
            if (scrollRef.current) {
                // Check against the length of the FEATURED array
                if (position >= (CARD_WIDTH + SPACING) * (featured2025Dramas.length - 1)) {
                    position = 0;
                    scrollRef.current.scrollTo({ x: 0, animated: false });
                } else {
                    position += CARD_WIDTH + SPACING;
                    scrollRef.current.scrollTo({ x: position, animated: true });
                }
            }
        }, 2500);

        return () => clearInterval(interval);
    }, []);

    // --- Handlers ---
    const handleSearch = () => {
        console.log('Searching for:', searchQuery);
    };

    const handleToggleFavourite = (drama) => {
        toggleFavouriteHelper(drama, favourites, setFavourites); 
    };

    // 🌟 NEW HANDLER: Navigates to the TrailerPlayerScreen 🌟
    const handleWatchTrailer = () => {
        if (selectedDrama) {
            // Close the modal first for a cleaner transition
            setSelectedDrama(null); 
            // Navigate to the TrailerPlayerScreen, passing data for the search/playback
            navigation.navigate('TrailerPlayerScreen', {
                title: selectedDrama.title,
                rating: selectedDrama.rating,
                platform: selectedDrama.platform,
                // videoId: null // We rely on the TrailerPlayerScreen to fetch the ID
            });
        }
    };
    
    // --- Renderers ---
    
    // 1. Horizontal Auto-Scrolling Cards (2025 Releases)
    const renderDramaCards = () => (
        <>
            <Text style={styles.featuredTitle}>2025 Anticipated Releases</Text>
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
                {featured2025Dramas.map((item, index) => {
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
                                {
                                    transform: [{ scale }], marginVertical: 10,
                                    marginRight: index === featured2025Dramas.length - 1 ? 0 : SPACING,
                                },
                            ]}
                        >
                            <Pressable onPress={() => setSelectedDrama(item)}>
                                <Image source={item.image} style={styles.verticalImage} />
                                <Text style={styles.cardTitle}>{item.title}</Text>
                                <Text style={styles.cardGenre}>{item.genre}</Text>
                            </Pressable>

                            <Pressable onPress={() => handleToggleFavourite(item)} style={styles.heartIcon}>
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
        </>
    );
    
    // 2. Vertical Genre Section (Reusable and Paginated)
    const renderGenreSection = (title, data, limit, setLimit, section) => (
        <View style={styles.verticalContentContainer}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <View style={styles.verticalGrid}>
                {/* Use the limit state to slice the data */}
                {data.slice(0, limit).map((item) => (
                    <Pressable 
                        key={item.id}
                        onPress={() => setSelectedDrama(item)}
                        style={styles.gridItem}
                    >
                        <Image source={item.image} style={styles.gridImage} />
                        <View style={styles.gridTitleContainer}>
                            <Text style={styles.gridTitle} numberOfLines={2}>{item.title}</Text>
                        </View>
                        <Pressable onPress={() => handleToggleFavourite(item)} style={styles.gridHeartIcon}>
                            <Ionicons
                                name={favourites.includes(item.id) ? 'heart' : 'heart-outline'}
                                size={20}
                                color="#FF5C5C"
                            />
                        </Pressable>
                    </Pressable>
                ))}
            </View>
            
            {/* NEW: Load More Button */}
            {data.length > limit && (
                <Pressable 
                    style={styles.loadMoreButton} 
                    onPress={() => handleLoadMore(section, limit, setLimit)}
                >
                    <Text style={styles.loadMoreText}>Load More <Ionicons name="chevron-down" size={16} color="#007BFF" /></Text>
                </Pressable>
            )}
            {data.length === 0 && (
                   <Text style={styles.helperText}>No dramas found for this section.</Text>
            )}
        </View>
    );

    // 3. Modal Renderer (With Trailer Button Fix)
    const renderModal = () => (
        <Modal visible={!!selectedDrama} transparent animationType="fade">
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Image source={selectedDrama?.image} style={styles.modalImage} />
                    <Text style={styles.modalTitle}>{selectedDrama?.title}</Text>
                    <Text style={styles.modalGenre}>{selectedDrama?.genre}</Text>
                    
                    {/* FIXED: Ensuring all strings/emojis are explicitly wrapped in a Text component */}
                    <Text style={styles.modalCast}>
                        <Text>🎭 {selectedDrama?.cast}</Text>
                    </Text>
                    <Text style={styles.modalRating}>
                        <Text>⭐ {selectedDrama?.rating} / 10</Text>
                    </Text>
                    
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{selectedDrama?.platform}</Text>
                    </View>
                    <Text style={styles.modalDescription}>{selectedDrama?.description}</Text>
                    
                    {/* 🌟 IMPLEMENTATION: Call handleWatchTrailer on press 🌟 */}
                    <Pressable style={styles.trailerButton} onPress={handleWatchTrailer}>
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

    // --- Main Render Structure ---
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    <View style={styles.titleRow}>
                        <LottieView
                            source={require('../assets/Clapperboard.json')}
                            autoPlay
                            loop
                            style={styles.reel}
                        />

                        <Text style={styles.title}>CineCloud</Text>

                        <LottieView
                            source={require('../assets/Clapperboard.json')}
                            autoPlay
                            loop
                            style={styles.reel}
                        />
                    </View>
                    {isGuest && (
                        <View style={styles.banner}>
                            <Text style={styles.bannerText}>You're exploring as a guest</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.loginLink}>Login for full access</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    {/* Search Bar Logic (retained) */}
                    <SearchBar
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        onSubmit={() => navigation.navigate('Search')}
                        editable={false}
                        onPress={() => navigation.navigate('Search')}
                    />

                    {/* 1. Horizontal Auto-Scrolling Content (2025 Featured) */}
                    {!showSearchPage && renderDramaCards()}

                    <View style={styles.spacer} /> 
                    
                    {/* 2. Vertical Genre-Filtered Sections with Pagination */}
                    {!showSearchPage && renderGenreSection(section1Title, section1Dramas, limit1, setLimit1, 1)}
                    {!showSearchPage && renderGenreSection(section2Title, section2Dramas, limit2, setLimit2, 2)}
                    {!showSearchPage && renderGenreSection(section3Title, section3Dramas, limit3, setLimit3, 3)}
                    
                    <View style={{ height: 40 }} /> 
                </View>
            </ScrollView>

            {/* Modal (outside of ScrollView) */}
            {renderModal()}
            
            {/* Custom Tab Bar (outside of ScrollView) */}
            <CustomTabBar active="Discover" isVIP={userData?.premium} />
        </SafeAreaView>
    );
};

// --- Styles (Unchanged) ---
const styles = StyleSheet.create({
    // ... (rest of the styles are unchanged)
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        gap: 8, // optional spacing between items
    },
    reel: {
        width: 50,
        height: 50,
    },
    title: {
        fontSize: 36,
        color: '#007BFF',
        fontFamily: 'Pacifico_400Regular',
        textAlign: 'center',
        paddingHorizontal: 10,
    },
    container: {
        flex: 1,
        backgroundColor: '#D0E8F2',
    },
    content: {
        alignItems: 'center',
        paddingTop: 40,
        width: '100%',
    },
    featuredTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#007BFF', // Highlight color
        marginTop: 20,
        marginBottom: 10,
        textAlign: 'center',
        width: '100%',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // --- Horizontal Card Styles ---
    verticalCard: {
        width: CARD_WIDTH,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#fff',
        elevation: 8,
        shadowColor: '#007BFF',
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
    // --- Vertical Grid Styles ---
    verticalContentContainer: {
        width: '100%',
        paddingHorizontal: SPACING,
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#007BFF',
        marginBottom: 15,
        textAlign: 'left',
        width: '100%',
    },
    verticalGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    gridItem: {
        width: VERTICAL_ITEM_WIDTH,
        marginBottom: SPACING,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#fff',
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 3,
        borderWidth: 1,
        borderColor: '#E0F0FF',
    },
    gridImage: {
        width: '100%',
        height: VERTICAL_ITEM_HEIGHT * 0.7,
        resizeMode: 'cover',
    },
    gridTitleContainer: {
        padding: 8,
        height: VERTICAL_ITEM_HEIGHT * 0.3,
        justifyContent: 'center',
    },
    gridTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
    },
    gridHeartIcon: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderRadius: 15,
        padding: 4,
    },
    // --- Load More Styles ---
    loadMoreButton: {
        marginTop: 15,
        paddingVertical: 10,
        backgroundColor: '#E0F0FF',
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#007BFF',
    },
    loadMoreText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#007BFF',
    },
    // --- Modal Styles ---
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
    // --- Search Bar Styles (etc.) ---
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
        width: width - 40,
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
        width: width - 40,
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
    helperText: {
        fontSize: 14,
        color: '#555',
        textAlign: 'center',
        marginBottom: 10,
    },
    backButton: {
        marginTop: 10,
        alignSelf: 'flex-start',
        marginLeft: 20,
    },
    backText: {
        color: '#007BFF',
        fontSize: 16,
    },
    spacer: {
        height: 20,
        width: '100%',
    },
    banner: {
        backgroundColor: '#DBEAFE',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        alignItems: 'center',
    },
    bannerText: {
        fontSize: 16,
        color: '#1e3a8a',
        marginBottom: 5,
    },
    loginLink: {
        fontSize: 16,
        color: '#2563eb',
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
});

export default DiscoverScreen;
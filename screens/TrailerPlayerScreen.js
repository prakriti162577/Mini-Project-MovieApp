import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    Dimensions,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import YoutubeIframe from 'react-native-youtube-iframe';
import { useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');

// ⚠️ IMPORTANT: REPLACE THIS WITH YOUR ACTUAL YOUTUBE API KEY
const YOUTUBE_API_KEY = 'AIzaSyD4Y3K8KnIfpt2XOTA_QxAUGNSuq4-B8iQ'; 
// Set to a placeholder value if a videoId is passed in, otherwise the component will search.
const INITIAL_VIDEO_ID = null; 

const TrailerPlayerScreen = ({ navigation }) => {
    const route = useRoute();
    // Destructure initial videoId (if available) and other details
    const { videoId: initialVideoId, title, rating, platform } = route.params || {};

    // State for the video ID to play (will be updated after search if initialId is null)
    const [mainVideoId, setMainVideoId] = useState(initialVideoId || INITIAL_VIDEO_ID); 
    const [playing, setPlaying] = useState(true);
    // Loading starts true if we don't have a video ID and need to search.
    const [loading, setLoading] = useState(!initialVideoId); 

    const videoTitle = title || 'Trailer';

    // --- YOUTUBE API CALL FUNCTION ---
    const searchForTrailer = useCallback(async (searchQuery) => {
        if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'YOUR_YOUTUBE_API_KEY') {
            Alert.alert("API Key Error", "Please set your YouTube API key in the code.");
            setLoading(false);
            return;
        }

        setLoading(true);
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&key=${YOUTUBE_API_KEY}&maxResults=1`;

        try {
            const response = await fetch(searchUrl);
            const data = await response.json();

            // Check if results are found and is a video
            if (data.items && data.items.length > 0 && data.items[0].id.kind === 'youtube#video') {
                const newVideoId = data.items[0].id.videoId;
                setMainVideoId(newVideoId);
                // Video ID is found, player will start loading now
            } else {
                setMainVideoId(null); // No trailer found
                Alert.alert("Trailer Not Found", `Could not find a trailer for "${title}".`);
            }
        } catch (error) {
            console.error("YouTube Search Error:", error);
            Alert.alert("Search Failed", "An error occurred while searching for the trailer.");
            setMainVideoId(null);
        } finally {
            setLoading(false);
        }
    }, [title]);

    // --- EFFECTS ---
    useEffect(() => {
        // Only run search if we didn't get a videoId via route params
        if (!initialVideoId && title) {
            // Construct a strong search query
            const searchQuery = `${title} ${platform ? platform + ' ' : ''}official trailer`;
            searchForTrailer(searchQuery);
        } else if (!initialVideoId) {
             // Handle case where neither videoId nor title is present
             setLoading(false);
        }
    }, [initialVideoId, title, platform, searchForTrailer]);

    // --- PLAYER HANDLERS (Remain the same) ---
    const onStateChange = useCallback((state) => {
        if (loading) { 
            setLoading(false); 
        }
        
        if (state === 'playing') {
            setPlaying(true);
        }
        if (state === 'paused' || state === 'ended') {
            setPlaying(false);
        }

        if (state === 'error') {
            Alert.alert("Playback Error", "Could not play the YouTube video.");
            setPlaying(false);
        }
    }, [loading]);
    
    const onReady = useCallback(() => {
        setLoading(false);
        setPlaying(true);
    }, []);

    // ... (rest of the component's return structure)
    return (
        <SafeAreaView style={styles.container}>
            {/* New View to contain all content for vertical centering */}
            <View style={styles.contentWrapper}>
                
                {/* 1. Header with Back/Close Button and Title */}
                <View style={styles.headerContainer}> 
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
                        <Ionicons name="close-circle-outline" size={32} color={styles.headerTitle.color} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle} numberOfLines={1}>{videoTitle}</Text>
                </View>
                
                {/* 2. Main Video Player Wrapper */}
                <View style={styles.playerWrapper}>
                    {loading && title ? (
                    <View style={styles.playerPlaceholder}>
                        <ActivityIndicator size="large" color="#fff" />
                        <Text style={styles.placeholderText}>Searching for Trailer...</Text>
                    </View>
                    ) : mainVideoId ? (
                    <YoutubeIframe
                        height={width * 0.5625}
                        width={width}
                        videoId={mainVideoId}
                        play={playing}
                        onChangeState={onStateChange}
                        onReady={onReady}
                    />
                    ) : (
                    <View style={styles.playerPlaceholder}>
                        <Ionicons name="alert-circle-outline" size={40} color="#fff" />
                        <Text style={styles.placeholderText}>Error: Trailer Not Found</Text>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 10 }}>
                        <Text style={{ color: '#fff', fontSize: 16, textDecorationLine: 'underline' }}>Go Back</Text>
                        </TouchableOpacity>
                    </View>
                    )}
                </View> 
                
                {/* 3. Information and Rating Block */}
                <View style={styles.infoContainer}>
                    <Text style={styles.infoTitle}>{title || "Trailer"}</Text>
                    
                    <View style={styles.ratingAndBadgeRow}>
                        {/* Rating */}
                        {rating && (
                            <Text style={styles.ratingText}>
                                <Ionicons name="star" size={18} color={styles.starColor.color} />
                                {' '}
                                {rating} / 10 
                            </Text>
                        )}
                        
                        {/* Platform Badge */}
                        {platform && (
                            <View style={styles.platformBadge}>
                                <Text style={styles.platformText}>{platform}</Text>
                            </View>
                        )}
                    </View>

                    <Text style={styles.statusText}>
                        {mainVideoId ? `Now playing: ${videoTitle} Trailer` : 'No video information available.'}
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
};

// --- STYLES (Remain the same) ---
const styles = StyleSheet.create({
    // --- CORE COLORS FOR REFERENCE ---
    primaryBlue: '#007BFF', 
    secondaryBlue: '#E0F0FF',
    navyText: '#0A2A47',
    
    container: {
        flex: 1,
        backgroundColor: '#F0F8FF', // Very Light Blue/Off-White
    },
    contentWrapper: { 
        flex: 1,
        justifyContent: 'center', // Centers video player and info block vertically
    },
    
    // --- HEADER STYLES ---
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#FFFFFF', // Pure White Header
        borderBottomWidth: 1,
        borderBottomColor: '#D0E8F2', // Light divider
        // NOTE: The header now sits high up, respecting the SafeAreaView boundary.
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0A2A47', // Deep Navy Text
        flex: 1,
        marginLeft: 10,
    },
    closeButton: {
        padding: 5,
    }, 

    // --- PLAYER STYLES (Blue Focus) ---
    playerWrapper: {
        width: '100%',
        backgroundColor: '#000', // Still black for player frame
        justifyContent: 'center',
        alignItems: 'center',
    },
    playerPlaceholder: {
        width: '100%',
        height: width * 0.5625,
        backgroundColor: '#090909ff', 
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        color: '#fff',
        marginTop: 10,
        fontSize: 16,
        fontWeight: '600',
    },

    // --- INFO/DETAILS STYLES ---
    infoContainer: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#FFFFFF', // White background for info block
        borderBottomWidth: 1,
        borderBottomColor: '#E0F0FF', 
    },
    infoTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#0A2A47', // Deep Navy Title
        marginBottom: 8,
    },
    ratingAndBadgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    ratingText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0A2A47', // Navy Text
        marginRight: 15,
    },
    starColor: { // Used as a reference for the star icon color
        color: '#1E90FF', // Bright Blue for emphasis
    },
    platformBadge: {
        backgroundColor: '#E0F0FF', // Very Light Blue Background
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#007BFF50', // Subtle blue border
    },
    platformText: {
        color: '#007BFF', // Primary Blue Text
        fontSize: 12,
        fontWeight: 'bold',
    },
    statusText: { 
        fontSize: 14,
        color: '#555555', // Standard Gray for secondary info
    },
});

export default TrailerPlayerScreen;
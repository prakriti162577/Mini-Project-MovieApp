// MovieCard.js

import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const SMALL_CARD_WIDTH = 120;
const SMALL_CARD_HEIGHT = 180;
const DARK_NAVY = '#0A2A47'; 
const PRIMARY_BLUE = '#007BFF';

export default function MovieCard({ item, onPress }) {
    // Note: The 'item' from OMDb search results typically includes Title, Year, Poster, and imdbID.
    
    return (
        <TouchableOpacity onPress={() => onPress(item)} style={styles.cardContainer}>
            <Image 
                source={{ uri: item.Poster }} 
                style={styles.cardImage} 
                resizeMode="cover" 
            />
            {/* Title area at the bottom of the card */}
            <View style={styles.cardTitleArea}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                    {item.Title}
                </Text>
                {/* Optional: Add year */}
                <Text style={styles.cardYear}>{item.Year}</Text>
            </View>
        </TouchableOpacity>
    );
}

// --- Card Specific Styles ---
const styles = StyleSheet.create({
    cardContainer: {
        width: SMALL_CARD_WIDTH, // 120px wide
        height: SMALL_CARD_HEIGHT + 30, // Taller to fit the title below the image
        marginRight: 16, // Use the SPACING defined in DiscoverScreen
        borderRadius: 10, 
        overflow: 'hidden',
        backgroundColor: '#FFFFFF', // White card background
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15, 
        shadowRadius: 4,
        elevation: 4,
    },
    cardImage: {
        width: '100%',
        height: SMALL_CARD_HEIGHT * 0.75, 
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    cardTitleArea: {
        paddingHorizontal: 8,
        paddingVertical: 5,
        height: SMALL_CARD_HEIGHT * 0.25 + 30, // Remaining height
        justifyContent: 'center',
    },
    cardTitle: {
        fontSize: 13,
        fontWeight: '700', 
        color: DARK_NAVY, 
        marginBottom: 2,
    },
    cardYear: {
        fontSize: 11,
        color: '#888', 
        fontWeight: '500',
    },
});
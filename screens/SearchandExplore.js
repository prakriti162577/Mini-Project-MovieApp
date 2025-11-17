import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
} from 'react-native';
import { TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomTabBar from '../components/CustomTabBar';
import SearchBar from '../components/SearchBar'; // adjust path if needed

const OMDB_API_KEY = '4e937f2f';

const genres = [
  'Action', 'Romance', 'Comedy', 'Thriller', 'Fantasy',
  'Drama', 'Horror', 'Sci-Fi', 'Mystery', 'Adventure',
  'Animation', 'Crime', 'Family', 'Historical', 'Musical',
  'War', 'Western', 'Biography', 'Sport', 'Supernatural'
];

export default function SimpleSearchScreen({ vipStatus }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeGenre, setActiveGenre] = useState('');

  const handleSearch = async (query) => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(`https://www.omdbapi.com/?s=${query}&apikey=${OMDB_API_KEY}`);
      const data = await response.json();
      if (data.Search) {
        setResults(data.Search);
      } else {
        setResults([]);
        console.log('No results:', data.Error);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenrePress = (genre) => {
    setActiveGenre(genre);
    setSearchQuery(genre);
    handleSearch(genre);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>CineCloud</Text>

      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Pressable onPress={() => {
          setActiveGenre('');
          setResults([]);
          setSearchQuery('');
        }}>
          <Ionicons name="arrow-back" size={24} color="#007BFF" style={{ marginLeft: 20, marginTop: 20 }} />
        </Pressable>

        <View style={{ flex: 1 }}>
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSubmit={() => handleSearch(searchQuery)}
          />
        </View>
      </View>

      <FlatList
        data={genres}
        keyExtractor={(item) => item}
        numColumns={2}
        contentContainerStyle={styles.genreGrid}
        columnWrapperStyle={styles.genreRow}
        renderItem={({ item }) => (
          <Pressable
            style={[
              styles.genreButton,
              activeGenre === item && styles.genreButtonActive
            ]}
            onPress={() => handleGenrePress(item)}
          >
            <Text
              style={[
                styles.genreText,
                activeGenre === item && styles.genreTextActive
              ]}
            >
              {item}
            </Text>
          </Pressable>
        )}
      />

      {loading && <Text style={styles.loading}>Loading...</Text>}

      <FlatList
        data={results}
        keyExtractor={(item) => item.imdbID}
        contentContainerStyle={styles.resultGrid}
        columnWrapperStyle={styles.resultRow}
        numColumns={2}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.Poster }} style={styles.poster} />
            <Text style={styles.name}>{item.Title}</Text>
            <Text style={styles.year}>{item.Year}</Text>
          </View>
        )}
      />

      <View style={styles.tabBarWrapper}>
        <CustomTabBar active="Search" isVIP={vipStatus} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D0E8F2',
  },
  title: {
    fontSize: 40,
    color: '#007BFF',
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'Pacifico_400Regular',
  },
  loading: {
    textAlign: 'center',
    marginTop: 10,
    color: '#555',
  },
  genreGrid: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  genreRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  genreButton: {
    flex: 1,
    marginHorizontal: 6,
    paddingVertical: 10,
    backgroundColor: '#DCEEFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#007BFF',
    alignItems: 'center',
  },
  genreButtonActive: {
    backgroundColor: '#b6e2f7ff',
  },
  genreText: {
    fontSize: 14,
    color: '#007BFF',
    fontWeight: 'bold',
  },
  resultGrid: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
    justifyContent: 'top',
  },
  card: {
    flex: 1,
    marginHorizontal: 6,
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#ddedffff',
    borderRadius: 10,
    padding: 10,
    elevation: 2,
  },
  poster: {
    width: 120,
    height: 180,
    borderRadius: 8,
    marginBottom: 8,
  },
  resultRow: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  year: {
    fontSize: 14,
    color: '#777',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 10,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#333',
  },
  backIcon: {
    marginRight: 8,
  },
  searchIconRight: {
    marginLeft: 8,
  },
});
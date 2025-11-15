import React from 'react';
import { View, TextInput, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SearchBar = ({
  searchQuery,
  setSearchQuery,
  onSubmit,
  onPress,
  editable = true,
}) => {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={20} color="#007BFF" style={styles.icon} />

      {editable ? (
        <TextInput
          style={styles.input}
          placeholder="Search movies, dramas..."
          placeholderTextColor="#7DAAC3"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={onSubmit}
          returnKeyType="search"
          editable={true}
          autoFocus={true}
          selectionColor="#007BFF"
        />
      ) : (
        <Pressable style={{ flex: 1 }} onPress={onPress}>
          <TextInput
            style={styles.input}
            placeholder="Search movies, dramas..."
            placeholderTextColor="#00a6ffff"
            value={searchQuery}
            editable={false}
            pointerEvents="none"
          />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 20,
    marginTop: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: '#007BFF',
    fontFamily: 'Pacifico_400Regular',
  },
});

export default SearchBar;
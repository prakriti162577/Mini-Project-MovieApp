import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const CustomTabBar = ({ active, isVIP }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TabButton
        icon="home"
        label="Discover"
        onPress={() => navigation.navigate('Discover')}
        active={active === 'Discover'}
      />
      <TabButton
        icon="star"
        label="Favourites"
        onPress={() => navigation.navigate('Favourites')}
        active={active === 'Favourites'}
      />
      <TabButton
        icon="search"
        label="Search"
        onPress={() => navigation.navigate('Search')}
        active={active === 'Search'}
      />
      <TabButton
        icon="person"
        label="Profile"
        onPress={() => navigation.navigate('Profile')}
        active={active === 'Profile'}
      />
      {isVIP && (
        <TabButton
          icon="sparkles"
          label="VIP"
          onPress={() => navigation.navigate('VIP')}
          active={active === 'VIP'}
          isVIP={true} // ✅ VIP badge only here
        />
      )}
    </View>
  );
};

const TabButton = ({ icon, label, onPress, active, isVIP = false }) => (
  <TouchableOpacity
    style={styles.button}
    onPress={onPress}
    accessibilityLabel={`Navigate to ${label} tab`}
  >
    <View style={styles.iconWrapper}>
      <Ionicons name={icon} size={24} color={active ? '#007BFF' : '#7DAAC3'} />
      {isVIP && (
        <Ionicons
          name="sparkles"
          size={12}
          color="#FFD700"
          style={styles.vipBadge}
        />
      )}
    </View>
    <Text style={[styles.label, { color: active ? '#007BFF' : '#7DAAC3' }]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#D0E8F2',
    paddingVertical: 10,
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#B0D4E3',
    marginBottom: 30,
  },
  button: {
    alignItems: 'center',
  },
  iconWrapper: {
    position: 'relative',
  },
  vipBadge: {
    position: 'absolute',
    top: -4,
    right: -6,
  },
  label: {
    fontSize: 12,
    fontFamily: 'Pacifico_400Regular',
    marginTop: 2,
  },
});

export default CustomTabBar;
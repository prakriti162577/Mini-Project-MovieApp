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
        icon="film"
        label="Watched"
        onPress={() => navigation.navigate('Watched')}
        active={active === 'Watched'}
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
        />
      )}
    </View>
  );
};

const TabButton = ({ icon, label, onPress, active }) => (
  <TouchableOpacity style={styles.button} onPress={onPress}>
    <Ionicons name={icon} size={24} color={active ? '#FFD700' : '#7DAAC3'} />
    <Text style={[styles.label, { color: active ? '#FFD700' : '#7DAAC3' }]}>
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
  label: {
    fontSize: 12,
    fontFamily: 'Pacifico_400Regular',
    marginTop: 2,
  },
});

export default CustomTabBar;
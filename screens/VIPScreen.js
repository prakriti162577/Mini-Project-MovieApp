import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function VIPScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎉 Welcome, VIP!</Text>
      <Text style={styles.subtitle}>Enjoy exclusive features and early access to premium content.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8DC',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#DAA520',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
});
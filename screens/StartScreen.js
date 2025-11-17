import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated, Text } from 'react-native';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function StartScreen() {
  const navigation = useNavigation();
  const bounceAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    Animated.spring(bounceAnim, {
      toValue: 0,
      friction: 4,
      tension: 60,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('Welcome');
    }, 3500); // ⏱️ 3.5 seconds delay

    return () => clearTimeout(timer); // cleanup
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.title, { transform: [{ translateY: bounceAnim }] }]}>
        CineCloud
      </Animated.Text>

      <View style={styles.animationWrapper}>
        <LottieView
          source={require('../assets/Clapperboard.json')}
          autoPlay
          loop
          style={styles.animation}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D0E8F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    fontFamily: 'Pacifico_400Regular',
    color: '#1e3a8a',
    marginBottom: 10,
  },
  animationWrapper: {
    marginTop: -10,
  },
  animation: {
    width: width * 0.5,
    height: width * 0.5,
  },
});
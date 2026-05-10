import { useEffect, useState } from 'react';
import { Animated, Text, View } from 'react-native';

import DottedPattern from '../../Components/DottedPattern';

import { SPLASH_MASCOT_URI } from './SplashScreen.config';
import styles from './SplashScreen.styles';

function createPulseAnimation(opacity: Animated.Value) {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(opacity, {
        duration: 850,
        toValue: 0.62,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        duration: 850,
        toValue: 1,
        useNativeDriver: true,
      }),
    ]),
  );
}

function usePulseAnimation() {
  const [opacity] = useState(() => new Animated.Value(1));

  useEffect(() => {
    const animation = createPulseAnimation(opacity);

    animation.start();

    return () => animation.stop();
  }, [opacity]);

  return opacity;
}

function DecorativeSparkles() {
  return (
    <View style={styles.sparkleLayer} pointerEvents="none">
      <Text style={[styles.sparkle, styles.sparkleStar]}>★</Text>
      <Text style={[styles.sparkle, styles.sparkleHeart]}>♥</Text>
      <Text style={[styles.sparkle, styles.sparkleLine]}>✧</Text>
    </View>
  );
}

function MascotLogo() {
  const logoOpacity = usePulseAnimation();

  return (
    <Animated.View style={[styles.logoCard, { opacity: logoOpacity }]}>
      <Animated.Image
        accessibilityLabel="Cute cat wallet mascot"
        source={{ uri: SPLASH_MASCOT_URI }}
        style={styles.logo}
      />
    </Animated.View>
  );
}

function SplashScreen() {
  return (
    <View style={styles.container}>
      <DottedPattern />
      <DecorativeSparkles />
      <View style={styles.content}>
        <MascotLogo />
        <Text style={styles.title}>Kawaii Wallet</Text>
        <Text style={styles.subtitle}>
          Your cheerful companion for smart savings.
        </Text>
      </View>
    </View>
  );
}

export default SplashScreen;

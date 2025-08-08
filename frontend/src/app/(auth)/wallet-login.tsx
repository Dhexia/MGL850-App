import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  Alert,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/theme';
import BoatChainMainIcon from '@/assets/images/boatchainIcons/BoatChainMainIcon.svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/contexts/WalletContext';
import { createConnectionScreenStyles } from '@/styles/layout/HomeScreen.style';

const WalletLoginScreen = () => {
  const theme = useTheme();
  const styles = createConnectionScreenStyles(theme);
  const { connect, address } = useWallet();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  // Connexion et authentification complète en une seule étape
  const handleConnectAndLogin = async () => {
    try {
      setLoading(true);
      
      // Étape 1: Connexion wallet (si pas déjà connecté)
      if (!address) {
        await connect();
      }
      
      // Étape 2: Authentification automatique après connexion
      await login(); // GET /auth/nonce → personal_sign(nonce) → POST /auth/login
      
      // Redirection vers l'app
      router.replace('/(tabs)');
    } catch (e: any) {
      const msg = e?.message ?? 'Connexion échouée';
      Alert.alert('Connexion', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={[styles.container, { backgroundColor: theme.colors.primary }]}>
        <LinearGradient
          style={styles.container}
          colors={['rgba(0,208,255,0.3)', 'transparent']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        >
          <View style={styles.middle}>
            <View style={styles.logo}>
              <BoatChainMainIcon width="100%" height="100%" color={theme.colors.textLight} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.title}>Bienvenue sur BoatChain</Text>
              <Text style={styles.body}>Achetez, vendez et suivez des bateaux en toute confiance.</Text>
            </View>
          </View>

          <View style={styles.bottomContainer}>
            <View style={styles.bigTitleContainer}>
              <Text style={styles.bigTitle}>Commençons !</Text>
            </View>

            {/* Connexion MetaMask (directe) */}
            <Pressable 
              style={[styles.buttonsContainer, loading && { opacity: 0.7 }]} 
              onPress={handleConnectAndLogin}
              disabled={loading}
            >
              <Image source={require('@/assets/images/metamask.png')} style={styles.images} />
              <Text style={styles.buttonsText}>
                {loading ? 'Connexion...' : 'Se connecter avec MetaMask'}
              </Text>
            </Pressable>

            {/* Connexion WalletConnect (autres wallets) */}
            <Pressable 
              style={[styles.buttonsContainer, loading && { opacity: 0.7 }]} 
              onPress={handleConnectAndLogin}
              disabled={loading}
            >
              <Image source={require('@/assets/images/walletConnect.png')} style={styles.images} />
              <Text style={styles.buttonsText}>
                {loading ? 'Connexion...' : 'Se connecter avec WalletConnect'}
              </Text>
            </Pressable>

            {/* Bouton retour */}
            <Pressable 
              style={{ marginTop: 24, padding: 12 }}
              onPress={() => router.back()}
            >
              <Text style={[theme.textStyles.labelMedium, { color: theme.colors.textLight, textAlign: 'center' }]}>
                ← Retour
              </Text>
            </Pressable>
          </View>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
};

export default WalletLoginScreen;
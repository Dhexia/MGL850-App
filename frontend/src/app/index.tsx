import { View, Text, Image, Pressable, Alert, ActivityIndicator } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { useTheme } from '@/theme';
import BoatChainMainIcon from '@/assets/images/boatchainIcons/BoatChainMainIcon.svg';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/contexts/WalletContext';

import {
  createLoadingScreenStyles,
  createConnectionScreenStyles,
} from '@/styles/layout/HomeScreen.style';

export default function Home() {
  const { jwt, isMockMode } = useAuth();
  const [loading, setLoading] = useState(false);

  // écran de transition très court pour lisser le retour d'arrière-plan
  const [booting, setBooting] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 300);
    return () => clearTimeout(t);
  }, []);

  const connected = Boolean(jwt);

  if (loading || booting) return <LoadingScreen />;
  
  // Si connecté → bateaux
  if (connected) return <Redirect href="/(tabs)" />;

  // Si mode dev disponible → sélection de mode
  if (isMockMode) return <Redirect href="/(auth)/mode" />;

  // Sinon → connexion MetaMask normale
  return <ConnectionScreen setLoading={setLoading} />;
}

function LoadingScreen() {
  const styles = createLoadingScreenStyles();
  return (
    <View style={[styles.container, { backgroundColor: '#000' }]}>
      <ActivityIndicator size="large" color="#fff" />
      <Text style={[styles.text, { color: 'white', marginTop: 20 }]}>Chargement...</Text>
    </View>
  );
}

function ConnectionScreen({ setLoading }: { setLoading: (b: boolean) => void }) {
  const theme = useTheme();
  const styles = createConnectionScreenStyles(theme);
  const { connect, address } = useWallet();
  const { login } = useAuth();
  const router = useRouter();

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

          {/* Connexion simple et standard DApp */}
          <Pressable style={styles.buttonsContainer} onPress={handleConnectAndLogin}>
            <Image source={require('@/assets/images/metamask.png')} style={styles.images} />
            <Text style={styles.buttonsText}>Se connecter avec MetaMask</Text>
          </Pressable>
        </View>
      </LinearGradient>
    </View>
  );
}
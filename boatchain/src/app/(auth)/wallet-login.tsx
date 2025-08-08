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

  // étape 1: ouverture WalletConnect pour choisir le wallet
  const handleOpenWalletConnect = async () => {
    try {
      await connect();
      // à ce stade tu vas dans MetaMask, tu choisis le compte, puis tu reviens
      // on n'enchaîne pas automatiquement la signature tant que tu n'as pas confirmé vouloir signer
    } catch (e: any) {
      Alert.alert('Connexion', e?.message ?? 'Erreur WalletConnect');
    }
  };

  // étape 2: signature du nonce et login backend
  const handleSignAndLogin = async () => {
    try {
      if (!address) {
        Alert.alert('Connexion', `Aucun wallet connecté. Ouvre d'abord WalletConnect.`);
        return;
      }
      setLoading(true);
      await login();          // GET /auth/nonce → personal_sign(nonce) → POST /auth/login
      router.replace('/'); // Retour à index.tsx pour logique centralisée
    } catch (e: any) {
      // si le backend renvoie un 401 ou 400 on expose le message si présent
      const msg = e?.message ?? 'Login échoué';
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

            {/* étape 1: ouvrir WalletConnect pour choisir le wallet */}
            <Pressable 
              style={[styles.buttonsContainer, loading && { opacity: 0.7 }]} 
              onPress={handleOpenWalletConnect}
              disabled={loading}
            >
              <Image source={require('@/assets/images/metamask.png')} style={styles.images} />
              <Text style={styles.buttonsText}>Choisir un wallet</Text>
            </Pressable>

            {/* étape 2: signer le nonce et se connecter au backend */}
            <Pressable 
              style={[styles.buttonsContainer, loading && { opacity: 0.7 }]} 
              onPress={handleSignAndLogin}
              disabled={loading}
            >
              <Image source={require('@/assets/images/walletConnect.png')} style={styles.images} />
              <Text style={styles.buttonsText}>
                {loading ? 'Connexion...' : 'Signer et continuer'}
              </Text>
            </Pressable>

            {/* aide visuelle optionnelle: adresse détectée après étape 1 */}
            {address ? (
              <Text style={{ marginTop: 8, color: theme.colors.textDark }}>
                Adresse détectée: {address.slice(0, 6)}...{address.slice(-4)}
              </Text>
            ) : null}

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

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
  const { jwt } = useAuth();
  const [loading, setLoading] = useState(false);

  // écran de transition très court pour lisser le retour d'arrière-plan
  const [booting, setBooting] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 300);
    return () => clearTimeout(t);
  }, []);

  const connected = Boolean(jwt);

  if (loading || booting) return <LoadingScreen />;
  if (!connected) return <ConnectionScreen setLoading={setLoading} />;

  return <Redirect href="/(tabs)" />;
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

  // étape 1: ouverture WalletConnect pour choisir le wallet
  const handleOpenWalletConnect = async () => {
    try {
      await connect();
      // à ce stade tu vas dans MetaMask, tu choisis le compte, puis tu reviens
      // on n’enchaîne pas automatiquement la signature tant que tu n’as pas confirmé vouloir signer
    } catch (e: any) {
      Alert.alert('Connexion', e?.message ?? 'Erreur WalletConnect');
    }
  };

  // étape 2: signature du nonce et login backend
  const handleSignAndLogin = async () => {
    try {
      if (!address) {
        Alert.alert('Connexion', 'Aucun wallet connecté. Ouvre d’abord WalletConnect.');
        return;
      }
      setLoading(true);
      await login();          // GET /auth/nonce → personal_sign(nonce) → POST /auth/login
      router.replace('/(tabs)');
    } catch (e: any) {
      // si le backend renvoie un 401 ou 400 on expose le message si présent
      const msg = e?.message ?? 'Login échoué';
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

          {/* étape 1: ouvrir WalletConnect pour choisir le wallet */}
          <Pressable style={styles.buttonsContainer} onPress={handleOpenWalletConnect}>
            <Image source={require('@/assets/images/metamask.png')} style={styles.images} />
            <Text style={styles.buttonsText}>Choisir un wallet</Text>
          </Pressable>

          {/* étape 2: signer le nonce et se connecter au backend */}
          <Pressable style={styles.buttonsContainer} onPress={handleSignAndLogin}>
            <Image source={require('@/assets/images/walletConnect.png')} style={styles.images} />
            <Text style={styles.buttonsText}>Signer et continuer</Text>
          </Pressable>

          {/* aide visuelle optionnelle: adresse détectée après étape 1 */}
          {address ? (
            <Text style={{ marginTop: 8, color: theme.colors.textDark }}>
              Adresse détectée: {address.slice(0, 6)}...{address.slice(-4)}
            </Text>
          ) : null}
        </View>
      </LinearGradient>
    </View>
  );
}

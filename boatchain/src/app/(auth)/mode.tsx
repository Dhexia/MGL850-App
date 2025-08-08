import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/theme';
import { PlatformUtils } from '@/lib/platform-utils';

const ModeSelectionScreen = () => {
  const theme = useTheme();

  const handleMetaMaskMode = () => {
    router.push('/(auth)/wallet-login');
  };

  const handleMockMode = () => {
    router.push('/(auth)/mock-accounts');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        {/* Header */}
        <View style={{ alignItems: 'center', marginBottom: 48 }}>
          <Text style={[theme.textStyles.displaySmall, { color: theme.colors.primary, marginBottom: 8 }]}>
            Mode Développement
          </Text>
          <Text style={[theme.textStyles.titleMedium, { color: theme.colors.textSecondary, textAlign: 'center' }]}>
            Choisissez votre méthode de connexion
          </Text>
        </View>

        {/* Mode Selection */}
        <View style={{ width: '100%', maxWidth: 300 }}>
          {/* MetaMask Login */}
          <TouchableOpacity
            style={{
              width: '100%',
              paddingVertical: 20,
              paddingHorizontal: 24,
              backgroundColor: theme.colors.primary,
              borderRadius: 12,
              alignItems: 'center',
              marginBottom: 16,
            }}
            onPress={handleMetaMaskMode}
          >
            <Text style={[theme.textStyles.titleMedium, { color: theme.colors.onPrimary, marginBottom: 4 }]}>
              🦊 Connexion MetaMask
            </Text>
            <Text style={[theme.textStyles.bodySmall, { color: theme.colors.onPrimary, textAlign: 'center', opacity: 0.8 }]}>
              Connexion normale via wallet
            </Text>
          </TouchableOpacity>

          {/* Mock Accounts */}
          <TouchableOpacity
            style={{
              width: '100%',
              paddingVertical: 20,
              paddingHorizontal: 24,
              backgroundColor: theme.colors.secondary,
              borderRadius: 12,
              alignItems: 'center',
            }}
            onPress={handleMockMode}
          >
            <Text style={[theme.textStyles.titleMedium, { color: theme.colors.onSecondary, marginBottom: 4 }]}>
              🧪 Supercomptes Mock
            </Text>
            <Text style={[theme.textStyles.bodySmall, { color: theme.colors.onSecondary, textAlign: 'center', opacity: 0.8 }]}>
              Comptes de test avec rôles prédéfinis
            </Text>
          </TouchableOpacity>
        </View>

        {/* Environment Info */}
        <View style={{ marginTop: 48, alignItems: 'center' }}>
          <View style={{ padding: 16, backgroundColor: theme.colors.surface, borderRadius: 8 }}>
            <Text style={[theme.textStyles.labelSmall, { color: theme.colors.textSecondary, textAlign: 'center' }]}>
              🛠 Environnement: {PlatformUtils.isIOSSimulator ? 'iOS Simulator' : PlatformUtils.isIOSDevice ? 'iPhone' : 'Web'}
            </Text>
            <Text style={[theme.textStyles.labelSmall, { color: theme.colors.textSecondary, textAlign: 'center' }]}>
              Mode Dev: ✅
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ModeSelectionScreen;
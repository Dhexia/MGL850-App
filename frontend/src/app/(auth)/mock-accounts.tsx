import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/theme';
import { useAuth } from '@/contexts/AuthContext';
import { TEST_ACCOUNTS } from '@/lib/test-accounts';

const TestLoginScreen = () => {
  const theme = useTheme();
  const { devLoginWithAccount, isMockMode } = useAuth();

  const handleAccountSelect = async (account: typeof TEST_ACCOUNTS[0]) => {
    try {
      await devLoginWithAccount(account);
      router.replace('/(tabs)'); // Aller directement aux tabs après login dev
    } catch (error) {
      console.error('Dev login failed:', error);
    }
  };

  if (!isMockMode) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={[theme.textStyles.titleLarge, { color: theme.colors.text }]}>
            Mode Test Non Disponible
          </Text>
          <Text style={[theme.textStyles.bodyMedium, { color: theme.colors.textSecondary, textAlign: 'center', marginTop: 10 }]}>
            Le mode test n'est disponible qu'en développement.
          </Text>
          <TouchableOpacity
            style={{
              marginTop: 20,
              paddingVertical: 12,
              paddingHorizontal: 24,
              backgroundColor: theme.colors.primary,
              borderRadius: 8,
            }}
            onPress={() => router.back()}
          >
            <Text style={[theme.textStyles.labelLarge, { color: theme.colors.onPrimary }]}>
              Retour
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: 20 }}>
        <Text style={[theme.textStyles.titleLarge, { color: theme.colors.text, marginBottom: 8 }]}>
          Comptes de Développement
        </Text>
        <Text style={[theme.textStyles.bodyMedium, { color: theme.colors.textSecondary, marginBottom: 24 }]}>
          Choisissez un compte avec accès blockchain complet
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {TEST_ACCOUNTS.map((account) => (
          <TouchableOpacity
            key={account.address}
            style={{
              marginHorizontal: 20,
              marginBottom: 16,
              padding: 20,
              backgroundColor: theme.colors.surface,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.colors.outline,
            }}
            onPress={() => handleAccountSelect(account)}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Text style={[theme.textStyles.titleMedium, { color: theme.colors.text, flex: 1 }]}>
                    {account.name}
                  </Text>
                  <View style={{
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 12,
                    backgroundColor: '#4CAF50',
                    marginLeft: 8,
                  }}>
                    <Text style={[theme.textStyles.labelSmall, { color: 'white', fontSize: 10 }]}>
                      🔗 BLOCKCHAIN
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    alignSelf: 'flex-start',
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    borderRadius: 16,
                    backgroundColor: account.role === 'certifier' ? theme.colors.primary : theme.colors.secondary,
                    marginBottom: 8,
                  }}
                >
                  <Text style={[
                    theme.textStyles.labelSmall,
                    { 
                      color: account.role === 'certifier' ? theme.colors.onPrimary : theme.colors.onSecondary,
                      textTransform: 'uppercase',
                    }
                  ]}>
                    {account.role === 'certifier' ? 'Certificateur' : 'Utilisateur Standard'}
                  </Text>
                </View>
                <Text style={[theme.textStyles.bodySmall, { color: theme.colors.textSecondary, marginBottom: 8 }]}>
                  {account.description}
                </Text>
                <Text style={[theme.textStyles.labelSmall, { color: theme.colors.textTertiary, fontFamily: 'monospace' }]}>
                  {account.address}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={{ padding: 20 }}>
        <TouchableOpacity
          style={{
            paddingVertical: 12,
            paddingHorizontal: 24,
            backgroundColor: theme.colors.outline,
            borderRadius: 8,
            alignItems: 'center',
          }}
          onPress={() => router.back()}
        >
          <Text style={[theme.textStyles.labelLarge, { color: theme.colors.onSurface }]}>
            Annuler
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default TestLoginScreen;
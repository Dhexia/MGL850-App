import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTheme } from '@/theme';
import { TEST_ACCOUNTS, TestAccount } from '@/lib/test-accounts';
import { createTestAccountSelectorStyles } from '@/styles/TestAccountSelector.style';

interface TestAccountSelectorProps {
  onAccountSelect: (account: TestAccount) => void;
  selectedAccount?: TestAccount;
}

export default function TestAccountSelector({ 
  onAccountSelect, 
  selectedAccount 
}: TestAccountSelectorProps) {
  const theme = useTheme();
  const styles = createTestAccountSelectorStyles(theme);

  const handleSelectAccount = (account: TestAccount) => {
    onAccountSelect(account);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'certifier': return '#007AFF';
      case 'standard_user': return '#34C759';
      default: return theme.colors.textDark;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'certifier': return '🏛️ CERTIFICATEUR';
      case 'standard_user': return '👤 UTILISATEUR STANDARD';
      default: return role.toUpperCase();
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.debugBanner}>
        <Text style={styles.debugText}>
          🧪 MODE TEST - iOS Simulator
        </Text>
      </View>

      <Text style={styles.title}>Choisir un compte de test</Text>
      <Text style={styles.subtitle}>
        Sélectionnez un compte pour tester les différents rôles
      </Text>

      {TEST_ACCOUNTS.map((account, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.accountCard,
            selectedAccount?.address === account.address && styles.selectedCard
          ]}
          onPress={() => handleSelectAccount(account)}
        >
          <Text style={styles.accountName}>{account.name}</Text>
          <Text style={[
            styles.accountRole, 
            { color: getRoleColor(account.role) }
          ]}>
            {getRoleLabel(account.role)}
          </Text>
          <Text style={styles.accountDescription}>
            {account.description}
          </Text>
          <Text style={styles.accountAddress}>
            {formatAddress(account.address)}
          </Text>
        </TouchableOpacity>
      ))}

      {selectedAccount && (
        <TouchableOpacity
          style={styles.connectButton}
          onPress={() => {/* Handled by parent */}}
        >
          <Text style={styles.connectButtonText}>
            Se connecter avec {selectedAccount.name}
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}
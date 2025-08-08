import { StyleSheet } from 'react-native';
import { Theme } from '@/theme';

export const createTestAccountSelectorStyles = (theme: Theme) => StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: theme.colors.backgroundLight,
  },
  title: {
    ...theme.textStyles.titleLarge,
    color: theme.colors.textDark,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    ...theme.textStyles.bodyMedium,
    color: theme.colors.textDark,
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.7,
  },
  accountCard: {
    backgroundColor: theme.colors.surfaceLight,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.neutral,
  },
  selectedCard: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.background,
  },
  accountName: {
    ...theme.textStyles.titleMedium,
    color: theme.colors.textDark,
    marginBottom: 4,
  },
  accountRole: {
    ...theme.textStyles.bodySmall,
    color: theme.colors.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  accountDescription: {
    ...theme.textStyles.bodyMedium,
    color: theme.colors.textDark,
    marginBottom: 8,
  },
  accountAddress: {
    ...theme.textStyles.bodySmall,
    color: theme.colors.textDark,
    opacity: 0.6,
    fontFamily: 'monospace',
  },
  connectButton: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  connectButtonDisabled: {
    backgroundColor: theme.colors.neutral,
  },
  connectButtonText: {
    ...theme.textStyles.titleMedium,
    color: theme.colors.background,
    fontWeight: '600',
  },
  debugBanner: {
    backgroundColor: '#ff6b35',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  debugText: {
    ...theme.textStyles.bodyMedium,
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '600',
  },
});
import { StyleSheet } from 'react-native';
import { Theme } from '@/theme';

export const createCertifierActionStyles = (theme: Theme) => StyleSheet.create({
  revokeButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginTop: 10,
    alignSelf: 'flex-end',
  },
  revokeButtonText: {
    ...theme.textStyles.bodySmall,
    color: '#ffffff',
    fontWeight: '600',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  statusContainer: {
    flex: 1,
  },
});
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useTheme } from '@/theme';
import { Feather } from '@expo/vector-icons';

interface OfferSummaryCardProps {
  offer: {
    priceInEth: number;
    message: string;
    offeredBy: string;
    status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'completed';
    createdAt: string | Date;
  };
  boat?: {
    title: string;
    image?: string;
    price?: number;
  };
  isOwner: boolean;
  onAccept?: () => void;
  onReject?: () => void;
  onViewDetails?: () => void;
}

export default function OfferSummaryCard({
  offer,
  boat,
  isOwner,
  onAccept,
  onReject,
  onViewDetails,
}: OfferSummaryCardProps) {
  const theme = useTheme();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FF9500';
      case 'accepted':
        return '#34C759';
      case 'rejected':
        return '#FF3B30';
      case 'expired':
        return '#8E8E93';
      case 'completed':
        return '#34C759';
      default:
        return theme.colors.textLight;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'accepted':
        return 'Acceptée';
      case 'rejected':
        return 'Refusée';
      case 'expired':
        return 'Expirée';
      case 'completed':
        return 'Terminée';
      default:
        return status;
    }
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: 12,
      padding: 16,
      marginVertical: 8,
      borderWidth: 1,
      borderColor: theme.colors.neutral,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    offerTitle: {
      ...theme.textStyles.titleMedium,
      color: theme.colors.textDark,
      fontWeight: '600',
      flex: 1,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginLeft: 8,
    },
    statusText: {
      ...theme.textStyles.bodySmall,
      fontWeight: '600',
      color: 'white',
    },
    boatInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    boatImage: {
      width: 60,
      height: 60,
      borderRadius: 8,
      marginRight: 12,
      backgroundColor: theme.colors.neutral,
    },
    boatDetails: {
      flex: 1,
    },
    boatTitle: {
      ...theme.textStyles.bodyMedium,
      color: theme.colors.textDark,
      fontWeight: '600',
      marginBottom: 2,
    },
    boatPrice: {
      ...theme.textStyles.bodySmall,
      color: theme.colors.textLight,
    },
    offerAmount: {
      ...theme.textStyles.titleLarge,
      color: theme.colors.primary || '#007AFF',
      fontWeight: 'bold',
      marginBottom: 8,
    },
    message: {
      ...theme.textStyles.bodyMedium,
      color: theme.colors.textDark,
      marginBottom: 12,
      fontStyle: 'italic',
    },
    metadata: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    offeredBy: {
      ...theme.textStyles.bodySmall,
      color: theme.colors.textLight,
    },
    date: {
      ...theme.textStyles.bodySmall,
      color: theme.colors.textLight,
    },
    actionsContainer: {
      flexDirection: 'row',
      gap: 8,
    },
    actionButton: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 4,
    },
    acceptButton: {
      backgroundColor: '#34C759',
    },
    rejectButton: {
      backgroundColor: '#FF3B30',
    },
    viewButton: {
      backgroundColor: theme.colors.neutral,
    },
    buttonText: {
      ...theme.textStyles.bodyMedium,
      fontWeight: '600',
    },
    acceptButtonText: {
      color: 'white',
    },
    rejectButtonText: {
      color: 'white',
    },
    viewButtonText: {
      color: theme.colors.textDark,
    },
  });

  return (
    <View style={styles.container}>
      {/* Header with status */}
      <View style={styles.header}>
        <Text style={styles.offerTitle}>
          {isOwner ? 'Offre reçue' : 'Votre offre'}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(offer.status) }]}>
          <Text style={styles.statusText}>{getStatusText(offer.status)}</Text>
        </View>
      </View>

      {/* Boat info if available */}
      {boat && (
        <View style={styles.boatInfo}>
          {boat.image && (
            <Image
              source={{ uri: boat.image }}
              style={styles.boatImage}
              resizeMode="cover"
            />
          )}
          <View style={styles.boatDetails}>
            <Text style={styles.boatTitle}>{boat.title}</Text>
            {boat.price && (
              <Text style={styles.boatPrice}>
                Prix demandé: {boat.price.toLocaleString('fr-FR')} $
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Offer amount */}
      <Text style={styles.offerAmount}>
        {offer.priceInEth} ETH
      </Text>

      {/* Message */}
      <Text style={styles.message}>"{offer.message}"</Text>

      {/* Metadata */}
      <View style={styles.metadata}>
        <Text style={styles.offeredBy}>
          Par: {offer.offeredBy.slice(0, 6)}...{offer.offeredBy.slice(-4)}
        </Text>
        <Text style={styles.date}>
          {new Date(offer.createdAt).toLocaleDateString('fr-FR')}
        </Text>
      </View>

      {/* Actions */}
      {offer.status === 'pending' && isOwner && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={onReject}
          >
            <Feather name="x" size={16} color="white" />
            <Text style={[styles.buttonText, styles.rejectButtonText]}>
              Refuser
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={onAccept}
          >
            <Feather name="check" size={16} color="white" />
            <Text style={[styles.buttonText, styles.acceptButtonText]}>
              Accepter
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {onViewDetails && (
        <TouchableOpacity
          style={[styles.actionButton, styles.viewButton]}
          onPress={onViewDetails}
        >
          <Feather name="eye" size={16} color={theme.colors.textDark} />
          <Text style={[styles.buttonText, styles.viewButtonText]}>
            Voir les détails
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
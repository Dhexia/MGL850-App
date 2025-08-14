import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { useTheme } from '@/theme';
import { Feather } from '@expo/vector-icons';

interface BoatInfo {
  id: string;
  title: string;
  price?: number;
  image?: string;
  owner?: string;
}

interface PurchaseOfferDialogProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (offer: { priceInEth: number; message: string }) => void;
  boat: BoatInfo;
  loading?: boolean;
}

export default function PurchaseOfferDialog({
  visible,
  onClose,
  onSubmit,
  boat,
  loading = false,
}: PurchaseOfferDialogProps) {
  const theme = useTheme();
  const [priceInEth, setPriceInEth] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    const price = parseFloat(priceInEth);
    
    if (!price || price <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer un prix valide en ETH');
      return;
    }

    if (!message.trim()) {
      Alert.alert('Erreur', 'Veuillez ajouter un message');
      return;
    }

    onSubmit({
      priceInEth: price,
      message: message.trim(),
    });
  };

  const handleClose = () => {
    setPriceInEth('');
    setMessage('');
    onClose();
  };

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: theme.colors.backgroundLight,
      borderRadius: 16,
      padding: 24,
      width: '90%',
      maxWidth: 400,
      maxHeight: '80%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      ...theme.textStyles.titleLarge,
      color: theme.colors.textDark,
      fontWeight: 'bold',
    },
    closeButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: theme.colors.neutral,
    },
    boatSummary: {
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.colors.neutral,
    },
    boatImage: {
      width: '100%',
      height: 120,
      borderRadius: 8,
      marginBottom: 12,
      backgroundColor: theme.colors.neutral,
    },
    boatTitle: {
      ...theme.textStyles.titleMedium,
      color: theme.colors.textDark,
      fontWeight: '600',
      marginBottom: 4,
    },
    boatPrice: {
      ...theme.textStyles.bodyMedium,
      color: theme.colors.textLight,
    },
    inputSection: {
      marginBottom: 20,
    },
    label: {
      ...theme.textStyles.bodyMedium,
      color: theme.colors.textDark,
      fontWeight: '600',
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.neutral,
      borderRadius: 8,
      padding: 12,
      backgroundColor: theme.colors.backgroundLight,
      color: theme.colors.textDark,
      ...theme.textStyles.bodyMedium,
    },
    messageInput: {
      height: 80,
      textAlignVertical: 'top',
    },
    ethContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    ethInput: {
      flex: 1,
      marginRight: 8,
    },
    ethLabel: {
      ...theme.textStyles.bodyMedium,
      color: theme.colors.textLight,
      fontWeight: '600',
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: 12,
    },
    button: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: theme.colors.neutral,
    },
    submitButton: {
      backgroundColor: theme.colors.primary || '#007AFF',
    },
    buttonText: {
      ...theme.textStyles.bodyMedium,
      fontWeight: '600',
    },
    cancelButtonText: {
      color: theme.colors.textDark,
    },
    submitButtonText: {
      color: theme.colors.backgroundLight,
    },
    disabledButton: {
      opacity: 0.6,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Faire une offre</Text>
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <Feather name="x" size={20} color={theme.colors.textDark} />
              </TouchableOpacity>
            </View>

            {/* Boat Summary */}
            <View style={styles.boatSummary}>
              {boat.image && (
                <Image
                  source={{ uri: boat.image }}
                  style={styles.boatImage}
                  resizeMode="cover"
                />
              )}
              <Text style={styles.boatTitle}>{boat.title}</Text>
              {boat.price && (
                <Text style={styles.boatPrice}>
                  Prix demandé: {boat.price.toLocaleString('fr-FR')} $
                </Text>
              )}
            </View>

            {/* Price Input */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>Votre offre</Text>
              <View style={styles.ethContainer}>
                <TextInput
                  style={[styles.input, styles.ethInput]}
                  placeholder="2.5"
                  placeholderTextColor={theme.colors.textLight}
                  value={priceInEth}
                  onChangeText={setPriceInEth}
                  keyboardType="decimal-pad"
                  editable={!loading}
                />
                <Text style={styles.ethLabel}>ETH</Text>
              </View>
            </View>

            {/* Message Input */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>Message au propriétaire</Text>
              <TextInput
                style={[styles.input, styles.messageInput]}
                placeholder="Bonjour, je suis intéressé par votre bateau..."
                placeholderTextColor={theme.colors.textLight}
                value={message}
                onChangeText={setMessage}
                multiline
                editable={!loading}
              />
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleClose}
                disabled={loading}
              >
                <Text style={[styles.buttonText, styles.cancelButtonText]}>
                  Annuler
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.submitButton,
                  loading && styles.disabledButton,
                ]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={[styles.buttonText, styles.submitButtonText]}>
                  {loading ? 'Envoi...' : 'Envoyer l\'offre'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
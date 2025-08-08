import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { useAuth } from '@/contexts/AuthContext';
import { BoatChainValidated } from '@/components/BoatChainValidated';
import { createCertifierActionStyles } from '@/styles/CertifierActions.style';
import * as WebBrowser from 'expo-web-browser';

interface EventData {
  id?: string;
  boatName: string;
  date: string;
  shortTitle: string;
  title: string;
  description?: string;
  status: 'validated' | 'pending' | 'rejected' | 'suspicious';
  attachments?: Array<{ title: string; uri: string }>;
}

interface BoatEventProps {
  eventData: EventData;
}

const openPDF = async (url: string) => {
  try {
    await WebBrowser.openBrowserAsync(encodeURI(url.trim()), {
      enableDefaultShareMenuItem: false,
    });
  } catch (e) {
    console.error("Impossible d'ouvrir le document PDF.", e);
  }
};

export default function BoatEvent({ eventData }: BoatEventProps) {
  const theme = useTheme();
  const { userRole } = useAuth();
  const certifierStyles = createCertifierActionStyles(theme);
  
  const isCertifier = userRole === 'certifier';
  const canRevoke = isCertifier && (eventData.status === 'validated' || eventData.status === 'suspicious');
  
  const handleRevoke = () => {
    Alert.alert(
      'Révoquer la certification',
      `Êtes-vous sûr de vouloir révoquer cette certification pour "${eventData.title}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Révoquer', 
          style: 'destructive',
          onPress: () => {
            // TODO: Appel API pour révoquer la certification
            console.log('Revoking certification for event:', eventData.id);
            Alert.alert('Succès', 'La certification a été révoquée.');
          }
        }
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      padding: 15,
      borderWidth: 1,
      borderColor: theme.colors.neutral,
      borderStyle: 'solid',
      borderRadius: 15,
      marginVertical: 10,
      backgroundColor: theme.colors.surfaceLight,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.neutral,
      borderStyle: 'solid',
    },
    boatName: {
      color: theme.colors.textDark,
      ...theme.textStyles.titleMedium,
    },
    date: {
      color: theme.colors.textDark,
      ...theme.textStyles.bodyMedium,
    },
    headerRightText: {
      color: theme.colors.textDark,
      ...theme.textStyles.titleMedium,
      borderRadius: 30,
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: theme.colors.neutral,
      paddingVertical: 5,
      paddingHorizontal: 10,
    },
    content: {
      paddingTop: 15,
    },
    title: {
      color: theme.colors.textDark,
      ...theme.textStyles.titleMedium,
    },
    description: {
      color: theme.colors.textDark,
      ...theme.textStyles.bodyLarge,
      paddingVertical: 5,
    },
    attachmentItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor: theme.colors.neutral,
      borderStyle: 'solid',
      borderRadius: 50,
      margin: 5,
    },
    attachmentText: {
      color: theme.colors.textDark,
      ...theme.textStyles.titleSmall,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.boatName}>{eventData.boatName}</Text>
          <Text style={styles.date}>{eventData.date}</Text>
        </View>
        <View>
          <Text style={styles.headerRightText}>{eventData.shortTitle}</Text>
        </View>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{eventData.title}</Text>
        <Text style={styles.description}>
          {eventData.description || 'Aucune description fournie.'}
        </Text>
        <View>
          {Array.isArray(eventData.attachments) && eventData.attachments.length > 0 ? (
            eventData.attachments.map(({ title, uri }, index) => (
              <TouchableOpacity
                key={index}
                style={styles.attachmentItem}
                onPress={() => openPDF(uri)}
              >
                <AntDesign name="filetext1" size={16} color={theme.colors.textDark} />
                <Text
                  style={styles.attachmentText}
                  numberOfLines={1}
                  ellipsizeMode="middle"
                >
                  {title ?? `Document ${index + 1}`}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.attachmentText}>Aucun document joint.</Text>
          )}
        </View>
        
        {/* Statut et actions pour certificateur */}
        <View style={certifierStyles.actionContainer}>
          <View style={certifierStyles.statusContainer}>
            <BoatChainValidated status={eventData.status} />
          </View>
          
          {canRevoke && (
            <TouchableOpacity 
              style={certifierStyles.revokeButton}
              onPress={handleRevoke}
            >
              <Text style={certifierStyles.revokeButtonText}>Révoquer</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}
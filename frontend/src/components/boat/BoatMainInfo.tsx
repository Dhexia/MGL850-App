import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useTheme } from '@/theme';
import ChatIcon from '@/assets/images/ChatIcon.svg';
import type { BoatSpecification } from '@/lib/boat.types';
import PurchaseOfferDialog from '@/components/chat/PurchaseOfferDialog';
import { ChatAPI } from '@/lib/chat.api';
import { useAuth } from '@/contexts/AuthContext';

interface BoatMainInfoProps {
  specification: BoatSpecification;
  boatId?: string;
  ownerId?: string;
}

export default function BoatMainInfo({ specification, boatId, ownerId }: BoatMainInfoProps) {
  const theme = useTheme();
  const router = useRouter();
  const { address } = useAuth();
  const [showOfferDialog, setShowOfferDialog] = useState(false);
  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);

  const isOwner = address && ownerId && address.toLowerCase() === ownerId.toLowerCase();
  const canMakeOffer = specification.for_sale && !isOwner;

  const handlePurchaseOffer = async (offer: { priceInEth: number; message: string }) => {
    if (!boatId || !ownerId || !address) {
      Alert.alert('Erreur', 'Informations manquantes pour créer la conversation');
      return;
    }

    setIsSubmittingOffer(true);
    
    try {
      // First, try to find existing conversation
      let conversation = await ChatAPI.findConversationByBoat(boatId, ownerId);
      
      if (conversation) {
        // Conversation exists, send offer as message
        await ChatAPI.sendOfferMessage(conversation.id, offer);
      } else {
        // No existing conversation, create new one
        conversation = await ChatAPI.createConversation({
          participants: [ownerId],
          boatId,
          offer,
        });
      }

      setShowOfferDialog(false);
      
      Alert.alert(
        'Offre envoyée !',
        'Votre offre a été envoyée au propriétaire. Vous pouvez suivre la discussion dans vos messages.',
        [
          {
            text: 'Voir la conversation',
            onPress: () => router.push(`/chat/chat?conversationId=${conversation.id}`),
          },
          { text: 'OK' },
        ]
      );
    } catch (error) {
      console.error('Error sending offer:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer l\'offre. Veuillez réessayer.');
    } finally {
      setIsSubmittingOffer(false);
    }
  };

  const handleBuyPress = () => {
    if (!address) {
      Alert.alert('Authentification requise', 'Vous devez être connecté pour faire une offre.');
      return;
    }

    if (!canMakeOffer) {
      if (isOwner) {
        Alert.alert('Information', 'Vous ne pouvez pas acheter votre propre bateau.');
      } else {
        Alert.alert('Information', 'Ce bateau n\'est pas en vente.');
      }
      return;
    }

    setShowOfferDialog(true);
  };

  const styles = StyleSheet.create({
    mainInfoContainer: {
      flexDirection: 'column',
    },
    mainInfoTopContainer: {
      flexDirection: 'row',
    },
    mainInfoTopLeftContainer: {
      flexDirection: 'row',
      width: '65%',
      alignItems: 'center',
      paddingRight: 20,
    },
    mainInfoIconContainer: {
      height: 40,
      width: 40,
      borderRadius: 50,
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: theme.colors.neutral,
      margin: 10,
    },
    mainInfoIcon: {
      height: '100%',
      width: '100%',
    },
    mainInfoTitleContainer: {
      maxWidth: '80%',
    },
    title: {
      color: theme.colors.textDark,
      ...theme.textStyles.titleMedium,
    },
    bodyLight: {
      color: theme.colors.textDark,
      ...theme.textStyles.bodyMedium,
    },
    chatButton: {
      margin: 5,
      padding: 10,
      borderRadius: 50,
      borderWidth: 1,
      borderColor: theme.colors.neutral,
      borderStyle: 'solid',
      backgroundColor: theme.colors.surfaceLight,
    },
    buyButton: {
      backgroundColor: theme.colors.secondary,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 50,
    },
    buyButtonText: {
      color: theme.colors.textLight,
      ...theme.textStyles.titleMedium,
    },
    mainInfoTopRightContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '35%',
    },
    mainInfoBottomContainer: {
      justifyContent: 'space-between',
      flexDirection: 'row',
      marginHorizontal: 10,
      marginVertical: 5,
      backgroundColor: theme.colors.surfaceLight,
      paddingVertical: 10,
      paddingHorizontal: 30,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: theme.colors.neutral,
      borderStyle: 'solid',
    },
    priceContainer: {
      flexDirection: 'column',
      alignItems: 'center',
    },
    price: {
      color: theme.colors.textDark,
      ...theme.textStyles.titleSmall,
    },
    priceTitle: {
      color: theme.colors.textDark,
      ...theme.textStyles.bodyMedium,
    },
    yearContainer: {
      flexDirection: 'column',
      alignItems: 'center',
    },
    year: {
      color: theme.colors.textDark,
      ...theme.textStyles.titleSmall,
    },
    yearTitle: {
      color: theme.colors.textDark,
      ...theme.textStyles.bodyMedium,
    },
    portContainer: {
      flexDirection: 'column',
      alignItems: 'center',
    },
    port: {
      color: theme.colors.textDark,
      ...theme.textStyles.titleSmall,
    },
    portTitle: {
      color: theme.colors.textDark,
      ...theme.textStyles.bodyMedium,
    },
  });

  return (
    <View style={styles.mainInfoContainer}>
      {/* TOP */}
      <View style={styles.mainInfoTopContainer}>
        {/* LEFT */}
        <View style={styles.mainInfoTopLeftContainer}>
          <View style={styles.mainInfoIconContainer}>
            <Image
              source={require('@/assets/images/userIcon.png')}
              resizeMode="contain"
              style={styles.mainInfoIcon}
            />
          </View>
          <View style={styles.mainInfoTitleContainer}>
            <Text numberOfLines={1} ellipsizeMode="tail" style={styles.title}>
              {specification.title}
            </Text>
            <Text numberOfLines={1} ellipsizeMode="tail" style={styles.bodyLight}>
              {specification.summary}
            </Text>
          </View>
        </View>
        {/* Right */}
        <View style={styles.mainInfoTopRightContainer}>
          <Link style={styles.chatButton} asChild={true} href="/chat/chat">
            <ChatIcon color={theme.colors.textDark} />
          </Link>
          <TouchableOpacity 
            style={[styles.buyButton, !canMakeOffer && { opacity: 0.6 }]} 
            onPress={handleBuyPress}
            disabled={isSubmittingOffer}
          >
            <Text style={styles.buyButtonText}>
              {isSubmittingOffer ? 'Envoi...' : 'Acheter'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.mainInfoBottomContainer}>
        <View style={styles.priceContainer}>
          <Text numberOfLines={1} ellipsizeMode="tail" style={styles.price}>
            {specification?.price?.toLocaleString('fr-FR')} $
          </Text>
          <Text numberOfLines={1} ellipsizeMode="tail" style={styles.priceTitle}>
            Prix
          </Text>
        </View>
        <View style={styles.yearContainer}>
          <Text numberOfLines={1} ellipsizeMode="tail" style={styles.year}>
            {specification.year}
          </Text>
          <Text numberOfLines={1} ellipsizeMode="tail" style={styles.yearTitle}>
            Année
          </Text>
        </View>

        <View style={styles.portContainer}>
          <Text numberOfLines={1} ellipsizeMode="tail" style={styles.port}>
            {specification?.city}
          </Text>
          <Text numberOfLines={1} ellipsizeMode="tail" style={styles.portTitle}>
            Port d'attache
          </Text>
        </View>
      </View>

      {/* Purchase Offer Dialog */}
      <PurchaseOfferDialog
        visible={showOfferDialog}
        onClose={() => setShowOfferDialog(false)}
        onSubmit={handlePurchaseOffer}
        boat={{
          id: boatId || '',
          title: specification.title || 'Bateau sans nom',
          price: specification.price,
          image: undefined, // Could be passed from parent component if needed
        }}
        loading={isSubmittingOffer}
      />
    </View>
  );
}
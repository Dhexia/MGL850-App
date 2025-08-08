import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Link } from 'expo-router';
import { useTheme } from '@/theme';
import ChatIcon from '@/assets/images/ChatIcon.svg';
import type { BoatSpecification } from '@/lib/boat.types';

interface BoatMainInfoProps {
  specification: BoatSpecification;
}

export default function BoatMainInfo({ specification }: BoatMainInfoProps) {
  const theme = useTheme();

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
          <TouchableOpacity style={styles.buyButton}>
            <Text style={styles.buyButtonText}>Acheter</Text>
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
    </View>
  );
}
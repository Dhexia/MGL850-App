import {
  ActivityIndicator,
  Animated,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useEffect, useState } from 'react';
import { Link } from 'expo-router';
import { useTheme } from '@/theme';
import { BoatChainValidated } from '@/components/BoatChainValidated';
import * as React from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { fetchBoatsFromBackend, clearBoatsCache } from '@/lib/boats.api';
import type { UIBoat } from '@/lib/boat.types';

import ScrollView = Animated.ScrollView;

const Boat = () => {
  const theme = useTheme();
  const [boats, setBoats] = useState<UIBoat[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = React.useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      if (forceRefresh) {
        await clearBoatsCache();
      }
      const list = await fetchBoatsFromBackend();
      setBoats(list);
    } catch (e) {
      console.error('Boat list error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // recharge à chaque fois que l'onglet « Bateaux » devient actif
  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        await fetchAll();
      })();
    }, [fetchAll])
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 20,
      backgroundColor: theme.colors.backgroundLight,
      width: '100%',
      flexDirection: 'column',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingBottom: 10,
    },
    title: {
      ...theme.textStyles.titleMedium,
    },
    refreshButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    refreshText: {
      ...theme.textStyles.bodySmall,
      color: theme.colors.background,
      fontWeight: '600',
    },
    text: {
      fontSize: 20,
      color: theme.colors.textDark,
    },
    tiles: {
      flexDirection: Platform.OS === 'web' ? 'row' : 'column',
      flexWrap: Platform.OS === 'web' ? 'wrap' : 'nowrap',
      justifyContent: Platform.OS === 'web' ? 'space-evenly' : 'flex-start',
      alignItems: Platform.OS === 'web' ? 'flex-start' : 'stretch',
      rowGap: Platform.OS === 'web' ? 24 : 0,
      columnGap: Platform.OS === 'web' ? 24 : 0,
      paddingBottom: 100,
      paddingTop: 20,
      paddingHorizontal: 20,
    },
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    );
  }

  if (boats.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No boats available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bateaux</Text>
        <Pressable 
          style={styles.refreshButton} 
          onPress={() => fetchAll(true)}
          disabled={loading}
        >
          <Text style={styles.refreshText}>↻ Actualiser</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.tiles}>
        {boats.map((boat) => (
          <BoatTile key={boat.id} boat={boat} />
        ))}
      </ScrollView>
    </View>
  );
};

export default Boat;

const BoatTile = ({ boat }: { boat: UIBoat }) => {
  const theme = useTheme();
  const { specification, images, certificates, events } = boat;
  const mainImage = images?.[0]?.uri;

  const tileStyles = StyleSheet.create({
    card: {
      overflow: 'hidden',
      width: '100%',
      maxWidth: Platform.OS === 'web' ? 300 : undefined,
      marginBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.neutral,
    },
    image: {
      width: '100%',
      borderRadius: 15,
      height: 180,
    },
    content: {
      paddingVertical: 15,
    },
    titleContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    title: {
      ...theme.textStyles.titleMedium,
      color: theme.colors.textDark,
    },
    descriptionContainer: {
      paddingVertical: 5,
    },
    description: {
      ...theme.textStyles.bodyMedium,
      color: theme.colors.textDark,
    },
    otherContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    moreContainer: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 30,
      borderWidth: 1,
      borderColor: theme.colors.neutral,
      borderStyle: 'solid',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceLight,
    },
    more: {
      ...theme.textStyles.titleSmall,
      color: theme.colors.textDark,
    },
    price: {
      ...theme.textStyles.bodyMoney,
      color: theme.colors.textDark,
    },
    boatTypeContainer: {
      position: 'absolute',
      top: 10,
      left: 10,
      backgroundColor: theme.colors.background,
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: 30,
      borderWidth: 2,
      borderColor: theme.colors.neutral,
    },
    boatType: {
      ...theme.textStyles.bodyMedium,
      color: theme.colors.textDark,
    },
  });

  return (
    <View style={tileStyles.card}>
      <View>
        {mainImage && (
          <Image source={{ uri: mainImage }} style={tileStyles.image} />
        )}

        <View style={tileStyles.boatTypeContainer}>
          <Text style={tileStyles.boatType}>
            {specification?.boat_type}
          </Text>
        </View>
      </View>
      <View style={tileStyles.content}>
        <View style={tileStyles.titleContainer}>
          <Text
            style={tileStyles.title}
            adjustsFontSizeToFit
            numberOfLines={1}
          >
            {specification?.title ?? `Bateau #${boat.id}`}
          </Text>
          <BoatChainValidated status={specification?.status} />
        </View>
        <View style={tileStyles.descriptionContainer}>
          <Text style={tileStyles.description}>
            {specification?.summary ?? ''}
          </Text>
        </View>
        <View style={tileStyles.otherContainer}>
          <View>
            <Text style={tileStyles.price}>
              {Number(specification?.price ?? 0).toLocaleString('fr-FR')} $
            </Text>
            <Text
              style={{
                ...theme.textStyles.bodyMedium,
                color: theme.colors.textDark,
              }}
            >
              {specification?.city ?? ''}{specification?.postal_code ? `, ${specification.postal_code}` : ''}
            </Text>
          </View>
          <Link
            href={{
              pathname: '/boats/boat-detail-screen',
              params: {
                boatId: String(boat.id),
                specification: JSON.stringify(specification ?? {}),
                images: JSON.stringify(images ?? []),
                certificates: JSON.stringify(certificates ?? []),
                events: JSON.stringify(events ?? []),
              },
            }}
            asChild
          >
            <Pressable style={tileStyles.moreContainer}>
              <Text style={tileStyles.more}>Voir plus</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </View>
  );
};
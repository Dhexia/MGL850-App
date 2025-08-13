import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '@/theme';
import BoatEvent from './BoatEvent';
import { Link } from 'expo-router';

interface BoatEventsSectionProps {
  events: Array<{
    boatName: string;
    date: string;
    shortTitle: string;
    title: string;
    description?: string;
    status: 'validated' | 'pending' | 'rejected' | 'suspicious';
    attachments?: Array<{ title: string; uri: string }>;
  }>;
  isOwner?: boolean;
  boatId?: string;
  ownerId?: string;
}

export default function BoatEventsSection({ events, isOwner, boatId, ownerId }: BoatEventsSectionProps) {
  const theme = useTheme();

  const styles = StyleSheet.create({
    eventsContainer: {
      marginHorizontal: 10,
    },
    eventsTitle: {
      color: theme.colors.textDark,
      ...theme.textStyles.titleMedium,
      flex: 1,
    },
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 15,
    },
    addButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 8,
      paddingHorizontal: 15,
      borderRadius: 20,
    },
    addButtonText: {
      color: theme.colors.background,
      ...theme.textStyles.titleSmall,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.eventsContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.eventsTitle}>📜 Historique des événements</Text>
        {isOwner && (
          <Link
            href={{
              pathname: '/boats/add-event' as any,
              params: { boatId: boatId || '', ownerId: ownerId || '' },
            }}
            asChild
          >
            <TouchableOpacity style={styles.addButton}>
              <Text style={styles.addButtonText}>Ajouter</Text>
            </TouchableOpacity>
          </Link>
        )}
      </View>
      <View>
        {events?.map((myevent, idx) => (
          <BoatEvent key={idx} eventData={myevent} />
        ))}
      </View>
    </View>
  );
}
import React from 'react';
import {
  View,
  StyleSheet,
  Text,
} from 'react-native';
import { useTheme } from '@/theme';
import BoatEvent from './BoatEvent';

interface BoatEventsSectionProps {
  events: Array<{
    boatName: string;
    date: string;
    shortTitle: string;
    title: string;
    description?: string;
    attachments?: Array<{ title: string; uri: string }>;
  }>;
}

export default function BoatEventsSection({ events }: BoatEventsSectionProps) {
  const theme = useTheme();

  const styles = StyleSheet.create({
    eventsContainer: {
      marginHorizontal: 10,
    },
    eventsTitle: {
      color: theme.colors.textDark,
      ...theme.textStyles.titleMedium,
      marginVertical: 15,
    },
  });

  return (
    <View style={styles.eventsContainer}>
      <View>
        <Text style={styles.eventsTitle}>📜 Historique des événements</Text>
      </View>
      <View>
        {events?.map((myevent, idx) => (
          <BoatEvent key={idx} eventData={myevent} />
        ))}
      </View>
    </View>
  );
}
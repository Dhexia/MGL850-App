import React from 'react';
import {
  View,
  StyleSheet,
  Text,
} from 'react-native';
import { useTheme } from '@/theme';

interface BoatDescriptionProps {
  description?: string;
}

export default function BoatDescription({ description }: BoatDescriptionProps) {
  const theme = useTheme();

  const styles = StyleSheet.create({
    descriptionContainer: {
      marginVertical: 10,
      marginHorizontal: 10,
    },
    description: {
      color: theme.colors.textDark,
      ...theme.textStyles.bodyLarge,
    },
  });

  if (!description) return null;

  return (
    <View style={styles.descriptionContainer}>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}
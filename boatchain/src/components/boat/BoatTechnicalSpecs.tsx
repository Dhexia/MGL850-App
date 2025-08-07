import React from 'react';
import {
  View,
  StyleSheet,
  Text,
} from 'react-native';
import { useTheme } from '@/theme';
import type { BoatSpecification } from '@/lib/boat.types';

interface BoatTechnicalSpecsProps {
  specification: BoatSpecification;
}

export default function BoatTechnicalSpecs({ specification }: BoatTechnicalSpecsProps) {
  const theme = useTheme();

  const styles = StyleSheet.create({
    technicalSpecsContainer: {
      marginHorizontal: 10,
    },
    technicalSpecsTitle: {
      color: theme.colors.textDark,
      ...theme.textStyles.titleMedium,
      marginVertical: 15,
    },
    technicalSpecsContent: {
      borderRadius: 15,
      borderWidth: 1,
      borderColor: theme.colors.neutral,
      borderStyle: 'solid',
      padding: 15,
      backgroundColor: theme.colors.surfaceLight,
    },
    technicalSpecsLine: {
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
      paddingVertical: 10,
      borderBottomColor: theme.colors.neutral,
      borderBottomWidth: 1,
      borderStyle: 'solid',
    },
    technicalSpecsLineText: {
      color: theme.colors.textDark,
      ...theme.textStyles.bodyMoney,
    },
    lastLine: {
      borderBottomWidth: 0,
    },
  });

  const specs = [
    { label: 'Longueur hors tout', value: `${specification.overall_length} m` },
    { label: 'Largeur', value: `${specification.width} m` },
    { label: 'Tirant d\'eau', value: `${specification.draft} m` },
    { label: 'Moteur', value: specification.engine },
    { label: 'Capacité d\'eau douce', value: `${specification.fresh_water_capacity} L` },
    { label: 'Capacité carburant', value: `${specification.fuel_capacity} L` },
    { label: 'Cabines', value: `${specification.cabins} cabines` },
    { label: 'Couchages', value: `Jusqu'à ${specification.beds} personnes` },
    { label: 'Catégorie de navigation', value: specification.navigation_category },
  ];

  return (
    <View style={styles.technicalSpecsContainer}>
      <View>
        <Text style={styles.technicalSpecsTitle}>
          ⚙️ Spécifications techniques
        </Text>
      </View>
      <View style={styles.technicalSpecsContent}>
        {specs.map((spec, index) => (
          <View
            key={index}
            style={[
              styles.technicalSpecsLine,
              index === specs.length - 1 && styles.lastLine,
            ]}
          >
            <Text style={styles.technicalSpecsLineText}>{spec.label}</Text>
            <Text style={styles.technicalSpecsLineText}>{spec.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
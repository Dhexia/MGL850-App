import React from 'react';
import {
  View,
  StyleSheet,
  Text,
} from 'react-native';
import { useTheme } from '@/theme';
import BoatCertificate from './BoatCertificate';

interface BoatCertificatesSectionProps {
  certificates: {
    person: string;
    date: string;
    status: 'validated' | 'pending' | 'rejected';
    title: string;
    expires?: string;
    description?: string;
    attachments?: { title: string; uri: string }[];
  }[];
}

export default function BoatCertificatesSection({ certificates }: BoatCertificatesSectionProps) {
  const theme = useTheme();

  const styles = StyleSheet.create({
    certificatesContainer: {
      marginVertical: 10,
      marginHorizontal: 10,
    },
    certificatesTitle: {
      color: theme.colors.textDark,
      ...theme.textStyles.titleMedium,
      marginVertical: 15,
    },
  });

  return (
    <View style={styles.certificatesContainer}>
      <View>
        <Text style={styles.certificatesTitle}>🧾 Certificats disponibles</Text>
      </View>
      <View>
        {certificates?.map((certificate, idx) => (
          <BoatCertificate key={idx} certificateData={certificate} />
        ))}
      </View>
    </View>
  );
}
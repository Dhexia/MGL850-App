import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  Text,
} from 'react-native';
import { useTheme } from '@/theme';
import ImageCarousel from '@/components/ImageCarousel';

interface BoatImageSectionProps {
  images: Array<{ uri: string; title?: string }>;
  boatType?: string;
}

export default function BoatImageSection({ images, boatType }: BoatImageSectionProps) {
  const theme = useTheme();
  const mainImage = images?.[0]?.uri;

  const styles = StyleSheet.create({
    image: {
      width: '100%',
      borderRadius: 15,
      height: 180,
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
    <View>
      {images && images.length > 0 ? (
        <View>
          <ImageCarousel images={images} />
          <View style={styles.boatTypeContainer}>
            <Text style={styles.boatType}>
              {boatType}
            </Text>
          </View>
        </View>
      ) : (
        <View>
          {mainImage && (
            <Image source={{ uri: mainImage }} style={styles.image} />
          )}
          <View style={styles.boatTypeContainer}>
            <Text style={styles.boatType}>
              {boatType}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
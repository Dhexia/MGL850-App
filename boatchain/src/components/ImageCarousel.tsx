import React, { useState, useRef } from 'react';
import {
  View,
  Image,
  Dimensions,
  StyleSheet,
  Text,
  FlatList,
} from 'react-native';
import { useTheme } from '@/theme';

interface ImageCarouselProps {
  images: Array<{ uri: string; title?: string }>;
}

const { width: screenWidth } = Dimensions.get('window');

export default function ImageCarousel({ images }: ImageCarouselProps) {
  const theme = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  if (!images || images.length === 0) {
    return null;
  }

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index || 0);
    }
  });

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  });

  const renderImage = ({ item, index }: { item: { uri: string; title?: string }; index: number }) => (
    <View style={styles.imageContainer}>
      <Image
        source={{ uri: item.uri }}
        style={styles.image}
        resizeMode="cover"
      />
    </View>
  );

  const styles = StyleSheet.create({
    container: {
      position: 'relative',
    },
    imageContainer: {
      width: screenWidth - 20,
    },
    image: {
      width: '100%',
      height: 180,
      borderRadius: 15,
    },
    overlay: {
      position: 'absolute',
      bottom: 10,
      right: 10,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    counterText: {
      color: 'white',
      fontSize: 12,
      fontWeight: '600',
    },
    dotsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 10,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginHorizontal: 3,
    },
    activeDot: {
      backgroundColor: theme.colors.primary,
    },
    inactiveDot: {
      backgroundColor: theme.colors.neutral,
    },
  });

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={images}
        renderItem={renderImage}
        keyExtractor={(_, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={viewabilityConfig.current}
      />
      
      {images.length > 1 && (
        <>
          <View style={styles.overlay}>
            <Text style={styles.counterText}>
              {activeIndex + 1} / {images.length}
            </Text>
          </View>
          
          <View style={styles.dotsContainer}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === activeIndex ? styles.activeDot : styles.inactiveDot,
                ]}
              />
            ))}
          </View>
        </>
      )}
    </View>
  );
}
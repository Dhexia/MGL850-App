import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  ImageSourcePropType,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "@/theme";

interface ImagePickerComponentProps {
  onImagesChange: (images: Array<{ uri: string; name: string }>) => void;
  maxImages?: number;
  initialImages?: Array<{ uri: string; name: string }>;
  wrapMode: boolean;
}

export default function ImagePickerComponent({
  onImagesChange,
  maxImages = 5,
  initialImages = [],
  wrapMode = false,
}: ImagePickerComponentProps) {
  const theme = useTheme();
  const [selectedImages, setSelectedImages] =
    useState<Array<{ uri: string; name: string }>>(initialImages);

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Permission requise", "Accès aux photos nécessaire");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: maxImages - selectedImages.length,
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map((asset, index) => ({
        uri: asset.uri,
        name: `image_${Date.now()}_${index}.jpg`,
      }));

      const updatedImages = [...selectedImages, ...newImages];
      setSelectedImages(updatedImages);
      onImagesChange(updatedImages);
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(updatedImages);
    onImagesChange(updatedImages);
  };

  const styles = StyleSheet.create({
    title: {
      ...theme.textStyles.titleMedium,
      color: theme.colors.textDark,
      marginBottom: 10,
    },
    addButton: {
      backgroundColor: theme.colors.primary,
      padding: 15,
      borderRadius: 10,
      alignItems: "center",
      marginBottom: 15,
    },
    addButtonText: {
      ...theme.textStyles.bodyMedium,
      color: theme.colors.background,
      fontWeight: "600",
    },
    imagesContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      paddingTop: 10,
    },
    imageContainer: {
      position: "relative",
      width: 80,
      height: 80,
    },
    image: {
      width: 80,
      height: 80,
      borderRadius: 8,
    },
    removeButton: {
      position: "absolute",
      top: -5,
      right: -5,
      backgroundColor: "#ff4444",
      borderRadius: 12,
      width: 24,
      height: 24,
      alignItems: "center",
      justifyContent: "center",
    },
    removeButtonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "bold",
    },
    counter: {
      ...theme.textStyles.bodySmall,
      color: theme.colors.textDark,
      marginTop: 5,
    },
  });

  const imagesDisplay = (selectedImages: ImageSourcePropType[]) => (
    <View style={styles.imagesContainer}>
      {selectedImages.map((image: ImageSourcePropType, index) => {
        return (
          <View key={index} style={styles.imageContainer}>
            <Image source={image} style={styles.image} />
            <Pressable
              style={styles.removeButton}
              onPress={() => removeImage(index)}
            >
              <Text style={styles.removeButtonText}>×</Text>
            </Pressable>
          </View>
        );
      })}
    </View>
  );

  const modedContainer = (selectedImages: ImageSourcePropType[]) => {
    if (wrapMode) return imagesDisplay(selectedImages);
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {imagesDisplay(selectedImages)}
      </ScrollView>
    );
  };

  return (
    <View>
      {selectedImages.length < maxImages && (
        <Pressable style={styles.addButton} onPress={pickImages}>
          <Text style={styles.addButtonText}>
            📷 Ajouter des photos ({selectedImages.length}/{maxImages})
          </Text>
        </Pressable>
      )}

      {selectedImages.length > 0 && modedContainer(selectedImages)}

      <Text style={styles.counter}>
        {selectedImages.length} photo{selectedImages.length > 1 ? "s" : ""}{" "}
        sélectionnée{selectedImages.length > 1 ? "s" : ""}
      </Text>
    </View>
  );
}

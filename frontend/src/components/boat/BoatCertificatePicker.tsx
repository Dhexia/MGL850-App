import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Pressable,
  Alert,
} from "react-native";
import { useTheme } from "@/theme";
import * as DocumentPicker from "expo-document-picker";
import { BoatAttachment } from "@/lib/boat.types";

export default function BoatCertificatePicker({ title, setNewCertificate }) {
  const theme = useTheme();
  var tmpAttachements: BoatAttachment[] = [];

  const styles = StyleSheet.create({
    certificatesContainer: {},
    addButton: {
      backgroundColor: theme.colors.primary,
      padding: 10,
      borderRadius: 10,
      alignItems: "center",
    },
    addButtonText: {
      ...theme.textStyles.bodyMedium,
      color: theme.colors.background,
      fontWeight: "600",
    },
  });

  const pickPdf = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf", // Only PDFs
        copyToCacheDirectory: true,
        multiple: true, // selecting one document at a time
      });

      if (!result.canceled && result.assets?.length > 0) {
        const pickedFiles = result.assets;
        console.log("Picked files:", pickedFiles);

        tmpAttachements = [
          ...tmpAttachements,
          ...pickedFiles.map((asset: DocumentPicker.DocumentPickerAsset) => ({
            uri: asset.uri,
            title: asset.name,
          })),
        ];

        console.log("tmpAttachements :", tmpAttachements);

        setNewCertificate({
          status: "pending",
          attachments: tmpAttachements,
        });
      } else {
        console.log("User canceled picking");
      }
    } catch (error) {
      Alert.alert("Error picking PDF", error.message);
    }
  };

  return (
    <View style={styles.certificatesContainer}>
      <Pressable style={styles.addButton} onPress={pickPdf}>
        <Text style={styles.addButtonText}>{title}</Text>
      </Pressable>
    </View>
  );
}

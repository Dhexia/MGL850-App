import React, { useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Alert } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useTheme } from "@/theme";
import { useAuth } from "@/contexts/AuthContext";
import { BoatChainValidated } from "@/components/BoatChainValidated";
import { createCertifierActionStyles } from "@/styles/CertifierActions.style";
import PdfViewer from "../PdfViewer";

interface CertificateData {
  id?: string;
  authorPubkey: string;
  date: string;
  status: "validated" | "pending" | "rejected" | "suspicious";
  title: string;
  expires?: string;
  description?: string;
  attachments?: Array<{ title: string; uri: string }>;
}

interface BoatCertificateProps {
  certificateData: CertificateData;
}

export default function BoatCertificate({
  certificateData,
}: BoatCertificateProps) {
  const theme = useTheme();
  const { userRole } = useAuth();
  const certifierStyles = createCertifierActionStyles(theme);

  const isCertifier = userRole === "certifier";
  const canRevoke =
    isCertifier &&
    (certificateData.status === "validated" ||
      certificateData.status === "suspicious");
  const [showPdf, setShowPdf] = useState<any>(false);
  const [pdfUri, setPdfUri] = useState<any>(null);

  const openPDF = async (url: string) => {
    setPdfUri(url);
    setShowPdf(true);
  };

  if (showPdf) {
    console.log("Displaying pdf", pdfUri);
    return <PdfViewer uri={pdfUri} setVisible={setShowPdf} />;
  }

  const handleRevoke = () => {
    Alert.alert(
      "Révoquer le certificat",
      `Êtes-vous sûr de vouloir révoquer le certificat "${certificateData.title}" ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Révoquer",
          style: "destructive",
          onPress: () => {
            // TODO: Appel API pour révoquer le certificat
            console.log("Revoking certificate:", certificateData.id);
            Alert.alert("Succès", "Le certificat a été révoqué.");
          },
        },
      ]
    );
  };

  const styles = StyleSheet.create({
    certificateContainer: {
      padding: 15,
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: 15,
      borderStyle: "solid",
      borderColor: theme.colors.neutral,
      borderWidth: 1,
      marginVertical: 10,
    },
    header: {
      justifyContent: "space-between",
      flexDirection: "row",
      alignItems: "center",
      paddingBottom: 15,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.neutral,
      borderStyle: "solid",
    },
    person: {
      color: theme.colors.textDark,
      ...theme.textStyles.titleMedium,
    },
    date: {
      color: theme.colors.textDark,
      ...theme.textStyles.bodyMedium,
    },
    content: {
      paddingTop: 15,
    },
    contentTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    title: {
      color: theme.colors.textDark,
      ...theme.textStyles.titleMedium,
    },
    expire: {
      color: theme.colors.textDark,
      ...theme.textStyles.bodyMedium,
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderStyle: "solid",
      borderColor: theme.colors.neutral,
      borderWidth: 1,
      borderRadius: 50,
    },
    contentDescriptionContainer: {
      paddingVertical: 5,
    },
    contentDescription: {
      color: theme.colors.textDark,
      ...theme.textStyles.bodyLarge,
    },
    attachmentItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor: theme.colors.neutral,
      borderStyle: "solid",
      borderRadius: 50,
      margin: 5,
    },
    attachmentText: {
      color: theme.colors.textDark,
      ...theme.textStyles.titleSmall,
    },
  });

  return (
    <View>
      <View style={styles.certificateContainer}>
        {/* TOP */}
        <View style={styles.header}>
          <View>
            <Text style={styles.person}>{certificateData.authorPubkey}</Text>
            <Text style={styles.date}>{certificateData.date}</Text>
          </View>
          <View>
            <BoatChainValidated status={certificateData.status} />
          </View>
        </View>

        {/* CONTENT */}
        <View style={styles.content}>
          <View style={styles.contentTop}>
            <Text style={styles.title}>{certificateData.title}</Text>
            <Text style={styles.expire}>
              {certificateData.expires
                ? `${certificateData.expires}`
                : "Perpétuel"}
            </Text>
          </View>

          <View style={styles.contentDescriptionContainer}>
            <Text style={styles.contentDescription}>
              {certificateData.description || "Aucune description fournie."}
            </Text>
          </View>

          <View>
            {Array.isArray(certificateData.attachments) &&
            certificateData.attachments.length > 0 ? (
              certificateData.attachments.map(({ title, uri }, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.attachmentItem}
                  onPress={() => openPDF(uri)}
                >
                  <AntDesign
                    name="filetext1"
                    size={16}
                    color={theme.colors.textDark}
                  />
                  <Text
                    style={styles.attachmentText}
                    numberOfLines={1}
                    ellipsizeMode="middle"
                  >
                    {title ?? `Document ${index + 1}`}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.attachmentText}>Aucun document joint.</Text>
            )}
          </View>

          {/* Actions pour certificateur */}
          {canRevoke && (
            <TouchableOpacity
              style={certifierStyles.revokeButton}
              onPress={handleRevoke}
            >
              <Text style={certifierStyles.revokeButtonText}>Révoquer</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

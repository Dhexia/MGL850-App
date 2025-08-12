import React, { Dispatch, useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Modal } from "react-native";
import { useTheme } from "@/theme";
import BoatCertificatePicker from "./BoatCertificatePicker";
import BoatCertificate from "./BoatCertificate";
import * as types from "@/lib/boat.types";
import BoatCertificateEditable from "./BoatCertificateEditable";

interface BoatCertificatesSectionProps {
  isOwner: boolean;
  certificates: types.BoatCertificate[];
}

export default function BoatCertificatesSection({
  isOwner,
  certificates,
}: BoatCertificatesSectionProps) {
  const theme = useTheme();
  const [newCertificate, setNewCertificate] =
    useState<types.BoatCertificate | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  const styles = StyleSheet.create({
    certificatesContainer: {
      marginVertical: 10,
      marginHorizontal: 10,
    },
    certificatesTitle: {
      color: theme.colors.textDark,
      ...theme.textStyles.titleMedium,
      flex: 1,
    },
    button: {
      borderRadius: 10,
      padding: 5,
      alignItems: "center",
      justifyContent: "center",
    },
    buttonText: {
      fontWeight: "bold",
    },
  });

  const handleCertificatePicked = (cert: types.BoatCertificate) => {
    setNewCertificate(cert);
    setShowEditor(true);
  };

  console.log(certificates);

  return (
    <View style={styles.certificatesContainer}>
      <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
        <Text style={styles.certificatesTitle}>🧾 Certificats</Text>
        {isOwner && (
          <BoatCertificatePicker
            title="Ajouter"
            setNewCertificate={handleCertificatePicked}
          />
        )}
      </View>
      {/* Editor Modal */}
      <Modal
        visible={showEditor}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        {newCertificate && (
          <BoatCertificateEditable
            initialData={newCertificate}
            onClose={() => setShowEditor(false)}
            onSave={(updated) => {
              certificates.push(updated);
              setShowEditor(false);
            }}
            setData={setNewCertificate}
          />
        )}
      </Modal>
      <View>
        {certificates?.map((certificate, idx) => (
          <BoatCertificate key={idx} certificateData={certificate} />
        ))}
      </View>
    </View>
  );
}

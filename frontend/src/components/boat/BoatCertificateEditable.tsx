import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Keyboard,
} from "react-native";
import { useTheme } from "@/theme";
import * as types from "@/lib/boat.types";
import { AntDesign } from "@expo/vector-icons";
import TextField from "../forms/TextField";
import DateField from "../forms/DateField";
import PdfViewer from "../PdfViewer";

interface Props {
  initialData: types.BoatCertificate;
  onClose: () => void;
  onSave: (data: types.BoatCertificate) => void;
  setData;
}

const fieldConfig: {
  [K in keyof types.BoatCertificate]?: {
    label: string;
    type: "text" | "date" | "textarea" | "picker" | "attachments";
    placeholder: string;
  };
} = {
  authorPubkey: {
    label: "Clé publique de l'auteur",
    type: "text",
    placeholder: "0xD3bdEb48c0b454AAF25f58FFB3c8e15efAAE30d9",
  },
  date: { label: "Date", type: "date", placeholder: "" },
  title: { label: "Titre", type: "text", placeholder: "Type de certificat" },
  expires: { label: "Date d'expiration", type: "date", placeholder: "" },
  description: {
    label: "Description",
    type: "textarea",
    placeholder: "Pour donner plus de détails",
  },
  attachments: { label: "Document(s)", type: "attachments", placeholder: "" },
};

export default function EditableCertificateForm({
  initialData,
  onClose,
  onSave,
}: Props) {
  const theme = useTheme();
  const [form, setForm] = useState<types.BoatCertificate>(initialData);
  const [showPdf, setShowPdf] = useState<any>(false);
  const [pdfUri, setPdfUri] = useState<any>(null);
  const openPDF = async (url: string) => {
    setPdfUri(url);
    setShowPdf(true);
  };

  // Create refs array — one per input field, skipping non-text inputs like attachments
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // keys for text inputs in the order they render (skip attachments)
  const textFieldKeys = Object.keys(fieldConfig).filter((key) =>
    ["text", "textarea"].includes(fieldConfig[key].type)
  );
  // handler to move to next or dismiss keyboard
  const onSubmitHandler = (index: number) => {
    if (index < textFieldKeys.length - 1) {
      // Focus next input
      inputRefs.current[index + 1]?.focus();
    } else {
      // Last input — dismiss keyboard
      Keyboard.dismiss();
    }
  };

  if (showPdf) {
    console.log("Displaying pdf", pdfUri);
    return <PdfViewer uri={pdfUri} setVisible={setShowPdf} />;
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      margin: 20,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    title: { ...theme.textStyles.titleLarge },
    input: {
      borderBottomWidth: 1,
      borderColor: theme.colors.neutral,
      marginBottom: 15,
      padding: 8,
    },
    label: {
      color: theme.colors.textDark,
      ...theme.textStyles.titleMedium,
      marginBottom: 4,
    },
    saveButton: {
      backgroundColor: theme.colors.primary,
      padding: 15,
      borderRadius: 10,
      alignItems: "center",
      marginTop: 20,
    },
    cancelButton: {
      backgroundColor: "red",
      padding: 15,
      borderRadius: 10,
      alignItems: "center",
      marginTop: 20,
    },
    saveText: { color: "white", fontWeight: "bold" },
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

  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const renderField = (key: string) => {
    const refIndex = textFieldKeys.indexOf(key);
    if (fieldConfig[key].type === "date") {
      return (
        <DateField
          key={key}
          label={fieldConfig[key].label}
          value={form[key]}
          onChange={(dateString) => handleChange(key, dateString)}
        />
      );
    }

    if (fieldConfig[key].type === "attachments") {
      return (
        <View key={key}>
          <Text style={styles.label}>{fieldConfig[key].label}</Text>
          {form.attachments.map((attachment, index) => (
            <TouchableOpacity
              key={`attachment_${index}`}
              style={styles.attachmentItem}
              onPress={() => openPDF(attachment.uri)}
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
                {attachment.title ?? `Document ${index + 1}`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    return (
      <TextField
        label={fieldConfig[key].label}
        key={key}
        placeholder={fieldConfig[key].placeholder}
        value={form[key]}
        returnKeyType={refIndex === textFieldKeys.length - 1 ? "done" : "next"}
        onChangeText={(text) => handleChange(key, text)}
        ref={(el) => {
          inputRefs.current[refIndex] = el;
        }}
        onSubmitEditing={() => {
          onSubmitHandler(refIndex);
        }}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Modifier le certificat</Text>
      </View>

      {/* Dynamic fields */}
      {Object.keys(fieldConfig).map((key) =>
        renderField(key as keyof types.BoatCertificate)
      )}

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={() => onSave(form)}>
        <Text style={styles.saveText}>Enregistrer</Text>
      </TouchableOpacity>
      {/* Cancel Button */}
      <TouchableOpacity style={styles.cancelButton} onPress={() => onClose()}>
        <Text style={styles.saveText}>Annuler</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

import React, { useState } from "react";
import {
  View,
  Dimensions,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Text,
} from "react-native";
import { WebView } from "react-native-webview";

export default function PdfViewer({ uri, setVisible }) {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center" },
    openButton: {
      backgroundColor: "#3498db",
      padding: 12,
      borderRadius: 8,
    },
    buttonText: { color: "#fff", fontSize: 16 },
    closeButton: {
      position: "absolute",
      top: 40,
      right: 20,
      zIndex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      borderRadius: 20,
      padding: 8,
    },
    closeButtonText: { color: "#fff", fontSize: 20 },
  });
  return (
    <Modal visible={isVisible} animationType="slide" transparent={false}>
      {/* Close button */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => {
          setIsVisible(false);
          setVisible(false);
        }}
      >
        <Text style={styles.closeButtonText}>✕</Text>
      </TouchableOpacity>

      {/* PDF WebView */}
      <WebView
        source={{ uri: uri }}
        style={{ flex: 1 }}
        originWhitelist={["*"]}
      />
    </Modal>
  );
}

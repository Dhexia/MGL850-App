import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/theme";
import { useAuth } from "@/contexts/AuthContext";
import TextField from "@/components/forms/TextField";
import SelectField from "@/components/forms/SelectField";
import HeaderWithTitle from "@/components/HeaderWithTitle";
import Constants from "expo-constants";

enum EventKind {
  SALE = 0,        // Vente/transfert de propriete
  REPAIR = 1,      // Reparations et maintenance
  INCIDENT = 2,    // Declaration d'incidents
  INSPECTION = 3   // Inspections techniques
}

interface CreateEventDto {
  boatId: number;
  kind: EventKind;
  ipfsHash: string;
}

interface CreateEventResponse {
  success: boolean;
  txHash?: string;
  message?: string;
}

export default function AddEventScreen() {
  const { boatId, ownerId } = useLocalSearchParams<{ boatId: string; ownerId?: string }>();
  const theme = useTheme();
  const router = useRouter();
  const { address, userRole, jwt } = useAuth();

  const API_BASE = (Constants.expoConfig?.extra as any)?.apiBase as string;

  // Vérifier si l'utilisateur est le propriétaire du bateau
  const isOwner = address && ownerId && address.toLowerCase() === ownerId.toLowerCase();

  const [eventKind, setEventKind] = useState<EventKind>(EventKind.REPAIR);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [technician, setTechnician] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);

  const eventKindOptions = [
    { label: "Vente/Transfert", value: EventKind.SALE.toString() },
    { label: "Réparation/Maintenance", value: EventKind.REPAIR.toString() },
    { label: "Incident", value: EventKind.INCIDENT.toString() },
    { label: "Inspection technique", value: EventKind.INSPECTION.toString() },
  ];

  const handleSubmit = async () => {
    if (!description) {
      Alert.alert("Erreur", "Veuillez remplir la description.");
      return;
    }

    try {
      setLoading(true);

      // 1. Préparer les métadonnées de l'événement
      const eventMetadata = {
        description,
        timestamp: new Date().toISOString(),
        location,
        technician,
        details,
        eventType: EventKind[eventKind],
        boatId: parseInt(boatId || "0"),
        attachments: []
      };

      // 2. Upload vers IPFS
      const ipfsResponse = await fetch(`${API_BASE}/documents/upload-json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
        },
        body: JSON.stringify({ boatData: eventMetadata }),
      });

      if (!ipfsResponse.ok) {
        throw new Error('Erreur lors de l\'upload IPFS');
      }

      const { ipfsHash } = await ipfsResponse.json();

      // 3. Créer l'événement
      const eventResponse = await fetch(`${API_BASE}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          boatId: parseInt(boatId || "0"),
          kind: eventKind,
          ipfsHash,
        }),
      });

      if (!eventResponse.ok) {
        throw new Error('Erreur lors de la création de l\'événement');
      }

      const result: CreateEventResponse = await eventResponse.json();

      if (result.success) {
        Alert.alert("Succès", "Événement créé avec succès!", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert("Erreur", result.message || "Erreur lors de la création");
      }
    } catch (error) {
      console.error('Erreur création événement:', error);
      Alert.alert("Erreur", "Impossible de créer l'événement.");
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.backgroundLight,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      ...theme.textStyles.titleMedium,
      color: theme.colors.textDark,
      marginBottom: 15,
    },
    submitButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 15,
      paddingHorizontal: 20,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 20,
    },
    submitButtonDisabled: {
      backgroundColor: theme.colors.neutral,
    },
    submitButtonText: {
      ...theme.textStyles.titleMedium,
      color: theme.colors.background,
      fontWeight: '600',
    },
  });

  // Vérifier que l'utilisateur est connecté et propriétaire du bateau
  if (!address || !jwt) {
    return (
      <View style={styles.container}>
        <HeaderWithTitle title="Ajouter un événement" />
        <View style={styles.content}>
          <Text>Vous devez être connecté pour ajouter un événement.</Text>
        </View>
      </View>
    );
  }

  if (!isOwner) {
    return (
      <View style={styles.container}>
        <HeaderWithTitle title="Ajouter un événement" />
        <View style={styles.content}>
          <Text>Vous devez être le propriétaire du bateau pour ajouter un événement.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeaderWithTitle title={`Ajouter un événement - Bateau #${boatId}`} />
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations de l'événement</Text>
          
          <SelectField
            label="Type d'événement"
            value={eventKind.toString()}
            onValueChange={(value) => setEventKind(parseInt(value) as EventKind)}
            placeholder="Sélectionner un type"
            options={eventKindOptions}
          />

          <TextField
            label="Description"
            placeholder="Description détaillée de l'événement..."
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <TextField
            label="Lieu (optionnel)"
            placeholder="Port de Nice"
            value={location}
            onChangeText={setLocation}
          />

          <TextField
            label="Technicien/Intervenant (optionnel)"
            placeholder="Jean Dupont"
            value={technician}
            onChangeText={setTechnician}
          />

          <TextField
            label="Détails supplémentaires (optionnel)"
            placeholder="Changement huile, filtre air, bougies..."
            value={details}
            onChangeText={setDetails}
            multiline
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? "Création en cours..." : "Créer l'événement"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
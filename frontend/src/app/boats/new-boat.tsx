import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Alert,
  ScrollView,
  Text,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useTheme } from "@/theme";
import HeaderWithTitle from "@/components/HeaderWithTitle";
import ImagePickerComponent from "@/components/ImagePicker";
import TextField from "@/components/forms/TextField";
import SelectField from "@/components/forms/SelectField";
import { useAuth } from "@/contexts/AuthContext";
import { mintPassport, uploadBoatDataToIPFS, uploadImages } from "@/lib/api/boats.api";
import { formDataToIPFSData } from "@/lib/api/transformers.api";
import { clearBoatsCache } from "@/lib/boats.api";
import type { NewBoatFormData } from "@/lib/boat.types";

export default function NewBoat() {
  const theme = useTheme();
  const { address, jwt, login } = useAuth() as any;
  const currentYear = new Date().getFullYear();
  
  // Form state
  const [formData, setFormData] = useState<NewBoatFormData>({
    price: 0,
    title: "",
    name: "",
    year: currentYear,
    port: "",
    postalCode: "",
    overall_length: "",
    width: "",
    draft: "",
    engine: "",
    fresh_water_capacity: "",
    fuel_capacity: "",
    cabins: "",
    beds: "",
    boat_type: "sailboat",
    navigation_category: "C - inshore navigation",
  });

  const [selectedImages, setSelectedImages] = useState<Array<{ uri: string; name: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof NewBoatFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.title || !formData.name || !formData.port || !formData.postalCode) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires");
      return false;
    }
    if (formData.price <= 0) {
      Alert.alert("Erreur", "Le prix doit être positif");
      return false;
    }
    if (formData.year < 1900 || formData.year > currentYear) {
      Alert.alert("Erreur", `L'année doit être entre 1900 et ${currentYear}`);
      return false;
    }
    if (selectedImages.length === 0) {
      Alert.alert("Erreur", "Veuillez ajouter au moins une photo de votre bateau");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // 1. Vérif connexion/auth
      if (!address) {
        Alert.alert("Connexion requise", "Connecte d'abord ton wallet et connecte-toi.");
        return;
      }
      if (!jwt) {
        try {
          await login?.();
        } catch {}
        if (!jwt) {
          Alert.alert('Non authentifié', "Refais la connexion pour obtenir un token.");
          return;
        }
      }

      // 2. Upload des images vers Cloudinary
      let imageUrls: string[] = [];
      if (selectedImages.length > 0) {
        console.log('[mint] Uploading images to Cloudinary...');
        const uploadedImages = await uploadImages(selectedImages);
        imageUrls = uploadedImages.images.map((img: any) => img.url);
        console.log('[mint] Images uploaded:', imageUrls);
      }

      // 3. Convertir form data → structure IPFS avec DTO
      const boatData = formDataToIPFSData(formData, imageUrls);

      // 4. Upload la structure complète vers IPFS
      console.log('[mint] Uploading boat data to IPFS...', boatData);
      const { ipfsHash } = await uploadBoatDataToIPFS(boatData);
      const uri = `ipfs://${ipfsHash}`;
      console.log('[mint] IPFS uploaded, uri=', uri);

      // 5. Mint NFT with real IPFS URI
      console.log('[mint] POST /boats to=', address, 'uri=', uri);
      const res = await mintPassport(address, uri);
      console.log('[mint] OK res=', res);
      
      Alert.alert(
        'Passeport envoyé', 
        `txHash: ${res?.txHash ?? 'ok'}`,
        [
          {
            text: 'OK',
            onPress: async () => {
              // Clear boats cache to ensure fresh data is loaded
              await clearBoatsCache();
              // Navigate to dashboard after user acknowledges success
              router.push('/(tabs)/dashboard');
            }
          }
        ]
      );
      
      // Reset form
      setFormData({
        price: 0,
        title: '',
        name: '',
        year: currentYear,
        port: "",
        postalCode: "",
        overall_length: "",
        width: "",
        draft: "",
        engine: "",
        fresh_water_capacity: "",
        fuel_capacity: "",
        cabins: "",
        beds: "",
        boat_type: 'sailboat',
        navigation_category: 'C - inshore navigation',
      });
      setSelectedImages([]);
    } catch (e: any) {
      console.log('[mint] ERR', e);
      Alert.alert('Erreur mint', e?.message ?? String(e));
    } finally {
      setIsSubmitting(false);
    }
  };

  const styles = StyleSheet.create({
    container: {},
    content: {
      marginHorizontal: 15,
      marginBottom: 50,
    },
    title: {
      color: theme.colors.textDark,
      ...theme.textStyles.titleMedium,
      borderBottomWidth: 1,
      borderColor: theme.colors.textDark,
      marginBottom: 5,
    },
    subtitle: {
      color: theme.colors.text,
      ...theme.textStyles.bodySmall,
      marginBottom: 10,
      fontStyle: 'italic',
    },
    btn: {
      position: "absolute",
      backgroundColor: theme.colors.secondary,
      flex: 1,
      top: 20,
      right: 15,
      borderRadius: 50,
      paddingVertical: 10,
      paddingHorizontal: 15,
    },
    btnPressed: { opacity: 0.7 },
    btnDisabled: { opacity: 0.5 },
    btnText: { color: theme.colors.textLight, ...theme.textStyles.titleMedium },
    fieldsGroup: {
      backgroundColor: theme.colors.surfaceLight,
      paddingHorizontal: 15,
      paddingVertical: 15,
      borderRadius: 15,
      borderColor: theme.colors.neutral,
      borderStyle: "solid",
      borderWidth: 1,
      marginBottom: 15,
    },
  });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "web" ? undefined : "padding"}
      keyboardVerticalOffset={0}
    >
      <HeaderWithTitle title="Nouveau bateau" />

      <Pressable
        style={({ pressed }) => [
          styles.btn,
          pressed && styles.btnPressed,
          isSubmitting && styles.btnDisabled,
        ]}
        disabled={isSubmitting}
        onPress={handleSubmit}
      >
        <Text style={styles.btnText}>Valider</Text>
      </Pressable>

      <ScrollView style={styles.content}>
        <View style={styles.fieldsGroup}>
          <Text style={styles.title}>Photos du bateau *</Text>
          <Text style={styles.subtitle}>Au moins une photo est requise</Text>
          <ImagePickerComponent 
            onImagesChange={setSelectedImages}
            maxImages={5}
            wrapMode={false}
          />
        </View>

        <View style={styles.fieldsGroup}>
          <Text style={styles.title}>Information générales</Text>
          <TextField
            label="Titre"
            placeholder="Bateau à vendre"
            value={formData.title}
            onChangeText={(text) => updateField('title', text)}
          />
          <TextField
            label="Nom"
            placeholder="Nom du bateau"
            value={formData.name}
            onChangeText={(text) => updateField('name', text)}
          />
          <TextField
            label="Prix ($)"
            placeholder="150 000"
            value={formData.price.toString()}
            onChangeText={(text) => updateField('price', parseFloat(text) || 0)}
            keyboardType="numeric"
          />
          <TextField
            label="Port d'attache"
            placeholder="La Rochelle"
            value={formData.port || ''}
            onChangeText={(text) => updateField('port', text)}
          />
          <TextField
            label="Code postal"
            placeholder="17000"
            value={formData.postalCode || ''}
            onChangeText={(text) => updateField('postalCode', text)}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.fieldsGroup}>
          <Text style={styles.title}>Information sur le bateau</Text>
          <TextField
            label="Année"
            placeholder="2020"
            value={formData.year.toString()}
            onChangeText={(text) => updateField('year', parseInt(text) || currentYear)}
            keyboardType="numeric"
          />
          <TextField
            label="Longueur hors tout (m)"
            placeholder="12.50"
            value={formData.overall_length || ''}
            onChangeText={(text) => updateField('overall_length', text)}
            keyboardType="numeric"
          />
          <TextField
            label="Largeur (m)"
            placeholder="3.80"
            value={formData.width || ''}
            onChangeText={(text) => updateField('width', text)}
            keyboardType="numeric"
          />
          <TextField
            label="Tirant d'eau (m)"
            placeholder="1.75"
            value={formData.draft || ''}
            onChangeText={(text) => updateField('draft', text)}
            keyboardType="numeric"
          />
          <TextField
            label="Moteur"
            placeholder="Volvo Penta D2-55"
            value={formData.engine || ''}
            onChangeText={(text) => updateField('engine', text)}
          />
          <TextField
            label="Capacité eau douce (L)"
            placeholder="530"
            value={formData.fresh_water_capacity || ''}
            onChangeText={(text) => updateField('fresh_water_capacity', text)}
            keyboardType="numeric"
          />
          <TextField
            label="Capacité carburant (L)"
            placeholder="200"
            value={formData.fuel_capacity || ''}
            onChangeText={(text) => updateField('fuel_capacity', text)}
            keyboardType="numeric"
          />
          <TextField
            label="Cabines"
            placeholder="3"
            value={formData.cabins || ''}
            onChangeText={(text) => updateField('cabins', text)}
            keyboardType="numeric"
          />
          <TextField
            label="Couchages"
            placeholder="8"
            value={formData.beds || ''}
            onChangeText={(text) => updateField('beds', text)}
            keyboardType="numeric"
          />
          <SelectField
            label="Type de bateau"
            placeholder="Choisir un type"
            value={formData.boat_type || ''}
            onValueChange={(value) => updateField('boat_type', value)}
            options={[
              { label: "Voilier", value: "sailboat" },
              { label: "Bateau à moteur", value: "motorboat" },
              { label: "Catamaran", value: "catamaran" },
              { label: "Péniche", value: "houseboat" },
            ]}
          />
          <SelectField
            label="Catégorie de navigation"
            placeholder="Choisir une catégorie"
            value={formData.navigation_category || ''}
            onValueChange={(value) => updateField('navigation_category', value)}
            options={[
              { label: "A – Navigation hauturière", value: "A - offshore navigation" },
              { label: "B – Navigation au large", value: "B - coastal navigation" },
              { label: "C – Navigation côtière", value: "C - inshore navigation" },
              { label: "D – Navigation abritée", value: "D - sheltered waters" },
            ]}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
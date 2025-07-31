import React from "react";
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
import { useTheme } from "@/theme";
import HeaderWithTitle from "@/components/HeaderWithTitle";

import { useForm, FormProvider } from "react-hook-form";
import TextField from "@/components/forms/TextField";
import SelectField from "@/components/forms/SelectField";
import { useAuth } from "@/contexts/AuthContext";
import { mintPassport } from "@/lib/boats.api";

// Champs déjà en place (on ne modifie pas la forme/UX)
type FormData = {
  price: number;
  title: string;
  name: string;
  year: number;
  port?: string;
  postalCode?: string;
  overall_length?: string;
  width?: string;
  draft?: string;
  engine?: string;
  fresh_water_capacity?: string;
  fuel_capacity?: string;
  cabins?: string;
  beds?: string;
  boat_type?: string;
  navigation_category?: string;
};

export default function NewBoat() {
  const theme = useTheme();
  const { address, jwt, login } = useAuth() as any;
  const currentYear = new Date().getFullYear();

  /* ---------- RHF ---------- */
  const methods = useForm<FormData>({
    defaultValues: {
      price: 0,
      title: "",
      name: "",
      year: new Date().getFullYear(),
      boat_type: 'sailboat',
      navigation_category: 'C - inshore navigation',
    },
  });

  const onSubmit = async (data: FormData) => {
    // 0) Traces
    console.log('[mint] start address=', address, 'jwt.len=', jwt ? jwt.length : 0);

    // 1) Vérif connexion/auth
    if (!address) {
      Alert.alert("Connexion requise", "Connecte d'abord ton wallet et connecte-toi.");
      return;
    }
    if (!jwt) {
      // Option: tenter un login auto (si tu veux)
      try {
        await login?.();
      } catch {}
      if (!jwt) {
        Alert.alert('Non authentifié', "Refais la connexion pour obtenir un token.");
        return;
      }
    }

    try {
      const uri = 'ipfs://example';
      console.log('[mint] POST /boats to=', address, 'uri=', uri);
      const res = await mintPassport(address, uri);
      console.log('[mint] OK res=', res);
      Alert.alert('Passeport envoyé', `txHash: ${res?.txHash ?? 'ok'}`);
      methods.reset({
        price: 0,
        title: '',
        name: '',
        year: new Date().getFullYear(),
        boat_type: 'sailboat',
        navigation_category: 'C - inshore navigation',
      });
    } catch (e: any) {
      console.log('[mint] ERR', e);
      Alert.alert('Erreur mint', e?.message ?? String(e));
    }
  };

  /* ------------------------- */

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
    validationButton: {},
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
    <FormProvider {...methods}>
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
            methods.formState.isSubmitting && styles.btnDisabled,
          ]}
          disabled={methods.formState.isSubmitting}
          onPress={methods.handleSubmit(onSubmit)}
        >
          <Text style={styles.btnText}>Valider</Text>
        </Pressable>

        <ScrollView style={styles.content}>
          <View style={styles.fieldsGroup}>
            <Text style={styles.title}>Information générales</Text>
            <TextField
              name="title"
              label="Titre"
              details="Titre de l'annonce"
              placeholder="Bateau à vendre"
              rules={{ required: "Un titre est obligatoire" }}
            />

            <TextField
              name="name"
              label="Nom"
              details="Nom du bateau"
              placeholder="Nom du bateau"
              rules={{ required: "Le nom est obligatoire" }}
            />

            <TextField
              name="price"
              label="Prix ($)"
              details="Prix du bateau en CAD"
              placeholder="150 000"
              rules={{
                required: "Le prix est obligatoire",
                pattern: { value: /^\d+(\.\d{1,2})?$/, message: "Nombre positif, 2 décimales max." },
              }}
              inputProps={{ keyboardType: "numeric", maxLength: 12 }}
            />
            <TextField
              name="port"
              label="Port d'attache"
              details="Port d'attache du bateau"
              placeholder="La Rochelle"
              rules={{ required: "Le port est obligatoire" }}
            />
            <TextField
              name="postalCode"
              label="Code postal"
              details="Code postal du port d'attache"
              placeholder="17000"
              rules={{ required: "Le code postal est obligatoire" }}
              inputProps={{ keyboardType: "numeric", maxLength: 12 }}
              borderBottomWidth={0}
            />
          </View>

          <View style={styles.fieldsGroup}>
            <Text style={styles.title}>Information sur le bateau</Text>
            <TextField
              name="year"
              label="Année"
              details="Année de construction"
              placeholder="2020"
              rules={{
                required: "L'année est obligatoire",
                pattern: { value: /^\d{4}$/, message: "Doit contenir 4 chiffres" },
                min: { value: 1900, message: "Trop ancien (>= 1900)" },
                max: { value: currentYear, message: `Ne peut pas dépasser ${currentYear}` },
              }}
              inputProps={{ keyboardType: "numeric", maxLength: 4 }}
            />
            <TextField
              name="overall_length"
              label="Longueur hors tout (m)"
              details="Longueur totale du bateau"
              placeholder="12.50"
              rules={{
                required: "La longueur est obligatoire",
                pattern: { value: /^\d+(\.\d{1,2})?$/, message: "Nombre positif, 2 décimales max." },
              }}
              inputProps={{ keyboardType: "numeric" }}
            />
            <TextField
              name="width"
              label="Largeur (m)"
              details="Largeur maximale du bateau"
              placeholder="3.80"
              rules={{
                required: "La largeur est obligatoire",
                pattern: { value: /^\d+(\.\d{1,2})?$/, message: "Nombre positif, 2 décimales max." },
              }}
              inputProps={{ keyboardType: "numeric" }}
            />
            <TextField
              name="draft"
              label="Tirant d'eau (m)"
              details="Profondeur sous la ligne de flottaison"
              placeholder="1.75"
              rules={{
                required: "Le tirant d'eau est obligatoire",
                pattern: { value: /^\d+(\.\d{1,2})?$/, message: "Nombre positif, 2 décimales max." },
              }}
              inputProps={{ keyboardType: "numeric" }}
            />
            <TextField
              name="engine"
              label="Moteur"
              details="Marque, modèle ou puissance"
              placeholder="Volvo Penta D2-55"
              rules={{ required: "Le moteur est obligatoire" }}
              inputProps={{ autoCapitalize: "words", returnKeyType: "next" }}
            />
            <TextField
              name="fresh_water_capacity"
              label="Capacité eau douce (L)"
              details="Réservoir d'eau potable"
              placeholder="530"
              rules={{ required: "La capacité est obligatoire", pattern: { value: /^\d+$/, message: "Entier positif requis" } }}
              inputProps={{ keyboardType: "numeric" }}
            />
            <TextField
              name="fuel_capacity"
              label="Capacité carburant (L)"
              details="Réservoir de diesel/essence"
              placeholder="200"
              rules={{ required: "La capacité est obligatoire", pattern: { value: /^\d+$/, message: "Entier positif requis" } }}
              inputProps={{ keyboardType: "numeric" }}
            />
            <TextField
              name="cabins"
              label="Cabines"
              details="Nombre total de cabines"
              placeholder="3"
              rules={{ required: "Nombre de cabines obligatoire", pattern: { value: /^\d+$/, message: "Entier positif requis" } }}
              inputProps={{ keyboardType: "numeric" }}
            />
            <TextField
              name="beds"
              label="Couchages"
              details="Places pour dormir"
              placeholder="8"
              rules={{ required: "Nombre de couchages obligatoire", pattern: { value: /^\d+$/, message: "Entier positif requis" } }}
              inputProps={{ keyboardType: "numeric" }}
            />
            <SelectField
              name="boat_type"
              label="Type de bateau"
              placeholder="Choisir un type"
              options={[
                { label: "Voilier", value: "sailboat" },
                { label: "Bateau à moteur", value: "motorboat" },
                { label: "Catamaran", value: "catamaran" },
                { label: "Péniche", value: "houseboat" },
              ]}
              rules={{ required: "Le type est obligatoire" }}
            />
            <SelectField
              name="navigation_category"
              label="Catégorie de navigation"
              placeholder="Choisir une catégorie"
              options={[
                { label: "A – Navigation hauturière", value: "A - offshore navigation" },
                { label: "B – Navigation au large", value: "B - coastal navigation" },
                { label: "C – Navigation côtière", value: "C - inshore navigation" },
                { label: "D – Navigation abritée", value: "D - sheltered waters" },
              ]}
              rules={{ required: "La catégorie est obligatoire" }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </FormProvider>
  );
}

import React, { Dispatch, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  TextInput,
  Keyboard,
  Image,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/theme";
import { useAuth } from "@/contexts/AuthContext";
import TextField from "@/components/forms/TextField";
import SelectField from "@/components/forms/SelectField";
import ImagePicker from "@/components/ImagePicker";
import HeaderWithTitle from "@/components/HeaderWithTitle";
import { createEditBoatStyles } from "@/styles/EditBoatScreen.style";
import { BoatIPFSData, BoatSpecification } from "@/lib/boat.types";

export default function EditBoatScreen() {
  const {
    boatId,
    ownerId,
    specification: specString,
    images: imgString,
    certificates: certString,
    events: eventsString,
  } = useLocalSearchParams<{
    boatId: string;
    ownerId: string;
    specification: string;
    images: string;
    certificates: string;
    events: string;
  }>();

  const theme = useTheme();
  const router = useRouter();
  const { address, userRole } = useAuth();
  const styles = createEditBoatStyles(theme);

  const originalSpec: BoatSpecification = JSON.parse(specString);
  const originalImages = JSON.parse(imgString);
  console.log("originalImages",originalImages);
  const originalCertificates = certString ? JSON.parse(certString) : [];
  const originalEvents = eventsString ? JSON.parse(eventsString) : [];

  // Controlled state for editable fields
  const [title, setTitle] = useState(originalSpec?.title || "");
  const [name, setName] = useState(originalSpec?.name?.toString() || "");
  const [description, setDescription] = useState(
    originalSpec?.description || ""
  );
  const [summary, setSummary] = useState(originalSpec?.summary || "");
  const [price, setPrice] = useState(originalSpec?.price?.toString() || "");
  const [boatType, setBoatType] = useState(originalSpec?.boat_type || "");
  const [year, setYear] = useState(originalSpec?.year?.toString() || "");
  const [length, setLength] = useState(
    originalSpec?.overall_length?.toString() || ""
  );
  const [draft, setDraft] = useState(originalSpec?.draft?.toString() || "");
  const [width, setWidth] = useState(originalSpec?.width?.toString() || "");
  const [engine, setengine] = useState(originalSpec?.engine?.toString() || "");
  const [freshWaterCapacity, setFreshWaterCapacity] = useState(
    originalSpec?.fresh_water_capacity?.toString() || ""
  );
  const [fuelCapacity, setFuelCapacity] = useState(
    originalSpec?.fuel_capacity?.toString() || ""
  );
  const [cabins, setCabins] = useState(originalSpec?.cabins?.toString() || "");
  const [beds, setBeds] = useState(originalSpec?.beds?.toString() || "");
  const [navigationCategory, setNavigationCategory] = useState(
    originalSpec?.navigation_category?.toString() || ""
  );
  const [city, setCity] = useState(originalSpec?.city || "");
  const [postalCode, setPostalCode] = useState(originalSpec?.postal_code || "");
  const [isForSale, setIsForSale] = useState(originalSpec?.for_sale || false);

  const [images, setImages]: [
    {
      uri: string;
      name: string;
    }[],
    Dispatch<
      {
        uri: string;
        name: string;
      }[]
    >
  ] = useState(originalImages);
  console.log("images state", images);
  const [saving, setSaving] = useState(false);

  // Check if user is the owner
  const isOwner =
    address && ownerId && address.toLowerCase() === ownerId.toLowerCase();

  if (!isOwner || userRole !== "standard_user") {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Vous n'avez pas les permissions pour modifier ce bateau.
        </Text>
      </View>
    );
  }

  const handleSave = async () => {
    try {
      setSaving(true);

      const updatedSpec = {
        ...originalSpec,
        title,
        description,
        summary,
        price: parseFloat(price) || 0,
        boat_type: boatType,
        year: parseInt(year) || undefined,
        length: parseFloat(length) || undefined,
        width: parseFloat(width) || undefined,
        engine_power: parseFloat(engine) || undefined,
        city,
        postal_code: postalCode,
        is_for_sale: isForSale,
      };

      // Call API to save changes
      console.log("Saving boat updates:", updatedSpec);

      const specification: BoatSpecification = {
        price: parseFloat(price),
        title: title,
        name: name,
        city: city,
        postal_code: postalCode,
        for_sale: isForSale,
        year: parseInt(year),
        overall_length: parseFloat(length),
        width: parseFloat(width),
        draft: parseFloat(draft),
        engine: engine,
        fresh_water_capacity: parseInt(freshWaterCapacity),
        fuel_capacity: parseInt(fuelCapacity),
        cabins: parseInt(cabins),
        beds: parseInt(beds),
        boat_type: boatType,
        navigation_category: navigationCategory,
        description: description,
        summary: summary,
        status: "pending",
      };

      const boatIPFSData: BoatIPFSData = {
        specification: specification,
        // TODO : add events and certificates
        certificates: [],
        events: [],
        images: images,
      };
      //  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      //   TODO : send data to finalize update
      //  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      //   const res2 = await uploadBoatDataToIPFS(boatIPFSData);

      Alert.alert("Succès", "Les modifications ont été sauvegardées.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Error saving boat updates:", error);
      Alert.alert("Erreur", "Impossible de sauvegarder les modifications.");
    } finally {
      setSaving(false);
    }
  };

  const boatTypeOptions = [
    { label: "Voilier", value: "voilier" },
    { label: "Bateau à moteur", value: "moteur" },
    { label: "Catamaran", value: "catamaran" },
    { label: "Yacht", value: "yacht" },
    { label: "Annexe", value: "annexe" },
  ];

  // Create refs for inputs and for KeyboardAwareScrollView
  const scrollViewRef = useRef<KeyboardAwareScrollView>(null);
  const titleRef = useRef<TextInput>(null);
  const nameRef = useRef<TextInput>(null);
  const summaryRef = useRef<TextInput>(null);
  const descriptionRef = useRef<TextInput>(null);
  const priceRef = useRef<TextInput>(null);
  const yearRef = useRef<TextInput>(null);
  const lengthRef = useRef<TextInput>(null);
  const widthRef = useRef<TextInput>(null);
  const draftRef = useRef<TextInput>(null);
  const engineRef = useRef<TextInput>(null);
  const freshWaterRef = useRef<TextInput>(null);
  const fuelCapacityRef = useRef<TextInput>(null);
  const cabinsRef = useRef<TextInput>(null);
  const bedsRef = useRef<TextInput>(null);
  const cityRef = useRef<TextInput>(null);
  const postalCodeRef = useRef<TextInput>(null);

  // Manual scroll handler on input focus with extra offset
  const onInputFocus = (inputRef: React.RefObject<TextInput>) => {
    if (inputRef.current) {
      scrollViewRef.current?.scrollToFocusedInput(inputRef.current, 350);
    }
  };

  return (
    <View style={styles.container}>
      <HeaderWithTitle title="Modifier le bateau" />
      <KeyboardAwareScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 200 }}
        enableAutomaticScroll={false} // disable built-in automatic scroll
        ref={scrollViewRef}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
      >
        {/* Informations générales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations générales</Text>
          <TextField
            label="Nom du modèle"
            placeholder="Jeanneau Sun Odyssey 380"
            value={title}
            ref={titleRef}
            onChangeText={setTitle}
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => {
              setTimeout(() => nameRef.current?.focus(), 25);
            }}
            onFocus={() => onInputFocus(titleRef)} // no scroll for first input
          />

          <TextField
            label="Nom"
            placeholder="Symphony of the Seas"
            value={name}
            ref={nameRef}
            onChangeText={setName}
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => {
              setTimeout(() => summaryRef.current?.focus(), 25);
            }}
            onFocus={() => onInputFocus(nameRef)}
          />

          <TextField
            label="Résumé"
            placeholder="Description courte"
            value={summary}
            onChangeText={setSummary}
            ref={summaryRef}
            returnKeyType="done"
            submitBehavior="submit"
            onSubmitEditing={() => Keyboard.dismiss()}
            onFocus={() => onInputFocus(summaryRef)}
          />
        </View>

        {/* Spécifications techniques */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Spécifications techniques</Text>

          <SelectField
            label="Type de bateau"
            value={boatType}
            onValueChange={setBoatType}
            placeholder="Sélectionner"
            options={boatTypeOptions}
          />

          {/* <SelectField
            label="Catégorie de navigation"
            placeholder="A"
            value={navigationCategory}
            onValueChange={setNavigationCategory}
            options={}
          /> */}

          <TextField
            label="Année"
            placeholder="2023"
            value={year}
            onChangeText={setYear}
            ref={yearRef}
            returnKeyType="next"
            keyboardType="numeric"
            submitBehavior="submit"
            onSubmitEditing={() => {
              setTimeout(() => lengthRef.current?.focus(), 25);
            }}
            onFocus={() => onInputFocus(yearRef)}
          />

          <TextField
            label="Longueur (m)"
            placeholder="10.5"
            value={length}
            onChangeText={setLength}
            ref={lengthRef}
            returnKeyType="next"
            keyboardType="numeric"
            submitBehavior="submit"
            onSubmitEditing={() => {
              setTimeout(() => widthRef.current?.focus(), 25);
            }}
            onFocus={() => onInputFocus(lengthRef)}
          />

          <TextField
            label="Largeur (m)"
            placeholder="3.2"
            value={width}
            onChangeText={setWidth}
            ref={widthRef}
            returnKeyType="next"
            keyboardType="numeric"
            submitBehavior="submit"
            onSubmitEditing={() => {
              setTimeout(() => draftRef.current?.focus(), 25);
            }}
            onFocus={() => onInputFocus(widthRef)}
          />

          <TextField
            label="Tirant d'eau (m)"
            placeholder="1.2"
            value={draft}
            onChangeText={setDraft}
            ref={draftRef}
            returnKeyType="next"
            keyboardType="numeric"
            submitBehavior="submit"
            onSubmitEditing={() => {
              setTimeout(() => engineRef.current?.focus(), 25);
            }}
            onFocus={() => onInputFocus(draftRef)}
          />

          <TextField
            label="Moteur"
            placeholder="Yamaha 300cv"
            value={engine}
            onChangeText={setengine}
            ref={engineRef}
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => {
              setTimeout(() => fuelCapacityRef.current?.focus(), 25);
            }}
            onFocus={() => onInputFocus(engineRef)}
          />

          <TextField
            label="Capacité du réservoir de carburant (L)"
            placeholder="150"
            value={fuelCapacity}
            onChangeText={setFuelCapacity}
            ref={fuelCapacityRef}
            returnKeyType="next"
            keyboardType="numeric"
            submitBehavior="submit"
            onSubmitEditing={() => {
              setTimeout(() => freshWaterRef.current?.focus(), 25);
            }}
            onFocus={() => onInputFocus(fuelCapacityRef)}
          />

          <TextField
            label="Capacité du réservoir d'eau douce (L)"
            placeholder="150"
            value={freshWaterCapacity}
            onChangeText={setFreshWaterCapacity}
            ref={freshWaterRef}
            returnKeyType="next"
            keyboardType="numeric"
            submitBehavior="submit"
            onSubmitEditing={() => {
              setTimeout(() => cabinsRef.current?.focus(), 25);
            }}
            onFocus={() => onInputFocus(freshWaterRef)}
          />

          <TextField
            label="Nombre de cabines"
            placeholder="2"
            value={cabins}
            onChangeText={setCabins}
            ref={cabinsRef}
            returnKeyType="next"
            keyboardType="numeric"
            submitBehavior="submit"
            onSubmitEditing={() => {
              setTimeout(() => bedsRef.current?.focus(), 25);
            }}
            onFocus={() => onInputFocus(cabinsRef)}
          />

          <TextField
            label="Nombre de couchages total"
            placeholder="6"
            value={beds}
            onChangeText={setBeds}
            ref={bedsRef}
            returnKeyType="next"
            keyboardType="numeric"
            submitBehavior="submit"
            onSubmitEditing={() => {
              setTimeout(() => cityRef.current?.focus(), 25);
            }}
            onFocus={() => onInputFocus(bedsRef)}
          />
        </View>

        {/* Localisation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Localisation</Text>

          <TextField
            label="Ville"
            placeholder="Marseille"
            value={city}
            onChangeText={setCity}
            ref={cityRef}
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => {
              setTimeout(() => postalCodeRef.current?.focus(), 25);
            }}
            onFocus={() => onInputFocus(cityRef)}
          />

          <TextField
            label="Code postal"
            placeholder="13000"
            value={postalCode}
            onChangeText={setPostalCode}
            ref={postalCodeRef}
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => {
              setTimeout(() => descriptionRef.current?.focus(), 25);
            }}
            onFocus={() => onInputFocus(postalCodeRef)}
          />
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Autres informations</Text>
          <TextField
            label="Description complète"
            placeholder="Description détaillée incluant des détails supplémentaires"
            value={description}
            onChangeText={setDescription}
            ref={descriptionRef}
            onSubmitEditing={() => Keyboard.dismiss()}
            multiline
            returnKeyType="default"
            submitBehavior="newline"
            onFocus={() => onInputFocus(descriptionRef)}
          />
          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={[styles.checkbox, isForSale && styles.checkboxChecked]}
              onPress={() => setIsForSale(!isForSale)}
            >
              {isForSale && (
                <Text style={{ color: theme.colors.background }}>✓</Text>
              )}
            </TouchableOpacity>
            <Text style={styles.checkboxText}>Bateau à vendre</Text>
          </View>
          {isForSale && (
            <TextField
              label="Prix ($/CAD)"
              placeholder="10000"
              value={price}
              onChangeText={setPrice}
              ref={priceRef}
              returnKeyType="next"
              keyboardType="numeric"
              submitBehavior="blurAndSubmit"
              onSubmitEditing={() => Keyboard.dismiss()}
              onFocus={() => onInputFocus(priceRef)}
            />
          )}
        </View>

        {/* Images */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Images</Text>
          <ImagePicker
            wrapMode
            onImagesChange={setImages}
            initialImages={originalImages.map((image: {uri: String, name : String}, index: number) => ({
              uri: image.uri,
              name: `existing_${index}.jpg`,
            }))}
          />
        </View>

        {/* Bouton sauvegarder */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? "Sauvegarde..." : "Sauvegarder les modifications"}
          </Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </View>
  );
}

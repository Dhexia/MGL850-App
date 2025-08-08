import React, { useState } from 'react';
import {
    ScrollView,
    View,
    Text,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/theme';
import { useAuth } from '@/contexts/AuthContext';
import TextField from '@/components/forms/TextField';
import SelectField from '@/components/forms/SelectField';
import ImagePicker from '@/components/ImagePicker';
import HeaderWithTitle from '@/components/HeaderWithTitle';
import { createEditBoatStyles } from '@/styles/EditBoatScreen.style';

export default function EditBoatScreen() {
    const {
        boatId,
        specification: specString,
        images: imgString,
        certificates: certString,
        events: eventsString
    } = useLocalSearchParams<{
        boatId: string;
        specification: string;
        images: string;
        certificates: string;
        events: string;
    }>();

    const theme = useTheme();
    const router = useRouter();
    const { address, userRole } = useAuth();
    const styles = createEditBoatStyles(theme);
    
    const originalSpec = JSON.parse(specString);
    const originalImages = JSON.parse(imgString);
    const originalCertificates = certString ? JSON.parse(certString) : [];
    const originalEvents = eventsString ? JSON.parse(eventsString) : [];

    // États pour les champs modifiables
    const [title, setTitle] = useState(originalSpec?.title || '');
    const [description, setDescription] = useState(originalSpec?.description || '');
    const [summary, setSummary] = useState(originalSpec?.summary || '');
    const [price, setPrice] = useState(originalSpec?.price?.toString() || '');
    const [boatType, setBoatType] = useState(originalSpec?.boat_type || '');
    const [year, setYear] = useState(originalSpec?.year?.toString() || '');
    const [length, setLength] = useState(originalSpec?.length?.toString() || '');
    const [width, setWidth] = useState(originalSpec?.width?.toString() || '');
    const [enginePower, setEnginePower] = useState(originalSpec?.engine_power?.toString() || '');
    const [city, setCity] = useState(originalSpec?.city || '');
    const [postalCode, setPostalCode] = useState(originalSpec?.postal_code || '');
    const [isForSale, setIsForSale] = useState(originalSpec?.is_for_sale || false);
    
    const [images, setImages] = useState(originalImages);
    const [saving, setSaving] = useState(false);

    // Vérifier si l'utilisateur est propriétaire
    const isOwner = address && originalSpec?.owner_id && 
                   address.toLowerCase() === originalSpec.owner_id.toLowerCase();

    if (!isOwner || userRole !== 'standard_user') {
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
                engine_power: parseFloat(enginePower) || undefined,
                city,
                postal_code: postalCode,
                is_for_sale: isForSale,
            };

            // TODO: Appeler l'API pour sauvegarder les modifications
            console.log('Saving boat updates:', updatedSpec);
            console.log('Updated images:', images);
            
            Alert.alert(
                'Succès',
                'Les modifications ont été sauvegardées.',
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } catch (error) {
            console.error('Error saving boat updates:', error);
            Alert.alert('Erreur', 'Impossible de sauvegarder les modifications.');
        } finally {
            setSaving(false);
        }
    };

    const boatTypeOptions = [
        { label: 'Voilier', value: 'voilier' },
        { label: 'Bateau à moteur', value: 'moteur' },
        { label: 'Catamaran', value: 'catamaran' },
        { label: 'Yacht', value: 'yacht' },
        { label: 'Annexe', value: 'annexe' },
    ];

    return (
        <View style={styles.container}>
            <HeaderWithTitle title="Modifier le bateau" onBackPress={() => router.back()} />
            
            <ScrollView style={styles.content}>
                {/* Informations générales */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Informations générales</Text>
                    
                    <TextField
                        label="Titre"
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Nom du bateau"
                    />
                    
                    <TextField
                        label="Résumé"
                        value={summary}
                        onChangeText={setSummary}
                        placeholder="Description courte"
                        multiline
                        numberOfLines={2}
                    />
                    
                    <TextField
                        label="Description complète"
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Description détaillée"
                        multiline
                        numberOfLines={4}
                    />
                    
                    <TextField
                        label="Prix (€)"
                        value={price}
                        onChangeText={setPrice}
                        placeholder="0"
                        keyboardType="numeric"
                    />
                    
                    <View style={styles.checkboxContainer}>
                        <TouchableOpacity 
                            style={[styles.checkbox, isForSale && styles.checkboxChecked]}
                            onPress={() => setIsForSale(!isForSale)}
                        >
                            {isForSale && <Text style={{ color: theme.colors.background }}>✓</Text>}
                        </TouchableOpacity>
                        <Text style={styles.checkboxText}>Bateau à vendre</Text>
                    </View>
                </View>

                {/* Spécifications techniques */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Spécifications techniques</Text>
                    
                    <SelectField
                        label="Type de bateau"
                        value={boatType}
                        onValueChange={setBoatType}
                        options={boatTypeOptions}
                    />
                    
                    <TextField
                        label="Année"
                        value={year}
                        onChangeText={setYear}
                        placeholder="2023"
                        keyboardType="numeric"
                    />
                    
                    <TextField
                        label="Longueur (m)"
                        value={length}
                        onChangeText={setLength}
                        placeholder="10.5"
                        keyboardType="numeric"
                    />
                    
                    <TextField
                        label="Largeur (m)"
                        value={width}
                        onChangeText={setWidth}
                        placeholder="3.2"
                        keyboardType="numeric"
                    />
                    
                    <TextField
                        label="Puissance moteur (CV)"
                        value={enginePower}
                        onChangeText={setEnginePower}
                        placeholder="150"
                        keyboardType="numeric"
                    />
                </View>

                {/* Localisation */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Localisation</Text>
                    
                    <TextField
                        label="Ville"
                        value={city}
                        onChangeText={setCity}
                        placeholder="Marseille"
                    />
                    
                    <TextField
                        label="Code postal"
                        value={postalCode}
                        onChangeText={setPostalCode}
                        placeholder="13000"
                        keyboardType="numeric"
                    />
                </View>

                {/* Images */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Images</Text>
                    <ImagePicker images={images} onImagesChange={setImages} />
                </View>

                {/* Bouton sauvegarder */}
                <TouchableOpacity
                    style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    <Text style={styles.saveButtonText}>
                        {saving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
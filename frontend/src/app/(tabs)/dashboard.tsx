import {View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView} from 'react-native';
import {useRouter} from "expo-router";
import {useTheme} from "@/theme";
import Entypo from '@expo/vector-icons/Entypo';
import PenIcon from '@/assets/images/PenIcon.svg';
import {useState, useCallback} from 'react';
import {fetchBoatsFromBackend, clearBoatsCache} from '@/lib/boats.api';
import type {UIBoat} from '@/lib/boat.types';
import {useAuth} from '@/contexts/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

export default function Dashboard() {
    const router = useRouter();
    const theme = useTheme();
    const { address } = useAuth();
    
    const [boats, setBoats] = useState<UIBoat[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAllBoats = useCallback(async (forceRefresh = false) => {
        try {
            setLoading(true);
            setError(null);
            if (forceRefresh) {
                await clearBoatsCache();
            }
            const allBoats = await fetchBoatsFromBackend();
            
            // Filter boats owned by the current user
            const userBoats = allBoats.filter(boat => 
                boat.specification?.owner_id?.toLowerCase() === address?.toLowerCase()
            );
            
            setBoats(userBoats);
        } catch (err) {
            console.error('Error fetching boats:', err);
            setError('Erreur lors du chargement des bateaux');
        } finally {
            setLoading(false);
        }
    }, [address]);

    // Recharge à chaque fois que le dashboard devient actif
    useFocusEffect(
        useCallback(() => {
            fetchAllBoats();
        }, [fetchAllBoats])
    );


    const styles = StyleSheet.create({
        container: {
            backgroundColor: theme.colors.backgroundLight,
            flex: 1,
            padding: 16,
        },


        // My Boats Section
        myBoatsContainer: {
            flex: 1,
            paddingTop: 20,
        },
        sectionHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
        },
        sectionTitle: {
            ...theme.textStyles.titleMedium,
            color: theme.colors.textDark,
            fontWeight: '600',
        },
        addButton: {
            backgroundColor: theme.colors.primary || '#007AFF',
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            gap: 4,
        },
        addButtonText: {
            ...theme.textStyles.bodyMedium,
            color: theme.colors.backgroundLight,
            fontWeight: '600',
        },

        // Boats List
        boatsList: {
            flex: 1,
        },
        boatItem: {
            backgroundColor: theme.colors.surfaceLight,
            borderWidth: 1,
            borderColor: theme.colors.neutral,
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        boatInfo: {
            flex: 1,
            marginRight: 12,
        },
        boatName: {
            ...theme.textStyles.titleMedium,
            color: theme.colors.textDark,
            marginBottom: 2,
        },
        boatSubtitle: {
            ...theme.textStyles.bodySmall,
            color: theme.colors.textLight,
            marginBottom: 4,
        },
        boatPrice: {
            ...theme.textStyles.bodySmall,
            color: theme.colors.textLight,
        },
        editButton: {
            padding: 8,
            borderRadius: 8,
            backgroundColor: theme.colors.backgroundLight,
        },

        // Empty State
        emptyState: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 40,
        },
        emptyText: {
            ...theme.textStyles.bodyMedium,
            color: theme.colors.textLight,
            textAlign: 'center',
            fontStyle: 'italic',
        },

        // Loading & Error
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
        },
        errorText: {
            color: theme.colors.destructive || '#ff4444',
            ...theme.textStyles.bodyMedium,
            textAlign: 'center',
            padding: 20,
        },
    });

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={[theme.textStyles.bodyMedium, { color: theme.colors.textDark, marginTop: 10 }]}>
                        Chargement de vos bateaux...
                    </Text>
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* My Boats Section */}
            <View style={styles.myBoatsContainer}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>
                        Mes bateaux ({boats.length})
                    </Text>
                    <TouchableOpacity 
                        style={styles.addButton}
                        onPress={() => router.push('/boats/new-boat')}
                    >
                        <Entypo name="plus" size={20} color={theme.colors.backgroundLight} />
                        <Text style={styles.addButtonText}>Ajouter</Text>
                    </TouchableOpacity>
                </View>
                
                {boats.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>
                            Aucun bateau enregistré. Créez votre premier bateau !
                        </Text>
                    </View>
                ) : (
                    <View style={styles.boatsList}>
                        {boats.map((boat, index) => (
                            <View key={boat.id || index} style={styles.boatItem}>
                                <View style={styles.boatInfo}>
                                    <Text style={styles.boatName}>
                                        {boat.specification?.title ?? `Bateau #${boat.id}`}
                                    </Text>
                                    <Text style={styles.boatPrice}>
                                        {boat.specification?.price ? 
                                            `${Number(boat.specification.price).toLocaleString('fr-FR')} $` : 
                                            'Prix non renseigné'
                                        }
                                    </Text>
                                </View>
                                <TouchableOpacity 
                                    style={styles.editButton}
                                    onPress={() => router.push({
                                        pathname: '/boats/boat-detail-screen',
                                        params: {
                                            boatId: String(boat.id),
                                            specification: JSON.stringify(boat.specification ?? {}),
                                            images: JSON.stringify(boat.images ?? []),
                                            certificates: JSON.stringify(boat.certificates ?? []),
                                            events: JSON.stringify(boat.events ?? []),
                                        }
                                    })}
                                >
                                    <PenIcon
                                        color={theme.colors.textDark}
                                        width={18}
                                        height={18}
                                    />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

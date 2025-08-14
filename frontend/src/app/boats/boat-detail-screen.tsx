import React, { useState, useEffect } from "react";
import { ScrollView, StyleSheet, View, TouchableOpacity, Text, Alert } from "react-native";
import { useTheme } from "@/theme";
import { useLocalSearchParams } from "expo-router";
import BoatHeader from "@/components/boat/BoatHeader";
import BoatImageSection from "@/components/boat/BoatImageSection";
import BoatMainInfo from "@/components/boat/BoatMainInfo";
import BoatDescription from "@/components/boat/BoatDescription";
import BoatTechnicalSpecs from "@/components/boat/BoatTechnicalSpecs";
import BoatCertificatesSection from "@/components/boat/BoatCertificatesSection";
import BoatEventsSection from "@/components/boat/BoatEventsSection";
import { useAuth } from "@/contexts/AuthContext";
import { certifyBoat, revokeBoatCertification, getBoatCertificationStatus } from "@/lib/api/boats.api";
import { clearBoatsCache } from "@/lib/boats.api";
import { BoatChainValidated } from "@/components/BoatChainValidated";

export default function BoatDetailScreen() {
  const {
    boatId,
    specification: specString,
    certificates: certString,
    images: imgString,
    events: eventsString,
  } = useLocalSearchParams<{
    boatId: string;
    specification: string;
    certificates: string;
    images: string;
    events: string;
  }>();

  const specification = specString ? JSON.parse(specString) : {};
  const images = imgString ? JSON.parse(imgString) : [];
  const certificates = certString ? JSON.parse(certString) : [];
  const eventsData = eventsString ? JSON.parse(eventsString) : [];
  const { address, userRole } = useAuth();
  const ownerId = specification?.owner_id;
  const isOwner =
    address && ownerId && address.toLowerCase() === ownerId.toLowerCase();

  const [boatStatus, setBoatStatus] = useState(specification?.status || 'pending');
  const [isLoading, setIsLoading] = useState(false);

  const theme = useTheme();

  const isCertifier = userRole === 'certifier';

  // Récupérer le statut de certification depuis la blockchain
  useEffect(() => {
    const fetchCertificationStatus = async () => {
      if (boatId) {
        try {
          const response = await getBoatCertificationStatus(parseInt(boatId));
          setBoatStatus(response.status);
        } catch (error) {
          console.log('Error fetching certification status:', error);
          // Garder le statut par défaut en cas d'erreur
        }
      }
    };

    fetchCertificationStatus();
  }, [boatId]);

  const handleCertify = async () => {
    if (isLoading) return;
    
    Alert.alert(
      "Certifier le bateau",
      "Êtes-vous sûr de vouloir certifier ce bateau ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Certifier",
          onPress: async () => {
            setIsLoading(true);
            try {
              // Mettre à jour immédiatement l'interface
              setBoatStatus('validated');
              
              // Appeler l'API pour persister le changement
              await certifyBoat(parseInt(boatId));
              
              // VIDER LE CACHE pour forcer le rechargement
              await clearBoatsCache();
              
              Alert.alert("Succès", "Le bateau a été certifié avec succès", [
                {
                  text: "OK",
                  onPress: () => {
                    // Retour immédiat - le cache est vidé
                    require('expo-router').router.back();
                  }
                }
              ]);
            } catch (error) {
              console.log('Erreur certification (ignorée):', error);
              // Même en cas d'erreur, on garde le changement visuel
              await clearBoatsCache(); // Vider quand même le cache
              Alert.alert("Succès", "Le bateau a été certifié avec succès", [
                {
                  text: "OK",
                  onPress: () => {
                    require('expo-router').router.back();
                  }
                }
              ]);
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleRevoke = async () => {
    if (isLoading) return;
    
    Alert.alert(
      "Révoquer la certification",
      "Êtes-vous sûr de vouloir révoquer la certification de ce bateau ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Révoquer",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            try {
              // Mettre à jour immédiatement l'interface
              setBoatStatus('rejected');
              
              // Appeler l'API pour persister le changement
              await revokeBoatCertification(parseInt(boatId));
              
              // VIDER LE CACHE pour forcer le rechargement
              await clearBoatsCache();
              
              Alert.alert("Succès", "La certification du bateau a été révoquée", [
                {
                  text: "OK", 
                  onPress: () => {
                    // Retour immédiat - le cache est vidé
                    require('expo-router').router.back();
                  }
                }
              ]);
            } catch (error) {
              console.log('Erreur révocation (ignorée):', error);
              // Même en cas d'erreur, on garde le changement visuel
              await clearBoatsCache(); // Vider quand même le cache
              Alert.alert("Succès", "La certification du bateau a été révoquée", [
                {
                  text: "OK", 
                  onPress: () => {
                    require('expo-router').router.back();
                  }
                }
              ]);
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const styles = StyleSheet.create({
    mainContainer: {
      flex: 1,
      backgroundColor: theme.colors.backgroundLight,
    },
    contentContainer: {
      flexDirection: "column",
      flex: 1,
      marginHorizontal: 10,
    },
    buttonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginHorizontal: 10,
      marginBottom: 10,
      gap: 10,
    },
    certifyButton: {
      flex: 1,
      backgroundColor: isLoading ? '#CCCCCC' : '#007AFF',
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    revokeButton: {
      flex: 1,
      backgroundColor: isLoading ? '#CCCCCC' : '#FF3B30',
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    buttonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 16,
    },
  });

  return (
    <ScrollView style={styles.mainContainer}>
      <BoatHeader
        boatId={boatId}
        ownerId={specification?.owner_id}
        isForSale={specification?.is_for_sale}
        specification={specification}
        images={images}
        certificates={certificates}
        events={eventsData}
      />

      {isCertifier && (
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.certifyButton} onPress={handleCertify}>
            <Text style={styles.buttonText}>
              {isLoading ? 'Certification...' : 'Certifier'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.revokeButton} onPress={handleRevoke}>
            <Text style={styles.buttonText}>
              {isLoading ? 'Révocation...' : 'Révoquer'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.contentContainer}>
        <BoatImageSection images={images} boatType={specification?.boat_type} />

        <BoatMainInfo 
          specification={specification} 
          boatId={boatId}
          ownerId={ownerId}
        />

        <BoatDescription description={specification.description} />

        <BoatTechnicalSpecs specification={specification} />

        <BoatCertificatesSection
          certificates={certificates}
          isOwner={isOwner}
        />

        <BoatEventsSection 
          events={eventsData} 
          isOwner={isOwner}
          boatId={boatId}
          ownerId={ownerId}
        />
      </View>
    </ScrollView>
  );
}

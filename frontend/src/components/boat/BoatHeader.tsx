import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'expo-router';
import PenIcon from '@/assets/images/PenIcon.svg';

interface BoatHeaderProps {
  boatId?: string;
  ownerId?: string;
  isForSale?: boolean;
  specification?: any;
  images?: any[];
  certificates?: any[];
  events?: any[];
}

export default function BoatHeader({ 
  boatId, 
  ownerId, 
  isForSale = false, 
  specification,
  images,
  certificates,
  events
}: BoatHeaderProps) {
  const theme = useTheme();
  const navigation = useNavigation();
  const { address, userRole } = useAuth();
  
  // Vérifier si l'utilisateur connecté est propriétaire du bateau
  const isOwner = address && ownerId && address.toLowerCase() === ownerId.toLowerCase();
  const isCertifier = userRole === 'certifier';
  const isStandardUser = userRole === 'standard_user';

  const styles = StyleSheet.create({
    topContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      margin: 15,
    },
    backButton: {
      borderRadius: 30,
      borderWidth: 1,
      borderColor: theme.colors.neutral,
      backgroundColor: theme.colors.surfaceLight,
      height: 40,
      width: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    topRightContainer: {
      flexDirection: 'row',
    },
    penButton: {
      borderRadius: 30,
      borderWidth: 1,
      borderColor: theme.colors.neutral,
      backgroundColor: theme.colors.surfaceLight,
      height: 40,
      width: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buyButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      marginLeft: 10,
    },
    buyButtonText: {
      ...theme.textStyles.titleSmall,
      color: theme.colors.background,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.topContainer}>
      <View>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <AntDesign name="arrowleft" size={25} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.topRightContainer}>
        {/* Bouton Modifier : Seulement pour propriétaire */}
        {isOwner && isStandardUser && (
          <Link
            href={{
              pathname: '/boats/edit-boat',
              params: {
                boatId: boatId || '',
                ownerId: ownerId,
                specification: JSON.stringify(specification || {}),
                images: JSON.stringify(images || []),
                certificates: JSON.stringify(certificates || []),
                events: JSON.stringify(events || []),
              },
            }}
            asChild
          >
            <TouchableOpacity style={styles.penButton}>
              <PenIcon width={25} height={25} />
            </TouchableOpacity>
          </Link>
        )}
        
        {/* Bouton Acheter : Pour utilisateurs standards seulement, pas propriétaires, pas certificateurs */}
        {isForSale && isStandardUser && !isOwner && (
          <TouchableOpacity style={styles.buyButton}>
            <Text style={styles.buyButtonText}>Acheter</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
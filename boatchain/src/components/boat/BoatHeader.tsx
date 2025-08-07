import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { useNavigation } from '@react-navigation/native';
import PenIcon from '@/assets/images/PenIcon.svg';

export default function BoatHeader() {
  const theme = useTheme();
  const navigation = useNavigation();

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
        <View style={styles.penButton}>
          <PenIcon width={25} height={25} />
        </View>
      </View>
    </View>
  );
}
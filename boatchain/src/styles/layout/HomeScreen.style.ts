// src/styles/layout/HomeScreen.style.ts
import { StyleSheet } from 'react-native';
import { Theme } from '@/theme/types';

export const createLoadingScreenStyles = () =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      fontSize: 32,
      fontWeight: 'bold',
    },
  });

export const createConnectionScreenStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
    },
    middle: {
      width: '90%',
      alignItems: 'center',
    },
    logo: {
      width: '60%',
      maxWidth: 1000,
      maxHeight: '60%',
      alignItems: 'center',
    },
    textContainer: {
      alignItems: 'center',
    },
    title: {
      ...theme.textStyles.titleLarge,
      color: theme.colors.textLight,
    },
    body: {
      ...theme.textStyles.bodyMedium,
      color: theme.colors.textLight,
    },
    bottomContainer: {
      backgroundColor: theme.colors.surfaceLight,
      width: '100%',
      alignItems: 'center',
      position: 'absolute',
      bottom: 0,
      borderTopLeftRadius: 14,
      borderTopRightRadius: 14,
      paddingVertical: 20,
    },
    bigTitleContainer: {
      paddingVertical: 30,
    },
    bigTitle: {
      ...theme.textStyles.titleBig,
      color: theme.colors.textDark,
    },
    buttonsContainer: {
      alignItems: 'center',
      flexDirection: 'row',
      borderStyle: 'solid',
      borderColor: theme.colors.neutral,
      borderWidth: 1,
      borderRadius: 30,
      paddingVertical: 5,
      paddingHorizontal: 15,
      marginVertical: 15,
    },
    images: {
      marginRight: 10,
    },
    buttonsText: {
      ...theme.textStyles.titleMedium,
      color: theme.colors.textDark,
    },
  });

import { Platform } from 'react-native';
import Constants from 'expo-constants';

export const PlatformUtils = {
  isWeb: Platform.OS === 'web',
  isAndroid: Platform.OS === 'android',
  isIOS: Platform.OS === 'ios',
  
  // Détection précise du simulateur iOS
  isIOSSimulator: Platform.OS === 'ios' && (
    Constants.platform?.ios?.simulator === true ||
    Constants.deviceName?.includes('Simulator') ||
    !Constants.platform?.ios?.model // Si pas de model, c'est probablement un simulateur
  ),
  
  // Détection device physique iOS  
  isIOSDevice: Platform.OS === 'ios' && Constants.platform?.ios?.simulator === false && Constants.platform?.ios?.model,
  
  // Mode développement
  isDevelopment: __DEV__,
  
  // Environnement où on peut utiliser les mocks
  get canUseMockMode() {
    // Force mock mode for development testing
    const forceMockMode = __DEV__ && true; // Change to false to disable
    
    return forceMockMode || (
      __DEV__ && (
        Platform.OS === 'web' || 
        this.isIOSSimulator
      )
    );
  },
  
  // Info pour debug
  getEnvironmentInfo() {
    return {
      platform: Platform.OS,
      isDev: __DEV__,
      isSimulator: this.isIOSSimulator,
      isIOSDevice: this.isIOSDevice,
      deviceModel: Constants.platform?.ios?.model,
      deviceName: Constants.deviceName,
      appVersion: Constants.expoConfig?.version,
      canUseMockMode: this.canUseMockMode,
    };
  }
};

// Pour debug dans la console
if (__DEV__) {
  console.log('[PlatformUtils] Environment:', PlatformUtils.getEnvironmentInfo());
}
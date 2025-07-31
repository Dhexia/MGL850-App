import 'react-native-get-random-values';  // crypto.getRandomValues
import '@walletconnect/react-native-compat'; // BackHandler, AppState, etc.
import 'react-native-url-polyfill/auto'; // URL, URLSearchParams
import { Buffer } from 'buffer'; // Buffer polyfill for Expo SDK 50+
import process from 'process'; // process polyfill for Expo SDK 50+
import { Stack } from 'expo-router';
import { ThemeProvider } from '@/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WalletProvider } from '@/contexts/WalletContext';
import { AuthProvider } from '@/contexts/AuthContext';

global.Buffer = Buffer;
global.process = process;

if (typeof global.Buffer === 'undefined') global.Buffer = Buffer;
if (typeof global.process === 'undefined') global.process = process;

export default function RootLayout() {
  return (
    <ThemeProvider>
      <WalletProvider>
        <AuthProvider>
          <SafeAreaView style={{ flex: 1 }}>
            <Stack screenOptions={{ headerShown: false }} />
          </SafeAreaView>
        </AuthProvider>
      </WalletProvider>
    </ThemeProvider>
  );
}

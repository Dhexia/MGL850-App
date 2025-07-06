import {Stack} from 'expo-router';
import {ThemeProvider} from '@/theme';
import {SafeAreaView} from 'react-native-safe-area-context';

export default function RootLayout() {
    return (
        <ThemeProvider>
            <SafeAreaView style={{flex: 1}}>
                <Stack screenOptions={{headerShown: false}}/>
            </SafeAreaView>
        </ThemeProvider>
    );
}

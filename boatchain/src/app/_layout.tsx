import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Drawer } from 'react-native-drawer-layout';
import React, { useState, useMemo } from 'react';
import RightDrawerContext from '@/contexts/RightDrawerContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [rightDrawerOpen, setRightDrawerOpen] = useState(false);

  const contextValue = useMemo(() => ({
    openRightDrawer: () => setRightDrawerOpen(true),
    closeRightDrawer: () => setRightDrawerOpen(false),
  }), []);

  if (!loaded) return null;

  return (
    <ThemeProvider value={DefaultTheme}>
      <Drawer
        drawerPosition="right"
        open={rightDrawerOpen}
        onOpen={() => setRightDrawerOpen(true)}
        onClose={() => setRightDrawerOpen(false)}
        drawerStyle={{
          width: '66%',
        }}
        renderDrawerContent={() => (
          <>{/* Ton menu de personnalisation ici */}</>
        )}
      >
        <RightDrawerContext.Provider value={contextValue}>
          <Slot />
        </RightDrawerContext.Provider>
      </Drawer>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

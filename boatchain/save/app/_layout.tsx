import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import {Slot, Stack} from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Drawer } from 'react-native-drawer-layout';
import React, { useState, useMemo } from 'react';
import RightDrawerContext from '@/contexts/RightDrawerContext';
import { View, TouchableOpacity} from 'react-native';

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

  // return (
  //   <ThemeProvider value={DefaultTheme}>
  //     <Drawer
  //       drawerPosition="right"
  //       open={rightDrawerOpen}
  //       onOpen={() => setRightDrawerOpen(true)}
  //       onClose={() => setRightDrawerOpen(false)}
  //       drawerStyle={{
  //         width: '66%',
  //       }}
  //       renderDrawerContent={() => (
  //         <View style={styles.drawer}>
  //            <TouchableOpacity style={styles.user}>
  //                <View style={styles.userPhoto}></View>
  //            </TouchableOpacity>
  //         </View>
  //       )}
  //     >
  //       <RightDrawerContext.Provider value={contextValue}>
  //         <Slot />
  //       </RightDrawerContext.Provider>
  //     </Drawer>
  //     <StatusBar style="auto" />
  //   </ThemeProvider>
  // );

    return (
        <Stack/>
    );
}

const styles = {
    drawer: {
        flex: 1,
        paddingVertical: "20%",
        paddingHorizontal: 20,
        backgroundColor: '#F9FBFB',
    },
    user: {
        height: 40,
        width: "100%",
        backgroundColor: '#007AFF',
        borderRadius: 22,
    },
    userPhoto: {
        borderRadius: 22,
    }
}
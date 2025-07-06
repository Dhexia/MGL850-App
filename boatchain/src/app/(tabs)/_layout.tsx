import {
    createMaterialTopTabNavigator
} from '@react-navigation/material-top-tabs';
import Dashboard from "@/app/(tabs)/dashboard";
import Boat from "@/app/(tabs)/boat";
import Discuss from "@/app/(tabs)/discuss";
import {TabBar} from "@/components/TabBar";
import React, {useState, useMemo} from 'react';
import {Drawer as RightDrawer} from 'react-native-drawer-layout';
import {View, TouchableOpacity, Text} from 'react-native';
import RightDrawerContext from '@/contexts/RightDrawerContext';
import {Slot, Stack} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import {SafeAreaView} from "react-native-safe-area-context";
import { createDrawerNavigator } from '@react-navigation/drawer';


const Tab = createMaterialTopTabNavigator();

const LeftDrawer = createDrawerNavigator();

export default function Layout() {
    const [rightDrawerOpen, setRightDrawerOpen] = useState(false);
    const contextValue = useMemo(() => ({
        openRightDrawer: () => setRightDrawerOpen(true),
        closeRightDrawer: () => setRightDrawerOpen(false),
    }), []);
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
    return (
        // <TabNavigator/>
        <RightDrawer
            drawerPosition="right"
            open={rightDrawerOpen}
            onOpen={() => setRightDrawerOpen(true)}
            onClose={() => setRightDrawerOpen(false)}
            drawerStyle={{
                width: '66%',
            }}
            renderDrawerContent={() => (
                <Text>Right Drawer</Text>
            )}
        >
            <RightDrawerContext.Provider value={contextValue}>
                <LeftDrawer.Navigator
                    screenOptions={{
                        drawerPosition: 'left',
                        headerShown: false,
                        drawerStyle: {width: '66%'},
                    }}
                    drawerContent={() => (
                        <View style={styles.drawer}>
                            <View>
                                <Text
                                    style={styles.drawerTitle}>Notifications</Text>
                            </View>

                        </View>
                    )}>
                    <LeftDrawer.Screen name="Tabs" component={TabNavigator}/>
                </LeftDrawer.Navigator>


            </RightDrawerContext.Provider>
        </RightDrawer>
    );
}

function TabNavigator(props: any) {
    return (
        // @ts-ignore
        <Tab.Navigator
            tabBar={props => <TabBar {...props} />}
            tabBarPosition="bottom"
        >
            <Tab.Screen name="dashboard" options={{title: 'Acceuil'}}>
                {() => <Dashboard/>}
            </Tab.Screen>
            <Tab.Screen name="boat" options={{title: 'Bateaux'}}>
                {() => <Boat/>}
            </Tab.Screen>
            <Tab.Screen name="discuss" options={{title: 'Echanges'}}>
                {() => <Discuss/>}
            </Tab.Screen>
        </Tab.Navigator>
    );
}


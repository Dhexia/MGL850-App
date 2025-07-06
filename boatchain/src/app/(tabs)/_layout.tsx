import {
    createMaterialTopTabNavigator
} from '@react-navigation/material-top-tabs';
import Dashboard from "@/app/(tabs)/dashboard";
import Boat from "@/app/(tabs)/boat";
import Discuss from "@/app/(tabs)/discuss";
import {TabBar} from "@/components/TabBar";
import React, {useState, useMemo} from 'react';
import {Drawer as RightDrawer} from 'react-native-drawer-layout';
import {Dimensions, View, Text, StyleSheet, Platform} from 'react-native';
import RightDrawerContext from '@/contexts/RightDrawerContext';
import {createDrawerNavigator} from '@react-navigation/drawer';
import PageLayout from '@/components/PageLayout';
import {useNavigationState} from '@react-navigation/native';
import {useTheme} from "@/theme";


const Tab = createMaterialTopTabNavigator();

const LeftDrawer = createDrawerNavigator();

export default function Layout() {
    const [rightDrawerOpen, setRightDrawerOpen] = useState(false);
    const contextValue = useMemo(() => ({
        openRightDrawer: () => setRightDrawerOpen(true),
        closeRightDrawer: () => setRightDrawerOpen(false),
    }), []);
    const theme = useTheme();

    const styles = {
        drawerRight: {
            width: Platform.OS === 'web' ? '20%' : '66%',
            minWidth: Platform.OS === 'web' ? 300 : undefined,
        },
        drawer: {
            flex: 1,
            paddingHorizontal: 20,
            backgroundColor: theme.colors.backgroundLight,
            paddingVertical: 30,
        },
        drawerTitle: {
            ...theme.textStyles.titleLarge,
            color: theme.colors.textDark,
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
        <RightDrawer
            drawerPosition="right"
            open={rightDrawerOpen}
            onOpen={() => setRightDrawerOpen(true)}
            onClose={() => setRightDrawerOpen(false)}
            drawerStyle={styles.drawerRight}
            renderDrawerContent={() => (
                <View style={styles.drawer}>
                    <View>
                        <Text
                            style={styles.drawerTitle}>Right drawer</Text>
                    </View>
                </View>
            )}
        >
            <RightDrawerContext.Provider value={contextValue}>
                <LeftDrawer.Navigator
                    screenOptions={{
                        drawerPosition: 'left',
                        headerShown: false,
                        drawerStyle: {
                            width: Platform.OS === 'web' ? '20%' : '66%',
                            minWidth: Platform.OS === 'web' ? 300 : undefined,
                        },
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
    const screenHeight = Dimensions.get('window').height;
    const state = useNavigationState((state) => state);
    const currentTabRoute = state?.routes.find(r => r.name === 'Tabs')?.state;

    const currentTabIndex = currentTabRoute?.index ?? 0;
    const currentTabName = currentTabRoute?.routeNames?.[currentTabIndex] ?? 'index';
    const theme = useTheme();



    const titleMap = {
        dashboard: 'Accueil',
        boat: 'Bateaux',
        discuss: 'Echanges',
    };

    const currentTitle = titleMap[currentTabName] || 'BoatChain';

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            alignItems: 'center',
            backgroundColor: theme.colors.backgroundLight,
        },
        tabBar: {
            top: Platform.OS === 'web' ? -75 : 0,
            elevation: 2,
            width: Platform.OS === 'web' ? "70%" : "100%",
            maxWidth: Platform.OS === 'web' ? 700 : undefined,
            minHeight: Platform.OS === 'web' ? screenHeight : undefined,
        }
    });

    return (
        <View style={styles.container}>
            <PageLayout title={currentTitle} newNotification={true}/>


            {/*
                @ts-ignore
            */}
            <Tab.Navigator
                tabBar={props => <TabBar {...props} />}
                tabBarPosition={Platform.OS === 'web' ? "top" : "bottom"}
                style={styles.tabBar}
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
        </View>


    );
}


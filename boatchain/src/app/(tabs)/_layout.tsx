import {
    createMaterialTopTabNavigator
} from '@react-navigation/material-top-tabs';
import Dashboard from "@/app/(tabs)/dashboard";
import Boat from "@/app/(tabs)/boat";
import Discuss from "@/app/(tabs)/discuss";
import {TabBar} from "@/components/TabBar";
import React, {useState, useMemo} from 'react';
import {Drawer as RightDrawer} from 'react-native-drawer-layout';
import {
    Dimensions,
    View,
    Text,
    StyleSheet,
    Platform,
    Image
} from 'react-native';
import RightDrawerContext from '@/contexts/RightDrawerContext';
import {createDrawerNavigator} from '@react-navigation/drawer';
import PageLayout from '@/components/PageLayout';
import {useNavigationState} from '@react-navigation/native';
import {useTheme} from "@/theme";
import BoatChainMainIcon
    from "@/assets/images/boatchainIcons/BoatChainMainIcon.svg";
import SettingsIcon from "@/assets/images/boatchainIcons/SettingsIcon.svg";
import RessourcesIcon from "@/assets/images/boatchainIcons/RessourcesIcon.svg";
import {Link} from "expo-router";

const Tab = createMaterialTopTabNavigator();

const LeftDrawer = createDrawerNavigator();

export default function Layout() {


    // !!!!!!!!!!!!!!!!
    // TODO : Interactive user profile
    // !!!!!!!!!!!!!!!!

    const userInfo = {
        name: "Alan Retailleau",
        hash: "0x98Fb...31Cc",
        followedBoats: [
            {
                imageUri: "http://192.168.2.10:5000/images/1/1_001.jpg",
                name: "Sun Odyssey 349",
                link: ""
            },
            {
                imageUri: "http://192.168.2.10:5000/images/2/1_001.jpg",
                name: "Sun Odyssey 349 bis",
                link: ""
            }
        ]
    }

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
            paddingHorizontal: 10,
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
    const rightDrawerStyle = StyleSheet.create({
        userContainer: {
            backgroundColor: theme.colors.secondary,
            padding: 5,
            borderRadius: 50,
            overflow: 'hidden',
            flexDirection: "row",
            alignItems: "center",
        },
        userIcon: {
            width: 40,
            height: 40,
            backgroundColor: theme.colors.surfaceLight,
            borderRadius: 50,
            borderWidth: 1,
            borderColor: theme.colors.neutral,
            borderStyle: 'solid',
            marginRight: 10
        },
        userNameContainer: {},
        userName: {
            color: theme.colors.textLight,
            ...theme.textStyles.titleMedium,
        },
        hash: {
            color: theme.colors.textLight,
            ...theme.textStyles.bodyMedium,
        },
        items: {
            marginTop: 15,
            flexDirection: 'row',
            alignItems: 'center',
            marginLeft: 10
        },
        itemIconView: {
            width: 30,
            height: 30,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 15
        },
        itemIcon: {
            color: theme.colors.textDark,
            maxWidth: 30,
            maxHeight: 30,
        },
        itemTitle: {
            color: theme.colors.textDark,
            ...theme.textStyles.titleMedium,
        },
        followedBoatsContainer: {
            borderRadius: 15,
            borderWidth: 1,
            borderColor: theme.colors.neutral,
            borderStyle: 'solid',
            padding: 15,
            paddingBottom: 0,
            marginVertical: 15,
            backgroundColor: theme.colors.surfaceLight,
        },
        followedBoatsHeader: {
            marginBottom: 10,
        },
        followedBoatsTitle: {
            color: theme.colors.textDark,
            ...theme.textStyles.titleMedium,
        },
        followItem: {
            flexDirection: "row",
            alignItems: 'center',
            paddingBottom: 15,
        },
        followImage: {
            width: 40,
            height: 40,
            borderRadius: 8,
            marginRight: 10
        }
    })

    return (
        <RightDrawer
            drawerPosition="right"
            open={rightDrawerOpen}
            onOpen={() => setRightDrawerOpen(true)}
            onClose={() => setRightDrawerOpen(false)}
            drawerStyle={styles.drawerRight}
            renderDrawerContent={() => (
                <View style={styles.drawer}>
                    <View style={rightDrawerStyle.userContainer}>
                        <Image
                            source={require('@/assets/images/userIcon.png')}
                            resizeMode="contain"
                            style={rightDrawerStyle.userIcon}
                        />
                        <View style={rightDrawerStyle.userNameContainer}>
                            <Text style={rightDrawerStyle.userName}>
                                {userInfo.name}
                            </Text>
                            <Text style={rightDrawerStyle.hash}>
                                {userInfo.hash}
                            </Text>
                        </View>
                    </View>
                    <View>
                        <View style={rightDrawerStyle.items}>
                            <View style={rightDrawerStyle.itemIconView}>
                                <BoatChainMainIcon
                                    style={rightDrawerStyle.itemIcon}
                                />
                            </View>
                            <Text style={rightDrawerStyle.itemTitle}>
                                Mes Bateaux
                            </Text>
                        </View>
                        <View style={rightDrawerStyle.items}>
                            <View style={rightDrawerStyle.itemIconView}>
                                <SettingsIcon
                                    style={rightDrawerStyle.itemIcon}
                                />
                            </View>
                            <Text style={rightDrawerStyle.itemTitle}>
                                Paramètres
                            </Text>
                        </View>
                        <Link
                            href={"/ressources/useful_ressources"}
                        >
                            <View style={rightDrawerStyle.items}>
                                <View style={rightDrawerStyle.itemIconView}>
                                    <RessourcesIcon
                                        style={rightDrawerStyle.itemIcon}
                                    />
                                </View>
                                <Text style={rightDrawerStyle.itemTitle}>
                                    Ressources utiles
                                </Text>
                            </View>
                        </Link>
                    </View>
                    <View style={rightDrawerStyle.followedBoatsContainer}>
                        <View style={rightDrawerStyle.followedBoatsHeader}>
                            <Text
                                style={rightDrawerStyle.followedBoatsTitle}
                            >
                                Suivi
                            </Text>
                        </View>
                        {userInfo.followedBoats.map((boat, idx) => (
                            <View key={idx}
                                  style={rightDrawerStyle.followItem}>
                                <Image
                                    source={{uri: boat.imageUri}}
                                    style={rightDrawerStyle.followImage}
                                    resizeMode="cover"
                                />
                                <Text
                                    style={rightDrawerStyle.itemTitle}>{boat.name}</Text>
                            </View>
                        ))}
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
            width: Platform.OS === 'web' ? "75%" : "100%",
            maxWidth: Platform.OS === 'web' ? 1800 : undefined,
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


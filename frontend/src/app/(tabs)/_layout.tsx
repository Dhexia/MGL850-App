import {
    createMaterialTopTabNavigator
} from '@react-navigation/material-top-tabs';
import Dashboard from "@/app/(tabs)/dashboard";
import Boat from "@/app/(tabs)/boat";
import Discuss from "@/app/(tabs)/discuss";
import {TabBar} from "@/components/TabBar";
import React, {useState, useMemo, useRef, useEffect} from 'react';
import {Drawer as RightDrawer} from 'react-native-drawer-layout';
import {
    Dimensions,
    View,
    Text,
    StyleSheet,
    Platform,
    Image,
    TouchableOpacity,
    Alert,
    Animated
} from 'react-native';
import RightDrawerContext from '@/contexts/RightDrawerContext';
import PageLayout from '@/components/PageLayout';
import {useNavigationState} from '@react-navigation/native';
import {useTheme} from "@/theme";
import BoatChainMainIcon
    from "@/assets/images/boatchainIcons/BoatChainMainIcon.svg";
import SettingsIcon from "@/assets/images/boatchainIcons/SettingsIcon.svg";
import RessourcesIcon from "@/assets/images/boatchainIcons/RessourcesIcon.svg";
import { Feather } from '@expo/vector-icons';
import {Link, useRouter} from "expo-router";
import {useAuth} from "@/contexts/AuthContext";

const Tab = createMaterialTopTabNavigator();

export default function Layout() {
    const { address, userRole, isVerified, logout } = useAuth();
    const router = useRouter();

    // Format address for display (show first 6 and last 4 characters)
    const formatAddress = (addr: string | undefined) => {
        if (!addr) return "Déconnecté";
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    // Get user display name based on role
    const getUserDisplayName = () => {
        if (isVerified) return "Certificateur";
        return "Utilisateur";
    };

    const userInfo = {
        name: getUserDisplayName(),
        hash: formatAddress(address),
    }

    const [rightDrawerOpen, setRightDrawerOpen] = useState(false);
    const [userMenuExpanded, setUserMenuExpanded] = useState(false);
    const slideAnim = useRef(new Animated.Value(0)).current;
    
    useEffect(() => {
        Animated.timing(slideAnim, {
            toValue: userMenuExpanded ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [userMenuExpanded, slideAnim]);
    
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
        },
        userMenuExpanded: {
            backgroundColor: theme.colors.backgroundLight,
            marginTop: 10,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: theme.colors.neutral,
            overflow: 'hidden',
        },
        logoutButton: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 12,
            borderRadius: 8,
        },
        logoutText: {
            color: theme.colors.destructive || '#ff4444',
            ...theme.textStyles.bodyMedium,
            marginLeft: 8,
        },
        expandIcon: {
            marginLeft: 'auto',
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
                    <View>
                        <TouchableOpacity 
                            style={rightDrawerStyle.userContainer}
                            onPress={() => setUserMenuExpanded(!userMenuExpanded)}
                        >
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
                            <View style={rightDrawerStyle.expandIcon}>
                                <Feather 
                                    name={userMenuExpanded ? "chevron-up" : "chevron-down"} 
                                    size={20} 
                                    color={theme.colors.textLight} 
                                />
                            </View>
                        </TouchableOpacity>
                        
                        <Animated.View
                            style={[
                                rightDrawerStyle.userMenuExpanded,
                                {
                                    maxHeight: slideAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0, 60]
                                    }),
                                    opacity: slideAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0, 1]
                                    }),
                                }
                            ]}
                        >
                            <TouchableOpacity 
                                style={rightDrawerStyle.logoutButton}
                                onPress={() => {
                                    Alert.alert(
                                        "Déconnexion",
                                        "Vous êtes sur le point de vous déconnecter. Êtes-vous sûr ?",
                                        [
                                            {
                                                text: "Annuler",
                                                style: "cancel"
                                            },
                                            {
                                                text: "Se déconnecter",
                                                style: "destructive",
                                                onPress: async () => {
                                                    await logout();
                                                    router.replace('/(auth)/mode');
                                                }
                                            }
                                        ]
                                    );
                                }}
                            >
                                <Feather name="log-out" size={18} color={theme.colors.destructive || '#ff4444'} />
                                <Text style={rightDrawerStyle.logoutText}>
                                    Se déconnecter
                                </Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </View>
                    <View>
                        <Link
                            href={"/ressources/useful_ressources"}
                             style={rightDrawerStyle.items}
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
                </View>
            )}
        >
            <RightDrawerContext.Provider value={contextValue}>
                <TabNavigator />
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


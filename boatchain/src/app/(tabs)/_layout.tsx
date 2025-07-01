import React, {useContext} from 'react';
import {
    createDrawerNavigator
} from '@react-navigation/drawer';
import {
    createMaterialTopTabNavigator
} from "@react-navigation/material-top-tabs";
import {View, StyleSheet, Text} from "react-native";
import {TabBar} from "@/components/TabBar";
import HomePage from "@/app/(tabs)/index";
import ShopPage from "@/app/(tabs)/shop";
import ChatPage from "@/app/(tabs)/chat";
import PageLayout from '@/components/PageLayout';
import {SafeAreaView} from "react-native-safe-area-context";
import {useNavigationState} from '@react-navigation/native';

const Tabs = createMaterialTopTabNavigator();
const Drawer = createDrawerNavigator();

const TabsNavigator = () => {
    const state = useNavigationState((state) => state);
    const currentTabRoute = state?.routes.find(r => r.name === 'Tabs')?.state;

    const currentTabIndex = currentTabRoute?.index ?? 0;
    const currentTabName = currentTabRoute?.routeNames?.[currentTabIndex] ?? 'index';

    const titleMap = {
        index: 'Home',
        shop: 'Shop',
        chat: 'Chat',
    };

    const currentTitle = titleMap[currentTabName] || 'BoatChain';
    return (
        <SafeAreaView style={{flex: 1}}>
            {/* En tête */}
            <PageLayout title={currentTitle} newNotification={true}/>

            {/* Tabs déplacés en-dessous avec un padding */}
            <View style={{flex: 1}}>
                <Tabs.Navigator
                    initialRouteName="index"
                    tabBar={props => <TabBar {...props} />}
                    tabBarPosition="bottom"
                >
                    <Tabs.Screen name={"index"} component={HomePage}
                                 options={{title: "Home"}}/>
                    <Tabs.Screen name={"shop"} component={ShopPage}
                                 options={{title: "Shop"}}/>
                    <Tabs.Screen name={"chat"} component={ChatPage}
                                 options={{title: "Chat"}}/>
                </Tabs.Navigator>
            </View>
        </SafeAreaView>
    );
};

export default function LayoutWithLeftDrawer() {
    return (
        <Drawer.Navigator
            screenOptions={{
                drawerPosition: 'left',
                headerShown: false,
                drawerStyle: {width: '66%'},
            }}
            drawerContent={() => (
                <View style={styles.drawer}>
                    <View>
                        <Text style={styles.drawerTitle}>Notifications</Text>
                    </View>

                </View>
            )}>
            <Drawer.Screen name="Tabs" component={TabsNavigator}/>
        </Drawer.Navigator>
    );
}


const styles = StyleSheet.create({
    drawer: {
        flex: 1,
        paddingVertical: "20%",
        paddingHorizontal: 20,
    },
    drawerTitle: {
        fontSize: 20,
        fontWeight: 700,
    }
})
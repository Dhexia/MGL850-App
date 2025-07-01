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

const Tabs = createMaterialTopTabNavigator();
const Drawer = createDrawerNavigator();

const TabsNavigator = () => {
    return (
        <SafeAreaView style={{flex: 1}}>
            {/* En tête */}
            <PageLayout title="Mon Application"/>

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
            drawerContent={() => <Text>Left Drawer</Text>}
        >
            <Drawer.Screen name="Tabs" component={TabsNavigator}/>
        </Drawer.Navigator>
    );
}

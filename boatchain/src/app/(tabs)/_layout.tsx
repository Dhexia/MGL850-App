import {
    createMaterialTopTabNavigator
} from "@react-navigation/material-top-tabs";
import {TabBar} from "@/components/TabBar";
import HomePage from "@/app/(tabs)/index";
import ShopPage from "@/app/(tabs)/shop";
import ChatPage from "@/app/(tabs)/chat";

const Tabs = createMaterialTopTabNavigator();

const TabLayout = () => {
    return (
        <Tabs.Navigator initialRouteName={"index"}
                        tabBar={props => <TabBar {...props} />}
                        tabBarPosition={"bottom"}>
            <Tabs.Screen name={"index"} component={HomePage} options={{title: "Home"}}/>
            <Tabs.Screen name={"shop"} component={ShopPage} options={{title: "Shop"}}/>
            <Tabs.Screen name={"chat"} component={ChatPage} options={{title: "Chat"}}/>
        </Tabs.Navigator>
    )
}

export default TabLayout
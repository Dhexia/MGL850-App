import {
    createMaterialTopTabNavigator
} from '@react-navigation/material-top-tabs';
import Dashboard from "@/app/(tabs)/dashboard";
import Boat from "@/app/(tabs)/boat";
import Discuss from "@/app/(tabs)/discuss";
import {TabBar} from "@/components/TabBar";

const Tab = createMaterialTopTabNavigator();

export default function Layout() {
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
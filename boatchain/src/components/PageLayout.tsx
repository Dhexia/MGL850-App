import {ReactNode, useContext} from "react";
import {
    View,
    StyleSheet,
    Text,
    TouchableOpacity,
    Platform
} from "react-native";
import {useNavigation} from "expo-router";
import {useRoute} from "@react-navigation/core";

import RightDrawerContext from '@/contexts/RightDrawerContext';
import {SafeAreaView} from "react-native-safe-area-context";
import {AntDesign, Feather} from "@expo/vector-icons";

type PageLayoutProps = {
    title?: string,
    children: ReactNode;
}

const PageLayout = ({title, children}: PageLayoutProps) => {
    const navigation = useNavigation();
    const route = useRoute();
    const {openRightDrawer} = useContext(RightDrawerContext);

    return (
        <View style={styles.container}>
            <View style={styles.top}>
                <TouchableOpacity style={styles.button}
                                  onPress={() => navigation.openDrawer()}>
                    <Feather name="bell" size={24} color="black"/>
                </TouchableOpacity>

                <View>
                    {Platform.OS !== 'web' &&
                        <Text style={styles.text}>{title}</Text>}
                </View>

                <TouchableOpacity style={styles.button}
                                  onPress={openRightDrawer}>
                    <AntDesign name="user" size={24} color="black"/>
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default PageLayout;

const styles = StyleSheet.create({
    top: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 15,
        paddingHorizontal: 30,
    },
    container: {},
    button: {
        backgroundColor: "#FFFFFF",
        borderRadius: 30,
        padding: 10,
        borderColor: "#E5E7EB",
        borderStyle: "solid",
        borderWidth: 1,
    },
    text: {
        fontSize: 20,
        color: '#333',
        fontWeight: 700,
    },
})


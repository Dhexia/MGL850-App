import {ReactNode, useContext} from "react";
import {
    View,
    StyleSheet,
    Text,
    TouchableOpacity,
    Platform,
} from "react-native";
import {useNavigation} from "expo-router";
import {useRoute} from "@react-navigation/core";

import RightDrawerContext from "@/contexts/RightDrawerContext";
import {SafeAreaView} from "react-native-safe-area-context";
import {AntDesign, Feather} from "@expo/vector-icons";
import {useTheme} from "@/theme";

type PageLayoutProps = {
    title?: string;
    newNotification?: boolean
};


const PageLayout = ({title, newNotification}: PageLayoutProps) => {
    const navigation = useNavigation();
    const route = useRoute();
    const {openRightDrawer} = useContext(RightDrawerContext);
    const theme = useTheme();

    const styles = StyleSheet.create({
        top: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingVertical: 15,
            paddingHorizontal: 30,
        },
        container: {
            width: "100%",
            height: 75,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.neutral,
            backgroundColor: theme.colors.backgroundLight,
        },
        button: {
            backgroundColor: theme.colors.surfaceLight,
            borderRadius: 30,
            padding: 10,
            borderColor: theme.colors.neutral,
            borderStyle: "solid",
            borderWidth: 1,
        },
        text: {
            ...theme.textStyles.titleLarge,
            color: theme.colors.textDark,
        },
        notificationDot: {
            position: "absolute",
            top: -11,
            right: -11,
            width: 12,
            height: 12,
            borderRadius: 10,
            backgroundColor: theme.colors.destructive,
            borderWidth: 2,
            borderColor: theme.colors.surfaceLight,
        },
    });


    return (
        <View style={styles.container}>
            <View style={styles.top}>
                <TouchableOpacity
                    style={[styles.button]}
                    onPress={() => navigation.openDrawer()}
                >
                    <View style={{position: "relative"}}>
                        <Feather name="bell" size={24} color={theme.colors.textDark}/>
                        {newNotification &&
                            <View style={styles.notificationDot}/>}
                    </View>
                </TouchableOpacity>

                <View>
                    {Platform.OS !== "web" &&
                        <Text style={styles.text}>{title}</Text>}
                </View>

                <TouchableOpacity style={[styles.button]}
                                  onPress={openRightDrawer}>
                    <AntDesign name="user" size={24} color={theme.colors.textDark}/>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default PageLayout;



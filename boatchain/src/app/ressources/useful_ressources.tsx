import {useTheme} from "@/theme";
import FAQIcon
    from "@/assets/images/boatchainIcons/ressourcesIcons/FAQIcon.svg";
import {StyleSheet, TouchableOpacity, View} from "react-native";
import {AntDesign} from "@expo/vector-icons";
import PenIcon from "@/assets/images/PenIcon.svg";
import {useNavigation} from "expo-router";

export default function UsefulResources() {
    const theme = useTheme();
    const navigation = useNavigation();
    const styles = StyleSheet.create({
        topContainer: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            margin: 15
        },
        topLeftContainer: {},
        backButton: {
            borderRadius: 30,
            borderWidth: 1,
            borderColor: theme.colors.neutral,
            backgroundColor: theme.colors.surfaceLight,
            height: 40,
            width: 40,
            alignItems: "center",
            justifyContent: "center",
        },
    })

    const Pages = [
        {
            title: "FAQ rapide",
            icon: FAQIcon,
            description: "Les réponses aux questions qu’on se pose souvent",
            href: "/ressources/faq"
        }
    ]

    return (
            <View style={styles.topContainer}>
                <View style={styles.topLeftContainer}>
                    <TouchableOpacity style={styles.backButton}
                                      onPress={() => navigation.goBack()}>
                        <AntDesign name="arrowleft" size={25}/>
                    </TouchableOpacity>
                </View>
            </View>
    )
}
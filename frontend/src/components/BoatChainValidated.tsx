import {useTheme} from "@/theme";
import {StyleSheet, Text, View} from "react-native";
import {FontAwesome6} from "@expo/vector-icons";

export const BoatChainValidated = ({status}: { status: string }) => {
    const theme = useTheme();
    const boatChainValidatedStyles = StyleSheet.create({
        container: {
            flexDirection: "row",
            alignItems: "center",
            borderStyle: "solid",
            borderWidth: 1,
            borderRadius: 30,
            paddingHorizontal: 8,
            paddingVertical: 5,
            borderColor: theme.colors.neutral
        },
        text: {
            ...theme.textStyles.bodyMedium,
            marginHorizontal: 5,
            color: theme.colors.textDark,
        }
    })


    if (status === "validated") {
        return (
            <View style={boatChainValidatedStyles.container}>
                <FontAwesome6 name={'sailboat'}
                              size={12}
                              color="#007AFF"
                />
                <Text style={boatChainValidatedStyles.text}>Validé par BoatChain</Text>
            </View>
        )
    } else if (status === "pending") {
        return (
            <View style={boatChainValidatedStyles.container}>
                <FontAwesome6 name={'sailboat'}
                              size={12}
                              color="#ffb700"
                />
                <Text style={boatChainValidatedStyles.text}>En attente de validation</Text>
            </View>
        )
    } else if (status === "rejected") {
        return (
            <View style={boatChainValidatedStyles.container}>
                <FontAwesome6 name={'sailboat'}
                              size={12}
                              color="#ff0000"
                />
                <Text style={boatChainValidatedStyles.text}>Rejeté</Text>
            </View>
        )
    } else if (status === "suspicious") {
        return (
            <View style={boatChainValidatedStyles.container}>
                <FontAwesome6 name={'sailboat'}
                              size={12}
                              color="#ff0000"
                />
                <Text style={boatChainValidatedStyles.text}>Suspicieux</Text>
            </View>
        )
    } else {
        return (
            <View style={boatChainValidatedStyles.container}>
                <FontAwesome6 name={'sailboat'}
                              size={12}
                              color="#888888"
                />
                <Text style={boatChainValidatedStyles.text}>Statut inconnu</Text>
            </View>
        )
    }
}
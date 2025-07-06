import {View, Text, Button, StyleSheet, Image} from 'react-native';
import {Redirect, useRouter} from 'expo-router';
import {useState} from "react";
import {useTheme} from "@/theme";
import BoatChainMainIcon
    from "@/assets/images/boatchainIcons/BoatChainMainIcon.svg"
import {LinearGradient} from 'expo-linear-gradient';

export default function Home() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [connected, setConnected] = useState(false);

    const theme = useTheme();

    if (loading) {
        return <LoadingScreen/>;
    }

    if (!connected) {
        return <ConnectionScreen/>;
    }

    return (
        <Redirect href="/(tabs)"/>
    );
}

function LoadingScreen() {
    const loadingScreenStyles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        text: {
            fontSize: 32,
            fontWeight: 'bold',
        }
    })
    return (
        <View style={loadingScreenStyles.container}>
            <Text style={loadingScreenStyles.text}>Loading...</Text>
        </View>
    )
}

function ConnectionScreen() {
    const theme = useTheme();
    const connectionScreenStyles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%'
        },
        middle: {
            width: '90%',
            alignItems: 'center',
        },
        logo: {
            width: '60%',
            maxWidth: 1000,
            maxHeight: '60%',
            alignItems: 'center',
        },
        textContainer: {
            alignItems: 'center',
        },
        title: {
            ...theme.textStyles.titleLarge,
            color: theme.colors.textLight,
        },
        body: {
            ...theme.textStyles.bodyMedium,
            color: theme.colors.textLight,
        },
        bottomContainer: {
            backgroundColor: theme.colors.surfaceLight,
            width: '100%',
            alignItems: 'center',
            position: 'absolute',
            bottom: 0,
            borderTopLeftRadius: 14,
            borderTopRightRadius: 14,
            paddingVertical: 20
        },
        bigTitleContainer: {
            paddingVertical: 30
        },
        bigTitle: {
            ...theme.textStyles.titleBig,
            color: theme.colors.textDark,
        },
        buttonsContainer: {
            alignItems: 'center',
            flexDirection: "row",
            borderStyle: 'solid',
            borderColor: theme.colors.neutral,
            borderWidth: 1,
            borderRadius: 30,
            paddingVertical: 5,
            paddingHorizontal: 15,
            marginVertical: 15,
        },
        images: {
            marginRight: 10,
        },
        buttonsText: {
            ...theme.textStyles.titleMedium,
            color: theme.colors.textDark,
        }
    })
    return (
        <View
            style={[connectionScreenStyles.container, {backgroundColor: theme.colors.primary}]}>
            <LinearGradient
                style={connectionScreenStyles.container}
                colors={["rgba(0,208,255,0.3)", "transparent"]}
                start={{x: 0.5, y: 0}}
                end={{x: 0.5, y: 1}}
            >
                <View style={connectionScreenStyles.middle}>
                    <View style={connectionScreenStyles.logo}>
                        <BoatChainMainIcon width="100%" height="100%"/>
                    </View>
                    <View style={connectionScreenStyles.textContainer}>
                        <Text style={connectionScreenStyles.title}>
                            Bienvenue sur BoatChain
                        </Text>
                        <Text style={connectionScreenStyles.body}>
                            Achetez, vendez et suivez des bateaux en toute
                            confiance.
                        </Text>
                    </View>
                </View>
                <View style={connectionScreenStyles.bottomContainer}>
                    <View style={connectionScreenStyles.bigTitleContainer}>
                        <Text style={connectionScreenStyles.bigTitle}>Commençons
                            !</Text>
                    </View>
                    <View style={connectionScreenStyles.buttonsContainer}>
                        <Image
                            source={require("@/assets/images/metamask.png")}
                            style={connectionScreenStyles.images}
                        />
                        <Text style={connectionScreenStyles.buttonsText}>Continuer
                            avec MetaMask</Text>
                    </View>
                    <View style={connectionScreenStyles.buttonsContainer}>
                        <Image
                            source={require("@/assets/images/walletConnect.png")}
                            style={connectionScreenStyles.images}
                        />
                        <Text style={connectionScreenStyles.buttonsText}>Continuer
                            avec WalletConnect</Text>
                    </View>
                </View>
            </LinearGradient>
        </View>
    )
}


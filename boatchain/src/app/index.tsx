import {View, Text, Button, StyleSheet} from 'react-native';
import {Redirect, useRouter} from 'expo-router';
import {useState} from "react";
import {useTheme} from "@/theme";

export default function Home() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [connected, setConnected] = useState(true);

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
    const connectionScreenStyles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
    })
    return (
        <View style={connectionScreenStyles.container}>
            <Text>Connection Screen</Text>
        </View>
    )
}


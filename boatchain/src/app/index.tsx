import {View, Text, Button, StyleSheet} from 'react-native';
import {useRouter} from 'expo-router';
import {useState} from "react";

export default function Home() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [connected, setConnected] = useState(true);

    if (loading) {
        return <LoadingScreen/>;
    }

    if (!connected) {
        return <ConnectionScreen/>;
    }

    return (
        <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text>Accueil</Text>
            <Button
                title="Aller aux onglets du haut"
                onPress={() => router.push('/(tabs)')}
            />
        </View>
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


import {Button, View} from "react-native";
import {router} from "expo-router";

export default function Discuss() {

    return (
        <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'red'
        }}>
            <Button
                title="Aller vers boats"
                onPress={() => router.push('/boats/boat-screen')}
            />
        </View>
    );
}

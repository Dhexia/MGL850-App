import {View, Text, Button} from 'react-native';
import {router} from "expo-router";

export default function Boat() {

    return (
        <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'yellow'
        }}>
            <Button
                title="Aller vers boats"
                onPress={() => router.push('/boats/boat-screen')}
            />
        </View>
    );
}

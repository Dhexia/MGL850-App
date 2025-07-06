import {View, Text, Button} from 'react-native';
import {useRouter} from "expo-router";

export default function Dashboard() {
    const router = useRouter();
    return (
        <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'green'
        }}>
            <Button
                title="Aller vers boats"
                onPress={() => router.push('/boats/boat-screen')}
            />
        </View>
    );
}

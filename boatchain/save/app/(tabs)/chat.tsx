import {View, Text, StyleSheet} from "react-native";

const ChatPage = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Chat Screen</Text>
        </View>
    )
}

export default ChatPage;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 20,
        color: '#333',
    },
})


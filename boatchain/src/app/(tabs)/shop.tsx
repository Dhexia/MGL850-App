import {View, Text, StyleSheet} from "react-native";

const ShopPage = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Shop Screen</Text>
        </View>
    )
}

export default ShopPage;

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


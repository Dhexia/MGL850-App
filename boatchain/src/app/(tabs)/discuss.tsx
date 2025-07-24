import {StyleSheet, Image, View, Text, Dimensions, TouchableOpacity} from "react-native";
import {useTheme} from "@/theme";
import Chat from "@/app/chat/chat";
import {router} from "expo-router";

export default function Discuss() {
   const myList = [
       {
           imageURI: 'https://randomuser.me/api/portraits/women/1.jpg',
           username: "Louise",
           lastMessage: "Oui, mais le prix n'est pas flexible",
           bold: true
       },
       {
           imageURI: 'https://randomuser.me/api/portraits/men/2.jpg',
           username: "Maxime Dubois",
           lastMessage: "Le diagnostic s'est très bien passé. Voici le rapport.",
           bold: false
       },
       {
           imageURI: 'https://randomuser.me/api/portraits/women/3.jpg',
           username: "MarineTech",
           lastMessage: "Qu'en penses-tu Benoit ?",
           bold: false
       },
       {
           imageURI: 'https://randomuser.me/api/portraits/women/4.jpg',
           username: "Julie",
           lastMessage: "Bonjour, êtes-vous disponibles pour un appel vidéo pour v?",
           bold: true
       }
   ]

    return (
    <View style={{ marginTop: 15, marginLeft:15}}>
        {myList.map((item) => (
            <ListItem
                key={item.username}
                imageURI={item.imageURI}
                username={item.username}
                lastMessage={item.lastMessage}
                bold={item.bold}
            />
        ))}
    </View>
);

}

const ListItem = ({imageURI, username, lastMessage, bold}) => {
    const theme = useTheme();
    const screenWidth = Dimensions.get('window').width;
    const scale = screenWidth / 420;
    const maxChars = Math.floor((screenWidth - 100) / 7);
    const truncatedMessage = lastMessage.length > maxChars
        ? lastMessage.substring(0, maxChars - 3) + "..."
        : lastMessage;
    const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10 * scale,
        borderBottomColor: theme.colors.neutral,
    },
    image: {
        width: 50 * scale,
        height: 50 * scale,
        borderRadius: 25 * scale,
        marginRight: 20 * scale,
    },
    username: {
        fontSize: 18 * scale,
        fontWeight: bold ? 'bold' : 'normal',
        color: theme.colors.text,
    },
    message: {
        fontSize: 14 * scale,
        fontWeight: bold ? 'bold' : 'normal',
        color: theme.colors.text,
    }
});


    return (
    <TouchableOpacity style={styles.container} onPress={() => router.push('/chat/chat')}>
        <Image source={{ uri: imageURI }} style={styles.image} />
        <View>
            <Text style={styles.username}>{username}</Text>
            <Text style={styles.message}>{truncatedMessage}</Text>
        </View>
    </TouchableOpacity>
);
}



import {
    Dimensions,
    Text,
    View,
    StyleSheet,
    FlatList,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity, Keyboard
} from "react-native";
import {useHeaderHeight} from '@react-navigation/elements';
import {useTheme} from "@/theme";
import HeaderWithTitle from "@/components/HeaderWithTitle";
import {AntDesign} from "@expo/vector-icons";
import React, {useEffect, useState} from "react";

export default function Chat() {
    const [inputText, setInputText] = useState("");
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const theme = useTheme();


    useEffect(() => {
        const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
            setKeyboardVisible(true);
        });
        const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
            setKeyboardVisible(false);
        });

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            padding: 10,
            backgroundColor: theme.colors.backgroundLight,
        },
    });
    return (
        <KeyboardAvoidingView
            style={{flex: 1}}
            behavior={Platform.OS === "web" ? undefined : "padding"}
            keyboardVerticalOffset={0}
        >
            <HeaderWithTitle title="Louise"/>
            <View style={styles.container}>
                <FlatList
                    data={[...myMessagesList]}
                    renderItem={({item}) => <MessageItem message={item}/>}
                    keyExtractor={(item) => item.id.toString()}
                    inverted={true}
                    contentContainerStyle={{paddingBottom: 10}}
                    showsVerticalScrollIndicator={false}
                />
            </View>
            <MessageInputBar inputText={inputText} setInputText={setInputText} isKeyboardVisible={isKeyboardVisible}/>
        </KeyboardAvoidingView>
    );
}

const MessageItem = ({message}) => {
    const theme = useTheme();
    const screenWidth = Dimensions.get('window').width;
    const scale = screenWidth / 420;
    const styles = StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 10,
            backgroundColor: message.sender === 'user' ? theme.colors.neutral : theme.colors.surfaceLight,
            borderRadius: 15,
            marginVertical: 5,
            maxWidth: screenWidth * 0.75,
            borderColor: theme.colors.neutral,
            borderWidth: 1,
            borderStyle: 'solid',
        },
        text: {
            color: theme.colors.text,
            ...theme.textStyles.bodyLarge,
        },
    });
    return (
        <View style={[styles.container, {alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start'}]}>
            <Text style={styles.text}>{message.text}</Text>
        </View>
    );
}

const MessageInputBar = ({inputText, setInputText, isKeyboardVisible}) => {
    const theme = useTheme();
    const styles = StyleSheet.create({
        searchContainer: {
            paddingHorizontal: 10,
            paddingVertical: 8,
            backgroundColor: theme.colors.backgroundLight,
            marginBottom: isKeyboardVisible ? 30 : 0
        },
        inputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 8,
            paddingVertical: 8,
            backgroundColor: theme.colors.neutral,
            borderRadius: 40,
        },
        input: {
            flex: 1,
            height: 40,
            backgroundColor: 'transparent',
            marginLeft: 8,
            borderRadius: 20,
            paddingHorizontal: 10,
            color: theme.colors.text,
        },
    })

    return (

        <View style={styles.searchContainer}>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Saisissez votre message..."
                    placeholderTextColor={theme.colors.textDark}
                    value={inputText}
                    onChangeText={setInputText}
                />
                <ArrowUpIcon active={inputText.trim().length > 0}/>
            </View>
        </View>

    );
};


const ArrowUpIcon = ({active}) => {
    const theme = useTheme();

    const styles = StyleSheet.create({
        iconContainer: {
            padding: 12,
            borderRadius: 50,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: active
                ? theme.colors.secondary
                : theme.colors.secondary + '55',
        },
    });

    return (
        <TouchableOpacity style={styles.iconContainer} disabled={!active}>
            <AntDesign
                name="arrowup"
                size={25}
                color={theme.colors.textLight}
                style={{opacity: 1}}
            />
        </TouchableOpacity>
    );
};


const myMessagesList = [
    {
        id: 20,
        text: "Merci pour votre aide !",
        sender: "user",
    },
    {
        id: 19,
        text: "Avec plaisir, n'hésitez pas si vous avez d'autres questions.",
        sender: "bot",
    },
    {
        id: 18,
        text: "Quels sont vos horaires d'ouverture ?",
        sender: "user",
    },
    {
        id: 17,
        text: "Nous sommes ouverts du lundi au vendredi de 9h à 18h.",
        sender: "bot",
    },
    {
        id: 16,
        text: "Est-ce que je peux prendre rendez-vous en ligne ?",
        sender: "user",
    },
    {
        id: 15,
        text: "Oui, vous pouvez réserver directement sur notre site web.",
        sender: "bot",
    },
    {
        id: 14,
        text: "Super, je vais regarder ça.",
        sender: "user",
    },
    {
        id: 13,
        text: "Avez-vous des offres spéciales ce mois-ci ?",
        sender: "user",
    },
    {
        id: 12,
        text: "Oui, nous proposons une réduction de 20% sur les diagnostics.",
        sender: "bot",
    },
    {
        id: 11,
        text: "Merci pour l'information.",
        sender: "user",
    },
    {
        id: 10,
        text: "Je vous en prie !",
        sender: "bot",
    },
    {
        id: 9,
        text: "Bien sûr, nous offrons des diagnostics complets pour tous nos services.",
        sender: "bot",
    },
    {
        id: 8,
        text: "Oui, j'aimerais en savoir plus sur les diagnostics.",
        sender: "user",
    },
    {
        id: 7,
        text: "Super ! As-tu des questions sur nos services ?",
        sender: "bot",
    },
    {
        id: 6,
        text: "Je vais bien aussi, merci de demander.",
        sender: "user",
    },
    {
        id: 5,
        text: "Ça va bien, merci ! Et toi ?",
        sender: "bot",
    },
    {
        id: 4,
        text: "Bonjour, comment ça va ?",
        sender: "user"
    },
    {
        id: 3,
        text: "Je suis ravi de discuter avec vous aujourd'hui.",
        sender: "bot"
    },
    {
        id: 2,
        text: "Merci, moi aussi !",
        sender: "user"
    },
    {
        id: 1,
        text: "Bonjour et bienvenue sur notre chat.",
        sender: "bot"
    },
];
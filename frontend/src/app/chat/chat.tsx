import {
    Dimensions,
    Text,
    View,
    StyleSheet,
    FlatList,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity, 
    Keyboard,
    ActivityIndicator,
    Alert
} from "react-native";
import {useTheme} from "@/theme";
import HeaderWithTitle from "@/components/HeaderWithTitle";
import {AntDesign} from "@expo/vector-icons";
import React, {useEffect, useState, useCallback} from "react";
import {useLocalSearchParams} from "expo-router";
import {ChatAPI, MessageResponse, ConversationResponse} from "@/lib/chat.api";
import {useFocusEffect} from '@react-navigation/native';
import OfferSummaryCard from "@/components/chat/OfferSummaryCard";
import {useAuth} from '@/contexts/AuthContext';
import { clearBoatsCache } from '@/lib/boats.api';

export default function Chat() {
    const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
    const [inputText, setInputText] = useState("");
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const [messages, setMessages] = useState<MessageResponse[]>([]);
    const [conversation, setConversation] = useState<ConversationResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { address } = useAuth();
    const theme = useTheme();

    const fetchConversationData = useCallback(async () => {
        if (!conversationId) return;
        
        try {
            setLoading(true);
            setError(null);
            
            // Fetch conversation and messages in parallel
            const [conversationData, messagesData] = await Promise.all([
                ChatAPI.getConversation(conversationId),
                ChatAPI.getMessages(conversationId)
            ]);
            
            setConversation(conversationData);
            setMessages(messagesData.reverse()); // Reverse for FlatList inverted
        } catch (err) {
            console.error('Error fetching conversation data:', err);
            setError('Erreur lors du chargement de la conversation');
        } finally {
            setLoading(false);
        }
    }, [conversationId]);

    const sendMessage = useCallback(async () => {
        if (!inputText.trim() || !conversationId || sending) return;
        
        try {
            setSending(true);
            const messageContent = inputText.trim();
            setInputText(""); // Clear input immediately for better UX
            
            const newMessage = await ChatAPI.sendMessage({
                conversationId,
                content: messageContent,
                messageType: 'text'
            });
            
            // Add new message to the list
            setMessages(prev => [newMessage, ...prev]);
        } catch (err) {
            console.error('Error sending message:', err);
            Alert.alert('Erreur', 'Impossible d\'envoyer le message');
            setInputText(inputText); // Restore input on error
        } finally {
            setSending(false);
        }
    }, [inputText, conversationId, sending]);

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

    useFocusEffect(
        useCallback(() => {
            fetchConversationData();
        }, [fetchConversationData])
    );

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.backgroundLight,
        },
        centerContainer: {
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
        },
        chatContainer: {
            flex: 1,
            padding: 10,
        },
    });

    const getDisplayName = () => {
        if (!conversation) return "Chat";
        
        // Find the other participant (not current user)
        const otherParticipant = conversation.participants.find(p => p !== address);
        if (otherParticipant) {
            return `${otherParticipant.slice(0, 6)}...${otherParticipant.slice(-4)}`;
        }
        
        return "Chat";
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContainer]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={[theme.textStyles.bodyMedium, { color: theme.colors.textDark, marginTop: 10 }]}>
                    Chargement de la conversation...
                </Text>
            </View>
        );
    }

    if (error || !conversation) {
        return (
            <View style={[styles.container, styles.centerContainer]}>
                <Text style={[theme.textStyles.bodyMedium, { color: theme.colors.destructive }]}>
                    {error || 'Conversation introuvable'}
                </Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={{flex: 1}}
            behavior={Platform.OS === "web" ? undefined : "padding"}
            keyboardVerticalOffset={0}
        >
            <HeaderWithTitle title={getDisplayName()}/>
            
            <View style={styles.chatContainer}>
                <FlatList
                    data={messages}
                    renderItem={({item}) => <MessageItem message={item} currentUser={address}/>}
                    keyExtractor={(item) => item.id}
                    inverted={true}
                    contentContainerStyle={{paddingBottom: 10}}
                    showsVerticalScrollIndicator={false}
                    ListFooterComponent={() => (
                        conversation.offer ? (() => {
                            // Fix: Compare addresses in lowercase to handle case sensitivity
                            const isOwner = conversation.offer.offeredBy.toLowerCase() !== address?.toLowerCase();
                            return (
                                <OfferSummaryCard
                                    offer={conversation.offer}
                                    isOwner={isOwner}
                                onAccept={async () => {
                                    try {
                                        const updatedConversation = await ChatAPI.acceptOffer(conversationId);
                                        setConversation(updatedConversation);
                                        
                                        // Clear boats cache to refresh ownership
                                        await clearBoatsCache();
                                        
                                        Alert.alert(
                                            'Succès', 
                                            'Offre acceptée ! Le transfert de propriété a été effectué. Vous pouvez maintenant recevoir de nouvelles offres.'
                                        );
                                    } catch (error) {
                                        Alert.alert('Erreur', 'Impossible d\'accepter l\'offre');
                                    }
                                }}
                                onReject={async () => {
                                    try {
                                        const updatedConversation = await ChatAPI.rejectOffer(conversationId);
                                        setConversation(updatedConversation);
                                        Alert.alert('Info', 'Offre refusée');
                                    } catch (error) {
                                        Alert.alert('Erreur', 'Impossible de refuser l\'offre');
                                    }
                                }}
                            />
                            );
                        })() : null
                    )}
                />
            </View>
            
            <MessageInputBar 
                inputText={inputText} 
                setInputText={setInputText} 
                isKeyboardVisible={isKeyboardVisible}
                onSend={sendMessage}
                sending={sending}
            />
        </KeyboardAvoidingView>
    );
}

const MessageItem = ({message, currentUser}: {message: MessageResponse, currentUser?: string}) => {
    const theme = useTheme();
    const screenWidth = Dimensions.get('window').width;
    const isFromCurrentUser = message.senderId?.toLowerCase() === currentUser?.toLowerCase();
    
    const styles = StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 10,
            backgroundColor: isFromCurrentUser ? theme.colors.secondary : theme.colors.surfaceLight,
            borderRadius: 15,
            marginVertical: 5,
            maxWidth: screenWidth * 0.75,
            borderColor: theme.colors.neutral,
            borderWidth: 1,
            borderStyle: 'solid',
        },
        text: {
            color: isFromCurrentUser ? theme.colors.textLight : theme.colors.textDark,
            ...theme.textStyles.bodyLarge,
        },
        timestamp: {
            ...theme.textStyles.bodySmall,
            color: theme.colors.textLight,
            marginTop: 4,
            textAlign: isFromCurrentUser ? 'right' : 'left',
        },
    });

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    return (
        <View style={{
            alignItems: isFromCurrentUser ? 'flex-end' : 'flex-start', 
            marginVertical: 2,
            width: '100%'
        }}>
            <View style={[styles.container, {alignSelf: isFromCurrentUser ? 'flex-end' : 'flex-start'}]}>
                <Text style={styles.text}>{message.content}</Text>
            </View>
        </View>
    );
}

const MessageInputBar = ({
    inputText, 
    setInputText, 
    isKeyboardVisible, 
    onSend, 
    sending
}: {
    inputText: string;
    setInputText: (text: string) => void;
    isKeyboardVisible: boolean;
    onSend: () => void;
    sending: boolean;
}) => {
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
            color: theme.colors.textDark,
        },
    });

    return (
        <View style={styles.searchContainer}>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Saisissez votre message..."
                    placeholderTextColor={theme.colors.textLight}
                    value={inputText}
                    onChangeText={setInputText}
                    editable={!sending}
                    onSubmitEditing={onSend}
                    returnKeyType="send"
                />
                <ArrowUpIcon 
                    active={inputText.trim().length > 0 && !sending}
                    onPress={onSend}
                    sending={sending}
                />
            </View>
        </View>
    );
};


const ArrowUpIcon = ({active, onPress, sending}: {active: boolean, onPress: () => void, sending: boolean}) => {
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

    if (sending) {
        return (
            <View style={styles.iconContainer}>
                <ActivityIndicator size="small" color="white" />
            </View>
        );
    }

    return (
        <TouchableOpacity 
            style={styles.iconContainer} 
            disabled={!active}
            onPress={onPress}
        >
            <AntDesign
                name="arrowup"
                size={25}
                color={theme.colors.textLight}
                style={{opacity: 1}}
            />
        </TouchableOpacity>
    );
};



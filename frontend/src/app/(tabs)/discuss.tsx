import {StyleSheet, Image, View, Text, Dimensions, TouchableOpacity, FlatList, ActivityIndicator} from "react-native";
import {useTheme} from "@/theme";
import {router} from "expo-router";
import {useState, useEffect, useCallback} from "react";
import {ChatAPI, ConversationResponse} from "@/lib/chat.api";
import {useFocusEffect} from '@react-navigation/native';

export default function Discuss() {
    const theme = useTheme();
    const [conversations, setConversations] = useState<ConversationResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchConversations = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await ChatAPI.getConversations();
            setConversations(data);
        } catch (err) {
            console.error('Error fetching conversations:', err);
            setError('Erreur lors du chargement des conversations');
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchConversations();
        }, [fetchConversations])
    );

    const formatAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const getOtherParticipant = (participants: string[], currentUser?: string) => {
        // Find the participant who is not the current user
        // For now, just return the first participant or formatted address
        const other = participants.find(p => p !== currentUser) || participants[0];
        return formatAddress(other);
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.backgroundLight,
        },
        centerContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
        },
    });

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={[theme.textStyles.bodyMedium, { color: theme.colors.textDark, marginTop: 10 }]}>
                    Chargement des conversations...
                </Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centerContainer}>
                <Text style={[theme.textStyles.bodyMedium, { color: theme.colors.destructive }]}>
                    {error}
                </Text>
            </View>
        );
    }

    if (conversations.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <Text style={[theme.textStyles.bodyMedium, { color: theme.colors.textLight }]}>
                    Aucune conversation pour le moment
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={conversations}
                renderItem={({ item }) => (
                    <ConversationListItem
                        conversation={item}
                        onPress={() => router.push(`/chat/chat?conversationId=${item.id}`)}
                    />
                )}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 15 }}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const ConversationListItem = ({ 
    conversation, 
    onPress 
}: { 
    conversation: ConversationResponse; 
    onPress: () => void; 
}) => {
    const theme = useTheme();
    const screenWidth = Dimensions.get('window').width;
    const scale = screenWidth / 420;
    const maxChars = Math.floor((screenWidth - 100) / 7);
    
    // Get the display name - could be the other participant's address or offer info
    const getDisplayName = () => {
        if (conversation.offer) {
            const offererAddress = conversation.offer.offeredBy;
            return `${offererAddress.slice(0, 6)}...${offererAddress.slice(-4)}`;
        }
        // Find other participant (not current user)
        const otherParticipant = conversation.participants[0]; // Simplified for now
        return `${otherParticipant.slice(0, 6)}...${otherParticipant.slice(-4)}`;
    };

    const getLastMessage = () => {
        if (conversation.lastMessage) {
            return conversation.lastMessage.content;
        }
        if (conversation.offer) {
            return `Offre: ${conversation.offer.priceInEth} ETH`;
        }
        return "Nouvelle conversation";
    };

    const truncatedMessage = (() => {
        const message = getLastMessage();
        return message.length > maxChars
            ? message.substring(0, maxChars - 3) + "..."
            : message;
    })();

    const hasUnread = conversation.unreadCount > 0;

    const styles = StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 12,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.neutral,
            backgroundColor: theme.colors.backgroundLight,
        },
        image: {
            width: 50,
            height: 50,
            borderRadius: 25,
            marginRight: 15,
            backgroundColor: theme.colors.neutral,
        },
        textContainer: {
            flex: 1,
        },
        username: {
            ...theme.textStyles.titleMedium,
            fontWeight: hasUnread ? 'bold' : 'normal',
            color: theme.colors.textDark,
            marginBottom: 4,
        },
        message: {
            ...theme.textStyles.bodyMedium,
            fontWeight: hasUnread ? '600' : 'normal',
            color: hasUnread ? theme.colors.textDark : theme.colors.textLight,
        },
        unreadBadge: {
            backgroundColor: theme.colors.primary || '#007AFF',
            borderRadius: 10,
            minWidth: 20,
            height: 20,
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: 8,
        },
        unreadText: {
            color: 'white',
            fontSize: 12,
            fontWeight: 'bold',
        },
    });

    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <Image 
                source={require('@/assets/images/userIcon.png')} 
                style={styles.image} 
                resizeMode="cover"
            />
            <View style={styles.textContainer}>
                <Text style={styles.username}>{getDisplayName()}</Text>
                <Text style={styles.message}>{truncatedMessage}</Text>
            </View>
            {conversation.unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>
                        {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
};



import {View, Text, StyleSheet} from 'react-native';
import {useTheme} from "@/theme";

interface ListItemProps {
    title: string,
    description: string,
}

export default function ListItem({title, description}: ListItemProps) {
    const theme = useTheme();
    const styles = StyleSheet.create({
        container: {
            borderStyle: 'solid',
            borderWidth: 1,
            borderColor: theme.colors.neutral,
            borderRadius: 15,
            backgroundColor: theme.colors.surfaceLight,
            padding: 15,
            marginBottom: 15,
            marginHorizontal: 15,

        },
        title: {
            color: theme.colors.textDark,
            ...theme.textStyles.titleMedium,
            marginBottom: 15,
        },
        description: {
            color: theme.colors.textDark,
            ...theme.textStyles.bodyLarge,
        }
    })
    return (
        <View style={styles.container}>
            <Text
                style={
                    [styles.title,
                        {flexShrink: 1, flexWrap: "wrap"}]
                }
                numberOfLines={0}
            >
                {title}
            </Text>
            <Text
                style={
                    [styles.description,
                        {flexShrink: 1, flexWrap: "wrap"}]
                }
                numberOfLines={0}
            >
                {description}
            </Text>
        </View>
    );
}
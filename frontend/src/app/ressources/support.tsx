import {useTheme} from "@/theme";
import {View, StyleSheet, ScrollView} from "react-native";
import HeaderWithTitle from "@/components/HeaderWithTitle";
import {useNavigation} from "@react-navigation/native";
import ListItem from "@/components/ListItem";

interface SupportProps {
    title: string;
    description: string;
}

export default function Support() {
    const theme = useTheme();
    const navigation = useNavigation();

    const styles = StyleSheet.create({
        content: {
            marginBottom: 100,
            marginTop: 10,
        }
    });

    const support: SupportProps[] = [
        {
            title: "Nous contacter ?",
            description: "Vous pouvez nous contacter par email à l'adresse xx@gmail.com"
        },
        {
            title: "Ouvrir un ticket de support",
            description: "Vous pouvez ouvrir des tickets sur github : https://github.com/Dhexia/MGL850-App"
        }
    ];

    return (
        <View>
            <HeaderWithTitle title={"Support"}/>
            <ScrollView style={styles.content}>
                {support.map((q, idx) => (
                    <ListItem key={idx} title={q.title}
                              description={q.description}/>
                ))}
            </ScrollView>
        </View>
    );
}
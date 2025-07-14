import {useTheme} from "@/theme";
import {View, StyleSheet, ScrollView} from "react-native";
import HeaderWithTitle from "@/components/HeaderWithTitle";
import {useNavigation} from "@react-navigation/native";
import ListItem from "@/components/ListItem";

interface Question {
    title: string;
    description: string;
}

export default function FAQ() {
    const theme = useTheme();
    const navigation = useNavigation();

    const styles = StyleSheet.create({
        content: {
            marginBottom: 100,
            marginTop: 10,
        }
    });

    const questions: Question[] = [
        {
            title: "Qu'est-ce que BoatChain ?",
            description:
                "BoatChain est une plateforme d'achat, de vente et de certification de bateaux, reposant sur la technologie blockchain pour garantir la transparence et la sécurité des transactions.",
        },
        {
            title: "Pourquoi utiliser la blockchain pour acheter un bateau ?",
            description:
                "La blockchain permet de garantir l'authenticité des informations (propriétaires, réparations, expertises), d'éviter les fraudes et d'assurer une traçabilité complète de l'historique du bateau.",
        },
        {
            title: "Est-ce que je peux vendre mon bateau sans passer par la blockchain ?",
            description:
                "Non. Toutes les transactions sur BoatChain sont enregistrées sur la blockchain pour assurer une transparence maximale et protéger acheteurs comme vendeurs.",
        },
        {
            title: "Comment savoir si un bateau est certifié ?",
            description:
                "Les bateaux certifiés affichent un badge 'Validé BoatChain'. Cela signifie que leurs documents ont été vérifiés par un professionnel et scellés sur la blockchain.",
        },
        {
            title: "Quels types de documents sont enregistrés sur la blockchain ?",
            description:
                "Titres de propriété, rapports d’expertise, historiques de maintenance, attestations de conformité et toute pièce justificative liée au bateau peuvent être horodatés et enregistrés.",
        },
        {
            title: "Dois-je payer en cryptomonnaie ?",
            description:
                "Non. Les paiements se font en devise classique (euros), mais les informations liées à la transaction sont sécurisées via la blockchain.",
        },
        {
            title: "Est-ce que mes données personnelles sont visibles sur la blockchain ?",
            description:
                "Non. Seules les empreintes cryptographiques des documents sont enregistrées. Aucune donnée personnelle n’est publiquement accessible.",
        },
        {
            title: "Comment un acheteur peut-il vérifier l’historique d’un bateau ?",
            description:
                "Depuis la fiche du bateau, l’acheteur peut consulter les documents validés et leur empreinte blockchain, assurant leur authenticité.",
        },
        {
            title: "Puis-je modifier un document déjà enregistré ?",
            description:
                "Non. Une fois qu’un document est scellé sur la blockchain, il est immuable. Si un document doit être mis à jour, une nouvelle version est ajoutée avec un nouvel horodatage.",
        },
        {
            title: "Que faire si je rencontre un problème avec un vendeur ou un acheteur ?",
            description:
                "Vous pouvez contacter notre centre de support depuis l’onglet 'Ressources'. Une équipe dédiée est disponible pour accompagner les litiges.",
        },
    ];

    return (
        <View>
            <HeaderWithTitle title={"Foire aux questions"}/>
            <ScrollView style={styles.content}>
                {questions.map((q, idx) => (
                    <ListItem key={idx} title={q.title}
                              description={q.description}/>
                ))}
            </ScrollView>
        </View>
    );
}
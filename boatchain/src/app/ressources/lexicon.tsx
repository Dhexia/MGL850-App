import {useTheme} from "@/theme";
import {View, StyleSheet, ScrollView} from "react-native";
import HeaderWithTitle from "@/components/HeaderWithTitle";
import {useNavigation} from "@react-navigation/native";
import ListItem from "@/components/ListItem";

interface LexiconProps {
    name: string;
    description: string;
}

export default function Lexicon() {
    const theme = useTheme();
    const navigation = useNavigation();

    const styles = StyleSheet.create({
        content: {
            marginBottom: 100,
            marginTop: 10,
        }
    });

    const lexicon: LexiconProps[] = [
        {
            name: "Blockchain",
            description:
                "Technologie de stockage et de transmission d'informations, transparente, sécurisée et fonctionnant sans organe central. Utilisée ici pour garantir la traçabilité des bateaux.",
        },
        {
            name: "Smart Contract",
            description:
                "Programme autonome inscrit sur la blockchain qui exécute automatiquement des actions (comme valider une vente) lorsque certaines conditions sont remplies.",
        },
        {
            name: "NFT (Non-Fungible Token)",
            description:
                "Jeton numérique unique représentant un actif, ici un bateau ou un document, inscrit sur la blockchain.",
        },
        {
            name: "Empreinte cryptographique",
            description:
                "Résumé numérique unique d’un document (comme un PDF), permettant de prouver qu’il n’a pas été modifié sans révéler son contenu.",
        },
        {
            name: "Horodatage",
            description:
                "Enregistrement d'une date et d'une heure précises sur la blockchain pour prouver qu’un document ou un événement a bien eu lieu à ce moment-là.",
        },
        {
            name: "Certificat de propriété",
            description:
                "Document officiel attestant que vous êtes le propriétaire légal du bateau. Il est possible de le certifier sur la blockchain pour éviter les fraudes.",
        },
        {
            name: "Vérification KYC",
            description:
                "‘Know Your Customer’ : procédure d’identification obligatoire pour valider l’identité des utilisateurs (vendeurs ou acheteurs).",
        },
        {
            name: "Wallet",
            description:
                "Portefeuille numérique permettant de stocker et gérer ses actifs blockchain (tokens, certificats, etc.).",
        },
        {
            name: "Traçabilité",
            description:
                "Suivi historique de toutes les étapes de vie du bateau (ventes, réparations, expertises) stocké de manière infalsifiable sur la blockchain.",
        },
        {
            name: "Validation BoatChain",
            description:
                "Processus par lequel un professionnel certifié vérifie les documents d’un bateau, puis les inscrit sur la blockchain comme preuve d’authenticité.",
        },
    ];

    return (
        <View>
            <HeaderWithTitle title={"Lexique"}/>
            <ScrollView style={styles.content}>
                {lexicon.map((q, idx) => (
                    <ListItem key={idx} title={q.name}
                              description={q.description}/>
                ))}
            </ScrollView>
        </View>
    );
}
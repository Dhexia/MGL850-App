import {useTheme} from "@/theme";

import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import { Link } from "expo-router";
import React from "react";

import FAQIcon
    from "@/assets/images/boatchainIcons/ressourcesIcons/FAQIcon.svg";
import LexiconIcon
    from "@/assets/images/boatchainIcons/ressourcesIcons/LexiconIcon.svg";
import SupportIcon
    from "@/assets/images/boatchainIcons/ressourcesIcons/SupportIcon.svg";
import PracticalGuideIcon
    from "@/assets/images/boatchainIcons/ressourcesIcons/PracticalGuideIcon.svg";
import CheckProIcon
    from "@/assets/images/boatchainIcons/ressourcesIcons/CheckProIcon.svg";
import SecurityIcon
    from "@/assets/images/boatchainIcons/ressourcesIcons/SecurityIcon.svg";
import LegalNoticeIcon
    from "@/assets/images/boatchainIcons/ressourcesIcons/LegalNoticeIcon.svg";
import HeaderWithTitle from "@/components/HeaderWithTitle";

interface ItemProps {
    icon: React.FC;
    title: string;
    href: string;
    description: string;
}

export default function UsefulResources() {
    const styles = StyleSheet.create({
        content: {
            margin: 15,
        }
    })

    const Pages: ItemProps[] = [
        {
            title: "FAQ rapide",
            icon: FAQIcon,
            description: "Les réponses aux questions qu’on se pose souvent",
            href: "/ressources/faq"
        }, {
            title: "Lexique simplifié",
            icon: LexiconIcon,
            description: "Comprendre les mots techniques sans se prendre la tête",
            href: "/ressources/lexicon"
        }, {
            title: "Centre de support",
            icon: SupportIcon,
            description: "Besoin d’aide ? On est là pour vous accompagner",
            href: "/ressources/support"
        }, {
            title: "Guides pratiques",
            icon: PracticalGuideIcon,
            description: "Pas à pas pour chaque étape clé",
            href: "/ressources/practical-guides"
        }, {
            title: "Vérifier un professionnel",
            icon: CheckProIcon,
            description: "Assurez-vous qu’un expert est bien certifié",
            href: "/ressources/check-professional"
        }, {
            title: "Sécurité et confiance",
            icon: SecurityIcon,
            description: "Ce qu’on fait pour protéger vos données et vos transactions",
            href: "/ressources/security-and-trust"
        }, {
            title: "Mentions légales",
            icon: LegalNoticeIcon,
            description: "Conditions, confidentialité, et politique d’usage",
            href: "/ressources/legal-notice"
        }
    ]

    return (
        <View>
            <HeaderWithTitle title={"Ressources utiles"}/>
            <View style={styles.content}>
                {Pages.map((item, idx) => (
                    <Item key={idx} {...item} />
                ))}
            </View>
        </View>
    )
}

function Item({icon, title, href, description}: ItemProps) {
    const theme = useTheme();

    const styles = StyleSheet.create({
        container: {
            borderRadius: 15,
            borderWidth: 1,
            borderColor: theme.colors.neutral,
            backgroundColor: theme.colors.surfaceLight,
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 15,
            paddingHorizontal: 20,
            marginBottom: 12,
        },
        iconContainer: {
            marginRight: 20,
        },
        textContainer: {},
        title: {
            color: theme.colors.textDark,
            ...theme.textStyles.titleMedium,
        },
        description: {
            color: theme.colors.textDark,
            ...theme.textStyles.bodySmall,
        },
    });

    return (
        <Link href={href} asChild>
            <TouchableOpacity style={styles.container}>
                <View style={styles.iconContainer}>
                    {React.createElement(icon, {width: 20, height: 20, color: theme.colors.textDark})}
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.title}>
                        {title}
                    </Text>
                    <Text style={[styles.description, {flexShrink: 1, flexWrap: "wrap"}]} numberOfLines={0}>
                        {description}
                    </Text>
                </View>
            </TouchableOpacity>
        </Link>
    );
}
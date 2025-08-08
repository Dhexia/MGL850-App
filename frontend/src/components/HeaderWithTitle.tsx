import {useTheme} from "@/theme";
import {useNavigation} from "expo-router";
import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {AntDesign} from "@expo/vector-icons";
import React from "react";

export default function HeaderWithTitle({title}: { title: string }) {
    const theme = useTheme();
    const navigation = useNavigation();
    const styles = StyleSheet.create({
        topContainer: {
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
            margin: 15
        },
        topLeftContainer: {},
        backButton: {
            borderRadius: 30,
            borderWidth: 1,
            borderColor: theme.colors.neutral,
            backgroundColor: theme.colors.surfaceLight,
            height: 40,
            width: 40,
            alignItems: "center",
            justifyContent: "center",
        },
        topRightContainer: {
            marginLeft: 10,
        },
        pageTitle: {
            color: theme.colors.textDark,
            ...theme.textStyles.titleLarge,
        }
    })

    return (
        <View style={styles.topContainer}>
            <View style={styles.topLeftContainer}>
                <TouchableOpacity style={styles.backButton}
                                  onPress={() => navigation.goBack()}>
                    <AntDesign name="arrowleft" size={25}/>
                </TouchableOpacity>
            </View>
            <View style={styles.topRightContainer}>
                <Text style={styles.pageTitle}>
                    {title}
                </Text>
            </View>
        </View>
    )
}
import {View, Text, Button, StyleSheet, TouchableOpacity} from 'react-native';
import {useRouter, useNavigation} from "expo-router";
import {useTheme} from "@/theme";
import Entypo from '@expo/vector-icons/Entypo';
import PenIcon from '@/assets/images/PenIcon.svg';

export default function Dashboard() {
    const router = useRouter();
    const theme = useTheme();

    const boats = [
        {
            title: "Mon bateau 1",

        }, {
            title: "Mon bateau 2",

        }, {
            title: "Mon bateau 3",

        }, {
            title: "Mon bateau 4",
        }
    ];

    const styles = StyleSheet.create({
        container: {
            backgroundColor: theme.colors.backgroundLight,
            flex: 1,
            padding: 10
        },
        title: {
            ...theme.textStyles.titleMedium,
            color: theme.colors.textDark,
        },
        myBoatsContainer: {
            padding: 10,
            backgroundColor: theme.colors.surfaceLight,
            borderRadius: 15,
            borderColor: theme.colors.neutral,
            borderWidth: 1,

        },
        myBoats: {},
        plusIcon: {
            backgroundColor: theme.colors.surfaceLight,
            padding: 5,
            borderRadius: 50,
            borderWidth: 1,
            borderColor: theme.colors.neutral,
        }
    });

    return (
        <View style={styles.container}>
            <View style={styles.myBoatsContainer}>
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 20
                }}>
                    <Text style={styles.title}>
                        Mes bateaux
                    </Text>
                    <TouchableOpacity onPress={() => {
                        router.push('/boats/new-boat');
                    }}>
                        <Entypo name="plus" size={24}
                                color={theme.colors.textDark}
                                style={styles.plusIcon}
                        />
                    </TouchableOpacity>

                </View>

                <View style={styles.myBoats}>
                    {boats.map((boat, index) => (
                        <TouchableOpacity
                            key={index}
                            style={{
                                backgroundColor: theme.colors.backgroundLight,
                                paddingVertical: 5,
                                paddingHorizontal: 15,
                                marginHorizontal: 10,
                                marginBottom: 10,
                                borderRadius: 15,
                                borderColor: theme.colors.neutral,
                                borderWidth: 1,
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <Text key={index}
                                  style={{
                                      ...theme.textStyles.titleMedium,
                                      color: theme.colors.textDark,
                                  }}
                            >{boat.title}</Text>
                            <PenIcon
                                    color={theme.colors.textDark}
                                    style={{
                                        padding: 5,

                                        borderColor: theme.colors.neutral,
                                    }}
                            />
                        </TouchableOpacity>

                    ))}
                </View>
            </View>
        </View>
    );
}

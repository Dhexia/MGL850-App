import {View, Text, StyleSheet, TouchableOpacity} from "react-native";
import {AntDesign} from '@expo/vector-icons';
import {useTheme} from '@/theme'
import PenIcon from '@/assets/images/PenIcon.svg'
import {useNavigation} from '@react-navigation/native';
import ImageCarousel from '@/components/ImageCarousel'

export default function BoatDetailScreen() {
    const theme = useTheme();
    const navigation = useNavigation();
    const styles = StyleSheet.create({
        mainContainer: {
            flex: 1,
            backgroundColor: theme.colors.backgroundLight,
        },
        topContainer: {
            flexDirection: "row",
            justifyContent: "space-between",
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
            flexDirection: "row",
        },
        penButton: {
            borderRadius: 30,
            borderWidth: 1,
            borderColor: theme.colors.neutral,
            backgroundColor: theme.colors.surfaceLight,
            height: 40,
            width: 40,
            alignItems: "center",
            justifyContent: "center",
        },
        contentContainer: {
            flexDirection: "column",
            flex: 1,
            marginHorizontal: 10
        }
    })
    return (
        <View style={styles.mainContainer}>
            <View style={styles.topContainer}>
                <View style={styles.topLeftContainer}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <AntDesign name="arrowleft" size={25}/>
                    </TouchableOpacity>
                </View>
                <View style={styles.topRightContainer}>
                    <View style={styles.penButton}>
                        <PenIcon width={25} height={25}/>
                    </View>
                </View>
            </View>
            <View style={styles.contentContainer}>
                <ImageCarousel/>
            </View>
        </View>
    )
}

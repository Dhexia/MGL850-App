import {
    Alert,
    Image, Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import {AntDesign} from '@expo/vector-icons';
import {useTheme} from '@/theme'
import PenIcon from '@/assets/images/PenIcon.svg'
import {useNavigation} from '@react-navigation/native';
import {Link, useLocalSearchParams} from "expo-router";
import ChatIcon from "@/assets/images/ChatIcon.svg"
import {BoatChainValidated} from "@/components/BoatChainValidated";
import * as WebBrowser from "expo-web-browser";

export default function BoatDetailScreen() {
    const {
        specification: specString,
        certificates: certString,
        images: imgString,
        events: eventsString
    } = useLocalSearchParams<{
        specification: string;
        certificates: string;
        images: string;
        events: string;
    }>();

    const specification = JSON.parse(specString);
    const images = JSON.parse(imgString);
    const mainImage = images?.[0]?.uri;
    const certificates = certString ? JSON.parse(certString) : [];
    const eventsData = eventsString ? JSON.parse(eventsString) : [];

    const theme = useTheme();
    const navigation = useNavigation();
    const styles = StyleSheet.create({
        mainContainer: {
            flex: 1,
            backgroundColor: theme.colors.backgroundLight,
        },
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
            marginHorizontal: 10,
        },
        image: {
            width: "100%",
            borderRadius: 15,
            height: 180,
        },
        boatTypeContainer: {
            position: "absolute",
            top: 10,
            left: 10,
            backgroundColor: theme.colors.background,
            paddingHorizontal: 8,
            paddingVertical: 5,
            borderRadius: 30,
            borderWidth: 2,
            borderColor: theme.colors.neutral,
        },
        boatType: {
            ...theme.textStyles.bodyMedium,
            color: theme.colors.textDark,
        },
        mainInfoContainer: {
            flexDirection: "column",
        },
        mainInfoTopContainer: {
            flexDirection: "row",
        },
        mainInfoTopLeftContainer: {
            flexDirection: "row",
            width: "65%",
            alignItems: "center",
            paddingRight: 20,
        },
        mainInfoIconContainer: {
            height: 40,
            width: 40,
            borderRadius: 50,
            borderWidth: 1,
            borderStyle: "solid",
            borderColor: theme.colors.neutral,
            margin: 10
        },
        mainInfoIcon: {
            height: "100%",
            width: "100%",

        },
        mainInfoTitleContainer: {
            maxWidth: "80%",
        },
        title: {
            color: theme.colors.textDark,
            ...theme.textStyles.titleMedium,
        },
        bodyLight: {
            color: theme.colors.textDark,
            ...theme.textStyles.bodyMedium,
        },
        chatButton: {
            margin: 5,
            padding: 10,
            borderRadius: 50,
            borderWidth: 1,
            borderColor: theme.colors.neutral,
            borderStyle: "solid",
            backgroundColor: theme.colors.surfaceLight,
        },
        buyButton: {
            backgroundColor: theme.colors.secondary,
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 50,

        },
        buyButtonText: {
            color: theme.colors.textLight,
            ...theme.textStyles.titleMedium,
        },
        mainInfoTopRightContainer: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            width: "35%",
        },
        mainInfoBottomContainer: {
            justifyContent: "space-between",
            flexDirection: "row",
            marginHorizontal: 10,
            marginVertical: 5,
            backgroundColor: theme.colors.surfaceLight,
            paddingVertical: 10,
            paddingHorizontal: 30,
            borderRadius: 15,
            borderWidth: 1,
            borderColor: theme.colors.neutral,
            borderStyle: "solid",
        },
        priceContainer: {
            flexDirection: "column",
            alignItems: "center",
        },
        price: {
            color: theme.colors.textDark,
            ...theme.textStyles.titleSmall,
        },
        priceTitle: {
            color: theme.colors.textDark,
            ...theme.textStyles.bodyMedium,
        },
        yearContainer: {
            flexDirection: "column",
            alignItems: "center",
        },
        year: {
            color: theme.colors.textDark,
            ...theme.textStyles.titleSmall,
        },
        yearTitle: {
            color: theme.colors.textDark,
            ...theme.textStyles.bodyMedium,
        },
        portContainer: {
            flexDirection: "column",
            alignItems: "center",
        },
        port: {
            color: theme.colors.textDark,
            ...theme.textStyles.titleSmall,
        },
        portTitle: {
            color: theme.colors.textDark,
            ...theme.textStyles.bodyMedium,
        },
        descriptionContainer: {
            marginVertical: 10,
            marginHorizontal: 10,
        },
        description: {
            color: theme.colors.textDark,
            ...theme.textStyles.bodyLarge,
        },
        technicalSpecsContainer: {
            marginHorizontal: 10
        },
        technicalSpecsTitle: {
            color: theme.colors.textDark,
            ...theme.textStyles.titleMedium,
            marginVertical: 15
        },
        technicalSpecsContent: {
            borderRadius: 15,
            borderWidth: 1,
            borderColor: theme.colors.neutral,
            borderStyle: "solid",
            padding: 15,
            backgroundColor: theme.colors.surfaceLight,
        },
        technicalSpecsLine: {
            flexDirection: "row",
            width: "100%",
            justifyContent: "space-between",
            paddingVertical: 10,
            borderBottomColor: theme.colors.neutral,
            borderBottomWidth: 1,
            borderStyle: "solid",
        },
        technicalSpecsLineText: {
            color: theme.colors.textDark,
            ...theme.textStyles.bodyMoney,
        },
        certificatesContainer: {
            marginVertical: 10,
            marginHorizontal: 10,
        },
        certificatesTitle: {
            color: theme.colors.textDark,
            ...theme.textStyles.titleMedium,
            marginVertical: 15
        },
        certificatesContent: {},
        eventsContainer: {
            marginHorizontal: 10,
        }
    })
    return (
        <ScrollView style={styles.mainContainer}>
            <View style={styles.topContainer}>
                <View style={styles.topLeftContainer}>
                    <TouchableOpacity style={styles.backButton}
                                      onPress={() => navigation.goBack()}>
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
                {/*<ImageCarousel/>*/}

                {/* Image container */}
                <View>

                    {mainImage && (
                        <Image source={{uri: mainImage}}
                               style={styles.image}/>
                    )}

                    <View style={styles.boatTypeContainer}>
                        <Text style={styles.boatType}>
                            {specification?.boat_type}
                        </Text>
                    </View>
                </View>
                {/* Main info */}
                <View style={styles.mainInfoContainer}>
                    {/* TOP */}
                    <View style={styles.mainInfoTopContainer}>
                        {/* LEFT */}
                        <View style={styles.mainInfoTopLeftContainer}>
                            <View style={styles.mainInfoIconContainer}>
                                <Image
                                    source={require('@/assets/images/userIcon.png')}
                                    resizeMode="contain"
                                    style={styles.mainInfoIcon}
                                />
                            </View>
                            <View style={styles.mainInfoTitleContainer}>
                                <Text numberOfLines={1}
                                      ellipsizeMode="tail"
                                      style={styles.title}
                                >
                                    {specification.title}
                                </Text>
                                <Text numberOfLines={1}
                                      ellipsizeMode="tail"
                                      style={styles.bodyLight}
                                >
                                    {specification.summary}
                                </Text>
                            </View>
                        </View>
                        {/* Right */}
                        <View style={styles.mainInfoTopRightContainer}>
                            <Link style={styles.chatButton} asChild={true}
                                  href={"/chat/chat"}>
                                <ChatIcon color={theme.colors.textDark}/>
                            </Link>
                            <TouchableOpacity style={styles.buyButton}>
                                <Text style={styles.buyButtonText}>
                                    Acheter
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.mainInfoBottomContainer}>
                        <View style={styles.priceContainer}>
                            <Text
                                numberOfLines={1}
                                ellipsizeMode="tail"
                                style={styles.price}
                            >
                                {specification?.price?.toLocaleString('fr-FR')} $
                            </Text>
                            <Text numberOfLines={1}
                                  ellipsizeMode="tail"
                                  style={styles.priceTitle}
                            >
                                Prix
                            </Text>
                        </View>
                        <View style={styles.yearContainer}>
                            <Text
                                numberOfLines={1}
                                ellipsizeMode="tail"
                                style={styles.year}
                            >
                                {specification.year}
                            </Text>
                            <Text numberOfLines={1}
                                  ellipsizeMode="tail"
                                  style={styles.yearTitle}>
                                Année
                            </Text>
                        </View>

                        <View style={styles.portContainer}>
                            <Text
                                numberOfLines={1}
                                ellipsizeMode="tail"
                                style={styles.port}
                            >
                                {specification?.city}
                            </Text>
                            <Text numberOfLines={1}
                                  ellipsizeMode="tail"
                                  style={styles.portTitle}>
                                Port d'attache
                            </Text>
                        </View>
                    </View>
                </View>
                <View style={styles.descriptionContainer}>
                    <Text
                        style={styles.description}
                    >
                        {specification.description}
                    </Text>
                </View>

                {/* Technical specs */}
                <View style={styles.technicalSpecsContainer}>
                    <View>
                        <Text style={styles.technicalSpecsTitle}>
                            ⚙️ Spécifications techniques
                        </Text>
                    </View>
                    <View style={styles.technicalSpecsContent}>
                        <View style={styles.technicalSpecsLine}>
                            <Text style={styles.technicalSpecsLineText}>
                                Longueur hors tout
                            </Text>
                            <Text style={styles.technicalSpecsLineText}>
                                {specification.overall_length} m
                            </Text>
                        </View>

                        <View style={styles.technicalSpecsLine}>
                            <Text style={styles.technicalSpecsLineText}>
                                Largeur
                            </Text>
                            <Text style={styles.technicalSpecsLineText}>
                                {specification.width} m
                            </Text>
                        </View>

                        <View style={styles.technicalSpecsLine}>
                            <Text style={styles.technicalSpecsLineText}>
                                Tirant d'eau
                            </Text>
                            <Text style={styles.technicalSpecsLineText}>
                                {specification.draft} m
                            </Text>
                        </View>

                        <View style={styles.technicalSpecsLine}>
                            <Text style={styles.technicalSpecsLineText}>
                                Moteur
                            </Text>
                            <Text style={styles.technicalSpecsLineText}>
                                {specification.engine}
                            </Text>
                        </View>

                        <View style={styles.technicalSpecsLine}>
                            <Text style={styles.technicalSpecsLineText}>
                                Capacité d'eau douce
                            </Text>
                            <Text style={styles.technicalSpecsLineText}>
                                {specification.fresh_water_capacity} L
                            </Text>
                        </View>

                        <View style={styles.technicalSpecsLine}>
                            <Text style={styles.technicalSpecsLineText}>
                                Capacité carburant
                            </Text>
                            <Text style={styles.technicalSpecsLineText}>
                                {specification.fuel_capacity} L
                            </Text>
                        </View>

                        <View style={styles.technicalSpecsLine}>
                            <Text style={styles.technicalSpecsLineText}>
                                Cabines
                            </Text>
                            <Text style={styles.technicalSpecsLineText}>
                                {specification.cabins} cabines
                            </Text>
                        </View>

                        <View style={styles.technicalSpecsLine}>
                            <Text style={styles.technicalSpecsLineText}>
                                Couchages
                            </Text>
                            <Text style={styles.technicalSpecsLineText}>
                                Jusqu'à {specification.beds} personnes
                            </Text>
                        </View>

                        <View style={[styles.technicalSpecsLine, {
                            borderBottomWidth: 0,
                        }]}>
                            <Text style={styles.technicalSpecsLineText}>
                                Catégorie de navigation
                            </Text>
                            <Text
                                style={styles.technicalSpecsLineText}>
                                {specification.navigation_category}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Certificats disponibles */}
                <View style={styles.certificatesContainer}>
                    <View>
                        <Text style={styles.certificatesTitle}>
                            🧾 Certificats disponibles
                        </Text>
                    </View>
                    <View style={styles.certificatesContent}>

                        {certificates?.map((certificate, idx) => (
                            <Certificate key={idx}
                                         certificateData={certificate}/>
                        ))}
                    </View>
                </View>

                <View style={styles.eventsContainer}>
                    <View>
                        <Text style={styles.certificatesTitle}>
                            📜 Historique des événements
                        </Text>
                    </View>
                    <View>

                        {eventsData?.map((myevent, idx) => (
                            <BoatEvent key={idx}
                                       eventData={myevent}/>
                        ))}

                    </View>
                </View>
            </View>


        </ScrollView>
    )
}


function Certificate({certificateData}) {
    const theme = useTheme();
    const styles = StyleSheet.create({
        certificateContainer: {
            padding: 15,
            backgroundColor: theme.colors.surfaceLight,
            borderRadius: 15,
            borderStyle: 'solid',
            borderColor: theme.colors.neutral,
            borderWidth: 1,
            marginVertical: 10
        },
        header: {
            justifyContent: 'space-between',
            flexDirection: 'row',
            alignItems: 'center',
            paddingBottom: 15,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.neutral,
            borderStyle: 'solid',
        },
        headerLeft: {},
        headerRight: {},
        person: {
            color: theme.colors.textDark,
            ...theme.textStyles.titleMedium,
        },
        date: {
            color: theme.colors.textDark,
            ...theme.textStyles.bodyMedium,
        },
        content: {
            paddingTop: 15,
        },
        contentTop: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        title: {
            color: theme.colors.textDark,
            ...theme.textStyles.titleMedium,
        },
        expire: {
            color: theme.colors.textDark,
            ...theme.textStyles.bodyMedium,
            paddingVertical: 5,
            paddingHorizontal: 10,
            borderStyle: 'solid',
            borderColor: theme.colors.neutral,
            borderWidth: 1,
            borderRadius: 50
        },
        contentDescriptionContainer: {
            paddingVertical: 5,
        },
        contentDescription: {
            color: theme.colors.textDark,
            ...theme.textStyles.bodyLarge,
        },
        attachmentsContainer: {},
        attachmentItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 5,
            paddingHorizontal: 10,
            borderWidth: 1,
            borderColor: theme.colors.neutral,
            borderStyle: 'solid',
            borderRadius: 50,
            margin: 5
        },
        attachmentText: {
            color: theme.colors.textDark,
            ...theme.textStyles.titleSmall,
        },
    });
    console.log(certificateData.attachements);
    return (
        <View style={styles.certificateContainer}>
            {/* TOP */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.person}>
                        {certificateData.person}
                    </Text>
                    <Text style={styles.date}>
                        {certificateData.date}
                    </Text>
                </View>
                <View style={styles.headerRight}>
                    <BoatChainValidated status={certificateData.status}/>
                </View>
            </View>

            {/* CONTENT */}
            <View style={styles.content}>
                <View style={styles.contentTop}>
                    <Text style={styles.title}>
                        {certificateData.title}
                    </Text>

                    <Text style={styles.expire}>
                        {certificateData.expires ? `${certificateData.expires}` : "Perpetuel"}
                    </Text>
                </View>

                <View style={styles.contentDescriptionContainer}>
                    <Text style={styles.contentDescription}>
                        {certificateData.description || "Aucune description fournie."}
                    </Text>
                </View>

                <View style={styles.attachmentsContainer}>
                    {Array.isArray(certificateData.attachments) && certificateData.attachments.length > 0 ? (
                        certificateData.attachments.map(({
                                                             title,
                                                             uri
                                                         }, index) => (
                            <TouchableOpacity                       // pour ouvrir/télécharger le PDF
                                key={index}
                                style={styles.attachmentItem}
                                onPress={() => openPDF(uri)}
                            >
                                <AntDesign name="filetext1" size={16}
                                           color={theme.colors.textDark}/>
                                <Text style={styles.attachmentText}
                                      numberOfLines={1} ellipsizeMode="middle">
                                    {title ?? `Document ${index + 1}`}
                                </Text>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <Text style={styles.attachmentText}>Aucun document
                            joint.</Text>
                    )}
                </View>
            </View>
        </View>
    );

}

function BoatEvent({eventData}) {
    const theme = useTheme();
    console.log("boat event : ", eventData);
    const styles = StyleSheet.create({
        container: {
            padding: 15,
            borderWidth: 1,
            borderColor: theme.colors.neutral,
            borderStyle: 'solid',
            borderRadius: 15,
            marginVertical: 10,
            backgroundColor: theme.colors.surfaceLight,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: 10,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.neutral,
            borderStyle: 'solid',
        },
        headerLeft: {},
        boatName: {
            color: theme.colors.textDark,
            ...theme.textStyles.titleMedium,
        },
        date: {
            color: theme.colors.textDark,
            ...theme.textStyles.bodyMedium,
        },
        headerRightText: {
            color: theme.colors.textDark,
            ...theme.textStyles.titleMedium,
            borderRadius: 30,
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: theme.colors.neutral,
            paddingVertical: 5,
            paddingHorizontal: 10,
        },
        content: {
            paddingTop: 15,
        },
        title: {
            color: theme.colors.textDark,
            ...theme.textStyles.titleMedium,
        },
        description: {
            color: theme.colors.textDark,
            ...theme.textStyles.bodyLarge,
            paddingVertical: 5,
        },
        attachmentsContainer: {},
        attachmentItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 5,
            paddingHorizontal: 10,
            borderWidth: 1,
            borderColor: theme.colors.neutral,
            borderStyle: 'solid',
            borderRadius: 50,
            margin: 5
        },
        attachmentText: {
            color: theme.colors.textDark,
            ...theme.textStyles.titleSmall,
        },
    });
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.boatName}>
                        {eventData.boatName}
                    </Text>
                    <Text style={styles.date}>
                        {eventData.date}
                    </Text>
                </View>
                <View>
                    <Text style={styles.headerRightText}>
                        {eventData.shortTitle}
                    </Text>
                </View>
            </View>
            <View style={styles.content}>
                <Text style={styles.title}>
                    {eventData.title}
                </Text>
                <Text style={styles.description}>
                    {eventData.description || "Aucune description fournie."}
                </Text>
                <View style={styles.attachmentsContainer}>
                    {Array.isArray(eventData.attachments) && eventData.attachments.length > 0 ? (
                        eventData.attachments.map(({
                                                             title,
                                                             uri
                                                         }, index) => (
                            <TouchableOpacity                       // pour ouvrir/télécharger le PDF
                                key={index}
                                style={styles.attachmentItem}
                                onPress={() => openPDF(uri)}
                            >
                                <AntDesign name="filetext1" size={16}
                                           color={theme.colors.textDark}/>
                                <Text style={styles.attachmentText}
                                      numberOfLines={1} ellipsizeMode="middle">
                                    {title ?? `Document ${index + 1}`}
                                </Text>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <Text style={styles.attachmentText}>Aucun document
                            joint.</Text>
                    )}
                </View>
            </View>

        </View>
    )
}


const openPDF = async (url: string) => {
    try {
        await WebBrowser.openBrowserAsync(encodeURI(url.trim()), {
            enableDefaultShareMenuItem: false,
        });
    } catch (e) {
        Alert.alert("Impossible d’ouvrir le document PDF.");
    }
};
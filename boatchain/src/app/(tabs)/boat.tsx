import {
    View,
    Text,
    StyleSheet,
    Image,
    Animated,
    Pressable
} from "react-native";
import {useEffect, useState} from "react";
import ScrollView = Animated.ScrollView;
import {FontAwesome6} from "@expo/vector-icons";
import {Link} from "expo-router";

const Boat = () => {
    const [boats, setBoats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("http://192.168.2.10:5000/boats")
            .then((res) => res.json())
            .then((data) => {
// transforme { "1.json": {...}, "2.json": {...} } en [{ id: "1.json", ... }, ...]
                const boatsArray = Object.entries(data).map(([id, boat]) => ({
                    id,
                    ...boat,
                }));
                setBoats(boatsArray);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Erreur de chargement:", error);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>Loading...</Text>
            </View>
        );
    }

    if (boats.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>No boats available</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.tiles}>
                {boats.map((boat) => (
                    <BoatTile key={boat.id} boat={boat}/>
                ))}
            </ScrollView>
        </View>
    );
};

export default Boat;

const BoatTile = ({boat}) => {
    const {specification, images} = boat;
    const mainImage = images?.[0]?.uri;

    return (
        <View style={tileStyles.card}>
            <View>
                {mainImage && (
                    <Image source={{uri: mainImage}} style={tileStyles.image}/>
                )}

                <View style={tileStyles.boatTypeContainer}>
                    <Text style={tileStyles.boatType}>
                        {specification?.boat_type}
                    </Text>
                </View>
            </View>
            <View style={tileStyles.content}>
                <View style={tileStyles.titleContainer}>
                    <Text
                        style={tileStyles.title}>{specification?.title}</Text>
                    <BoatChainValidated status={specification?.status}/>
                </View>
                <View style={tileStyles.descriptionContainer}>
                    <Text style={tileStyles.description}>
                        {specification?.summary}
                    </Text>
                </View>
                <View style={tileStyles.otherContainer}>
                    <View>
                        <Text style={tileStyles.price}>
                            {specification?.price?.toLocaleString('fr-FR')} $
                        </Text>
                        <Text>
                            {specification?.city}, {specification?.postal_code}
                        </Text>
                    </View>
                    <Link href="/(tabs)/shop/BoatDetailsPage" asChild>
                        <Pressable style={tileStyles.moreContainer}>
                            <Text style={tileStyles.more}>Voir plus</Text>
                        </Pressable>
                    </Link>
                </View>
            </View>
        </View>
    );
};

const BoatChainValidated = ({status}: { status: string }) => {
    if (status === "validated") {
        return (
            <View style={boatChainValidatedStyles.container}>
                <FontAwesome6 name={'sailboat'}
                              size={12}
                              color="#007AFF"
                />
                <Text style={boatChainValidatedStyles.text}>Validé par
                    BoatChain</Text>
            </View>
        )
    } else if (status === "suspicious") {
        return (
            <View style={boatChainValidatedStyles.container}>
                <FontAwesome6 name={'sailboat'}
                              size={12}
                              color="#ff0000"
                />
                <Text style={boatChainValidatedStyles.text}>Suspicieux</Text>
            </View>
        )
    } else {
        return (
            <View style={boatChainValidatedStyles.container}>
                <FontAwesome6 name={'sailboat'}
                              size={12}
                              color="#ffb700"
                />
                <Text style={boatChainValidatedStyles.text}>Inconnu</Text>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "600",
        marginBottom: 10,
    },
    text: {
        fontSize: 20,
        color: "#333",
    },
    tiles: {
        flexDirection: "column",
        flexWrap: "wrap",
        justifyContent: "center",
        paddingBottom: 100,
        paddingTop: 20,
        width: "100%",
        paddingHorizontal: "5%",
    },
});

const tileStyles = StyleSheet.create({
    card: {
        overflow: "hidden",
        width: "100%",
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    image: {
        width: "100%",
        borderRadius: 15,
        height: 180,
    },
    content: {
        paddingVertical: 15,
    },
    titleContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
    },
    descriptionContainer: {
        paddingVertical: 5,
    },
    description: {
        fontSize: 14,
        color: "#666",
        marginTop: 5,
    },
    otherContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    moreContainer: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderStyle: "solid",
        justifyContent: "center",
        backgroundColor: "#FFFFFF",
    },
    more: {
        fontSize: 13,
        fontWeight: "700",
    },
    price: {
        fontSize: 16,
        fontWeight: "700",
    },
    boatTypeContainer: {
        position: "absolute",
        top: 10,
        left: 10,
        backgroundColor: "#dadada",
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: "#FFFFFF",
    },
    boatType: {
        fontSize: 12,
        fontWeight: "900",
    }
});

const boatChainValidatedStyles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        borderStyle: "solid",
        borderWidth: 1,
        borderRadius: 30,
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderColor: "#E5E7EB"
    },
    text: {
        fontSize: 12,
        marginHorizontal: 5,
        fontWeight: "700",
    }
})


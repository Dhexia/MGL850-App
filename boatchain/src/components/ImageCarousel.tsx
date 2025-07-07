import {useTheme} from "@/theme";
import {useNavigation} from "@react-navigation/native";
import {useRef, useState} from "react";
import {
    FlatList,
    View,
    StyleSheet,
    ImageBackground,
    Dimensions, useColorScheme, Platform
} from 'react-native';

export default function ImageCarousel() {
    const data = [
        {
            id: 1,
            uri: "http://192.168.2.10:5000/images/1/1_001.jpg"
        },
        {
            id: 2,
            uri: "http://192.168.2.10:5000/images/1/1_002.jpg"
        },
        {
            id: 3,
            uri: "http://192.168.2.10:5000/images/1/1_003.jpg"
        }
    ]

    const theme = useTheme();
    const colorScheme = useColorScheme();
    const navigation = useNavigation();

    const carouselRef = useRef<FlatList<{
        id: number;
        uri: string
    }> | null>(null);

    const viewConfigRef = {viewAreaCoveragePercentThreshold: 95}
    const [activeIndex, setActiveIndex] = useState<number>(0)

    const onViewRef = useRef(({changed}) => {
        if (changed[0].isViewable) {
            setActiveIndex(changed[0].index);
        }
    });

    const height = Platform.OS === 'web' ? 400 : 9 / 16 * Dimensions.get("screen").width - 20

    const styles = StyleSheet.create({
        container: {
            height: height,
            // backgroundColor: theme.colors.backgroundLight,
            borderRadius: 25,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            width: Dimensions.get("screen").width - 20
        },
        imageDimension: {
            width: Dimensions.get("screen").width - 20,
            height: 300,
        },
        imageStyle: {},
        dotContainer: {
            flexDirection: "row",
            justifyContent: "center",
            marginVertical: 15,
            position: "absolute",
            bottom: 5,
            backgroundColor: colorScheme === 'dark' ? 'rgba(213,213,213,0.9)' : 'rgba(122,122,122,0.9)',
            borderRadius: 25,
        },
        dot: {
            width: 7,
            height: 7,
            margin: 5,
            borderRadius: 30,
            backgroundColor: theme.colors.textLight,
        }
    });

    return (
        <View style={styles.container}>
            <FlatList
                data={data}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                renderItem={({item, index}) => {
                    return (
                        <ImageBackground
                            source={{uri: item.uri}}
                            style={styles.imageDimension}
                            imageStyle={styles.imageStyle}
                            resizeMode="auto"
                        >

                        </ImageBackground>
                    );
                }}
                keyExtractor={(item) => item.id.toString()}
                pagingEnabled={true}
                ref={(ref) => {
                    carouselRef.current = ref;
                }}
                viewabilityConfig={viewConfigRef}
                onViewableItemsChanged={onViewRef.current}
            />
            <View style={styles.dotContainer}>
                {data.map(({}, index) => (
                    <View
                        key={index}
                        style={[
                            styles.dot,
                            {opacity: index === activeIndex ? 1 : 0.5},
                        ]}
                    >

                    </View>
                ))}
            </View>
        </View>
    );
}
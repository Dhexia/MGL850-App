import {StyleSheet, Pressable} from "react-native";
import {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import Animated from "react-native-reanimated"
import {useEffect} from "react";

export function TabBarButton({
                                 onPress,
                                 onLongPress,
                                 isFocused,
                                 routeName,
                                 icon
                             }) {
    const scale = useSharedValue(0);

    useEffect(() => {
        scale.value = withSpring(
            typeof isFocused === 'boolean' ? (isFocused ? 1 : 0) : isFocused,
            {duration: 350}
        );
    }, [isFocused, scale])

    const animatedIconStyle = useAnimatedStyle(() => {
        const scaleValue = interpolate(scale.value, [0, 1], [1, 1.2]);
        const top = interpolate(scale.value, [0, 1], [0, 9]);

        return {
            transform: [{scale: scaleValue}],
        }
    });

    const animatedTextStyle = useAnimatedStyle(() => {
        const opacity = interpolate(scale.value, [0, 1], [1, 0]);

        return {
            opacity,
        }
    })

    return (
        <Pressable
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabBarItem}
        >
            <Animated.View
                style={[animatedIconStyle, {
                    alignItems: 'center',

                }]}
            >
                {icon[routeName]({
                    color: isFocused ? "#ffffff" : "#222",
                })}

                {/*<Animated.Text*/}
                {/*    style={[animatedTextStyle, {color: isFocused ? "#fff" : "#222"}]}>*/}
                {/*    {routeName}*/}
                {/*</Animated.Text>*/}
            </Animated.View>


        </Pressable>


    );
}

const styles = StyleSheet.create({
    tabBarItem: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5,
        marginVertical: 8
    },
})


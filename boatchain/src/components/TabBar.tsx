import {
    View,
    Platform,
    TouchableOpacity,
    StyleSheet,
    LayoutChangeEvent
} from 'react-native';
import {useLinkBuilder, useTheme} from '@react-navigation/native';
import {Text, PlatformPressable} from '@react-navigation/elements';
import {MaterialTopTabBarProps} from "@react-navigation/material-top-tabs";
import {Feather, Entypo, Ionicons, FontAwesome6, MaterialCommunityIcons} from "@expo/vector-icons";
import {TabBarButton} from "@/components/TabBarButton";
import {useEffect, useState} from "react";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from "react-native-reanimated";

export function TabBar({
                           state,
                           descriptors,
                           navigation
                       }: MaterialTopTabBarProps) {
    const {colors} = useTheme();
    const {buildHref} = useLinkBuilder();
    const icon = {
        index: (props) => <MaterialCommunityIcons name="home" {...props} />,
        shop: (props) => <MaterialCommunityIcons name="boat" {...props} />,
        chat: (props) => <MaterialCommunityIcons name="chat" {...props} />,
    };

    const [dimensions, setDimensions] = useState({height: 20, width: 100}); // Initial dimensions doesn't matter

    const buttonWidth = dimensions.width / state.routes.length;
    const circleSize = Platform.OS === 'web' ? (dimensions.height - 20) * 3 : dimensions.height - 20;

    const onTabBarLayout = (event: LayoutChangeEvent) => {
        setDimensions({
            height: event.nativeEvent.layout.height,
            width: event.nativeEvent.layout.width,
        });
        tabPositionX.value = withSpring(buttonWidth * state.index + (buttonWidth / 2) - (circleSize) / 2, {duration: 1000});
    }

    const tabPositionX = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{translateX: tabPositionX.value}]
        }
    });

    useEffect(() => {
        tabPositionX.value = withSpring(buttonWidth * state.index + (buttonWidth / 2) - (circleSize) / 2, {duration: 1000});
    }, [state.index]);

    return (
        <View onLayout={onTabBarLayout} style={styles.tabBar}>
            <Animated.View style={[animatedStyle, {
                position: 'absolute',
                backgroundColor: "#0536F8",
                borderRadius: 30,
                height: circleSize,
                width: circleSize,
            }]}/>
            {state.routes.map((route, index) => {
                const {options} = descriptors[route.key];
                const label =
                    options.tabBarLabel !== undefined
                        ? options.tabBarLabel
                        : options.title !== undefined
                            ? options.title
                            : route.name;

                const isFocused = state.index === index;

                const onPress = () => {

                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name, route.params);
                    }
                };

                const onLongPress = () => {
                    navigation.emit({
                        type: 'tabLongPress',
                        target: route.key,
                    });
                };

                return (
                    <TabBarButton
                        key={route.name}
                        onPress={onPress}
                        onLongPress={onLongPress}
                        isFocused={isFocused}
                        routeName={route.name}
                        icon={icon}
                    />
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        position: 'absolute',
        bottom: Platform.OS === 'web' ? undefined : 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFF',
        width: Platform.OS === 'web' ? '80%' : undefined,
        maxWidth: 1000,
        paddingVertical: 15,
        alignSelf: 'center',
        borderStyle: 'solid',
        borderColor: '#E5E7EB',

        // Only for phone and tablet
        borderTopWidth: 1,

        // Only for web
        borderBottomWidth: 1,

    },
})
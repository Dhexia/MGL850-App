import {
    View,
    Platform,
    TouchableOpacity,
    StyleSheet,
    LayoutChangeEvent
} from 'react-native';
import {useLinkBuilder, useTheme} from '@react-navigation/native';
import {Text, PlatformPressable} from '@react-navigation/elements';
import {BottomTabBarProps} from "@react-navigation/bottom-tabs";
import {Feather, Entypo, Ionicons} from "@expo/vector-icons";
import {TabBarButton} from "@/components/TabBarButton";
import {useState} from "react";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from "react-native-reanimated";

export function TabBar({state, descriptors, navigation}: BottomTabBarProps) {
    const {colors} = useTheme();
    const {buildHref} = useLinkBuilder();
    const icon = {
        index: (props: any) => <Feather name={'home'} size={24} {...props} />,
        shop: (props: any) => <Feather name={'shopping-bag'}
                                       size={24} {...props} />,
        chat: (props: any) => <Ionicons name={'chatbubbles-outline'}
                                        size={24} {...props} />,

    }

    const [dimensions, setDimensions] = useState({height: 20, width: 100}); // Initial dimensions doesn't matter

    const buttonWidth = dimensions.width / state.routes.length;
    const circleSize = dimensions.height - 60;

    const onTabBarLayout = (event: LayoutChangeEvent) => {
        setDimensions({
            height: event.nativeEvent.layout.height,
            width: event.nativeEvent.layout.width,
        });
    }

    const tabPositionX = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{translateX: tabPositionX.value}]
        }
    });

    return (
        <View onLayout={onTabBarLayout} style={styles.tabBar}>
            <Animated.View style={[animatedStyle, {
                position: 'absolute',
                backgroundColor: "#0536F8",
                borderRadius: 30,
                marginBottom: Platform.OS === 'web' ? undefined : 30,
                height: circleSize,
                width: circleSize,
                // width: dimensions.width/state.routes.length - 25,
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
                    tabPositionX.value = withSpring(buttonWidth * index + (buttonWidth / 2) - (circleSize) / 2, {duration: 1000});

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
        paddingBottom: Platform.OS === 'web' ? undefined : 50,
        top: Platform.OS === 'web' ? 50 : undefined,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'fff',
        width: Platform.OS === 'web' ? '80%' : undefined,
        maxWidth: 1000,
        paddingVertical: 15,
        alignSelf: 'center',
        borderStyle: 'solid',
        borderTopColor: '#E5E7EB',
        borderTopWidth: 1,
    },
})
import {
    View,
    Platform,
    TouchableOpacity,
    StyleSheet,
    LayoutChangeEvent
} from 'react-native';
import {useLinkBuilder} from '@react-navigation/native';
import {Text, PlatformPressable} from '@react-navigation/elements';
import {MaterialTopTabBarProps} from "@react-navigation/material-top-tabs";
import {
    Feather,
    Entypo,
    Ionicons,
    FontAwesome6,
    MaterialCommunityIcons
} from "@expo/vector-icons";
import {TabBarButton} from "@/components/TabBarButton";
import {useEffect, useState} from "react";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from "react-native-reanimated";
import {useTheme} from "@/theme";


export function TabBar({
                           state,
                           descriptors,
                           navigation
                       }: MaterialTopTabBarProps) {
    const theme = useTheme();
    const {buildHref} = useLinkBuilder();
    const icon = {
        dashboard: (props) => <Feather name={'home'}
                                       {...props}
                                       size={24}
        />,
        boat: (props) => <FontAwesome6 name={'sailboat'}
                                       {...props}
                                       size={24}
        />,
        discuss: (props) => <Ionicons name={'chatbubbles-outline'}
                                      {...props}
                                      size={24}
        />,
    };

    const [dimensions, setDimensions] = useState({height: 20, width: 100}); // Initial dimensions doesn't matter

    const buttonWidth = dimensions.width / state.routes.length;
    const circleSize = Platform.OS === 'web' ? (dimensions.height - 13) * 3 : dimensions.height - 13;

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

    const styles = StyleSheet.create({
        tabBar: {
            position: Platform.OS === 'web' ? 'relative' : 'absolute',

            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: theme.colors.backgroundLight,
            width: Platform.OS === 'web' ? '80%' : undefined,
            maxWidth: 1000,
            paddingVertical: 15,
            alignSelf: 'center',
            borderStyle: 'solid',
            borderColor: theme.colors.neutral,

            // Only for phone and tablet
            borderTopWidth: Platform.OS === 'web' ? 0 : 1,
            bottom: Platform.OS === 'web' ? undefined : 0,

            // Only for web
            height: Platform.OS === 'web' ? 75 : undefined,
        },
    })


    return (
        <View onLayout={onTabBarLayout} style={styles.tabBar}>
            <Animated.View style={[animatedStyle, {
                position: 'absolute',
                backgroundColor: theme.colors.primary,
                borderRadius: Platform.OS === "web" ? 0 : 30,
                height: Platform.OS === "web" ? 75 : circleSize,
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


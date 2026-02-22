import React from 'react';
import { View, Text, Pressable, StyleSheet, useColorScheme } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Info, Dices, Swords, Trophy, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AppHeader from '../components/AppHeader';
import {
    GameScreen,
    LeaderboardScreen,
    RaffleScreen,
    ProfileScreen,
    AboutScreen,
    StatsScreen,
    ReferralScreen,
} from '../screens';

const Tab = createBottomTabNavigator();
const ProfileStackNav = createNativeStackNavigator();

function ProfileStack() {
    return (
        <ProfileStackNav.Navigator screenOptions={{ headerShown: false }}>
            <ProfileStackNav.Screen name="ProfileMain" component={ProfileScreen} />
            <ProfileStackNav.Screen name="Stats" component={StatsScreen} />
            <ProfileStackNav.Screen name="Referral" component={ReferralScreen} />
        </ProfileStackNav.Navigator>
    );
}

// Match web's mobile-bottom-nav.tsx tab config
const TAB_ICONS: Record<string, typeof Info> = {
    About: Info,
    Raffle: Dices,
    Game: Swords,
    Leaderboard: Trophy,
    Profile: User,
};

const TAB_LABELS: Record<string, string> = {
    About: 'About',
    Raffle: 'Raffle',
    Game: 'Play',
    Leaderboard: 'Ranks',
    Profile: 'Profile',
};

// Custom tab bar matching web's mobile-bottom-nav design
function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const insets = useSafeAreaInsets();

    // Web theme: --primary in dark = oklch(0.922) ≈ #e8e8e8, light = oklch(0.205) ≈ #171717
    // Web theme: --muted-foreground dark = oklch(0.708) ≈ #a3a3a3, light = oklch(0.556) ≈ #737373
    const primaryColor = isDark ? '#e8e8e8' : '#171717';
    const mutedColor = isDark ? '#a3a3a3' : '#737373';
    const cardBg = isDark ? '#171717' : '#ffffff';
    const borderColor = isDark ? 'rgba(255,255,255,0.1)' : '#e5e5e5';

    return (
        <View
            style={[
                styles.tabBar,
                {
                    backgroundColor: cardBg,
                    borderTopColor: borderColor,
                    paddingBottom: insets.bottom || 8,
                },
            ]}
        >
            <View style={styles.tabBarInner}>
                {state.routes.map((route, index) => {
                    const isFocused = state.index === index;
                    const Icon = TAB_ICONS[route.name] || Info;
                    const label = TAB_LABELS[route.name] || route.name;

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

                    return (
                        <Pressable
                            key={route.key}
                            onPress={onPress}
                            style={styles.tabItem}
                            accessibilityRole="button"
                            accessibilityState={isFocused ? { selected: true } : {}}
                        >
                            <View
                                style={[
                                    styles.tabContainer,
                                    isFocused
                                        ? {
                                            borderColor: primaryColor,
                                            backgroundColor: isDark
                                                ? 'rgba(232,232,232,0.1)'
                                                : 'rgba(23,23,23,0.1)',
                                        }
                                        : { borderColor: 'transparent' },
                                ]}
                            >
                                <Icon
                                    size={24}
                                    color={isFocused ? primaryColor : mutedColor}
                                    strokeWidth={2.5}
                                />
                                <Text
                                    style={[
                                        styles.tabLabel,
                                        { color: isFocused ? primaryColor : mutedColor },
                                    ]}
                                >
                                    {label}
                                </Text>
                            </View>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
}

// Navigation themes matching web's CSS variables
const LightTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        background: '#ffffff',
        card: '#ffffff',
        text: '#09090b',
        border: '#e5e5e5',
        primary: '#171717',
    },
};

const DarkNavTheme = {
    ...DarkTheme,
    colors: {
        ...DarkTheme.colors,
        background: '#09090b',
        card: '#171717',
        text: '#fafafa',
        border: '#1a1a1a',
        primary: '#e8e8e8',
    },
};

export default function RootNavigator() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <NavigationContainer theme={isDark ? DarkNavTheme : LightTheme}>
            <View style={{ flex: 1, backgroundColor: isDark ? '#09090b' : '#ffffff' }}>
                <AppHeader />
                <Tab.Navigator
                    tabBar={(props) => <CustomTabBar {...props} />}
                    screenOptions={{ headerShown: false }}
                >
                    <Tab.Screen name="About" component={AboutScreen} />
                    <Tab.Screen name="Raffle" component={RaffleScreen} />
                    <Tab.Screen name="Game" component={GameScreen} />
                    <Tab.Screen name="Leaderboard" component={LeaderboardScreen} />
                    <Tab.Screen name="Profile" component={ProfileStack} />
                </Tab.Navigator>
            </View>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        borderTopWidth: 1,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        overflow: 'hidden',
    },
    tabBarInner: {
        flexDirection: 'row',
        height: 72,
        paddingHorizontal: 4,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        width: '100%',
        borderRadius: 12,
        borderWidth: 2,
    },
    tabLabel: {
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 0.5,
        marginTop: 4,
    },
});

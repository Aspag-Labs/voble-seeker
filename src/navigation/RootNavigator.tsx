import React from 'react';
import { useColorScheme } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, Trophy, Gift, User } from 'lucide-react-native';

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
            <ProfileStackNav.Screen name="About" component={AboutScreen} />
            <ProfileStackNav.Screen name="Stats" component={StatsScreen} />
            <ProfileStackNav.Screen name="Referral" component={ReferralScreen} />
        </ProfileStackNav.Navigator>
    );
}

const LightTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        background: '#f8fafc',
        card: '#ffffff',
        text: '#1e293b',
        border: '#e2e8f0',
        primary: '#6366f1',
    },
};

const DarkNavTheme = {
    ...DarkTheme,
    colors: {
        ...DarkTheme.colors,
        background: '#0f172a',
        card: '#1e293b',
        text: '#f1f5f9',
        border: '#334155',
        primary: '#818cf8',
    },
};

export default function RootNavigator() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <NavigationContainer theme={isDark ? DarkNavTheme : LightTheme}>
            <Tab.Navigator
                screenOptions={{
                    headerShown: false,
                    tabBarStyle: {
                        backgroundColor: isDark ? '#1e293b' : '#ffffff',
                        borderTopColor: isDark ? '#334155' : '#e5e7eb',
                        paddingBottom: 8,
                        paddingTop: 8,
                        height: 60,
                    },
                    tabBarActiveTintColor: isDark ? '#818cf8' : '#6366f1',
                    tabBarInactiveTintColor: isDark ? '#64748b' : '#9ca3af',
                    tabBarLabelStyle: {
                        fontSize: 12,
                        fontWeight: '600',
                    },
                }}
            >
                <Tab.Screen
                    name="Game"
                    component={GameScreen}
                    options={{
                        tabBarLabel: 'Play',
                        tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
                    }}
                />
                <Tab.Screen
                    name="Leaderboard"
                    component={LeaderboardScreen}
                    options={{
                        tabBarIcon: ({ color, size }) => <Trophy size={size} color={color} />,
                    }}
                />
                <Tab.Screen
                    name="Raffle"
                    component={RaffleScreen}
                    options={{
                        tabBarIcon: ({ color, size }) => <Gift size={size} color={color} />,
                    }}
                />
                <Tab.Screen
                    name="Profile"
                    component={ProfileStack}
                    options={{
                        tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
                    }}
                />
            </Tab.Navigator>
        </NavigationContainer>
    );
}

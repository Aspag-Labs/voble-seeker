import React from 'react';
import { View, Text, Image, Pressable, StyleSheet, useColorScheme } from 'react-native';
import { BarChart3 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useWallet } from '../providers';

export default function AppHeader() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const { connected, address } = useWallet();

    // Web theme colors
    const cardBg = isDark ? '#171717' : '#ffffff';
    const borderColor = isDark ? '#1a1a1a' : '#e5e5e5';
    const mutedColor = isDark ? '#a3a3a3' : '#737373';
    const textColor = isDark ? '#fafafa' : '#09090b';
    const outlineBorder = isDark ? '#27272a' : '#e4e4e7';

    const truncatedAddress = address
        ? `${address.slice(0, 4)}...${address.slice(-2)}`
        : null;

    return (
        <View
            style={[
                styles.header,
                {
                    backgroundColor: cardBg,
                    borderBottomColor: borderColor,
                    paddingTop: insets.top,
                },
            ]}
        >
            <View style={styles.headerInner}>
                {/* Left: Logo + BETA */}
                <View style={styles.leftSection}>
                    <Image
                        source={require('../../assets/images/logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={[styles.betaText, { color: mutedColor }]}>
                        BETA
                    </Text>
                </View>

                {/* Right: Stats + Wallet */}
                <View style={styles.rightSection}>
                    {/* Stats icon */}
                    <Pressable
                        onPress={() => navigation.navigate('Profile', { screen: 'Stats' })}
                        style={styles.iconButton}
                    >
                        <BarChart3 size={20} color={mutedColor} strokeWidth={2} />
                    </Pressable>

                    {/* Wallet button */}
                    {connected && truncatedAddress ? (
                        <View
                            style={[
                                styles.walletButton,
                                { borderColor: outlineBorder },
                            ]}
                        >
                            <Text style={[styles.walletText, { color: textColor }]}>
                                {truncatedAddress}
                            </Text>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>
                                    {address?.slice(-1)?.toUpperCase()}
                                </Text>
                            </View>
                        </View>
                    ) : (
                        <Pressable
                            onPress={() => navigation.navigate('Profile')}
                            style={[
                                styles.walletButton,
                                { borderColor: outlineBorder },
                            ]}
                        >
                            <Text style={[styles.walletText, { color: textColor }]}>
                                Connect
                            </Text>
                        </Pressable>
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        borderBottomWidth: 1,
    },
    headerInner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    logo: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    betaText: {
        fontSize: 12,
        fontWeight: '600',
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconButton: {
        padding: 8,
        borderRadius: 8,
    },
    walletButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        gap: 8,
    },
    walletText: {
        fontSize: 14,
        fontWeight: '500',
    },
    avatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#ef4444',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: '#ffffff',
        fontSize: 11,
        fontWeight: '700',
    },
});

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import Svg, { Path, Rect } from 'react-native-svg';
import { colors } from '../utils/styles';
import { useLanguage } from '../utils/LanguageContext';

function HomeIcon({ active }) {
    const color = active ? colors.accent : "#9E9085";
    return (
        <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill={active ? `${colors.accent}15` : "none"} />
            <Path d="M9 22V12h6v10" />
        </Svg>
    );
}

function GridIcon({ active }) {
    const color = active ? colors.accent : "#9E9085";
    return (
        <Svg width="22" height="22" viewBox="0 0 24 24" fill={active ? `${colors.accent}20` : "none"} stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <Rect x="3" y="3" width="7" height="7" rx="1.5" />
            <Rect x="14" y="3" width="7" height="7" rx="1.5" />
            <Rect x="14" y="14" width="7" height="7" rx="1.5" />
            <Rect x="3" y="14" width="7" height="7" rx="1.5" />
        </Svg>
    );
}

function HeartIcon({ active }) {
    const color = active ? colors.accent : "#9E9085";
    return (
        <Svg width="22" height="22" viewBox="0 0 24 24" fill={active ? colors.accent : "none"} stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.72-8.72 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </Svg>
    );
}

function CalendarIcon({ active }) {
    const color = active ? colors.accent : "#9E9085";
    return (
        <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" fill={active ? `${colors.accent}15` : "none"} />
            <Path d="M16 2v4" />
            <Path d="M8 2v4" />
            <Path d="M3 10h18" />
        </Svg>
    );
}

export default function BottomNav({ activeTab }) {
    const { language } = useLanguage();

    const tabs = [
        {
            key: 'index',
            label: language.t('_navHome'),
            icon: HomeIcon,
            pathname: '/',
        },
        {
            key: 'categories',
            label: language.t('_navCategories'),
            icon: GridIcon,
            pathname: '/categories',
        },
        {
            key: 'favorites',
            label: language.t('_navFavorites'),
            icon: HeartIcon,
            pathname: '/favorites',
        },
        {
            key: 'appointments',
            label: language.t('_navAppointments'),
            icon: CalendarIcon,
            pathname: '/appointments',
        },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.key;
                    const IconComponent = tab.icon;
                    return (
                        <TouchableOpacity
                            key={tab.key}
                            style={styles.tabItem}
                            activeOpacity={0.7}
                            onPress={() => {
                                if (!isActive) {
                                    router.replace(tab.pathname);
                                }
                            }}
                        >
                            <View style={[styles.iconWrapper, isActive && styles.activeIconWrapper]}>
                                <IconComponent active={isActive} />
                            </View>
                            <Text style={[styles.label, isActive ? styles.activeLabel : styles.inactiveLabel]}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: '#F0E8E1',
        paddingBottom: Platform.OS === 'ios' ? 20 : 10,
        paddingTop: 8,
        elevation: 12,
        shadowColor: '#2C221E',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    content: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 4,
    },
    iconWrapper: {
        marginBottom: 3,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeIconWrapper: {
        transform: [{ scale: 1.05 }],
    },
    label: {
        fontSize: 11,
        fontFamily: 'ancizar-medium',
    },
    activeLabel: {
        color: colors.accent,
        fontFamily: 'ancizar-bold',
    },
    inactiveLabel: {
        color: '#9E9085',
    },
});

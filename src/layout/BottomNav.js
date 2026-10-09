import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import Svg, { Ellipse, Path, Rect } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
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

function GuideIcon({ active }) {
    const color = active ? colors.accent : "#9E9085";
    return (
        <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <Path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" fill={active ? `${colors.accent}15` : "none"} />
            <Path d="M9 7h7M9 11h5" />
        </Svg>
    );
}

function HalloweenAttentionBadge() {
    return (
        <View style={styles.halloweenAttentionBadge} pointerEvents="none">
            <Svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <Path d="M7 3.3V1.8c0-.5.4-.9.9-.9h.8" stroke="#FFF0D5" strokeWidth="1.2" strokeLinecap="round" />
                <Ellipse cx="7" cy="8.1" rx="5.5" ry="4.7" fill="#F58A2A" stroke="#FFF0D5" strokeWidth=".8" />
                <Path d="m4.6 7.2.9-.8.8.8m1.4 0 .8-.8.9.8M4.8 9.4c1.4 1.1 3 1.1 4.4 0" stroke="#2C1B31" strokeWidth=".9" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
        </View>
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
    const guidesLabel = String(language._locale || "es").toLowerCase().startsWith("es")
        ? "Guías"
        : "Guides";

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
            key: 'guides',
            label: guidesLabel,
            icon: GuideIcon,
            pathname: '/guides',
            halloweenAttention: true,
        },
        {
            key: 'appointments',
            label: language.t('_navAppointments'),
            icon: CalendarIcon,
            pathname: '/appointments',
        },
    ];

    return (
        <SafeAreaView edges={['bottom']} style={styles.container}>
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
                            <View style={[
                                styles.iconWrapper,
                                tab.halloweenAttention && styles.attentionIconWrapper,
                                isActive && styles.activeIconWrapper,
                            ]}>
                                <IconComponent active={isActive} />
                                {tab.halloweenAttention && <HalloweenAttentionBadge />}
                            </View>
                            <Text style={[styles.label, isActive ? styles.activeLabel : styles.inactiveLabel]}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: '#F0E8E1',
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
        position: 'relative',
        width: 30,
        height: 24,
        marginBottom: 3,
        alignItems: 'center',
        justifyContent: 'center',
    },
    attentionIconWrapper: {
        borderRadius: 12,
        backgroundColor: '#FFF0E2',
    },
    halloweenAttentionBadge: {
        position: 'absolute',
        top: -7,
        right: -7,
        width: 17,
        height: 17,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 9,
        borderWidth: 1.5,
        borderColor: colors.white,
        backgroundColor: '#2C1B31',
        elevation: 4,
        shadowColor: '#2C1B31',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
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

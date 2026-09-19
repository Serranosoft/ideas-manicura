import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../utils/styles";
import { router } from "expo-router";
import Svg, { Path, Circle } from "react-native-svg";
import { useLanguage } from "../utils/LanguageContext";
import { SafeAreaView } from "react-native-safe-area-context";


function BackArrowIcon({ color = colors.textDark, size = 20 }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M19 12H5" />
            <Path d="M12 19l-7-7 7-7" />
        </Svg>
    );
}

function SettingsIcon({ color = colors.textDark, size = 20 }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <Circle cx="12" cy="12" r="3" />
            <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </Svg>
    );
}

function HeartMenuIcon({ color = colors.accentDark, size = 18 }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </Svg>
    );
}

export default function Header({ title, back, settings = true, favorites = true }) {
    const { language } = useLanguage();

    return (
        <SafeAreaView edges={["top"]} style={styles.safeArea}>

            <View style={styles.header}>
                <View style={styles.leftContainer}>
                    {back ? (
                        <TouchableOpacity style={styles.backBtn} activeOpacity={0.7} onPress={() => router.back()}>
                            <BackArrowIcon />
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.placeholderBox} />
                    )}
                </View>

                <View style={styles.logoCenter}>
                    <Text style={styles.logoText} numberOfLines={1}>
                        {title || language.t("_homeTitle")}
                    </Text>
                </View>

                <View style={styles.rightContainer}>
                    {favorites && (
                        <TouchableOpacity
                            style={styles.headerIconWrapper}
                            activeOpacity={0.7}
                            accessibilityRole="button"
                            accessibilityLabel={language.t("_navFavorites")}
                            onPress={() => router.push("/favorites")}
                        >
                            <HeartMenuIcon />
                        </TouchableOpacity>
                    )}
                    {settings && (
                        <TouchableOpacity
                            style={styles.headerIconWrapper}
                            activeOpacity={0.7}
                            accessibilityRole="button"
                            accessibilityLabel={language.t("_settingsLabel")}
                            onPress={() => router.push("/settings")}
                        >
                            <SettingsIcon />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: colors.primary,
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 8,
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(240, 232, 225, 0.7)",
    },
    leftContainer: {
        width: 76,
        alignItems: "flex-start",
    },
    rightContainer: {
        width: 76,
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 10,
        alignItems: "center",
    },
    logoCenter: {
        flex: 1,
        alignItems: "center",
    },
    logoText: {
        fontFamily: "ancizar-bold",
        fontSize: 18,
        color: colors.textDark,
        textAlign: "center",
    },
    backBtn: {
        padding: 4,
    },
    placeholderBox: {
        width: 24,
    },
    headerIconWrapper: {
        padding: 4,
    },
});

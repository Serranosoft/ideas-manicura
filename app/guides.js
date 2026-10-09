import React, { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Stack, router } from "expo-router";
import { Image } from "expo-image";
import Svg, { Ellipse, Path } from "react-native-svg";
import Header from "../src/layout/header";
import BottomNav from "../src/layout/BottomNav";
import { useLanguage } from "../src/utils/LanguageContext";
import { colors, ui } from "../src/utils/styles";
import { getGuideCopy, getGuideLabel, guideCategories, guideMatchesFilter } from "../src/utils/guides-data";

function ArrowIcon() {
    return (
        <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.white} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M9 18l6-6-6-6" />
        </Svg>
    );
}

function HalloweenNewIcon() {
    return (
        <Svg width="17" height="17" viewBox="0 0 18 18" fill="none">
            <Path d="M9 4V2.2c0-.7.5-1.2 1.2-1.2h1" stroke="#FFD29A" strokeWidth="1.5" strokeLinecap="round" />
            <Ellipse cx="9" cy="10.2" rx="7" ry="6" fill="#F58A2A" stroke="#FFD29A" strokeWidth="1.1" />
            <Path d="M6.1 8.8 7.3 7.6l1.1 1.2M9.6 8.8l1.1-1.2 1.2 1.2M6.3 11.8c1.7 1.4 3.7 1.4 5.4 0" stroke="#2C1B31" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M5.6 5.4c-1.1 1.1-1.7 2.8-1.7 4.8s.6 3.7 1.7 4.8M12.4 5.4c1.1 1.1 1.7 2.8 1.7 4.8s-.6 3.7-1.7 4.8" stroke="#D96918" strokeWidth=".8" strokeLinecap="round" />
        </Svg>
    );
}

export default function Guides() {
    const { language } = useLanguage();
    const copy = getGuideCopy(language._locale);
    const [activeFilter, setActiveFilter] = useState("all");
    const filters = [
        { id: "all", label: language.t("_guideFilterAll") },
        { id: "halloween", label: language.t("_halloweenTitle") },
    ];
    const filteredCategories = guideCategories
        .map((category) => ({
            ...category,
            designs: category.designs.filter((design) => guideMatchesFilter(design, activeFilter)),
        }))
        .filter((category) => category.designs.length > 0);

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ header: () => <Header title={copy.guidesTitle} /> }} />

            <View style={styles.headerArea}>
                <Text style={ui.h2}>{copy.chooseCategory}</Text>
            </View>

            <View style={styles.filterRow}>
                {filters.map((filter) => {
                    const selected = activeFilter === filter.id;
                    return (
                        <Pressable
                            key={filter.id}
                            accessibilityRole="button"
                            accessibilityState={{ selected }}
                            style={[styles.filterChip, selected && styles.filterChipActive]}
                            onPress={() => setActiveFilter(filter.id)}
                        >
                            <Text style={[styles.filterChipText, selected && styles.filterChipTextActive]}>
                                {filter.label}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>

            <FlatList
                data={filteredCategories}
                extraData={activeFilter}
                numColumns={2}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    const count = item.designs.length;
                    return (
                        <View style={styles.cardWrapper}>
                            <Pressable
                                style={styles.card}
                                accessibilityRole="button"
                                accessibilityLabel={item.id === "halloween" ? language.t("_halloweenTitle") : getGuideLabel(item.title, language._locale)}
                                onPress={() => router.push({
                                    pathname: "/guide-designs",
                                    params: { category: item.id, filter: activeFilter },
                                })}
                            >
                                <Image source={item.cover} style={styles.image} contentFit="cover" transition={500} />
                                <View style={styles.overlay} />
                                {item.id === "halloween" && (
                                    <View style={styles.halloweenNewBadge}>
                                        <HalloweenNewIcon />
                                        <Text style={styles.halloweenNewBadgeText}>{language.t("_newBadge")}</Text>
                                    </View>
                                )}
                                <View style={styles.cardContent}>
                                    <Text style={styles.cardTitle}>{item.id === "halloween" ? language.t("_halloweenTitle") : getGuideLabel(item.title, language._locale)}</Text>
                                    <View style={styles.metaRow}>
                                        <Text style={styles.cardMeta}>
                                            {count} {count === 1 ? copy.design : copy.designs}
                                        </Text>
                                        <View style={styles.arrowCircle}>
                                            <ArrowIcon />
                                        </View>
                                    </View>
                                </View>
                            </Pressable>
                        </View>
                    );
                }}
                ListEmptyComponent={(
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>{copy.noFilteredGuides}</Text>
                    </View>
                )}
            />

            <BottomNav activeTab="guides" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    headerArea: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 10,
        gap: 3,
    },
    listContent: {
        paddingHorizontal: 12,
        paddingBottom: 24,
    },
    filterRow: {
        flexDirection: "row",
        gap: 8,
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    filterChip: {
        minHeight: 38,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 18,
        borderRadius: 19,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        backgroundColor: colors.cardBg,
    },
    filterChipActive: {
        borderColor: colors.accentDark,
        backgroundColor: colors.accentDark,
    },
    filterChipText: {
        color: colors.textDark,
        fontFamily: "ancizar-bold",
        fontSize: 14,
    },
    filterChipTextActive: {
        color: colors.white,
    },
    emptyState: {
        marginHorizontal: 8,
        marginTop: 10,
        paddingHorizontal: 24,
        paddingVertical: 32,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        backgroundColor: colors.cardBg,
    },
    emptyStateText: {
        color: colors.textMuted,
        fontFamily: "ancizar-medium",
        fontSize: 15,
        lineHeight: 21,
        textAlign: "center",
    },
    cardWrapper: {
        flex: 1,
        height: 230,
        padding: 6,
    },
    card: {
        flex: 1,
        borderRadius: 18,
        overflow: "hidden",
        backgroundColor: colors.cardBg,
        elevation: 3,
        shadowColor: colors.textDark,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    image: {
        width: "100%",
        height: "100%",
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(44, 34, 30, 0.28)",
    },
    halloweenNewBadge: {
        position: "absolute",
        top: 12,
        left: 12,
        minHeight: 32,
        flexDirection: "row",
        alignItems: "center",
        gap: 7,
        paddingLeft: 8,
        paddingRight: 11,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(255, 210, 154, 0.7)",
        backgroundColor: "rgba(44, 27, 49, 0.94)",
        elevation: 4,
        shadowColor: "#1B1020",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    halloweenNewBadgeText: {
        color: "#FFF4E8",
        fontFamily: "ancizar-bold",
        fontSize: 10,
        letterSpacing: 1,
        textTransform: "uppercase",
    },
    cardContent: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        padding: 14,
        backgroundColor: "rgba(44, 34, 30, 0.48)",
    },
    cardTitle: {
        color: colors.white,
        fontFamily: "ancizar-bold",
        fontSize: 18,
        marginBottom: 7,
    },
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    cardMeta: {
        color: "rgba(255,255,255,0.88)",
        fontFamily: "ancizar-medium",
        fontSize: 12,
    },
    arrowCircle: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: "rgba(255,255,255,0.18)",
        alignItems: "center",
        justifyContent: "center",
    },
});

import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Stack, router } from "expo-router";
import { Image } from "expo-image";
import Svg, { Path } from "react-native-svg";
import Header from "../src/layout/header";
import BottomNav from "../src/layout/BottomNav";
import { useLanguage } from "../src/utils/LanguageContext";
import { colors, ui } from "../src/utils/styles";
import { getGuideCopy, getGuideLabel, guideCategories } from "../src/utils/guides-data";

function ArrowIcon() {
    return (
        <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.white} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M9 18l6-6-6-6" />
        </Svg>
    );
}

export default function Guides() {
    const { language } = useLanguage();
    const copy = getGuideCopy(language._locale);

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ header: () => <Header title={copy.guidesTitle} /> }} />

            <View style={styles.headerArea}>
                <Text style={ui.badgeLabel}>{copy.guidesBadge}</Text>
                <Text style={ui.h2}>{copy.chooseCategory}</Text>
            </View>

            <FlatList
                data={guideCategories}
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
                                accessibilityLabel={getGuideLabel(item.title, language._locale)}
                                onPress={() => router.push({ pathname: "/guide-designs", params: { category: item.id } })}
                            >
                                <Image source={item.cover} style={styles.image} contentFit="cover" transition={500} />
                                <View style={styles.overlay} />
                                <View style={styles.cardContent}>
                                    <Text style={styles.cardTitle}>{getGuideLabel(item.title, language._locale)}</Text>
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

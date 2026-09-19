import React, { useContext, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import Svg, { Path, Rect } from "react-native-svg";
import Header from "../src/layout/header";
import { AdsContext } from "../src/DataContext";
import { useLanguage } from "../src/utils/LanguageContext";
import { colors, ui } from "../src/utils/styles";
import { getGuideCategory, getGuideCopy, getGuideLabel } from "../src/utils/guides-data";
import { SafeAreaView } from "react-native-safe-area-context";

function LockIcon({ unlocked = false }) {
    return (
        <Svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={colors.white} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <Rect x="4" y="10" width="16" height="11" rx="2" />
            {unlocked
                ? <Path d="M8 10V7a4 4 0 0 1 7.5-2" />
                : <Path d="M8 10V7a4 4 0 0 1 8 0v3" />}
        </Svg>
    );
}

export default function GuideDesigns() {
    const { category: categoryId } = useLocalSearchParams();
    const { language } = useLanguage();
    const copy = getGuideCopy(language._locale);
    const category = getGuideCategory(categoryId);
    const categoryTitle = getGuideLabel(category?.title, language._locale);
    const {
        guideUnlocksLoaded,
        isGuideUnlocked,
        unlockGuideWithReward,
    } = useContext(AdsContext);
    const [unlockingDesign, setUnlockingDesign] = useState(null);

    function openGuide(designId) {
        router.push({
            pathname: "/guide-steps",
            params: { category: categoryId, design: designId },
        });
    }

    async function unlockGuide(item) {
        const guideId = `${categoryId}/${item.id}`;
        setUnlockingDesign(item.id);
        try {
            const result = await unlockGuideWithReward(guideId);
            if (result.status === "earned") {
                openGuide(item.id);
            } else if (result.status === "not-configured" || result.status === "disabled") {
                Alert.alert(copy.adUnavailableTitle, copy.adUnavailableMessage);
            } else if (result.status === "not-ready" || result.status === "busy") {
                Alert.alert(copy.adNotReadyTitle, copy.adNotReadyMessage);
            } else if (result.status === "error") {
                Alert.alert(copy.adErrorTitle, copy.adErrorMessage);
            }
        } finally {
            setUnlockingDesign(null);
        }
    }

    function handleGuidePress(item) {
        const guideId = `${categoryId}/${item.id}`;
        if (isGuideUnlocked(guideId)) {
            openGuide(item.id);
            return;
        }

        if (unlockingDesign) return;
        const guideTitle = getGuideLabel(item.title, language._locale);
        Alert.alert(
            copy.unlockTitle,
            copy.unlockMessage.replace("%{guide}", guideTitle),
            [
                { text: language.t("_cancel"), style: "cancel" },
                { text: copy.watchAd, onPress: () => unlockGuide(item) },
            ]
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ header: () => <Header back title={categoryTitle || copy.guidesTitle} /> }} />

            <View style={styles.headerArea}>
                <Text style={ui.badgeLabel}>{copy.guidesTitle}</Text>
                <Text style={ui.h2}>{copy.designsTitle}</Text>
            </View>

            <SafeAreaView edges={["bottom"]} style={styles.safeContent}>
                <FlatList
                    data={category?.designs || []}
                    numColumns={2}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => {
                        const guideId = `${categoryId}/${item.id}`;
                        const isUnlocked = guideUnlocksLoaded && isGuideUnlocked(guideId);
                        const isUnlocking = unlockingDesign === item.id;
                        return (
                            <View style={styles.cardWrapper}>
                                <Pressable
                                    style={styles.card}
                                    accessibilityRole="button"
                                    accessibilityLabel={getGuideLabel(item.title, language._locale)}
                                    accessibilityHint={isUnlocked
                                        ? copy.unlocked
                                        : copy.unlockMessage.replace("%{guide}", getGuideLabel(item.title, language._locale))}
                                    disabled={!guideUnlocksLoaded || Boolean(unlockingDesign)}
                                    onPress={() => handleGuidePress(item)}
                                >
                                    <Image source={item.cover} style={styles.image} contentFit="cover" transition={500} />
                                    <View style={styles.overlay} />
                                    <View style={styles.unlockPill}>
                                        {isUnlocking || !guideUnlocksLoaded ? (
                                            <ActivityIndicator size="small" color={colors.white} />
                                        ) : (
                                            <LockIcon unlocked={isUnlocked} />
                                        )}
                                        <Text style={styles.unlockPillText}>
                                            {isUnlocked ? copy.unlocked : copy.watchAd}
                                        </Text>
                                    </View>
                                    <View style={styles.cardContent}>
                                        <Text style={styles.cardTitle}>{getGuideLabel(item.title, language._locale)}</Text>
                                        <View style={styles.stepPill}>
                                            <Text style={styles.stepPillText}>{item.images.length} {copy.steps}</Text>
                                        </View>
                                    </View>
                                </Pressable>
                            </View>
                        );
                    }}
                />
            </SafeAreaView>
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
    safeContent: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: 12,
        paddingBottom: 30,
    },
    cardWrapper: {
        flex: 1,
        height: 240,
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
        backgroundColor: "rgba(44, 34, 30, 0.2)",
    },
    unlockPill: {
        position: "absolute",
        top: 12,
        right: 12,
        minHeight: 28,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 14,
        backgroundColor: "rgba(44, 34, 30, 0.68)",
    },
    unlockPillText: {
        color: colors.white,
        fontFamily: "ancizar-bold",
        fontSize: 10,
    },
    cardContent: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        padding: 14,
        backgroundColor: "rgba(44, 34, 30, 0.5)",
    },
    cardTitle: {
        color: colors.white,
        fontFamily: "ancizar-bold",
        fontSize: 17,
        marginBottom: 8,
    },
    stepPill: {
        alignSelf: "flex-start",
        paddingHorizontal: 9,
        paddingVertical: 4,
        borderRadius: 10,
        backgroundColor: "rgba(255,255,255,0.18)",
    },
    stepPillText: {
        color: colors.white,
        fontFamily: "ancizar-medium",
        fontSize: 11,
    },
});

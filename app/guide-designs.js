import React, { useContext, useState } from "react";
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";
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

function RewardIcon() {
    return (
        <Svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={colors.accentDark} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M12 3l2.25 4.56 5.03.73-3.64 3.55.86 5.01L12 14.48l-4.5 2.37.86-5.01-3.64-3.55 5.03-.73L12 3z" />
            <Path d="M9.5 18.1 8.3 22l3.7-2.15L15.7 22l-1.2-3.9" />
        </Svg>
    );
}

function GuideUnlockModal({ copy, guide, language, message, onCancel, onConfirm, title }) {
    const isUnlockConfirmation = Boolean(guide);
    const guideTitle = getGuideLabel(guide?.title, language._locale);

    return (
        <Modal
            animationType="fade"
            transparent
            visible={Boolean(guide || message)}
            statusBarTranslucent
            navigationBarTranslucent
            onRequestClose={onCancel}
        >
            <View style={styles.modalRoot}>
                <Pressable
                    accessibilityLabel={language.t("_cancel")}
                    style={styles.modalBackdrop}
                    onPress={onCancel}
                />

                <View
                    accessibilityViewIsModal
                    style={styles.modalCard}
                >
                    {isUnlockConfirmation && (
                        <View style={styles.modalHero}>
                            <Image
                                source={guide.cover}
                                style={styles.modalHeroImage}
                                contentFit="cover"
                                transition={250}
                            />
                            <View style={styles.modalHeroOverlay} />
                            <View style={styles.modalGuideNameWrap}>
                                <Text style={styles.modalGuideEyebrow}>{copy.guidesTitle}</Text>
                                <Text style={styles.modalGuideName}>{guideTitle}</Text>
                            </View>
                        </View>
                    )}

                    <View style={styles.modalContent}>
                        <View style={[
                            styles.rewardIconWrap,
                            !isUnlockConfirmation && styles.rewardIconStandalone,
                        ]}>
                            <RewardIcon />
                        </View>

                        <Text style={styles.modalTitle}>{title}</Text>
                        <Text style={styles.modalMessage}>
                            {message || copy.unlockMessage.replace("%{guide}", guideTitle)}
                        </Text>

                        {isUnlockConfirmation && (
                            <View style={styles.accessPill}>
                                <Text style={styles.accessPillText}>{copy.rewardAccess}</Text>
                            </View>
                        )}

                        <View style={styles.modalActions}>
                            {isUnlockConfirmation && (
                                <Pressable
                                    accessibilityRole="button"
                                    style={({ pressed }) => [
                                        styles.modalSecondaryButton,
                                        pressed && styles.buttonPressed,
                                    ]}
                                    onPress={onCancel}
                                >
                                    <Text style={styles.modalSecondaryText}>{language.t("_cancel")}</Text>
                                </Pressable>
                            )}

                            <Pressable
                                accessibilityRole="button"
                                style={({ pressed }) => [
                                    styles.modalPrimaryButton,
                                    !isUnlockConfirmation && styles.modalPrimaryButtonFull,
                                    pressed && styles.buttonPressed,
                                ]}
                                onPress={isUnlockConfirmation ? onConfirm : onCancel}
                            >
                                <Text style={styles.modalPrimaryText}>
                                    {isUnlockConfirmation ? copy.watchAd : copy.close}
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
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
    const [unlockModalGuide, setUnlockModalGuide] = useState(null);
    const [statusModal, setStatusModal] = useState(null);

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
                setStatusModal({
                    title: copy.adUnavailableTitle,
                    message: copy.adUnavailableMessage,
                });
            } else if (result.status === "not-ready" || result.status === "busy") {
                setStatusModal({
                    title: copy.adNotReadyTitle,
                    message: copy.adNotReadyMessage,
                });
            } else if (result.status === "error") {
                setStatusModal({
                    title: copy.adErrorTitle,
                    message: copy.adErrorMessage,
                });
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
        setUnlockModalGuide(item);
    }

    function confirmUnlock() {
        const guide = unlockModalGuide;
        if (!guide) return;
        setUnlockModalGuide(null);
        unlockGuide(guide);
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

            <GuideUnlockModal
                copy={copy}
                guide={unlockModalGuide}
                language={language}
                title={copy.unlockTitle}
                onCancel={() => setUnlockModalGuide(null)}
                onConfirm={confirmUnlock}
            />

            <GuideUnlockModal
                copy={copy}
                language={language}
                title={statusModal?.title}
                message={statusModal?.message}
                onCancel={() => setStatusModal(null)}
            />
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
    modalRoot: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 22,
        paddingVertical: 36,
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(44, 34, 30, 0.58)",
    },
    modalCard: {
        width: "100%",
        maxWidth: 390,
        overflow: "hidden",
        borderRadius: 28,
        backgroundColor: colors.cardBg,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.7)",
        elevation: 14,
        shadowColor: "#1E1612",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.28,
        shadowRadius: 24,
    },
    modalHero: {
        height: 154,
        backgroundColor: colors.badgeBg,
    },
    modalHeroImage: {
        width: "100%",
        height: "100%",
    },
    modalHeroOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(44, 34, 30, 0.38)",
    },
    modalGuideNameWrap: {
        position: "absolute",
        left: 22,
        right: 22,
        bottom: 18,
    },
    modalGuideEyebrow: {
        marginBottom: 3,
        color: "rgba(255,255,255,0.82)",
        fontFamily: "ancizar-bold",
        fontSize: 10,
        letterSpacing: 1.1,
        textTransform: "uppercase",
    },
    modalGuideName: {
        color: colors.white,
        fontFamily: "ancizar-bold",
        fontSize: 24,
    },
    modalContent: {
        alignItems: "center",
        paddingHorizontal: 24,
        paddingTop: 25,
        paddingBottom: 22,
    },
    rewardIconWrap: {
        width: 58,
        height: 58,
        alignItems: "center",
        justifyContent: "center",
        marginTop: -54,
        marginBottom: 14,
        borderRadius: 29,
        backgroundColor: "#FFF9EF",
        borderWidth: 4,
        borderColor: colors.cardBg,
        elevation: 5,
        shadowColor: colors.textDark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.14,
        shadowRadius: 8,
    },
    rewardIconStandalone: {
        marginTop: 0,
    },
    modalTitle: {
        color: colors.textDark,
        fontFamily: "ancizar-bold",
        fontSize: 23,
        textAlign: "center",
    },
    modalMessage: {
        marginTop: 9,
        color: colors.textMuted,
        fontFamily: "ancizar-regular",
        fontSize: 15,
        lineHeight: 21,
        textAlign: "center",
    },
    accessPill: {
        marginTop: 17,
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 16,
        backgroundColor: colors.badgeBg,
    },
    accessPillText: {
        color: colors.accentDark,
        fontFamily: "ancizar-bold",
        fontSize: 12,
        letterSpacing: 0.35,
    },
    modalActions: {
        width: "100%",
        flexDirection: "row",
        gap: 10,
        marginTop: 24,
    },
    modalSecondaryButton: {
        flex: 1,
        minHeight: 50,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 25,
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    modalSecondaryText: {
        color: colors.textDark,
        fontFamily: "ancizar-bold",
        fontSize: 15,
    },
    modalPrimaryButton: {
        flex: 1.25,
        minHeight: 50,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 25,
        backgroundColor: colors.accentDark,
        elevation: 3,
        shadowColor: colors.accentDark,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.22,
        shadowRadius: 6,
    },
    modalPrimaryButtonFull: {
        flex: 1,
    },
    modalPrimaryText: {
        color: colors.white,
        fontFamily: "ancizar-bold",
        fontSize: 15,
    },
    buttonPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.985 }],
    },
});

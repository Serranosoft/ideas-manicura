import React, { useContext, useEffect, useRef, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import Svg, { Path } from "react-native-svg";
import Header from "../src/layout/header";
import { AdsContext } from "../src/DataContext";
import { useLanguage } from "../src/utils/LanguageContext";
import { colors } from "../src/utils/styles";
import { getGuideCopy, getGuideDesign, getGuideLabel } from "../src/utils/guides-data";
import { SafeAreaView } from "react-native-safe-area-context";

function Chevron({ direction = "right", color = colors.textDark }) {
    const path = direction === "left" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6";
    return (
        <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <Path d={path} />
        </Svg>
    );
}

export default function GuideSteps() {
    const { category, design: designId } = useLocalSearchParams();
    const { language } = useLanguage();
    const copy = getGuideCopy(language._locale);
    const design = getGuideDesign(category, designId);
    const images = design?.images || [];
    const title = getGuideLabel(design?.title, language._locale) || copy.guidesTitle;
    const [currentStep, setCurrentStep] = useState(0);
    const listRef = useRef(null);
    const { width } = useWindowDimensions();
    const progress = images.length ? ((currentStep + 1) / images.length) * 100 : 0;
    const { guideUnlocksLoaded, isGuideUnlocked } = useContext(AdsContext);
    const guideId = `${category}/${designId}`;

    useEffect(() => {
        if (guideUnlocksLoaded && !isGuideUnlocked(guideId)) {
            router.replace({ pathname: "/guide-designs", params: { category } });
        }
    }, [category, guideId, guideUnlocksLoaded, isGuideUnlocked]);

    function goToStep(index) {
        if (index < 0 || index >= images.length) return;
        listRef.current?.scrollToIndex({ index, animated: true });
        setCurrentStep(index);
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ header: () => <Header back title={title} /> }} />

            <View style={styles.progressRow}>
                <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
                <Text style={styles.counter}>{currentStep + 1}/{images.length}</Text>
            </View>

            <FlatList
                ref={listRef}
                data={images}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                initialNumToRender={images.length}
                maxToRenderPerBatch={images.length}
                windowSize={Math.max(3, images.length)}
                removeClippedSubviews={false}
                keyExtractor={(item) => item}
                getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
                onMomentumScrollEnd={(event) => {
                    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
                    setCurrentStep(Math.max(0, Math.min(nextIndex, images.length - 1)));
                }}
                renderItem={({ item, index }) => (
                    <View style={[styles.page, { width }]}>
                        <View style={styles.imageCard}>
                            <Image
                                source={item}
                                recyclingKey={item}
                                cachePolicy="memory-disk"
                                style={styles.image}
                                contentFit="cover"
                                transition={350}
                            />
                            <View style={styles.stepBadge}>
                                <Text style={styles.stepBadgeText}>{copy.step} {index + 1}</Text>
                            </View>
                        </View>
                    </View>
                )}
            />

            <SafeAreaView edges={["bottom"]} style={styles.footer}>
                <TouchableOpacity
                    style={[styles.previousButton, currentStep === 0 && styles.disabledButton]}
                    activeOpacity={0.75}
                    disabled={currentStep === 0}
                    accessibilityLabel={copy.previous}
                    onPress={() => goToStep(currentStep - 1)}
                >
                    <Chevron direction="left" color={currentStep === 0 ? colors.textMuted : colors.textDark} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.nextButton}
                    activeOpacity={0.8}
                    onPress={() => {
                        if (currentStep < images.length - 1) {
                            goToStep(currentStep + 1);
                        } else {
                            router.back();
                        }
                    }}
                >
                    <Text style={styles.nextButtonText}>
                        {currentStep < images.length - 1 ? copy.next : copy.finish}
                    </Text>
                    {currentStep < images.length - 1 && <Chevron color={colors.white} />}
                </TouchableOpacity>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    progressRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 8,
        gap: 14,
    },
    progressTrack: {
        flex: 1,
        height: 6,
        borderRadius: 3,
        overflow: "hidden",
        backgroundColor: colors.cardBorder,
    },
    progressFill: {
        height: "100%",
        borderRadius: 3,
        backgroundColor: colors.accent,
    },
    counter: {
        width: 42,
        fontFamily: "ancizar-bold",
        fontSize: 13,
        color: colors.textDark,
        textAlign: "right",
    },
    page: {
        flex: 1,
        paddingHorizontal: 18,
        paddingTop: 8,
        paddingBottom: 14,
    },
    imageCard: {
        flex: 1,
        borderRadius: 24,
        overflow: "hidden",
        backgroundColor: colors.cardBg,
        elevation: 4,
        shadowColor: colors.textDark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
    },
    image: {
        width: "100%",
        height: "100%",
    },
    stepBadge: {
        position: "absolute",
        top: 16,
        left: 16,
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 14,
        backgroundColor: "rgba(255,255,255,0.93)",
        elevation: 2,
    },
    stepBadgeText: {
        fontFamily: "ancizar-bold",
        color: colors.accentDark,
        fontSize: 12,
        letterSpacing: 0.5,
        textTransform: "uppercase",
    },
    footer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 18,
        paddingTop: 8,
        paddingBottom: 18,
    },
    previousButton: {
        width: 54,
        height: 54,
        borderRadius: 27,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.cardBg,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    disabledButton: {
        opacity: 0.45,
    },
    nextButton: {
        flex: 1,
        height: 54,
        borderRadius: 27,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: colors.accentDark,
        elevation: 3,
        shadowColor: colors.accentDark,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 7,
    },
    nextButtonText: {
        color: colors.white,
        fontFamily: "ancizar-bold",
        fontSize: 16,
    },
});

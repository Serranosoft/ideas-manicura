import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import Svg, { Path } from "react-native-svg";
import Header from "../src/layout/header";
import GuideMaterials from "../src/components/GuideMaterials";
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

function ToolIcon() {
    return (
        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.accentDark} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <Path d="m14.5 4.5 5 5-8.7 8.7a2.1 2.1 0 0 1-3 0l-2-2a2.1 2.1 0 0 1 0-3L14.5 4.5z" />
            <Path d="m4 20 3.8-1.8-2-2L4 20zM13 6l5 5" />
        </Svg>
    );
}

export default function GuideSteps() {
    const { category, design: designId } = useLocalSearchParams();
    const { language } = useLanguage();
    const copy = getGuideCopy(language._locale);
    const design = getGuideDesign(category, designId);
    const steps = design?.steps || [];
    const pages = useMemo(
        () => [{ id: "materials", type: "materials" }, ...steps.map((step) => ({ ...step, type: "step" }))],
        [steps],
    );
    const title = getGuideLabel(design?.title, language._locale) || copy.guidesTitle;
    const [currentPage, setCurrentPage] = useState(0);
    const listRef = useRef(null);
    const { width } = useWindowDimensions();
    const progress = steps.length ? (currentPage / steps.length) * 100 : 0;
    const { guideUnlocksLoaded, isGuideUnlocked } = useContext(AdsContext);
    const guideId = `${category}/${designId}`;

    useEffect(() => {
        if (guideUnlocksLoaded && !isGuideUnlocked(guideId)) {
            router.replace({ pathname: "/guide-designs", params: { category } });
        }
    }, [category, guideId, guideUnlocksLoaded, isGuideUnlocked]);

    function goToPage(index) {
        if (index < 0 || index >= pages.length) return;
        listRef.current?.scrollToIndex({ index, animated: true });
        setCurrentPage(index);
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ header: () => <Header back title={title} /> }} />

            <View style={styles.progressRow}>
                <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
                <Text style={styles.counter}>{currentPage}/{steps.length}</Text>
            </View>

            <FlatList
                ref={listRef}
                data={pages}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                initialNumToRender={pages.length}
                maxToRenderPerBatch={pages.length}
                windowSize={Math.max(3, pages.length)}
                removeClippedSubviews={false}
                keyExtractor={(item) => item.id || item.image}
                getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
                onMomentumScrollEnd={(event) => {
                    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
                    setCurrentPage(Math.max(0, Math.min(nextIndex, pages.length - 1)));
                }}
                renderItem={({ item, index }) => item.type === "materials" ? (
                    <View style={[styles.materialsPage, { width }]}>
                        <GuideMaterials
                            materials={design?.materials}
                            copy={copy}
                            locale={language._locale}
                        />
                    </View>
                ) : (
                    <View style={[styles.page, { width }]}>
                        <View style={styles.imageCard}>
                            <Image
                                source={item.image}
                                recyclingKey={item.image}
                                cachePolicy="memory-disk"
                                style={styles.image}
                                contentFit="cover"
                                transition={350}
                            />
                            <View style={styles.stepBadge}>
                                <Text style={styles.stepBadgeText}>{copy.step} {index}</Text>
                            </View>
                        </View>

                        <View style={styles.instructionCard}>
                            <Text style={styles.instructionLabel}>{copy.whatToDo}</Text>
                            <Text style={styles.instructionText}>
                                {getGuideLabel(item.instruction, language._locale)}
                            </Text>

                            <View style={styles.toolRow}>
                                <View style={styles.toolIconWrap}>
                                    <ToolIcon />
                                </View>
                                <View style={styles.toolCopy}>
                                    <Text style={styles.toolLabel}>{copy.tool}</Text>
                                    <Text style={styles.toolText}>
                                        {getGuideLabel(item.tool, language._locale)}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                )}
            />

            <SafeAreaView edges={["bottom"]} style={styles.footer}>
                <TouchableOpacity
                    style={[styles.previousButton, currentPage === 0 && styles.disabledButton]}
                    activeOpacity={0.75}
                    disabled={currentPage === 0}
                    accessibilityLabel={copy.previous}
                    onPress={() => goToPage(currentPage - 1)}
                >
                    <Chevron direction="left" color={currentPage === 0 ? colors.textMuted : colors.textDark} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.nextButton}
                    activeOpacity={0.8}
                    onPress={() => {
                        if (currentPage < pages.length - 1) {
                            goToPage(currentPage + 1);
                        } else {
                            router.back();
                        }
                    }}
                >
                    <Text style={styles.nextButtonText}>
                        {currentPage === 0
                            ? copy.startGuide
                            : currentPage < pages.length - 1 ? copy.next : copy.finish}
                    </Text>
                    {currentPage < pages.length - 1 && <Chevron color={colors.white} />}
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
        paddingBottom: 8,
    },
    materialsPage: {
        flex: 1,
    },
    imageCard: {
        flex: 1,
        minHeight: 250,
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
    instructionCard: {
        marginTop: 12,
        paddingHorizontal: 18,
        paddingTop: 15,
        paddingBottom: 14,
        borderRadius: 20,
        backgroundColor: colors.cardBg,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    instructionLabel: {
        color: colors.accentDark,
        fontFamily: "ancizar-bold",
        fontSize: 10,
        letterSpacing: 1.1,
        textTransform: "uppercase",
    },
    instructionText: {
        marginTop: 5,
        color: colors.textDark,
        fontFamily: "ancizar-regular",
        fontSize: 15,
        lineHeight: 20,
    },
    toolRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginTop: 12,
        paddingTop: 11,
        borderTopWidth: 1,
        borderTopColor: colors.cardBorder,
    },
    toolIconWrap: {
        width: 36,
        height: 36,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 18,
        backgroundColor: colors.badgeBg,
    },
    toolCopy: {
        flex: 1,
    },
    toolLabel: {
        color: colors.textMuted,
        fontFamily: "ancizar-bold",
        fontSize: 10,
        letterSpacing: 0.6,
        textTransform: "uppercase",
    },
    toolText: {
        marginTop: 1,
        color: colors.textDark,
        fontFamily: "ancizar-medium",
        fontSize: 14,
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

import React, { useState, useEffect, useContext } from "react";
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    Pressable,
    ActivityIndicator
} from "react-native";
import { Link, Stack, router } from "expo-router";
import { Image } from "expo-image";
import Svg, { Path, Circle } from "react-native-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "../src/utils/styles";
import { DataContext, AdsContext } from "../src/DataContext";
import { useLanguage } from "../src/utils/LanguageContext";
import BottomNav from "../src/layout/BottomNav";
import { SafeAreaView } from "react-native-safe-area-context";

function SettingsIcon({ color = colors.textDark, size = 20 }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <Circle cx="12" cy="12" r="3" />
            <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </Svg>
    );
}

function HeartHeaderIcon({ color = colors.accentDark, size = 20 }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </Svg>
    );
}

function HeartBadge({ isFav, size = 16 }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill={isFav ? "#E53935" : "none"} stroke={isFav ? "#E53935" : "#FFFFFF"} strokeWidth="2.2">
            <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </Svg>
    );
}

const ARTIST_NAMES = [
    "Sofía M.",
    "Studio 22",
    "Elena Nails",
    "ArteNail",
    "NailLab",
    "Clara Atelier",
];

export default function Home() {
    const { language } = useLanguage();
    const { favorites, setFavorites } = useContext(DataContext);
    const { setAdTrigger } = useContext(AdsContext);

    const [rawMedia, setRawMedia] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDesigns();
    }, []);

    async function loadDesigns() {
        try {
            setLoading(true);
            const response = await fetch("https://mollydigital.manu-scholz.com/wp-json/custom/v1/media-filtered?app=diseno-de-unas");
            const data = await response.json();
            if (Array.isArray(data)) {
                setRawMedia(data);
            }
        } catch (error) {
            console.log("Error al cargar diseños:", error);
        } finally {
            setLoading(false);
        }
    }

    const trendingItems = [
        {
            id: "trend-1",
            image: "https://mollydigital.manu-scholz.com/wp-content/uploads/2026/09/local-58a94635e61e3234be72.jpg",
        },
        {
            id: "trend-2",
            image: "https://mollydigital.manu-scholz.com/wp-content/uploads/2026/09/local-9721f81a746bfb2d1875.jpg",
        },
        {
            id: "trend-3",
            image: "https://mollydigital.manu-scholz.com/wp-content/uploads/2026/09/local-b4faaa67997369aa646c.jpg",
        },
        {
            id: "trend-4",
            image: "https://mollydigital.manu-scholz.com/wp-content/uploads/2026/09/local-1fae44a2ec0026026866.jpg",
        },
        {
            id: "trend-5",
            image: "https://mollydigital.manu-scholz.com/wp-content/uploads/2026/09/local-26e1f1871ed754b59249.jpg",
        },
    ];

    // Priorizar diseños de Verano y 3D para la sección de Populares
    const summerItems = rawMedia.filter((item) => item.categoria === "verano");
    const d3Items = rawMedia.filter((item) => item.categoria === "3d");
    const otherItems = rawMedia.filter((item) => item.categoria !== "verano" && item.categoria !== "3d");

    const priorityItems = [];
    const maxLen = Math.max(summerItems.length, d3Items.length);
    for (let i = 0; i < maxLen; i++) {
        if (i < summerItems.length) priorityItems.push(summerItems[i]);
        if (i < d3Items.length) priorityItems.push(d3Items[i]);
    }
    const sortedMedia = [...priorityItems, ...otherItems];

    const popularDesigns = sortedMedia.map((item, idx) => {
        const titleKey = `_designName${idx % 30}`;
        const localizedTitle = language.t(titleKey);
        const artist = ARTIST_NAMES[idx % ARTIST_NAMES.length];
        const byArtistText = `${language.t("_byArtist")} ${artist}`;
        return {
            id: item.id || `img-${idx}`,
            url: item.url,
            title: localizedTitle,
            author: byArtistText,
            category: item.categoria,
        };
    });

    const newDesignsPreview = popularDesigns.slice(0, 6);

    async function toggleFavorite(imageUrl) {
        let newFavorites;
        if (favorites.includes(imageUrl)) {
            newFavorites = favorites.filter((fav) => fav !== imageUrl);
        } else {
            newFavorites = [...favorites, imageUrl];
        }
        setFavorites(newFavorites);
        await AsyncStorage.setItem("favorites", JSON.stringify(newFavorites));
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header compacto con fondo armonizado */}
            <SafeAreaView edges={["top"]} style={styles.topHeader}>
                <View style={styles.headerActions}>
                    <TouchableOpacity
                        style={styles.headerActionBtn}
                        accessibilityRole="button"
                        accessibilityLabel={language.t("_navFavorites")}
                        onPress={() => router.push("/favorites")}
                    >
                        <HeartHeaderIcon />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.headerActionBtn}
                        accessibilityRole="button"
                        accessibilityLabel={language.t("_settingsLabel")}
                        onPress={() => router.push("/settings")}
                    >
                        <SettingsIcon />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <Text style={styles.heroTitle}>{language.t("_heroTitle")}</Text>
                </View>

                {/* Sección 1: Tendencias */}
                <View style={[styles.sectionContainer, styles.trendingSection]}>
                    <View style={styles.sectionHeaderRow}>
                        <View style={styles.sectionHeading}>
                            <Text style={styles.sectionTitle}>{language.t("_trendingTitle")}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.seeAllButton}
                            accessibilityRole="button"
                            accessibilityLabel={language.t("_seeAll")}
                            onPress={() => router.push("/categories")}
                        >
                            <Text style={styles.seeAllText}>{language.t("_seeAll")}</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.trendScroll}
                    >
                        {trendingItems.map((item) => (
                            <Link
                                key={item.id}
                                asChild
                                href={{ pathname: "/image", params: { image: item.image } }}
                            >
                                <Pressable
                                    style={styles.trendCard}
                                    onPress={() => setAdTrigger((prev) => prev + 1)}
                                >
                                    <Image
                                        transition={500}
                                        style={styles.trendImage}
                                        source={item.image}
                                        placeholder={"L8FOP=~UKOxt$mI9IAbGBQw[%MRk"}
                                    />
                                </Pressable>
                            </Link>
                        ))}
                    </ScrollView>
                </View>

                {/* Sección 2: Nuevos Diseños */}
                <View style={[styles.sectionContainer, styles.newSection]}>
                    <View style={styles.sectionHeaderRow}>
                        <View style={styles.sectionHeading}>
                            <Text style={styles.sectionTitle}>{language.t("_newTitle")}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.seeAllButton}
                            accessibilityRole="button"
                            accessibilityLabel={language.t("_seeAll")}
                            onPress={() => router.push("/new-designs")}
                        >
                            <Text style={styles.seeAllText}>{language.t("_seeAll")}</Text>
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <View style={styles.loadingBox}>
                            <ActivityIndicator size="large" color={colors.accent} />
                        </View>
                    ) : (
                        <View style={styles.gridContainer}>
                            {newDesignsPreview.map((item) => {
                                const isFav = favorites.includes(item.url);
                                return (
                                    <View key={`new-prev-${item.id}`} style={styles.gridCardWrapper}>
                                        <Link
                                            asChild
                                            href={{ pathname: "/image", params: { image: item.url } }}
                                        >
                                            <Pressable
                                                style={styles.gridCard}
                                                onPress={() => setAdTrigger((prev) => prev + 1)}
                                            >
                                                <Image
                                                    transition={500}
                                                    style={styles.gridImage}
                                                    source={item.url}
                                                    placeholder={"L8FOP=~UKOxt$mI9IAbGBQw[%MRk"}
                                                />

                                                <TouchableOpacity
                                                    style={[
                                                        styles.favCircle,
                                                        isFav && styles.favCircleActive,
                                                    ]}
                                                    activeOpacity={0.8}
                                                    onPress={(e) => {
                                                        e.stopPropagation();
                                                        toggleFavorite(item.url);
                                                    }}
                                                >
                                                    <HeartBadge isFav={isFav} size={16} />
                                                </TouchableOpacity>
                                            </Pressable>
                                        </Link>
                                    </View>
                                );
                            })}
                        </View>
                    )}
                </View>

                {/* Sección 3: Diseños Populares */}
                <View style={[styles.sectionContainer, styles.popularSection]}>
                    <View style={styles.sectionHeaderRow}>
                        <View style={styles.sectionHeading}>
                            <Text style={styles.sectionTitle}>{language.t("_popularTitle")}</Text>
                        </View>
                    </View>

                    {loading ? (
                        <View style={styles.loadingBox}>
                            <ActivityIndicator size="large" color={colors.accent} />
                        </View>
                    ) : (
                        <View style={styles.gridContainer}>
                            {popularDesigns.slice(0, 10).map((item) => {
                                const isFav = favorites.includes(item.url);
                                return (
                                    <View key={item.id} style={styles.gridCardWrapper}>
                                        <Link
                                            asChild
                                            href={{ pathname: "/image", params: { image: item.url } }}
                                        >
                                            <Pressable
                                                style={styles.gridCard}
                                                onPress={() => setAdTrigger((prev) => prev + 1)}
                                            >
                                                <Image
                                                    transition={500}
                                                    style={styles.gridImage}
                                                    source={item.url}
                                                    placeholder={"L8FOP=~UKOxt$mI9IAbGBQw[%MRk"}
                                                />

                                                <TouchableOpacity
                                                    style={[
                                                        styles.favCircle,
                                                        isFav && styles.favCircleActive,
                                                    ]}
                                                    activeOpacity={0.8}
                                                    onPress={(e) => {
                                                        e.stopPropagation();
                                                        toggleFavorite(item.url);
                                                    }}
                                                >
                                                    <HeartBadge isFav={isFav} size={16} />
                                                </TouchableOpacity>
                                            </Pressable>
                                        </Link>
                                    </View>
                                );
                            })}
                        </View>
                    )}
                </View>
            </ScrollView>

            <BottomNav activeTab="index" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    topHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 6,
        backgroundColor: colors.background,
    },
    headerActions: {
        width: 72,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 8,
    },
    headerActionBtn: {
        padding: 4,
    },
    scrollContent: {
        paddingBottom: 32,
    },
    heroSection: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 4,
    },
    heroTitle: {
        fontFamily: "ancizar-bold",
        fontSize: 30,
        lineHeight: 36,
        color: colors.textDark,
        marginBottom: 6,
    },
    sectionContainer: {
        marginHorizontal: 12,
        marginTop: 20,
        paddingTop: 18,
        paddingBottom: 16,
        borderWidth: 1,
        borderRadius: 24,
        overflow: "hidden",
        elevation: 2,
        shadowColor: "#2C221E",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.07,
        shadowRadius: 10,
    },
    trendingSection: {
        backgroundColor: "#FFF7F1",
        borderColor: "#E8D4BE",
    },
    newSection: {
        backgroundColor: colors.cardBg,
        borderColor: colors.cardBorder,
    },
    popularSection: {
        backgroundColor: "#F3EEE9",
        borderColor: "#E3D8CF",
    },
    sectionHeaderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    sectionHeading: {
        flex: 1,
        alignItems: "flex-start",
        paddingRight: 12,
    },
    sectionTitle: {
        fontFamily: "ancizar-bold",
        fontSize: 25,
        lineHeight: 29,
        color: colors.textDark,
        letterSpacing: -0.25,
    },
    seeAllButton: {
        flexShrink: 0,
        minHeight: 38,
        justifyContent: "center",
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 19,
        backgroundColor: colors.accentDark,
        elevation: 1,
        shadowColor: "#2C221E",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
    },
    seeAllText: {
        fontFamily: "ancizar-bold",
        fontSize: 14,
        color: colors.white,
    },
    trendScroll: {
        paddingLeft: 16,
        paddingRight: 2,
    },
    trendCard: {
        width: 190,
        height: 250,
        borderRadius: 20,
        marginRight: 14,
        overflow: "hidden",
        backgroundColor: colors.cardBg,
        elevation: 3,
        shadowColor: "#2C221E",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    trendImage: {
        width: "100%",
        height: "100%",
    },
    loadingBox: {
        paddingVertical: 40,
        alignItems: "center",
    },
    gridContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        paddingHorizontal: 10,
    },
    gridCardWrapper: {
        width: "50%",
        padding: 6,
        marginBottom: 8,
    },
    gridCard: {
        height: 180,
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: colors.cardBg,
        position: "relative",
        elevation: 2,
        shadowColor: "#2C221E",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
    },
    gridImage: {
        width: "100%",
        height: "100%",
    },
    favCircle: {
        position: "absolute",
        top: 10,
        right: 10,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "rgba(0,0,0,0.35)",
        alignItems: "center",
        justifyContent: "center",
    },
    favCircleActive: {
        backgroundColor: "rgba(255,255,255,0.95)",
    },
    cardInfoArea: {
        paddingTop: 6,
        paddingHorizontal: 4,
    },
    designTitle: {
        fontFamily: "ancizar-bold",
        fontSize: 14.5,
        color: colors.textDark,
    },
    designAuthor: {
        fontFamily: "ancizar-regular",
        fontSize: 12,
        color: colors.textMuted,
        marginTop: 1,
    },
});

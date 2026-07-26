import React, { useContext, useEffect, useState } from "react";
import {
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import { Link, Stack } from "expo-router";
import { Image } from "expo-image";
import Svg, { Path } from "react-native-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DataContext, AdsContext } from "../src/DataContext";
import { useLanguage } from "../src/utils/LanguageContext";
import { colors, ui } from "../src/utils/styles";
import Header from "../src/layout/header";
import BottomNav from "../src/layout/BottomNav";

function HeartBadge({ isFav, size = 16 }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill={isFav ? "#E53935" : "none"} stroke={isFav ? "#E53935" : "#FFFFFF"} strokeWidth="2.2">
            <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.72-8.72 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
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

export default function NewDesigns() {
    const { language } = useLanguage();
    const { favorites, setFavorites } = useContext(DataContext);
    const { setAdTrigger } = useContext(AdsContext);

    const [designs, setDesigns] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNewDesigns();
    }, []);

    async function loadNewDesigns() {
        try {
            setLoading(true);
            const response = await fetch("https://mollydigital.manu-scholz.com/wp-json/custom/v1/media-filtered?app=diseno-de-unas");
            const data = await response.json();
            if (Array.isArray(data)) {
                // Formatear y obtener los más recientes (primeros elementos o subconjunto dedicado)
                const formatted = data.map((item, idx) => {
                    const titleKey = `_designName${idx % 30}`;
                    const localizedTitle = language.t(titleKey);
                    const artist = ARTIST_NAMES[idx % ARTIST_NAMES.length];
                    const byArtistText = `${language.t("_byArtist")} ${artist}`;
                    return {
                        id: item.id || `new-${idx}`,
                        url: item.url,
                        title: localizedTitle,
                        author: byArtistText,
                    };
                });
                setDesigns(formatted);
            }
        } catch (error) {
            console.log("Error al cargar nuevos diseños:", error);
        } finally {
            setLoading(false);
        }
    }

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
            <Stack.Screen
                options={{
                    header: () => <Header back={true} title={language.t("_newTitle")} />,
                }}
            />

            <View style={styles.headerArea}>
                <Text style={ui.badgeLabel}>{language.t("_newBadge")}</Text>
                <Text style={ui.h2}>{language.t("_newTitle")}</Text>
            </View>

            {loading ? (
                <View style={styles.loadingBox}>
                    <ActivityIndicator size="large" color={colors.accent} />
                </View>
            ) : (
                <View style={styles.listWrapper}>
                    <FlatList
                        contentContainerStyle={styles.listContent}
                        data={designs}
                        numColumns={2}
                        showsVerticalScrollIndicator={false}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => {
                            const isFav = favorites.includes(item.url);
                            return (
                                <View style={styles.cardContainer}>
                                    <Link
                                        asChild
                                        href={{ pathname: "/image", params: { image: item.url } }}
                                    >
                                        <Pressable
                                            style={styles.card}
                                            onPress={() => setAdTrigger((prev) => prev + 1)}
                                        >
                                            <Image
                                                transition={500}
                                                style={styles.image}
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
                                    <View style={styles.cardInfoArea}>
                                        <Text style={styles.designTitle} numberOfLines={1}>
                                            {item.title}
                                        </Text>
                                        <Text style={styles.designAuthor} numberOfLines={1}>
                                            {item.author}
                                        </Text>
                                    </View>
                                </View>
                            );
                        }}
                    />
                </View>
            )}

            <BottomNav activeTab="index" />
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
        paddingTop: 12,
        paddingBottom: 10,
    },
    listWrapper: {
        flex: 1,
        paddingHorizontal: 10,
    },
    listContent: {
        paddingBottom: 24,
    },
    loadingBox: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    cardContainer: {
        flex: 1,
        margin: 6,
        marginBottom: 14,
    },
    card: {
        aspectRatio: 1,
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: colors.cardBg,
        position: "relative",
        elevation: 2,
        shadowColor: "#2C221E",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
    },
    image: {
        width: "100%",
        height: "100%",
    },
    favCircle: {
        position: "absolute",
        top: 8,
        right: 8,
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
        fontSize: 14,
        color: colors.textDark,
    },
    designAuthor: {
        fontFamily: "ancizar-regular",
        fontSize: 12,
        color: colors.textMuted,
        marginTop: 1,
    },
});

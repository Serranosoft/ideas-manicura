import React, { useContext, useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Link, Stack } from "expo-router";
import { Image } from "expo-image";
import Svg, { Path } from "react-native-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DataContext } from "../src/DataContext";
import { useLanguage } from "../src/utils/LanguageContext";
import { colors, ui } from "../src/utils/styles";
import Header from "../src/layout/header";
import BottomNav from "../src/layout/BottomNav";

import AssignDesignModal from "../src/components/AssignDesignModal";

function HeartIconFilled({ size = 16 }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="#E53935" stroke="#E53935" strokeWidth="2">
            <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.72-8.72 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </Svg>
    );
}

function CalendarBadgeIcon({ size = 15 }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={colors.accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
            <Path d="M16 2v4" />
            <Path d="M8 2v4" />
            <Path d="M3 10h18" />
        </Svg>
    );
}

export default function Favorites() {
    const { language } = useLanguage();
    const { favorites, setFavorites } = useContext(DataContext);
    const [favoriteImages, setFavoriteImages] = useState([]);
    const [selectedImageForAssign, setSelectedImageForAssign] = useState(null);

    useEffect(() => {
        setFavoriteImages([...favorites]);
    }, [favorites]);

    async function removeFavorite(imageUrl) {
        const newFavs = favorites.filter((item) => item !== imageUrl);
        setFavorites(newFavs);
        await AsyncStorage.setItem("favorites", JSON.stringify(newFavs));
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ header: () => <Header title={language.t("_favoritesTitle")} /> }} />

            <View style={styles.headerArea}>
                <Text style={ui.badgeLabel}>{language.t("_myFavorites")}</Text>
                <Text style={ui.h2}>{language.t("_favoritesTitle")}</Text>
            </View>

            {favoriteImages.length > 0 ? (
                <View style={styles.listWrapper}>
                    <FlatList
                        contentContainerStyle={styles.listContent}
                        data={favoriteImages}
                        numColumns={2}
                        showsVerticalScrollIndicator={false}
                        keyExtractor={(item, index) => `${item}-${index}`}
                        renderItem={({ item }) => (
                            <View style={styles.cardContainer}>
                                <Link asChild href={{ pathname: "/image", params: { image: item } }}>
                                    <Pressable style={styles.card}>
                                        <Image
                                            transition={500}
                                            style={styles.image}
                                            source={item}
                                            placeholder={"L8FOP=~UKOxt$mI9IAbGBQw[%MRk"}
                                        />
                                        <TouchableOpacity
                                            style={styles.assignBadgeCircle}
                                            activeOpacity={0.8}
                                            onPress={(e) => {
                                                e.stopPropagation();
                                                setSelectedImageForAssign(item);
                                            }}
                                        >
                                            <CalendarBadgeIcon size={15} />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.favBadgeCircle}
                                            activeOpacity={0.8}
                                            onPress={(e) => {
                                                e.stopPropagation();
                                                removeFavorite(item);
                                            }}
                                        >
                                            <HeartIconFilled size={15} />
                                        </TouchableOpacity>
                                    </Pressable>
                                </Link>
                            </View>
                        )}
                    />
                </View>
            ) : (
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconCircle}>
                        <HeartIconFilled size={32} />
                    </View>
                    <Text style={styles.emptyText}>{language.t("_noFavorites")}</Text>
                </View>
            )}

            <AssignDesignModal
                visible={Boolean(selectedImageForAssign)}
                onClose={() => setSelectedImageForAssign(null)}
                image={selectedImageForAssign}
            />

            <BottomNav activeTab="favorites" />
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
    cardContainer: {
        flex: 1,
        aspectRatio: 1,
        margin: 6,
    },
    card: {
        flex: 1,
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
    assignBadgeCircle: {
        position: "absolute",
        top: 8,
        left: 8,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        alignItems: "center",
        justifyContent: "center",
        elevation: 2,
    },
    favBadgeCircle: {
        position: "absolute",
        top: 8,
        right: 8,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        alignItems: "center",
        justifyContent: "center",
        elevation: 2,
    },
    emptyContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 40,
    },
    emptyIconCircle: {
        width: 68,
        height: 68,
        borderRadius: 34,
        backgroundColor: colors.badgeBg,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    emptyText: {
        fontFamily: "ancizar-medium",
        fontSize: 15,
        color: colors.textMuted,
        textAlign: "center",
        lineHeight: 22,
    },
});
import React, { useState, useCallback } from "react";
import { FlatList, StyleSheet, Text, View, Pressable } from "react-native";
import { Link, Stack, useFocusEffect } from "expo-router";
import { Image } from "expo-image";
import { colors, ui } from "../src/utils/styles";
import { fetchDesigns } from "../src/utils/data";
import { applyCategoryUpdates, CATEGORY_UPDATE_SINCE } from "../src/utils/category-updates";
import { useLanguage } from "../src/utils/LanguageContext";
import Header from "../src/layout/header";
import BottomNav from "../src/layout/BottomNav";

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const { language } = useLanguage();

    useFocusEffect(
        useCallback(() => {
            const list = fetchDesigns(language._locale);
            setCategories(list);
            const controller = new AbortController();
            fetch(`https://mollydigital.manu-scholz.com/wp-json/inspiration-importer/v1/category-updates?since=${encodeURIComponent(CATEGORY_UPDATE_SINCE)}`, { signal: controller.signal })
                .then((response) => response.ok ? response.json() : null)
                .then((updates) => {
                    if (updates && !controller.signal.aborted) {
                        setCategories((current) => applyCategoryUpdates(current, updates));
                    }
                })
                .catch(() => {});
            for (const category of list.filter((item) => item.coverCategory)) {
                fetch(`https://mollydigital.manu-scholz.com/wp-json/custom/v1/media-filtered?app=diseno-de-unas&categoria=${encodeURIComponent(category.coverCategory)}`, { signal: controller.signal })
                    .then((response) => response.ok ? response.json() : [])
                    .then((media) => {
                        const image = Array.isArray(media) ? media.find((item) => item.url)?.url : null;
                        if (image && !controller.signal.aborted) {
                            setCategories((current) => current.map((item) => item.name === category.name ? { ...item, image } : item));
                        }
                    })
                    .catch(() => {});
            }
            return () => controller.abort();
        }, [language])
    );

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ header: () => <Header title={language.t("_navCategories")} /> }} />
            
            <View style={styles.headerTitleArea}>
                <Text style={ui.h2}>{language.t("_allCategoriesTitle")}</Text>
            </View>

            <View style={styles.listWrapper}>
                <FlatList
                    contentContainerStyle={styles.listContent}
                    data={categories}
                    numColumns={2}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item, index) => `${item.name}-${index}`}
                    renderItem={({ item }) => (
                        <View style={styles.cardContainer}>
                            <Link asChild href={{ pathname: "/gallery", params: { name: item.name, title: item.title } }}>
                                <Pressable style={styles.card}>
                                    <Image
                                        transition={600}
                                        style={styles.image}
                                        source={item.image}
                                        placeholder={"L8FOP=~UKOxt$mI9IAbGBQw[%MRk"}
                                    />
                                    <View style={styles.overlayGradient} />
                                    {item.isNew && (
                                        <View style={styles.newBadge}>
                                            <Text style={styles.newBadgeText}>{language.t("_newBadge")}</Text>
                                        </View>
                                    )}
                                    <View style={styles.cardFooter}>
                                        <Text style={styles.cardTitle}>{item.title}</Text>
                                    </View>
                                </Pressable>
                            </Link>
                        </View>
                    )}
                />
            </View>

            <BottomNav activeTab="categories" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    headerTitleArea: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 8,
    },
    listWrapper: {
        flex: 1,
        paddingHorizontal: 12,
    },
    listContent: {
        paddingBottom: 24,
    },
    cardContainer: {
        flex: 1,
        height: 180,
        margin: 6,
    },
    card: {
        flex: 1,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: colors.cardBg,
        elevation: 2,
        shadowColor: '#2C221E',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
    },
    image: {
        width: "100%",
        height: "100%",
    },
    overlayGradient: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(44, 34, 30, 0.35)",
    },
    cardFooter: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 12,
        justifyContent: 'flex-end',
    },
    newBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: colors.accentDark,
    },
    newBadgeText: {
        color: colors.white,
        fontFamily: 'ancizar-bold',
        fontSize: 11,
        letterSpacing: 0.5,
    },
    cardTitle: {
        color: colors.white,
        fontFamily: 'ancizar-bold',
        fontSize: 16,
        textShadowColor: 'rgba(0, 0, 0, 0.4)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
});

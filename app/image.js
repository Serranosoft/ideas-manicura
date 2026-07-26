import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, ToastAndroid, View, TouchableOpacity, Text, Platform, Alert } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";
import { ImageZoom } from '@likashefqet/react-native-image-zoom';
import Svg, { Path } from "react-native-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "../src/utils/styles";
import { bannerId } from "../src/utils/constants";
import { useLanguage } from "../src/utils/LanguageContext";
import Header from "../src/layout/header";
import { AdsContext, DataContext } from "../src/DataContext";

function HeartIconAction({ isFav, size = 20 }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill={isFav ? "#E53935" : "none"} stroke={isFav ? "#E53935" : colors.textDark} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.72-8.72 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </Svg>
    );
}

function DownloadIconAction({ size = 20 }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={colors.white} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <Path d="M7 10l5 5 5-5" />
            <Path d="M12 15V3" />
        </Svg>
    );
}

export default function ImageWrapper() {
    const params = useLocalSearchParams();
    const { image } = params;
    const imageName = image ? image.substring(image.lastIndexOf("/") + 1, image.length) : "imagen";
    const { language } = useLanguage();

    const { favorites, setFavorites } = useContext(DataContext);
    const { adsLoaded, setShowOpenAd } = useContext(AdsContext);
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        if (image) {
            setIsFavorite(favorites.includes(image));
        }
    }, [image, favorites]);

    async function handleFavorite() {
        let newFavorites;
        if (!favorites.includes(image)) {
            newFavorites = [...favorites, image];
            setIsFavorite(true);
        } else {
            newFavorites = favorites.filter((fav) => fav !== image);
            setIsFavorite(false);
        }
        setFavorites(newFavorites);
        await AsyncStorage.setItem("favorites", JSON.stringify(newFavorites));
    }

    async function requestPermissions() {
        try {
            setShowOpenAd(false);
            const { status } = await MediaLibrary.requestPermissionsAsync(true);
            if (status === "granted") {
                downloadImage();
            } else {
                if (Platform.OS === "android") {
                    ToastAndroid.showWithGravityAndOffset(
                        "No tengo permisos para acceder a la galería de su dispositivo",
                        ToastAndroid.LONG,
                        ToastAndroid.BOTTOM,
                        25,
                        50
                    );
                } else {
                    Alert.alert("No tengo permisos para acceder a la galería de su dispositivo");
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    async function downloadImage() {
        try {
            const { uri } = await FileSystem.downloadAsync(image, FileSystem.documentDirectory + `${imageName}.jpg`);
            await MediaLibrary.createAssetAsync(uri);

            if (Platform.OS === "android") {
                ToastAndroid.showWithGravityAndOffset(
                    language.t("_toastImageSaved"),
                    ToastAndroid.LONG,
                    ToastAndroid.BOTTOM,
                    25,
                    50
                );
            } else {
                Alert.alert(language.t("_toastImageSaved"));
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ header: () => <Header back={true} title={language.t("_designDetail")} /> }} />

            <View style={styles.bannerWrapper}>
                {adsLoaded && <BannerAd unitId={bannerId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} requestOptions={{}} />}
            </View>

            <View style={styles.zoomContainer}>
                {Boolean(image) && (
                    <ImageZoom
                        uri={image}
                        source={{ uri: image }}
                        style={styles.imageZoom}
                        minScale={1}
                        maxScale={3}
                        isDoubleTapEnabled
                        resizeMode="contain"
                    />
                )}
            </View>

            {/* Floating Action Bar */}
            <View style={styles.actionsFloatingContainer}>
                <View style={styles.actionsBar}>
                    <TouchableOpacity
                        style={styles.favBtn}
                        activeOpacity={0.8}
                        onPress={handleFavorite}
                    >
                        <HeartIconAction isFav={isFavorite} size={20} />
                        <Text style={[styles.favBtnText, isFavorite && styles.favBtnTextActive]}>
                            {isFavorite ? language.t("_removeFavorites") : language.t("_addFavorites")}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.downloadBtn}
                        activeOpacity={0.8}
                        onPress={requestPermissions}
                    >
                        <DownloadIconAction size={18} />
                        <Text style={styles.downloadBtnText}>{language.t("_download")}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    bannerWrapper: {
        position: "relative",
        zIndex: 1,
    },
    zoomContainer: {
        flex: 1,
        width: "100%",
        height: "100%",
        paddingBottom: 90,
    },
    imageZoom: {
        width: "100%",
        height: "100%",
    },
    actionsFloatingContainer: {
        position: "absolute",
        bottom: 24,
        left: 20,
        right: 20,
        alignItems: "center",
    },
    actionsBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: colors.white,
        borderRadius: 30,
        paddingVertical: 8,
        paddingHorizontal: 12,
        elevation: 6,
        shadowColor: "#2C221E",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
        width: "100%",
        maxWidth: 380,
    },
    favBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 24,
        backgroundColor: "#F4ECE6",
        flex: 1,
        marginRight: 8,
        justifyContent: "center",
    },
    favBtnText: {
        fontFamily: "ancizar-bold",
        fontSize: 13.5,
        color: colors.textDark,
    },
    favBtnTextActive: {
        color: "#E53935",
    },
    downloadBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 24,
        backgroundColor: colors.accent,
        justifyContent: "center",
    },
    downloadBtnText: {
        fontFamily: "ancizar-bold",
        fontSize: 14,
        color: colors.white,
    },
});
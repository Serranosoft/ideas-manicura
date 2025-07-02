import { Stack, useLocalSearchParams } from "expo-router";
import { Image as ReactNativeImage, Pressable, StyleSheet, ToastAndroid, View, TouchableOpacity, Image, Text, Platform } from "react-native";
import { colors, ui } from "../src/utils/styles";
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";
import { bannerId } from "../src/utils/constants";
import { ImageZoom } from '@likashefqet/react-native-image-zoom';
import { useLanguage } from "../src/utils/LanguageContext";
import Header from "../src/layout/header";
import { useContext, useState } from "react";
import { DataContext } from "../src/DataContext";


export default function ImageWrapper() {

    const params = useLocalSearchParams();
    const { image } = params;
    const imageName = image.substring(image.lastIndexOf("/") + 1, image.length);
    const { language } = useLanguage();

    const { favorites, setFavorites } = useContext(DataContext)
    const [isFavorite, setIsFavorite] = useState(false);

    // Agrega o elimina favoritos del estado
        async function handleFavorite() {
            if (!favorites.includes(image)) {
                setFavorites(favorites.concat(image))
                setIsFavorite(true);
            } else {
                let favoritesAux = [...favorites];
                favoritesAux.splice(favoritesAux.indexOf(image), 1)
                setFavorites(favoritesAux);
                setIsFavorite(false);
            }
        }

    async function requestPermissions() {
        try {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status === "granted") {
                downloadImage();
            } else {
                if (Platform.OS === "android") {
                    ToastAndroid.showWithGravityAndOffset(
                        "No tengo permisos para acceder a la galería de su dispositivo",
                        ToastAndroid.LONG,
                        ToastAndroid.BOTTOM,
                        25,
                        50,
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

            // Agregar la imagen al álbum
            const asset = await MediaLibrary.createAssetAsync(uri);

            // Obtener el álbum existente o crearlo
            let album = await MediaLibrary.getAlbumAsync(language.t("_nailDesigns"));
            if (!album) {
                album = await MediaLibrary.createAlbumAsync(language.t("_nailDesigns"), asset, true);
            } else {
                await MediaLibrary.addAssetsToAlbumAsync([asset], album, true);
            }

            if (Platform.OS === "android") {
                ToastAndroid.showWithGravityAndOffset(
                    language.t("_toastImageSaved"),
                    ToastAndroid.LONG,
                    ToastAndroid.BOTTOM,
                    25,
                    50,
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
            <Stack.Screen options={{ header: () => <Header back={true} /> }} />
            <BannerAd unitId={bannerId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} requestOptions={{}} />

            <ImageZoom
                onResetAnimationEnd={false}
                minScale={1}
                maxScale={3}
                uri={image}
                isDoubleTapEnabled
            />

           
            <View style={styles.actions}>
                <View style={[styles.action]}>
                    <TouchableOpacity onPress={() => handleFavorite()} style={styles.button}>
                        {
                            isFavorite ?
                            <Image style={styles.icon} source={require("../assets/heart-filled.png")} />
                            :
                            <Image style={styles.icon} source={require("../assets/heart-unfilled.png")} />
                        }
                        {/* <Favorite {...{ isFavorite, setIsFavorite, image }} /> */}
                    </TouchableOpacity>
                    <Text style={ui.h5}>{isFavorite ? language.t("_removeFavorites") : language.t("_addFavorites")} </Text>
                </View>
                <View style={[styles.action, { marginLeft: "auto"}]}>
                    <TouchableOpacity onPress={() => requestPermissions()} style={styles.button}>
                        <Image style={styles.icon} source={require("../assets/download-dark.png")} />
                    </TouchableOpacity>
                    <Text style={ui.h5}>{language.t("_download")}</Text>
                </View>
            </View>

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: "relative",
        backgroundColor: "#fff"
    },

    image: {
        width: "100%",
        height: "100%",
    },

    actions: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        flexDirection: "row",
        // justifyContent: "center",
        gap: 20,
        borderTopWidth: 2,
        borderColor: colors.accent,
    },

    action: {
        alignItems: "center",
        gap: 4,
    },

    button: {
        padding: 8,
        borderRadius: 100,
        backgroundColor: colors.primary,
    },
    icon: {
        width: 35,
        height: 35,
    },
})
import { Stack, useLocalSearchParams } from "expo-router";
import { Image as ReactNativeImage, Pressable, StyleSheet, ToastAndroid, View } from "react-native";
import Header from "../src/components/header";
import { ui } from "../src/utils/styles";
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import Image from 'react-native-image-progress';
import * as Progress from 'react-native-progress';
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";
import { bannerId } from "../src/utils/constants";

export default function ImageWrapper() {

    const params = useLocalSearchParams();
    const { image } = params;
    const imageName = image.substring(image.lastIndexOf("/") + 1, image.length);

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
            let album = await MediaLibrary.getAlbumAsync("Diseños de uñas");
            if (!album) {
                album = await MediaLibrary.createAlbumAsync("Diseños de uñas", asset, true);
            } else {
                await MediaLibrary.addAssetsToAlbumAsync([asset], album, true);
            }
            
            if (Platform.OS === "android") {
                ToastAndroid.showWithGravityAndOffset(
                    "Imagen guardada en tu galería en el albúm «Diseños de uñas»",
                    ToastAndroid.LONG,
                    ToastAndroid.BOTTOM,
                    25,
                    50,
                );
            } else {
                Alert.alert("Imagen guardada en tu galería en el albúm «Diseños de uñas»");
            }
            


        } catch (error) {
            console.log(error);
        }
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ header: () => <Header image={image} withFavorite={true} /> }} />
            <BannerAd unitId={bannerId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} requestOptions={{}} />
            <Image
                style={styles.image}
                source={{ uri: image }}
                resizeMode="contain"
                indicator={Progress.Bar}
                indicatorProps={{
                    size: 150,
                    height: 35,
                    width: 275,
                    borderWidth: 0,
                    color: 'rgba(91, 26, 35, 1)',
                    unfilledColor: 'rgba(91, 26, 35, 0.2)'
                }}
            />
            <Pressable onPress={requestPermissions} style={[ui.floatingWrapper, { left: 15 }]}>
                <ReactNativeImage style={[ui.floatingImg, { marginBottom: 6, marginLeft: 1 }]} source={require("../assets/download.png")} />
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: "relative",
    },

    image: {
        width: "100%",
        height: "100%",
    }
})
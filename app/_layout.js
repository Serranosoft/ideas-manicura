import { SplashScreen, Stack } from "expo-router";
import { View, StatusBar, StyleSheet } from "react-native";
import { createRef, useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { DataContext } from "../src/DataContext";
import { colors } from "../src/utils/styles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AdsHandler from "../src/components/AdsHandler";
import Constants from "expo-constants";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LanguageProvider } from "../src/utils/LanguageContext";
import UpdatesModal from "../src/layout/updates-modal";
import * as StoreReview from 'expo-store-review';

SplashScreen.preventAutoHideAsync();

export default function Layout() {

    // Carga de fuentes.
    const [fontsLoaded] = useFonts({
        "Regular": require("../assets/fonts/AncizarSans-Regular.ttf"),
        "Medium": require("../assets/fonts/AncizarSans-Medium.ttf"),
        "Semibold": require("../assets/fonts/AncizarSans-Bold.ttf"),
        "Bold": require("../assets/fonts/AncizarSans-ExtraBold.ttf")
    });

    useEffect(() => {
        if (fontsLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded])

    const [favorites, setFavorites] = useState([]);
    useEffect(() => {
        async function getFavorites() {
            const value = await AsyncStorage.getItem("favorites");
            if (value !== null) {
                setFavorites(JSON.parse(value));
            }
        }
        // Borrar favoritos si es la primera vez que inicializa la app
        async function isFirstTime() {
            const value = await AsyncStorage.getItem("FIRST_LAUNCH_APP");
            if (!value) {
                AsyncStorage.setItem("favorites", JSON.stringify([]));
                AsyncStorage.setItem("FIRST_LAUNCH_APP", "has launched");
            }
        }

        isFirstTime();
        getFavorites();
    }, [])

    // Gestión de anuncios
    const [adTrigger, setAdTrigger] = useState(0);
    const adsHandlerRef = createRef();

    useEffect(() => {
        if (adTrigger > 2) {
            askForReview();
        } else if (adTrigger > 4) {
            adsHandlerRef.current.showIntersitialAd();
            setAdTrigger(0);
        }
    }, [adTrigger])

    async function askForReview() {
        if (await StoreReview.hasAction()) {
            StoreReview.requestReview()
        }
    }

    // Esperar hasta que las fuentes se carguen
    if (!fontsLoaded) {
        return null;
    }

    return (
        <View style={styles.container}>
            <AdsHandler ref={adsHandlerRef} adType={[0]} />
            <LanguageProvider>
                <DataContext.Provider value={{ favorites: favorites, setFavorites: setFavorites, setAdTrigger: setAdTrigger }}>
                    <GestureHandlerRootView style={styles.wrapper}>
                        <Stack />
                    </GestureHandlerRootView>
                    <UpdatesModal />
                </DataContext.Provider>
            </LanguageProvider>
            <StatusBar style="light" backgroundColor={colors.primary} />
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: "relative",
        justifyContent: "center",
        paddingTop: Constants.statusBarHeight,
    },
    wrapper: {
        flex: 1,
        width: "100%",
        alignSelf: "center",
        justifyContent: "center",
    }
})
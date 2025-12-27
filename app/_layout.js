import { Stack } from "expo-router";
import { View, StatusBar, StyleSheet, AppState } from "react-native";
import { createRef, useEffect, useState } from "react";
import { AdsContext, DataContext } from "../src/DataContext";
import { colors } from "../src/utils/styles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AdsHandler from "../src/components/AdsHandler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LanguageProvider } from "../src/utils/LanguageContext";
import UpdatesModal from "../src/layout/updates-modal";
import * as StoreReview from "expo-store-review";
import { userPreferences } from "../src/utils/user-preferences";
import * as Notifications from 'expo-notifications';

export default function Layout() {

    // Gestión de anuncios
    const [adsLoaded, setAdsLoaded] = useState(false);
    const [adTrigger, setAdTrigger] = useState(0);
    const [showOpenAd, setShowOpenAd] = useState(true);
    const adsHandlerRef = createRef();

    // Gestión de favoritos
    const [favorites, setFavorites] = useState([]);

    // Cargar base de datos, preferencias de usuario y notificaciones
    useEffect(() => {
        configureNotifications();
    }, [])

    useEffect(() => {
        async function getFavorites() {
            const value = await AsyncStorage.getItem("favorites");
            if (value !== null) {
                setFavorites(JSON.parse(value));
            }
        }
        // 1.2 Borrar favoritos si es la primera vez que inicializa la app (debido a migracion del hosting)
        async function isFirstTime() {
            const value = await AsyncStorage.getItem("FIRST_LAUNCH_APP_2");
            if (!value) {
                AsyncStorage.setItem("favorites", JSON.stringify([]));
                AsyncStorage.setItem("FIRST_LAUNCH_APP_2", "has launched");
            }
        }

        configureNotifications();
        isFirstTime();
        getFavorites();
    }, [])


    useEffect(() => {
        if (adTrigger > 2) {
            askForReview();
        }

        if (adsLoaded) {
            if (adTrigger > 5) {
                adsHandlerRef.current.showIntersitialAd();
                setAdTrigger(0);
            }
        }
    }, [adTrigger])

    async function askForReview() {
        try {
            if (AppState.currentState !== "active") return;
            if (await StoreReview.hasAction()) {
                StoreReview.requestReview()
            }
        } catch (error) {
            console.log(error);
        }
    }

    async function configureNotifications() {
        const { granted } = await Notifications.requestPermissionsAsync();
        if (granted) {
            await AsyncStorage.setItem(userPreferences.NOTIFICATION_PERMISSION, "true");
            Notifications.setNotificationHandler({
                handleNotification: async () => ({
                    shouldShowBanner: true,
                    shouldShowList: true,
                    shouldPlaySound: false,
                    shouldSetBadge: false,
                }),
            });
        } else {
            await AsyncStorage.setItem(userPreferences.NOTIFICATION_PERMISSION, "false");
        }
    }

    return (
        <View style={styles.container}>
            <AdsHandler ref={adsHandlerRef} setAdsLoaded={setAdsLoaded} showOpenAd={showOpenAd} setShowOpenAd={setShowOpenAd} adsLoaded={adsLoaded} />
            <LanguageProvider>
                <DataContext.Provider value={{ favorites: favorites, setFavorites: setFavorites }}>
                    <AdsContext.Provider value={{ setAdTrigger: setAdTrigger, setShowOpenAd: setShowOpenAd, adsLoaded: adsLoaded }}>
                        <GestureHandlerRootView style={styles.wrapper}>
                            <Stack />
                        </GestureHandlerRootView>
                        <UpdatesModal />
                    </AdsContext.Provider>
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
    },
    wrapper: {
        flex: 1,
        width: "100%",
        alignSelf: "center",
        justifyContent: "center",
    }
})
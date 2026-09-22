import { Stack, usePathname } from "expo-router";
import { View, StyleSheet, AppState } from "react-native";
import { useEffect, useRef, useState } from "react";
import { AdsContext, DataContext } from "../src/DataContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AdsHandler from "../src/components/AdsHandler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LanguageProvider } from "../src/utils/LanguageContext";
import UpdatesModal from "../src/layout/updates-modal";
import * as StoreReview from "expo-store-review";
import { userPreferences } from "../src/utils/user-preferences";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { guideAccessRequiresReward } from "../src/utils/constants";

import { scheduleAppointmentNotification, cancelAppointmentNotification } from "../src/utils/appointmentNotifications";
import { ensureNotificationPermissionsAsync } from "../src/utils/notifications";

const GUIDE_UNLOCKS_STORAGE_KEY = "rewardedGuideUnlocks";
const GUIDE_UNLOCK_DURATION_MS = 24 * 60 * 60 * 1000;

export default function Layout() {
    const pathname = usePathname();

    // Gestión de anuncios
    const [adsLoaded, setAdsLoaded] = useState(false);
    const [adTrigger, setAdTrigger] = useState(0);
    const [showOpenAd, setShowOpenAd] = useState(true);
    const [privacyOptionsRequired, setPrivacyOptionsRequired] = useState(false);
    const [rewardedAdLoaded, setRewardedAdLoaded] = useState(false);
    const [requestNonPersonalizedAdsOnly, setRequestNonPersonalizedAdsOnly] =
        useState(true);
    const adsHandlerRef = useRef(null);
    const reviewRequestedRef = useRef(false);
    const appOpenBlocked =
        pathname === "/image"
        || pathname === "/appointments"
        || pathname === "/guide-steps";

    // En plataformas con anuncios, una recompensa desbloquea la guía durante
    // 24 horas. En iOS las guías son de acceso directo mientras no haya anuncios.
    const [unlockedGuides, setUnlockedGuides] = useState([]);
    const [guideUnlocksLoaded, setGuideUnlocksLoaded] = useState(
        !guideAccessRequiresReward
    );
    const unlockedGuidesRef = useRef({});

    function isGuideUnlocked(guideId) {
        return !guideAccessRequiresReward
            || Number(unlockedGuidesRef.current[guideId]) > Date.now();
    }

    async function saveGuideUnlocks(unlocks) {
        await AsyncStorage.setItem(GUIDE_UNLOCKS_STORAGE_KEY, JSON.stringify(unlocks));
    }

    async function removeExpiredGuideUnlocks() {
        const now = Date.now();
        const validUnlocks = Object.fromEntries(
            Object.entries(unlockedGuidesRef.current).filter(([, expiresAt]) => (
                Number(expiresAt) > now
            ))
        );
        const changed = Object.keys(validUnlocks).length
            !== Object.keys(unlockedGuidesRef.current).length;

        unlockedGuidesRef.current = validUnlocks;
        setUnlockedGuides(Object.keys(validUnlocks));
        if (changed) await saveGuideUnlocks(validUnlocks);
    }

    useEffect(() => {
        if (!guideAccessRequiresReward) return undefined;

        async function loadGuideUnlocks() {
            try {
                const stored = await AsyncStorage.getItem(GUIDE_UNLOCKS_STORAGE_KEY);
                unlockedGuidesRef.current = stored ? JSON.parse(stored) : {};
                await removeExpiredGuideUnlocks();
            } catch (error) {
                console.log("Error loading rewarded guide unlocks:", error);
                unlockedGuidesRef.current = {};
                setUnlockedGuides([]);
            } finally {
                setGuideUnlocksLoaded(true);
            }
        }

        loadGuideUnlocks();

        const subscription = AppState.addEventListener("change", (nextState) => {
            if (nextState === "active") removeExpiredGuideUnlocks();
        });
        return () => subscription.remove();
    }, []);

    async function grantGuideUnlock(guideId) {
        const expiresAt = Date.now() + GUIDE_UNLOCK_DURATION_MS;
        const updatedUnlocks = {
            ...unlockedGuidesRef.current,
            [guideId]: expiresAt,
        };
        unlockedGuidesRef.current = updatedUnlocks;
        setUnlockedGuides(Object.keys(updatedUnlocks));
        await saveGuideUnlocks(updatedUnlocks);
        return expiresAt;
    }

    async function unlockGuideWithReward(guideId) {
        if (!guideAccessRequiresReward) {
            return { status: "earned", expiresAt: null };
        }

        if (isGuideUnlocked(guideId)) {
            return {
                status: "earned",
                expiresAt: unlockedGuidesRef.current[guideId],
            };
        }

        const result = await adsHandlerRef.current?.tryShowRewardedAd()
            || { status: "not-ready" };
        if (result.status === "earned") {
            const expiresAt = await grantGuideUnlock(guideId);
            return { ...result, expiresAt };
        }
        return result;
    }

    // Gestión de favoritos
    const [favorites, setFavorites] = useState([]);

    // Gestión de citas y salones guardados
    const [appointments, setAppointments] = useState([]);
    const [savedSalons, setSavedSalons] = useState([]);

    // Cargar base de datos, preferencias de usuario y notificaciones
    useEffect(() => {
        async function getFavorites() {
            const value = await AsyncStorage.getItem("favorites");
            if (value !== null) {
                setFavorites(JSON.parse(value));
            }
        }

        async function getAppointments() {
            const value = await AsyncStorage.getItem("appointments");
            if (value !== null) {
                setAppointments(JSON.parse(value));
            }
        }

        async function getSavedSalons() {
            const value = await AsyncStorage.getItem("savedSalons");
            if (value !== null) {
                setSavedSalons(JSON.parse(value));
            } else {
                setSavedSalons([]);
                await AsyncStorage.setItem("savedSalons", JSON.stringify([]));
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
        getAppointments();
        getSavedSalons();
    }, [])

    async function addSavedSalon(name) {
        if (!name || savedSalons.includes(name)) return;
        const updated = [...savedSalons, name];
        setSavedSalons(updated);
        await AsyncStorage.setItem("savedSalons", JSON.stringify(updated));
    }

    async function deleteSavedSalon(name) {
        const updated = savedSalons.filter((s) => s !== name);
        setSavedSalons(updated);
        await AsyncStorage.setItem("savedSalons", JSON.stringify(updated));
    }

    async function saveAppointments(newAppointments) {
        setAppointments(newAppointments);
        await AsyncStorage.setItem("appointments", JSON.stringify(newAppointments));
    }

    async function addAppointment(appointmentData) {
        const id = Date.now().toString();
        let newApp = {
            id,
            place: appointmentData.place || "",
            date: appointmentData.date || "",
            time: appointmentData.time || "12:00",
            notes: appointmentData.notes || "",
            image: appointmentData.image || null,
            created: new Date().toISOString(),
        };

        const notificationId = await scheduleAppointmentNotification(newApp);
        if (notificationId) {
            newApp.notificationId = notificationId;
        }

        const updated = [...appointments, newApp];
        await saveAppointments(updated);
        return newApp;
    }

    async function updateAppointment(id, updatedData) {
        const existing = appointments.find((a) => a.id === id);
        if (!existing) return;

        let merged = { ...existing, ...updatedData };
        const notificationId = await scheduleAppointmentNotification(merged);
        if (notificationId) {
            merged.notificationId = notificationId;
        }

        const updated = appointments.map((a) => (a.id === id ? merged : a));
        await saveAppointments(updated);
    }

    async function deleteAppointment(id) {
        const target = appointments.find((a) => a.id === id);
        if (target && target.notificationId) {
            await cancelAppointmentNotification(target.notificationId);
        }
        const updated = appointments.filter((a) => a.id !== id);
        await saveAppointments(updated);
    }

    async function assignImageToAppointment(appointmentId, imageUri) {
        const target = appointments.find((a) => a.id === appointmentId);
        if (!target) return;
        await updateAppointment(appointmentId, { image: imageUri });
    }


    useEffect(() => {
        if (adTrigger > 2 && !reviewRequestedRef.current) {
            reviewRequestedRef.current = true;
            askForReview();
        }

        if (adsLoaded && adTrigger > 5) {
            const wasShown = adsHandlerRef.current?.tryShowInterstitialAd();
            if (wasShown) {
                setAdTrigger(0);
            } else if (adTrigger > 6) {
                setAdTrigger(6);
            }
        }
    }, [adTrigger, adsLoaded])

    async function showPrivacyOptionsForm() {
        try {
            await adsHandlerRef.current?.showPrivacyOptionsForm();
        } catch (error) {
            console.log(error);
        }
    }

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
        const granted = await ensureNotificationPermissionsAsync();
        if (granted) {
            await AsyncStorage.setItem(userPreferences.NOTIFICATION_PERMISSION, "true");
        } else {
            await AsyncStorage.setItem(userPreferences.NOTIFICATION_PERMISSION, "false");
        }
    }

    return (
        <SafeAreaProvider>
            <View style={styles.container}>
                <AdsHandler
                    ref={adsHandlerRef}
                    setAdsLoaded={setAdsLoaded}
                    showOpenAd={showOpenAd}
                    setShowOpenAd={setShowOpenAd}
                    adsLoaded={adsLoaded}
                    appOpenBlocked={appOpenBlocked}
                    setPrivacyOptionsRequired={setPrivacyOptionsRequired}
                    setRewardedAdLoaded={setRewardedAdLoaded}
                    setRequestNonPersonalizedAdsOnly={setRequestNonPersonalizedAdsOnly}
                />
                <LanguageProvider>
                    <DataContext.Provider value={{
                        favorites,
                        setFavorites,
                        appointments,
                        setAppointments,
                        addAppointment,
                        updateAppointment,
                        deleteAppointment,
                        assignImageToAppointment,
                        savedSalons,
                        addSavedSalon,
                        deleteSavedSalon,
                    }}>
                        <AdsContext.Provider value={{
                            setAdTrigger,
                            setShowOpenAd,
                            adsLoaded,
                            privacyOptionsRequired,
                            showPrivacyOptionsForm,
                            requestNonPersonalizedAdsOnly,
                            rewardedAdLoaded,
                            unlockedGuides,
                            guideUnlocksLoaded,
                            isGuideUnlocked,
                            unlockGuideWithReward,
                        }}>
                            <GestureHandlerRootView style={styles.wrapper}>
                                <Stack />
                            </GestureHandlerRootView>
                            <UpdatesModal />
                        </AdsContext.Provider>
                    </DataContext.Provider>
                </LanguageProvider>
                <StatusBar style="dark" backgroundColor="transparent" translucent />
            </View>
        </SafeAreaProvider>
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

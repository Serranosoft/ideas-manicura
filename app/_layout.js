import { SplashScreen, Stack, router } from "expo-router";
import { View, StatusBar, StyleSheet, Image, Pressable } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { DataContext } from "../src/DataContext";
import { ui } from "../src/utils/styles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from 'expo-notifications';

SplashScreen.preventAutoHideAsync();
export default function Layout() {

    // Carga de fuentes.
    const [fontsLoaded] = useFonts({
        "Regular": require("../assets/fonts/Playfair/Regular.ttf"),
        "Semibold": require("../assets/fonts/Playfair/Semibold.ttf"),
        "Bold": require("../assets/fonts/Playfair/Bold.ttf"),
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
        getFavorites();
    }, [])

    useEffect(() => {
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: false,
                shouldSetBadge: false,
            }),
        });
    }, [])

    if (!fontsLoaded) {
        return null;
    }

    return (
        <View style={styles.container}>
            <GestureHandlerRootView style={styles.wrapper}>
                <DataContext.Provider value={{ favorites: favorites, setFavorites: setFavorites }}>
                    <Stack />
                    <Pressable onPress={() => router.push("/favorites")} style={ui.floatingWrapper}>
                        <Image style={ui.floatingImg} source={require("../assets/favorites.png")} />
                    </Pressable>
                </DataContext.Provider>
            </GestureHandlerRootView>
            <StatusBar style="light" />
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: "relative",
        justifyContent: "center",
        marginTop: StatusBar.currentHeight,
    },
    wrapper: {
        flex: 1,
        width: "100%",
        alignSelf: "center",
        justifyContent: "center",
    }
})
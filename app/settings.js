import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Stack } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useContext, useState } from "react";
import { bannerId } from "../src/utils/constants";
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";
import { colors, ui } from "../src/utils/styles";
import Header from "../src/layout/header";
import { useLanguage } from "../src/utils/LanguageContext";
import { AdsContext } from "../src/DataContext";

export default function Settings() {

    const { language, setLanguage } = useLanguage();
    const { adsLoaded } = useContext(AdsContext);

    const [selected, setSelected] = useState(language._locale);

    const languages = [
        { title: language.t("_langListSpanish"), acronym: "es" },
        { title: language.t("_langListEnglish"), acronym: "en" },
        { title: language.t("_langListArabic"), acronym: "ar" },
        { title: language.t("_langListGerman"), acronym: "de" },
        { title: language.t("_langListFrench"), acronym: "fr" },
        { title: language.t("_langListHindi"), acronym: "hi" },
        { title: language.t("_langListIndonesian"), acronym: "id" },
        { title: language.t("_langListPortuguese"), acronym: "pt" },
        { title: language.t("_langListRussian"), acronym: "ru" },
        { title: language.t("_langListPolish"), acronym: "pl" },
        { title: language.t("_langListVietnamese"), acronym: "vi" },
        { title: language.t("_langListTurkish"), acronym: "tr" },
    ]


    async function updateLanguage(acronym) {
        setLanguage(acronym);
        await AsyncStorage.setItem("language", acronym);
    }

    function handlePress(acronym) {
        updateLanguage(acronym);
        setSelected(acronym);
    }

    return (
        <>
            <Stack.Screen options={{ header: () => <Header back={true} settings={false} /> }} />
            <View style={styles.container}>
                <View style={styles.box}>

                    <Text style={[ui.h2]}>{language.t("_settingsApp")}</Text>
                    <Text style={[ui.h4]}>{language.t("_settingsLang")}</Text>
                    <View style={styles.scrollContainer}>
                        <ScrollView style={styles.scroll}>
                            {
                                languages.map((language, index) => {
                                    return (
                                        <TouchableOpacity key={index} onPress={() => handlePress(language.acronym)} style={[styles.option, selected === language.acronym && styles.selected]}>
                                            <Text style={[ui.text, { color: selected === language.acronym ? "#fff" : "#000" }]}>{language.title}</Text>
                                        </TouchableOpacity>
                                    )
                                })
                            }
                        </ScrollView>
                    </View>
                </View>

                { adsLoaded && <BannerAd unitId={bannerId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} requestOptions={{}} /> }
            </View>
        </>
    )
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        gap: 12,
        backgroundColor: "#fff",

    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginVertical: 8,
        paddingBottom: 16,
        borderBottomWidth: 2,
        borderBottomColor: "#f0f0f0"
    },

    box: {
        gap: 12,
        backgroundColor: colors.primary,
        paddingVertical: 16,
        paddingHorizontal: 16,
        marginHorizontal: 20,
        borderRadius: 8,
        marginVertical: 16
    },

    scrollContainer: {
        height: 250,
        width: "100%",
    },

    scroll: {
        flex: 1,
        width: "100%",
        backgroundColor: "#fff",
    },
    option: {
        padding: 12,
    },

    selected: {
        backgroundColor: colors.accent,
    }
})
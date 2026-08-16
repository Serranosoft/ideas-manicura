import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Stack } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useContext, useState } from "react";
import { colors, ui } from "../src/utils/styles";
import Header from "../src/layout/header";
import { useLanguage } from "../src/utils/LanguageContext";
import { AdsContext } from "../src/DataContext";

export default function Settings() {
    const { language, setLanguage } = useLanguage();
    const { privacyOptionsRequired, showPrivacyOptionsForm } = useContext(AdsContext);
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
        { title: language.t("_langListItalian"), acronym: "it" },
        { title: language.t("_langListFarsi"), acronym: "fa" },
    ];

    async function handlePress(acronym) {
        setSelected(acronym);
        setLanguage(acronym);
        await AsyncStorage.setItem("language", acronym);
    }

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    header: () => (
                        <Header
                            back={true}
                            settings={false}
                            title={language.t("_settingsLabel")}
                        />
                    ),
                }}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
            >
                <View style={styles.intro}>
                    <View style={styles.introIcon}>
                        <Text style={styles.introIconText}>Aa</Text>
                    </View>
                    <View style={styles.introCopy}>
                        <Text style={ui.badgeLabel}>{language.t("_settingsLabel")}</Text>
                        <Text style={styles.title}>{language.t("_settingsApp")}</Text>
                    </View>
                </View>

                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>{language.t("_settingsLang")}</Text>
                        <View style={styles.selectedCodePill}>
                            <Text style={styles.selectedCodeText}>{selected.toUpperCase()}</Text>
                        </View>
                    </View>

                    <View style={styles.languageList}>
                        {languages.map((item, index) => {
                            const isSelected = selected === item.acronym;

                            return (
                                <View key={item.acronym}>
                                    <TouchableOpacity
                                        accessibilityRole="radio"
                                        accessibilityState={{ checked: isSelected }}
                                        activeOpacity={0.7}
                                        onPress={() => handlePress(item.acronym)}
                                        style={[
                                            styles.option,
                                            isSelected && styles.optionSelected,
                                        ]}
                                    >
                                        <View
                                            style={[
                                                styles.languageCode,
                                                isSelected && styles.languageCodeSelected,
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.languageCodeText,
                                                    isSelected && styles.languageCodeTextSelected,
                                                ]}
                                            >
                                                {item.acronym.toUpperCase()}
                                            </Text>
                                        </View>

                                        <Text
                                            numberOfLines={1}
                                            style={[
                                                styles.languageName,
                                                isSelected && styles.languageNameSelected,
                                            ]}
                                        >
                                            {item.title}
                                        </Text>

                                        <View
                                            style={[
                                                styles.radio,
                                                isSelected && styles.radioSelected,
                                            ]}
                                        >
                                            {isSelected && <Text style={styles.check}>✓</Text>}
                                        </View>
                                    </TouchableOpacity>

                                    {index < languages.length - 1 && <View style={styles.divider} />}
                                </View>
                            );
                        })}
                    </View>
                </View>

                {privacyOptionsRequired && (
                    <TouchableOpacity
                        accessibilityRole="button"
                        activeOpacity={0.75}
                        onPress={showPrivacyOptionsForm}
                        style={styles.privacyCard}
                    >
                        <View style={styles.privacyIcon}>
                            <Text style={styles.privacyIconText}>i</Text>
                        </View>
                        <View style={styles.privacyCopy}>
                            <Text style={styles.privacyTitle}>{language.t("_privacyOptions")}</Text>
                            <Text style={styles.privacyDescription}>
                                {language.t("_privacyOptionsDesc")}
                            </Text>
                        </View>
                        <Text style={styles.privacyChevron}>›</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        width: "100%",
        maxWidth: 620,
        alignSelf: "center",
        paddingHorizontal: 20,
        paddingTop: 22,
        paddingBottom: 36,
    },
    intro: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 22,
    },
    introIcon: {
        width: 52,
        height: 52,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.badgeBg,
        marginRight: 14,
    },
    introIconText: {
        fontFamily: "ancizar-bold",
        fontSize: 19,
        color: colors.accentDark,
        letterSpacing: -0.5,
    },
    introCopy: {
        flex: 1,
        gap: 3,
    },
    title: {
        fontFamily: "ancizar-bold",
        fontSize: 25,
        lineHeight: 30,
        color: colors.textDark,
    },
    card: {
        overflow: "hidden",
        backgroundColor: colors.cardBg,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        borderRadius: 22,
        shadowColor: "#2C221E",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.05,
        shadowRadius: 14,
        elevation: 2,
    },
    cardHeader: {
        minHeight: 62,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 18,
        borderBottomWidth: 1,
        borderBottomColor: colors.cardBorder,
    },
    cardTitle: {
        flex: 1,
        fontFamily: "ancizar-bold",
        fontSize: 17,
        color: colors.textDark,
        marginRight: 12,
    },
    selectedCodePill: {
        minWidth: 38,
        paddingHorizontal: 10,
        paddingVertical: 5,
        alignItems: "center",
        borderRadius: 12,
        backgroundColor: colors.badgeBg,
    },
    selectedCodeText: {
        fontFamily: "ancizar-bold",
        fontSize: 11,
        letterSpacing: 0.8,
        color: colors.accentDark,
    },
    languageList: {
        padding: 8,
    },
    option: {
        minHeight: 58,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        borderRadius: 14,
    },
    optionSelected: {
        backgroundColor: "#FBF5EA",
    },
    languageCode: {
        width: 38,
        height: 34,
        borderRadius: 11,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        marginRight: 12,
    },
    languageCodeSelected: {
        backgroundColor: colors.accent,
        borderColor: colors.accent,
    },
    languageCodeText: {
        fontFamily: "ancizar-bold",
        fontSize: 11,
        letterSpacing: 0.5,
        color: colors.textMuted,
    },
    languageCodeTextSelected: {
        color: colors.white,
    },
    languageName: {
        flex: 1,
        fontFamily: "ancizar-medium",
        fontSize: 16,
        color: colors.textDark,
    },
    languageNameSelected: {
        fontFamily: "ancizar-bold",
        color: colors.accentDark,
    },
    radio: {
        width: 22,
        height: 22,
        borderRadius: 11,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1.5,
        borderColor: "#D8CEC7",
        marginLeft: 10,
    },
    radioSelected: {
        backgroundColor: colors.accent,
        borderColor: colors.accent,
    },
    check: {
        fontFamily: "ancizar-bold",
        fontSize: 13,
        lineHeight: 16,
        color: colors.white,
    },
    divider: {
        height: 1,
        backgroundColor: colors.cardBorder,
        marginLeft: 60,
        marginRight: 10,
    },
    privacyCard: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 16,
        padding: 16,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        backgroundColor: colors.cardBg,
    },
    privacyIcon: {
        width: 38,
        height: 38,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 12,
        backgroundColor: colors.badgeBg,
        marginRight: 12,
    },
    privacyIconText: {
        fontFamily: "ancizar-bold",
        fontSize: 18,
        color: colors.accentDark,
    },
    privacyCopy: {
        flex: 1,
    },
    privacyTitle: {
        fontFamily: "ancizar-bold",
        fontSize: 16,
        color: colors.textDark,
        marginBottom: 2,
    },
    privacyDescription: {
        fontFamily: "ancizar-regular",
        fontSize: 13,
        lineHeight: 17,
        color: colors.textMuted,
    },
    privacyChevron: {
        fontFamily: "ancizar-medium",
        fontSize: 26,
        color: colors.accent,
        marginLeft: 10,
    },
});

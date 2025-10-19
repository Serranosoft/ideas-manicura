import { Image, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { colors, ui } from "../utils/styles";
import { router } from "expo-router";
import { Menu, MenuItem } from "react-native-material-menu";
import { useState } from "react";
import { useLanguage } from "../utils/LanguageContext";

export default function Header({ title, back, settings = true }) {

    const [visible, setVisible] = useState(false);
    const hideMenu = () => setVisible(false);
    const showMenu = () => setVisible(true);
    const { language } = useLanguage();

    return (
        <View style={styles.header}>
            {back &&
                <TouchableOpacity onPress={() => router.back()}>
                    <View style={styles.pressableWrapper}>
                        <Image style={styles.img} source={require("../../assets/back-dark.png")} />
                    </View>
                </TouchableOpacity>
            }
            <View style={styles.logo}>
                <Text style={[ui.h3, { color: colors.accent, fontFamily: "Semibold" }]}>{title}</Text>
            </View>
            {
                settings == true &&
                <Menu
                    visible={visible}
                    style={{ maxWidth: 200 }}
                    onRequestClose={hideMenu}
                    anchor={(
                        <TouchableWithoutFeedback onPress={showMenu}>
                            <View style={styles.pressableWrapper}>
                                <Image source={require("../../assets/more.png")} style={styles.img} />

                            </View>
                        </TouchableWithoutFeedback>
                    )}>
                    <MenuItem onPress={() => {
                        router.push("settings");
                        hideMenu();
                    }}>
                        <View style={styles.row}>
                            <Image style={styles.icon} source={require("../../assets/settings.png")} />
                            <Text style={ui.text}>{language.t("_settingsLabel")}</Text>
                        </View>
                    </MenuItem>
                    <MenuItem onPress={() => {
                        router.push("favorites");
                        hideMenu();
                    }}>
                        <View style={styles.row}>
                            <Image style={styles.icon} source={require("../../assets/heart-unfilled.png")} />
                            <Text style={ui.text}>{language.t("_myFavorites")}</Text>
                        </View>
                    </MenuItem>
                </Menu>
            }
        </View>
    )
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        gap: 8,
        padding: 8,
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: colors.primary,
        borderBottomWidth: 2,
        borderColor: colors.accent
    },

    logo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        color: colors.accent,
        paddingLeft: 8,
    },

    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
    },

    img: {
        width: 28,
        height: 28,
    },
    icon: {
        width: 20,
        height: 20,
    },
    pressableWrapper: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        alignItems: "flex-end",
    }
})
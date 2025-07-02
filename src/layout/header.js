import { Image, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { colors, ui } from "../utils/styles";
import { router } from "expo-router";
import { Menu, MenuItem } from "react-native-material-menu";
import { useState } from "react";

export default function Header({ title, back, settings = true }) {

    const [visible, setVisible] = useState(false);
    const hideMenu = () => setVisible(false);
    const showMenu = () => setVisible(true);

    return (
        <View style={styles.header}>
            {back &&
                <TouchableOpacity onPress={() => router.back()}>
                    <Image style={styles.img} source={require("../../assets/back-dark.png")} />
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
                            <Image source={require("../../assets/more.png")} style={styles.img} />
                        </TouchableWithoutFeedback>
                    )}>
                    <MenuItem onPress={() => {
                        router.push("settings");
                        hideMenu();
                    }}>
                        <View style={styles.row}>
                            <Image style={styles.icon} source={require("../../assets/settings.png")} />
                            {/* WIP TRANSLATIONS */}
                            <Text style={ui.text}>Ajustes</Text>
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
        padding: 16,
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
})
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { colors, ui } from "../utils/styles";

export default function Button({ icon, text, onClick, disabled }) {
    return (
        <TouchableOpacity style={[styles.button, disabled && styles.disabled]} onPress={onClick} disabled={disabled}>
            {icon}
            <Text style={[ui.h4, styles.buttonText]}>{text}</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({

    button: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        gap: 16,
        backgroundColor: colors.accent,
        paddingVertical: 8,
        paddingHorizontal: 24,
        borderRadius: 8,

        shadowColor: "#efedff",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4,
    },

    buttonText: {
        color: "#fff"
    },

    disabled: {
        backgroundColor: "#047e66"
    }
})
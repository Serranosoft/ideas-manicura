import { PixelRatio } from "react-native";

const fontScale = PixelRatio.getFontScale();
const getFontSize = size => size / fontScale;

export const colors = {
    primary: "#FFFFFF",
    background: "#FAF7F5",
    accent: "#C5A059",
    accentDark: "#8C6D37",
    textDark: "#2C221E",
    textMuted: "#7A6F68",
    cardBg: "#FFFFFF",
    cardBorder: "#F0E8E1",
    badgeBg: "#F4ECE6",
    white: "#FFFFFF",
}

export const ui = {
    img: {
        aspectRatio: 1,
        width: 35,
    },
    text: {
        fontFamily: "ancizar-regular",
        color: colors.textDark,
        fontSize: getFontSize(15),
    },
    titleEditorial: {
        fontFamily: "ancizar-bold",
        color: colors.textDark,
        fontSize: getFontSize(32),
        lineHeight: 38,
    },
    h2: {
        fontFamily: "ancizar-bold",
        color: colors.textDark,
        fontSize: getFontSize(24),
    },
    h3: {
        fontFamily: "ancizar-medium",
        color: colors.textDark,
        fontSize: getFontSize(20),
    },
    h4: {
        fontFamily: "ancizar-medium",
        color: colors.textDark,
        fontSize: getFontSize(17),
    },
    h5: {
        fontFamily: "ancizar-regular",
        color: colors.textMuted,
        fontSize: getFontSize(14),
    },
    badgeLabel: {
        fontFamily: "ancizar-bold",
        color: colors.accentDark,
        fontSize: getFontSize(11),
        letterSpacing: 1.2,
        textTransform: "uppercase",
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderWidth: 1,
        borderColor: colors.accent,
        backgroundColor: colors.accent, 
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 24,
    }
}
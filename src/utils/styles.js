import { PixelRatio } from "react-native";

const fontScale = PixelRatio.getFontScale();
const getFontSize = size => size / fontScale;


export const colors = {
    primary: "#f3e8d6",
    accent: "#c38312"
}

export const ui = {
    img: {
        aspectRatio: 1,
        width: 35,
    },
    text: {
        fontFamily: "Regular",
        color: "black",
        fontSize: getFontSize(17.5),
    },
    h2: {
        fontFamily: "Semibold",
        color: "black",
        fontSize: getFontSize(28),
    },
    h3: {
        fontFamily: "Regular",
        color: "black",
        fontSize: getFontSize(25),
    },
    h4: {
        fontFamily: "Regular",
        color: "black",
        fontSize: getFontSize(21),
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderWidth: 3,
        borderColor: "#ff85b8",
        backgroundColor: "rgba(255, 133, 184, 0.25)", 
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 12,
    },
    floatingWrapper: {
        backgroundColor: "#5B1A23", 
        width: 65, 
        height: 65, 
        borderRadius: 100, 
        position: "absolute", 
        bottom: 15, 
        right: 15, 
        justifyContent: "center", 
        alignItems: "center",
    },
    floatingImg: {
        width: 40,
        height: 40,
        marginTop: 3,
    }

}
import React from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import { colors } from "../utils/styles";
import { useLanguage } from "../utils/LanguageContext";

function TrashIconModal({ size = 28, color = "#E53935" }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M3 6h18" />
            <Path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </Svg>
    );
}

function InfoIconModal({ size = 28, color = colors.accent }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <Circle cx="12" cy="12" r="10" />
            <Path d="M12 16v-4" />
            <Path d="M12 8h.01" />
        </Svg>
    );
}

export default function CustomConfirmModal({
    visible,
    title,
    message,
    confirmText,
    cancelText,
    isDanger = false,
    type = "trash",
    onConfirm,
    onCancel,
}) {
    const { language } = useLanguage();
    if (!visible) return null;

    const resolvedConfirmText = confirmText ?? language.t("_understood");
    const resolvedCancelText = cancelText === undefined ? language.t("_cancel") : cancelText;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                <View style={styles.card}>
                    {/* Icon Header Circle */}
                    <View style={[styles.iconCircle, isDanger ? styles.dangerCircle : styles.infoCircle]}>
                        {type === "trash" || isDanger ? (
                            <TrashIconModal color={isDanger ? "#E53935" : colors.accent} />
                        ) : (
                            <InfoIconModal />
                        )}
                    </View>

                    {/* Text Body */}
                    {Boolean(title) && <Text style={styles.title}>{title}</Text>}
                    {Boolean(message) && <Text style={styles.message}>{message}</Text>}

                    {/* Buttons */}
                    <View style={styles.actionsRow}>
                        {Boolean(resolvedCancelText) && (
                            <TouchableOpacity
                                style={styles.cancelBtn}
                                activeOpacity={0.8}
                                onPress={onCancel}
                            >
                                <Text style={styles.cancelBtnText}>{resolvedCancelText}</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={[
                                styles.confirmBtn,
                                isDanger ? styles.confirmBtnDanger : styles.confirmBtnPrimary,
                            ]}
                            activeOpacity={0.8}
                            onPress={onConfirm}
                        >
                            <Text style={styles.confirmBtnText}>{resolvedConfirmText}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(44, 34, 30, 0.55)",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    card: {
        width: "100%",
        maxWidth: 340,
        backgroundColor: colors.white,
        borderRadius: 24,
        paddingHorizontal: 22,
        paddingTop: 24,
        paddingBottom: 20,
        alignItems: "center",
        elevation: 10,
        shadowColor: "#2C221E",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.18,
        shadowRadius: 12,
    },
    iconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 14,
    },
    dangerCircle: {
        backgroundColor: "#FDE8E8",
    },
    infoCircle: {
        backgroundColor: "#FAF6F3",
    },
    title: {
        fontFamily: "ancizar-bold",
        fontSize: 17,
        color: colors.textDark,
        textAlign: "center",
        marginBottom: 8,
    },
    message: {
        fontFamily: "ancizar-medium",
        fontSize: 14,
        color: colors.textMuted,
        textAlign: "center",
        lineHeight: 20,
        marginBottom: 20,
    },
    actionsRow: {
        flexDirection: "row",
        gap: 10,
        width: "100%",
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 20,
        backgroundColor: "#F4ECE6",
        alignItems: "center",
    },
    cancelBtnText: {
        fontFamily: "ancizar-bold",
        fontSize: 14,
        color: colors.textDark,
    },
    confirmBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 20,
        alignItems: "center",
    },
    confirmBtnPrimary: {
        backgroundColor: colors.accent,
    },
    confirmBtnDanger: {
        backgroundColor: "#E53935",
    },
    confirmBtnText: {
        fontFamily: "ancizar-bold",
        fontSize: 14,
        color: colors.white,
    },
});

import React, { useState } from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import Svg, { Path } from "react-native-svg";
import { colors } from "../utils/styles";

function CloseIcon({ size = 20, color = colors.textDark }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M18 6L6 18" />
            <Path d="M6 6l12 12" />
        </Svg>
    );
}

const QUICK_TIMES = ["09:00", "10:00", "11:30", "12:30", "16:00", "17:00", "18:00", "19:00", "20:00"];
const HOURS = ["08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21"];
const MINUTES = ["00", "15", "30", "45"];

export default function TimePickerModal({ visible, onClose, onSelectTime, initialTime = "17:00" }) {
    const [selectedHour, setSelectedHour] = useState(initialTime.split(":")[0] || "17");
    const [selectedMin, setSelectedMin] = useState(initialTime.split(":")[1] || "00");

    function handleSelectQuick(timeStr) {
        onSelectTime(timeStr);
        onClose();
    }

    function handleConfirmCustom() {
        const formatted = `${selectedHour}:${selectedMin}`;
        onSelectTime(formatted);
        onClose();
    }

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Seleccionar Hora</Text>
                        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                            <CloseIcon />
                        </TouchableOpacity>
                    </View>

                    {/* Quick selection chips */}
                    <Text style={styles.subTitle}>Horas habituales:</Text>
                    <View style={styles.chipsRow}>
                        {QUICK_TIMES.map((t) => (
                            <TouchableOpacity
                                key={t}
                                style={[styles.chip, initialTime === t && styles.chipSelected]}
                                onPress={() => handleSelectQuick(t)}
                            >
                                <Text style={[styles.chipText, initialTime === t && styles.chipTextSelected]}>
                                    {t}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={[styles.subTitle, { marginTop: 14 }]}>O elige hora exacta:</Text>
                    <View style={styles.pickersContainer}>
                        {/* Hours */}
                        <View style={styles.pickerCol}>
                            <Text style={styles.colLabel}>Hora</Text>
                            <ScrollView style={styles.scrollCol} nestedScrollEnabled showsVerticalScrollIndicator={false}>
                                {HOURS.map((h) => (
                                    <TouchableOpacity
                                        key={h}
                                        style={[styles.itemBtn, selectedHour === h && styles.itemBtnSelected]}
                                        onPress={() => setSelectedHour(h)}
                                    >
                                        <Text style={[styles.itemText, selectedHour === h && styles.itemTextSelected]}>
                                            {h}h
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <Text style={styles.colon}>:</Text>

                        {/* Minutes */}
                        <View style={styles.pickerCol}>
                            <Text style={styles.colLabel}>Minutos</Text>
                            <ScrollView style={styles.scrollCol} nestedScrollEnabled showsVerticalScrollIndicator={false}>
                                {MINUTES.map((m) => (
                                    <TouchableOpacity
                                        key={m}
                                        style={[styles.itemBtn, selectedMin === m && styles.itemBtnSelected]}
                                        onPress={() => setSelectedMin(m)}
                                    >
                                        <Text style={[styles.itemText, selectedMin === m && styles.itemTextSelected]}>
                                            {m}m
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmCustom}>
                        <Text style={styles.confirmBtnText}>Confirmar ({selectedHour}:{selectedMin})</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    card: {
        width: "100%",
        maxWidth: 340,
        backgroundColor: colors.white,
        borderRadius: 24,
        padding: 20,
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    title: {
        fontFamily: "ancizar-bold",
        fontSize: 16,
        color: colors.textDark,
    },
    closeBtn: {
        padding: 4,
    },
    subTitle: {
        fontFamily: "ancizar-bold",
        fontSize: 12.5,
        color: colors.textMuted,
        marginBottom: 8,
    },
    chipsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 6,
    },
    chip: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        backgroundColor: "#FAF6F3",
        borderWidth: 1,
        borderColor: "#EFE8E2",
    },
    chipSelected: {
        backgroundColor: colors.accent,
        borderColor: colors.accent,
    },
    chipText: {
        fontFamily: "ancizar-medium",
        fontSize: 12.5,
        color: colors.textDark,
    },
    chipTextSelected: {
        fontFamily: "ancizar-bold",
        color: colors.white,
    },
    pickersContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        marginVertical: 10,
    },
    pickerCol: {
        flex: 1,
        alignItems: "center",
    },
    colLabel: {
        fontFamily: "ancizar-bold",
        fontSize: 11,
        color: colors.textMuted,
        marginBottom: 4,
    },
    scrollCol: {
        height: 120,
        width: "100%",
        backgroundColor: "#FAF6F3",
        borderRadius: 14,
        padding: 4,
    },
    colon: {
        fontFamily: "ancizar-bold",
        fontSize: 22,
        color: colors.textDark,
        marginTop: 15,
    },
    itemBtn: {
        paddingVertical: 8,
        alignItems: "center",
        borderRadius: 8,
        marginVertical: 2,
    },
    itemBtnSelected: {
        backgroundColor: colors.accent,
    },
    itemText: {
        fontFamily: "ancizar-medium",
        fontSize: 14,
        color: colors.textDark,
    },
    itemTextSelected: {
        fontFamily: "ancizar-bold",
        color: colors.white,
    },
    confirmBtn: {
        backgroundColor: colors.accent,
        paddingVertical: 12,
        borderRadius: 20,
        alignItems: "center",
        marginTop: 14,
    },
    confirmBtnText: {
        fontFamily: "ancizar-bold",
        fontSize: 14,
        color: colors.white,
    },
});

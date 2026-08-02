import React, { useState } from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Svg, { Path } from "react-native-svg";
import { colors } from "../utils/styles";

function ChevronLeft({ size = 20, color = colors.textDark }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M15 18l-6-6 6-6" />
        </Svg>
    );
}

function ChevronRight({ size = 20, color = colors.textDark }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M9 18l6-6-6-6" />
        </Svg>
    );
}

function CloseIcon({ size = 20, color = colors.textDark }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M18 6L6 18" />
            <Path d="M6 6l12 12" />
        </Svg>
    );
}

const MONTH_NAMES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const WEEK_DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export default function DatePickerModal({ visible, onClose, onSelectDate, initialDate }) {
    // Current viewed month/year in calendar
    const [currentDate, setCurrentDate] = useState(new Date());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    function getDaysInMonth(y, m) {
        return new Date(y, m + 1, 0).getDate();
    }

    function getFirstDayOffset(y, m) {
        let day = new Date(y, m, 1).getDay();
        return day === 0 ? 6 : day - 1;
    }

    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOffset = getFirstDayOffset(year, month);

    function handlePrevMonth() {
        setCurrentDate(new Date(year, month - 1, 1));
    }

    function handleNextMonth() {
        setCurrentDate(new Date(year, month + 1, 1));
    }

    function handlePickDay(dayNum) {
        const dd = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
        const mm = (month + 1) < 10 ? `0${month + 1}` : `${month + 1}`;
        const formatted = `${dd}-${mm}-${year}`;
        onSelectDate(formatted);
        onClose();
    }

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Seleccionar Fecha</Text>
                        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                            <CloseIcon />
                        </TouchableOpacity>
                    </View>

                    {/* Month selector */}
                    <View style={styles.monthHeader}>
                        <TouchableOpacity style={styles.navBtn} onPress={handlePrevMonth}>
                            <ChevronLeft />
                        </TouchableOpacity>
                        <Text style={styles.monthTitle}>{MONTH_NAMES[month]} {year}</Text>
                        <TouchableOpacity style={styles.navBtn} onPress={handleNextMonth}>
                            <ChevronRight />
                        </TouchableOpacity>
                    </View>

                    {/* Week Header */}
                    <View style={styles.weekRow}>
                        {WEEK_DAYS.map((w, idx) => (
                            <Text key={idx} style={styles.weekDayText}>{w}</Text>
                        ))}
                    </View>

                    {/* Grid */}
                    <View style={styles.grid}>
                        {Array.from({ length: firstDayOffset }).map((_, idx) => (
                            <View key={`empty-${idx}`} style={styles.dayEmpty} />
                        ))}
                        {Array.from({ length: daysInMonth }).map((_, idx) => {
                            const dayNum = idx + 1;
                            const dd = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
                            const mm = (month + 1) < 10 ? `0${month + 1}` : `${month + 1}`;
                            const dateStr = `${dd}-${mm}-${year}`;
                            const isSelected = initialDate === dateStr;

                            return (
                                <TouchableOpacity
                                    key={`day-${dayNum}`}
                                    style={[styles.dayCell, isSelected && styles.dayCellSelected]}
                                    onPress={() => handlePickDay(dayNum)}
                                >
                                    <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>
                                        {dayNum}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
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
        marginBottom: 16,
    },
    title: {
        fontFamily: "ancizar-bold",
        fontSize: 16,
        color: colors.textDark,
    },
    closeBtn: {
        padding: 4,
    },
    monthHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 14,
    },
    monthTitle: {
        fontFamily: "ancizar-bold",
        fontSize: 15,
        color: colors.textDark,
    },
    navBtn: {
        padding: 6,
        borderRadius: 12,
        backgroundColor: "#FAF6F3",
    },
    weekRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#F4ECE6",
        paddingBottom: 6,
    },
    weekDayText: {
        fontFamily: "ancizar-bold",
        fontSize: 12,
        color: colors.textMuted,
        width: 36,
        textAlign: "center",
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    dayEmpty: {
        width: `${100 / 7}%`,
        height: 38,
    },
    dayCell: {
        width: `${100 / 7}%`,
        height: 38,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
    },
    dayCellSelected: {
        backgroundColor: colors.accent,
    },
    dayText: {
        fontFamily: "ancizar-medium",
        fontSize: 13.5,
        color: colors.textDark,
    },
    dayTextSelected: {
        fontFamily: "ancizar-bold",
        color: colors.white,
    },
});

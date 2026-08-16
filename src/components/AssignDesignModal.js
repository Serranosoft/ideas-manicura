import React, { useContext, useState } from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Platform, ToastAndroid } from "react-native";
import { Image } from "expo-image";
import Svg, { Path, Rect, Circle } from "react-native-svg";
import { DataContext } from "../DataContext";
import { useLanguage } from "../utils/LanguageContext";
import { colors } from "../utils/styles";
import DatePickerModal from "./DatePickerModal";
import TimePickerModal from "./TimePickerModal";
import CustomConfirmModal from "./CustomConfirmModal";

function CloseIcon({ size = 20, color = colors.textDark }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M18 6L6 18" />
            <Path d="M6 6l12 12" />
        </Svg>
    );
}

function CalendarCheckIcon({ size = 18, color = colors.accent }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <Path d="M16 2v4" />
            <Path d="M8 2v4" />
            <Path d="M3 10h18" />
            <Path d="M9 16l2 2 4-4" />
        </Svg>
    );
}

function CalendarIconSvg({ size = 16, color = colors.accent }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <Path d="M16 2v4" />
            <Path d="M8 2v4" />
            <Path d="M3 10h18" />
        </Svg>
    );
}

function ClockIcon({ size = 16, color = colors.textDark }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <Circle cx="12" cy="12" r="10" />
            <Path d="M12 6v6l4 2" />
        </Svg>
    );
}

function PlusIcon({ size = 18, color = colors.white }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M12 5v14" />
            <Path d="M5 12h14" />
        </Svg>
    );
}

function CheckIcon({ size = 11, color = colors.white }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M20 6L9 17l-5-5" />
        </Svg>
    );
}

function getTodayEU() {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
}

export default function AssignDesignModal({ visible, onClose, image }) {
    const { language } = useLanguage();
    const {
        appointments,
        assignImageToAppointment,
        addAppointment,
        savedSalons,
        addSavedSalon,
        deleteSavedSalon,
    } = useContext(DataContext);

    const [isCreatingNew, setIsCreatingNew] = useState(false);

    // Form state for creating inline appointment
    const [place, setPlace] = useState("");
    const [date, setDate] = useState(getTodayEU());
    const [time, setTime] = useState("17:00");
    const [notes, setNotes] = useState("");
    const [shouldSaveSalon, setShouldSaveSalon] = useState(true);

    // Modal pickers
    const [datePickerVisible, setDatePickerVisible] = useState(false);
    const [timePickerVisible, setTimePickerVisible] = useState(false);

    // Custom confirm modal state
    const [confirmModalConfig, setConfirmModalConfig] = useState(null);

    function showSuccessMsg(msg) {
        if (Platform.OS === "android") {
            ToastAndroid.show(msg, ToastAndroid.SHORT);
        } else {
            setConfirmModalConfig({
                title: language.t("_nailDesigns"),
                message: msg,
                confirmText: language.t("_understood"),
                cancelText: null,
                isDanger: false,
                type: "info",
                onConfirm: () => setConfirmModalConfig(null),
                onCancel: () => setConfirmModalConfig(null),
            });
        }
    }

    function handleConfirmDeleteSalon(salonName) {
        setConfirmModalConfig({
            title: language.t("_deleteSalonTitle"),
            message: language.t("_deleteSalonConfirm"),
            confirmText: language.t("_delete"),
            cancelText: language.t("_cancel"),
            isDanger: true,
            type: "trash",
            onConfirm: async () => {
                await deleteSavedSalon(salonName);
                if (place === salonName) setPlace("");
                setConfirmModalConfig(null);
            },
            onCancel: () => setConfirmModalConfig(null),
        });
    }

    async function handleAssignExisting(appointmentId) {
        await assignImageToAppointment(appointmentId, image);
        showSuccessMsg(language.t("_appointmentSaved"));
        onClose();
    }

    async function handleCreateAndAssign() {
        if (!place.trim()) {
            setConfirmModalConfig({
                title: language.t("_placeSalon"),
                message: language.t("_placePlaceholder"),
                confirmText: language.t("_understood"),
                cancelText: null,
                isDanger: false,
                type: "info",
                onConfirm: () => setConfirmModalConfig(null),
                onCancel: () => setConfirmModalConfig(null),
            });
            return;
        }

        if (shouldSaveSalon) {
            await addSavedSalon(place.trim());
        }

        await addAppointment({
            place: place.trim(),
            date: date || getTodayEU(),
            time: time || "17:00",
            notes: notes.trim(),
            image: image,
        });

        showSuccessMsg(language.t("_appointmentSaved"));
        setIsCreatingNew(false);
        setPlace("");
        onClose();
    }

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalCard}>

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>{language.t("_assignDesign")}</Text>
                        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                            <CloseIcon />
                        </TouchableOpacity>
                    </View>

                    {/* Image Preview */}
                    {Boolean(image) && (
                        <View style={styles.imagePreviewRow}>
                            <Image source={image} style={styles.previewThumb} />
                            <View style={styles.previewInfo}>
                                <Text style={styles.previewLabel}>{language.t("_designDetail")}</Text>
                                <Text style={styles.previewSub} numberOfLines={1}>{language.t("_nailDesigns")}</Text>
                            </View>
                        </View>
                    )}

                    <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
                        {!isCreatingNew ? (
                            <>
                                <TouchableOpacity
                                    style={styles.createNewBtn}
                                    activeOpacity={0.8}
                                    onPress={() => setIsCreatingNew(true)}
                                >
                                    <PlusIcon size={18} color={colors.white} />
                                    <Text style={styles.createNewBtnText}>
                                        {language.t("_createNewAppointmentWithDesign")}
                                    </Text>
                                </TouchableOpacity>

                                <Text style={styles.sectionHeading}>{language.t("_selectAppointment")}</Text>

                                {appointments && appointments.length > 0 ? (
                                    appointments.map((item) => (
                                        <TouchableOpacity
                                            key={item.id}
                                            style={styles.appointmentItem}
                                            activeOpacity={0.7}
                                            onPress={() => handleAssignExisting(item.id)}
                                        >
                                            <View style={styles.appointmentIconBox}>
                                                <CalendarCheckIcon />
                                            </View>
                                            <View style={styles.appointmentDetails}>
                                                <Text style={styles.salonName}>{item.place || language.t("_placeSalon")}</Text>
                                                <Text style={styles.dateTimeText}>
                                                    📅 {item.date}   ⏰ {item.time}
                                                </Text>
                                            </View>
                                            <Text style={styles.assignBadgeText}>{language.t("_assign")}</Text>
                                        </TouchableOpacity>
                                    ))
                                ) : (
                                    <View style={styles.emptyBox}>
                                        <Text style={styles.emptyText}>{language.t("_noAppointments")}</Text>
                                    </View>
                                )}
                            </>
                        ) : (
                            <View style={styles.formContainer}>
                                <Text style={styles.formTitle}>{language.t("_addAppointment")}</Text>

                                <Text style={styles.label}>{language.t("_placeSalon")}</Text>

                                {savedSalons && savedSalons.length > 0 && (
                                    <View style={styles.salonsChipContainer}>
                                        <Text style={styles.salonChipTitle}>{language.t("_savedSalonsHint")}</Text>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.salonsScroll}>
                                            {savedSalons.map((salon, sIdx) => (
                                                <TouchableOpacity
                                                    key={sIdx}
                                                    style={[styles.salonChip, place === salon && styles.salonChipActive]}
                                                    onPress={() => setPlace(salon)}
                                                    onLongPress={() => handleConfirmDeleteSalon(salon)}
                                                >
                                                    <Text style={[styles.salonChipText, place === salon && styles.salonChipTextActive]}>
                                                        💅 {salon}
                                                    </Text>
                                                    <TouchableOpacity
                                                        style={styles.deleteSalonX}
                                                        onPress={(e) => {
                                                            e.stopPropagation();
                                                            handleConfirmDeleteSalon(salon);
                                                        }}
                                                    >
                                                        <CloseIcon size={12} color={place === salon ? colors.accent : colors.textMuted} />
                                                    </TouchableOpacity>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}

                                <TextInput
                                    style={styles.input}
                                    placeholder={language.t("_placePlaceholder")}
                                    placeholderTextColor="#A89B91"
                                    value={place}
                                    onChangeText={setPlace}
                                />

                                <TouchableOpacity
                                    style={styles.saveSalonCheckboxRow}
                                    activeOpacity={0.8}
                                    onPress={() => setShouldSaveSalon(!shouldSaveSalon)}
                                >
                                    <View style={[styles.checkboxSquare, shouldSaveSalon && styles.checkboxSquareChecked]}>
                                        {shouldSaveSalon && <CheckIcon size={11} color={colors.white} />}
                                    </View>
                                    <Text style={styles.saveSalonCheckboxText}>{language.t("_saveSalonOption")}</Text>
                                </TouchableOpacity>

                                <View style={styles.rowInputs}>
                                    <View style={styles.flex1}>
                                        <Text style={styles.label}>{language.t("_dateLabel")}</Text>
                                        <TouchableOpacity
                                            style={styles.pickerTriggerBox}
                                            onPress={() => setDatePickerVisible(true)}
                                        >
                                            <CalendarIconSvg size={16} color={colors.accent} />
                                            <Text style={styles.pickerTriggerText}>{date || "dd-mm-aaaa"}</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.flex1}>
                                        <Text style={styles.label}>{language.t("_timeLabel")}</Text>
                                        <TouchableOpacity
                                            style={styles.pickerTriggerBox}
                                            onPress={() => setTimePickerVisible(true)}
                                        >
                                            <ClockIcon size={16} color={colors.textDark} />
                                            <Text style={styles.pickerTriggerText}>{time || "17:00"}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <Text style={styles.label}>{language.t("_notesLabel")}</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder={language.t("_notesPlaceholder")}
                                    placeholderTextColor="#A89B91"
                                    multiline
                                    numberOfLines={3}
                                    value={notes}
                                    onChangeText={setNotes}
                                />

                                <View style={styles.formActions}>
                                    <TouchableOpacity
                                        style={styles.cancelBtn}
                                        onPress={() => setIsCreatingNew(false)}
                                    >
                                        <Text style={styles.cancelBtnText}>{language.t("_back")}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.saveBtn}
                                        onPress={handleCreateAndAssign}
                                    >
                                        <Text style={styles.saveBtnText}>{language.t("_scheduleAppointment")}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>

            {/* Clickable Date Picker Modal */}
            <DatePickerModal
                visible={datePickerVisible}
                onClose={() => setDatePickerVisible(false)}
                initialDate={date}
                onSelectDate={(newDate) => setDate(newDate)}
            />

            {/* Clickable Time Picker Modal */}
            <TimePickerModal
                visible={timePickerVisible}
                onClose={() => setTimePickerVisible(false)}
                initialTime={time}
                onSelectTime={(newTime) => setTime(newTime)}
            />
            {/* Custom Confirm Dialog Modal */}
            <CustomConfirmModal
                visible={Boolean(confirmModalConfig)}
                {...confirmModalConfig}
            />
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    modalCard: {
        backgroundColor: colors.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: "88%",
        paddingBottom: 24,
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 18,
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#F0E8E1",
    },
    title: {
        fontFamily: "ancizar-bold",
        fontSize: 18,
        color: colors.textDark,
    },
    closeBtn: {
        padding: 4,
    },
    imagePreviewRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: "#FAF6F3",
        borderBottomWidth: 1,
        borderBottomColor: "#F0E8E1",
    },
    previewThumb: {
        width: 50,
        height: 50,
        borderRadius: 10,
        backgroundColor: colors.cardBg,
        marginRight: 12,
    },
    previewInfo: {
        flex: 1,
    },
    previewLabel: {
        fontFamily: "ancizar-bold",
        fontSize: 14,
        color: colors.textDark,
    },
    previewSub: {
        fontFamily: "ancizar-medium",
        fontSize: 12,
        color: colors.textMuted,
    },
    scrollArea: {
        maxHeight: 450,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    createNewBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: colors.accent,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 25,
        marginBottom: 16,
    },
    createNewBtnText: {
        fontFamily: "ancizar-bold",
        fontSize: 14,
        color: colors.white,
    },
    sectionHeading: {
        fontFamily: "ancizar-bold",
        fontSize: 14,
        color: colors.textDark,
        marginBottom: 12,
    },
    appointmentItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.background,
        padding: 14,
        borderRadius: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#EFE8E2",
    },
    appointmentIconBox: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.white,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    appointmentDetails: {
        flex: 1,
    },
    salonName: {
        fontFamily: "ancizar-bold",
        fontSize: 14,
        color: colors.textDark,
    },
    dateTimeText: {
        fontFamily: "ancizar-medium",
        fontSize: 12,
        color: colors.textMuted,
        marginTop: 2,
    },
    assignBadgeText: {
        fontFamily: "ancizar-bold",
        fontSize: 13,
        color: colors.accent,
        backgroundColor: `${colors.accent}15`,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
    },
    emptyBox: {
        paddingVertical: 20,
        alignItems: "center",
    },
    emptyText: {
        fontFamily: "ancizar-medium",
        fontSize: 14,
        color: colors.textMuted,
    },
    formContainer: {
        gap: 10,
    },
    formTitle: {
        fontFamily: "ancizar-bold",
        fontSize: 16,
        color: colors.textDark,
        marginBottom: 6,
    },
    label: {
        fontFamily: "ancizar-medium",
        fontSize: 13,
        color: colors.textDark,
    },
    salonsChipContainer: {
        marginBottom: 2,
    },
    salonChipTitle: {
        fontFamily: "ancizar-medium",
        fontSize: 11.5,
        color: colors.textMuted,
        marginBottom: 4,
    },
    salonsScroll: {
        gap: 6,
    },
    salonChip: {
        backgroundColor: "#FAF6F3",
        borderWidth: 1,
        borderColor: "#EFE8E2",
        paddingLeft: 12,
        paddingRight: 8,
        paddingVertical: 6,
        borderRadius: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    salonChipActive: {
        backgroundColor: `${colors.accent}18`,
        borderColor: colors.accent,
    },
    salonChipText: {
        fontFamily: "ancizar-medium",
        fontSize: 12.5,
        color: colors.textDark,
    },
    salonChipTextActive: {
        fontFamily: "ancizar-bold",
        color: colors.accent,
    },
    deleteSalonX: {
        padding: 3,
        marginLeft: 2,
    },
    saveSalonCheckboxRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 4,
        marginBottom: 8,
    },
    checkboxSquare: {
        width: 18,
        height: 18,
        borderRadius: 5,
        borderWidth: 1.5,
        borderColor: colors.textMuted,
        backgroundColor: colors.white,
        alignItems: "center",
        justifyContent: "center",
    },
    checkboxSquareChecked: {
        backgroundColor: colors.accent,
        borderColor: colors.accent,
    },
    saveSalonCheckboxText: {
        fontFamily: "ancizar-medium",
        fontSize: 12.5,
        color: colors.textDark,
    },
    input: {
        backgroundColor: "#FAF6F3",
        borderWidth: 1,
        borderColor: "#E6DDD6",
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontFamily: "ancizar-medium",
        fontSize: 14,
        color: colors.textDark,
    },
    pickerTriggerBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "#FAF6F3",
        borderWidth: 1,
        borderColor: "#E6DDD6",
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 11,
    },
    pickerTriggerText: {
        fontFamily: "ancizar-medium",
        fontSize: 14,
        color: colors.textDark,
    },
    textArea: {
        height: 70,
        textAlignVertical: "top",
    },
    rowInputs: {
        flexDirection: "row",
        gap: 10,
    },
    flex1: {
        flex: 1,
        gap: 4,
    },
    formActions: {
        flexDirection: "row",
        gap: 12,
        marginTop: 14,
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 20,
        backgroundColor: "#EFE8E2",
        alignItems: "center",
    },
    cancelBtnText: {
        fontFamily: "ancizar-medium",
        fontSize: 14,
        color: colors.textDark,
    },
    saveBtn: {
        flex: 2,
        paddingVertical: 12,
        borderRadius: 20,
        backgroundColor: colors.accent,
        alignItems: "center",
    },
    saveBtnText: {
        fontFamily: "ancizar-bold",
        fontSize: 14,
        color: colors.white,
    },
});

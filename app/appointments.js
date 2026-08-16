import React, { useContext, useState } from "react";
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert, Platform, ToastAndroid } from "react-native";
import { Stack, router } from "expo-router";
import { Image } from "expo-image";
import Svg, { Path, Rect, Circle } from "react-native-svg";
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";
import { DataContext, AdsContext } from "../src/DataContext";
import { useLanguage } from "../src/utils/LanguageContext";
import { colors, ui } from "../src/utils/styles";
import { bannerId } from "../src/utils/constants";
import Header from "../src/layout/header";
import BottomNav from "../src/layout/BottomNav";
import DatePickerModal from "../src/components/DatePickerModal";
import TimePickerModal from "../src/components/TimePickerModal";

import CustomConfirmModal from "../src/components/CustomConfirmModal";

function PlusIcon({ size = 18, color = colors.white }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M12 5v14" />
            <Path d="M5 12h14" />
        </Svg>
    );
}

function CalendarIconSvg({ size = 20, color = colors.accent }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <Path d="M16 2v4" />
            <Path d="M8 2v4" />
            <Path d="M3 10h18" />
        </Svg>
    );
}

function ClockIcon({ size = 15, color = colors.textMuted }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <Circle cx="12" cy="12" r="10" />
            <Path d="M12 6v6l4 2" />
        </Svg>
    );
}

function MapPinIcon({ size = 15, color = colors.accent }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <Circle cx="12" cy="10" r="3" />
        </Svg>
    );
}

function TrashIcon({ size = 16, color = "#E53935" }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M3 6h18" />
            <Path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </Svg>
    );
}

function EditIcon({ size = 16, color = colors.textDark }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </Svg>
    );
}

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

function CheckIcon({ size = 12, color = colors.white }) {
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

export default function AppointmentsScreen() {
    const { language } = useLanguage();
    const {
        appointments,
        addAppointment,
        updateAppointment,
        deleteAppointment,
        favorites,
        savedSalons,
        addSavedSalon,
        deleteSavedSalon,
    } = useContext(DataContext);
    const { adsLoaded } = useContext(AdsContext);

    // Calendar view state
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDateStr, setSelectedDateStr] = useState(null); // 'DD-MM-YYYY' or null for all

    // Modal state for Add/Edit appointment
    const [modalVisible, setModalVisible] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState(null);
    const [place, setPlace] = useState("");
    const [dateInput, setDateInput] = useState(getTodayEU());
    const [timeInput, setTimeInput] = useState("17:00");
    const [notesInput, setNotesInput] = useState("");
    const [selectedImage, setSelectedImage] = useState(null);
    const [showImagePicker, setShowImagePicker] = useState(false);
    const [shouldSaveSalon, setShouldSaveSalon] = useState(true);

    // Pickers modal states
    const [datePickerVisible, setDatePickerVisible] = useState(false);
    const [timePickerVisible, setTimePickerVisible] = useState(false);

    // Helper functions for Calendar
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const calendarLocale = `${language.locale || language._locale || "es"}-u-ca-gregory`;
    const monthNames = Array.from({ length: 12 }, (_, index) =>
        new Intl.DateTimeFormat(calendarLocale, { month: "long" }).format(new Date(2024, index, 1))
    );
    const weekDays = Array.from({ length: 7 }, (_, index) =>
        new Intl.DateTimeFormat(calendarLocale, { weekday: "short" }).format(new Date(2024, 0, index + 1))
    );

    function getDaysInMonth(year, month) {
        return new Date(year, month + 1, 0).getDate();
    }

    function getFirstDayOfMonth(year, month) {
        let day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1;
    }

    function handlePrevMonth() {
        setCurrentDate(new Date(year, month - 1, 1));
    }

    function handleNextMonth() {
        setCurrentDate(new Date(year, month + 1, 1));
    }

    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOffset = getFirstDayOfMonth(year, month);

    // Set of dates with appointments
    const appointmentDatesSet = new Set(
        (appointments || []).map((app) => app.date)
    );

    const todayEU = getTodayEU();

    function openAddModal(prefilledDate) {
        setEditingAppointment(null);
        setPlace("");
        setDateInput(prefilledDate || selectedDateStr || todayEU);
        setTimeInput("17:00");
        setNotesInput("");
        setSelectedImage(null);
        setShouldSaveSalon(true);
        setModalVisible(true);
    }

    function openEditModal(appItem) {
        setEditingAppointment(appItem);
        setPlace(appItem.place || "");
        setDateInput(appItem.date || todayEU);
        setTimeInput(appItem.time || "17:00");
        setNotesInput(appItem.notes || "");
        setSelectedImage(appItem.image || null);
        setShouldSaveSalon(false);
        setModalVisible(true);
    }

    // Custom confirm modal state
    const [confirmModalConfig, setConfirmModalConfig] = useState(null);

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

    async function handleSave() {
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

        if (editingAppointment) {
            await updateAppointment(editingAppointment.id, {
                place: place.trim(),
                date: dateInput || todayEU,
                time: timeInput || "17:00",
                notes: notesInput.trim(),
                image: selectedImage,
            });
        } else {
            await addAppointment({
                place: place.trim(),
                date: dateInput || todayEU,
                time: timeInput || "17:00",
                notes: notesInput.trim(),
                image: selectedImage,
            });
        }

        setModalVisible(false);
        if (Platform.OS === "android") {
            ToastAndroid.show(language.t("_appointmentSaved"), ToastAndroid.SHORT);
        }
    }

    function handleDelete(id) {
        setConfirmModalConfig({
            title: language.t("_appointmentsTitle"),
            message: language.t("_confirmDeleteAppointment"),
            confirmText: language.t("_delete"),
            cancelText: language.t("_cancel"),
            isDanger: true,
            type: "trash",
            onConfirm: async () => {
                await deleteAppointment(id);
                setConfirmModalConfig(null);
                if (Platform.OS === "android") {
                    ToastAndroid.show(language.t("_appointmentDeleted"), ToastAndroid.SHORT);
                }
            },
            onCancel: () => setConfirmModalConfig(null),
        });
    }

    // Filter appointments
    const filteredAppointments = (appointments || []).filter((app) => {
        if (!selectedDateStr) return true;
        return app.date === selectedDateStr;
    });

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ header: () => <Header title={language.t("_appointmentsTitle")} /> }} />

            {adsLoaded && (
                <View style={styles.bannerWrapper}>
                    <BannerAd unitId={bannerId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} requestOptions={{}} />
                </View>
            )}

            <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Header Banner Section */}
                <View style={styles.topHeaderCard}>
                    <View style={styles.headerInfo}>
                        <Text style={ui.badgeLabel}>{language.t("_myAppointments")}</Text>
                        <Text style={ui.h2}>{language.t("_appointmentsTitle")}</Text>
                    </View>

                    <TouchableOpacity style={styles.addMainBtn} activeOpacity={0.8} onPress={() => openAddModal()}>
                        <PlusIcon />
                        <Text style={styles.addMainBtnText}>{language.t("_addAppointment")}</Text>
                    </TouchableOpacity>
                </View>

                {/* Calendar Card */}
                <View style={styles.calendarCard}>
                    <View style={styles.calendarHeader}>
                        <TouchableOpacity style={styles.monthNavBtn} onPress={handlePrevMonth}>
                            <ChevronLeft />
                        </TouchableOpacity>

                        <Text style={styles.monthTitle}>
                            {monthNames[month]} {year}
                        </Text>

                        <TouchableOpacity style={styles.monthNavBtn} onPress={handleNextMonth}>
                            <ChevronRight />
                        </TouchableOpacity>
                    </View>

                    {/* Weekday headers */}
                    <View style={styles.weekRow}>
                        {weekDays.map((day, idx) => (
                            <Text key={idx} style={styles.weekDayText}>{day}</Text>
                        ))}
                    </View>

                    {/* Days grid */}
                    <View style={styles.daysGrid}>
                        {Array.from({ length: firstDayOffset }).map((_, idx) => (
                            <View key={`empty-${idx}`} style={styles.dayCellEmpty} />
                        ))}

                        {Array.from({ length: daysInMonth }).map((_, idx) => {
                            const dayNum = idx + 1;
                            const formattedDay = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
                            const formattedMonth = (month + 1) < 10 ? `0${month + 1}` : `${month + 1}`;
                            const dateStr = `${formattedDay}-${formattedMonth}-${year}`;

                            const isSelected = selectedDateStr === dateStr;
                            const isToday = todayEU === dateStr;
                            const hasAppointment = appointmentDatesSet.has(dateStr);

                            return (
                                <TouchableOpacity
                                    key={`day-${dayNum}`}
                                    style={[
                                        styles.dayCell,
                                        isToday && styles.todayCell,
                                        hasAppointment && styles.hasAppointmentCell,
                                        isSelected && styles.selectedDayCell,
                                    ]}
                                    activeOpacity={0.7}
                                    onPress={() => {
                                        if (isSelected) {
                                            setSelectedDateStr(null);
                                        } else {
                                            setSelectedDateStr(dateStr);
                                        }
                                    }}
                                >
                                    <Text style={[
                                        styles.dayText,
                                        isToday && styles.todayText,
                                        hasAppointment && styles.hasAppointmentText,
                                        isSelected && styles.selectedDayText,
                                    ]}>
                                        {dayNum}
                                    </Text>
                                    {hasAppointment && (
                                        <View style={[styles.dotIndicator, isSelected && styles.dotIndicatorSelected]} />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {selectedDateStr && (
                        <TouchableOpacity style={styles.clearFilterRow} onPress={() => setSelectedDateStr(null)}>
                            <Text style={styles.clearFilterText}>
                                {language.t("_appointmentsForDate", { date: selectedDateStr })}  •  <Text style={styles.clearFilterTextBold}>{language.t("_viewAll")}</Text>
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Appointments List */}
                <View style={styles.listSection}>
                    <Text style={styles.sectionTitle}>
                        {selectedDateStr ? language.t("_appointmentsForDate", { date: selectedDateStr }) : language.t("_myAppointments")} ({filteredAppointments.length})
                    </Text>

                    {filteredAppointments.length > 0 ? (
                        filteredAppointments.map((item) => (
                            <View key={item.id} style={styles.appointmentCard}>
                                <View style={styles.cardHeader}>
                                    <View style={styles.salonBox}>
                                        <MapPinIcon />
                                        <Text style={styles.salonText}>{item.place || language.t("_placeSalon")}</Text>
                                    </View>
                                    <View style={styles.actionsRow}>
                                        <TouchableOpacity style={styles.iconBtn} onPress={() => openEditModal(item)}>
                                            <EditIcon />
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(item.id)}>
                                            <TrashIcon />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={styles.timeBadgeRow}>
                                    <View style={styles.badgeItem}>
                                        <CalendarIconSvg size={14} color={colors.accent} />
                                        <Text style={styles.badgeText}>{item.date}</Text>
                                    </View>
                                    <View style={styles.badgeItem}>
                                        <ClockIcon size={14} color={colors.textDark} />
                                        <Text style={styles.badgeText}>{item.time}</Text>
                                    </View>
                                </View>

                                {Boolean(item.notes) && (
                                    <Text style={styles.notesText}>📝 {item.notes}</Text>
                                )}

                                {/* Assigned Image Preview */}
                                <View style={styles.designContainer}>
                                    <Text style={styles.designTitle}>{language.t("_assignedDesign")}:</Text>
                                    {item.image ? (
                                        <TouchableOpacity
                                            style={styles.assignedImageRow}
                                            activeOpacity={0.8}
                                            onPress={() => router.push({ pathname: "/image", params: { image: item.image } })}
                                        >
                                            <Image source={item.image} style={styles.assignedThumb} />
                                            <View style={styles.assignedDetails}>
                                                <Text style={styles.assignedLabel}>{language.t("_nailDesigns")}</Text>
                                                <Text style={styles.assignedSub}>{language.t("_tapFullscreen")}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    ) : (
                                        <TouchableOpacity
                                            style={styles.noDesignRow}
                                            activeOpacity={0.7}
                                            onPress={() => openEditModal(item)}
                                        >
                                            <Text style={styles.noDesignText}>{language.t("_assignDesignBtn")}</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIconCircle}>
                                <CalendarIconSvg size={32} color={colors.accent} />
                            </View>
                            <Text style={styles.emptyTitle}>{language.t("_noAppointments")}</Text>
                            <Text style={styles.emptyDesc}>{language.t("_noAppointmentsDesc")}</Text>
                            <TouchableOpacity style={styles.emptyAddBtn} onPress={() => openAddModal()}>
                                <PlusIcon />
                                <Text style={styles.addMainBtnText}>{language.t("_addAppointment")}</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Modal Add/Edit Appointment */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {editingAppointment ? language.t("_editAppointment") : language.t("_addAppointment")}
                            </Text>
                            <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
                                <CloseIcon />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
                            
                            {/* Saved Salons Quick Selection */}
                            <Text style={styles.fieldLabel}>{language.t("_placeSalon")}</Text>
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

                            {/* Clickable Date and Time pickers */}
                            <View style={styles.rowInputs}>
                                <View style={styles.flex1}>
                                    <Text style={styles.fieldLabel}>{language.t("_dateLabel")}</Text>
                                    <TouchableOpacity
                                        style={styles.pickerTriggerBox}
                                        onPress={() => setDatePickerVisible(true)}
                                    >
                                        <CalendarIconSvg size={16} color={colors.accent} />
                                        <Text style={styles.pickerTriggerText}>{dateInput || "dd-mm-aaaa"}</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.flex1}>
                                    <Text style={styles.fieldLabel}>{language.t("_timeLabel")}</Text>
                                    <TouchableOpacity
                                        style={styles.pickerTriggerBox}
                                        onPress={() => setTimePickerVisible(true)}
                                    >
                                        <ClockIcon size={16} color={colors.textDark} />
                                        <Text style={styles.pickerTriggerText}>{timeInput || "17:00"}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <Text style={styles.fieldLabel}>{language.t("_notesLabel")}</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder={language.t("_notesPlaceholder")}
                                placeholderTextColor="#A89B91"
                                multiline
                                numberOfLines={3}
                                value={notesInput}
                                onChangeText={setNotesInput}
                            />

                            {/* Select design image */}
                            <Text style={styles.fieldLabel}>{language.t("_assignedDesign")}</Text>
                            {selectedImage ? (
                                <View style={styles.selectedImagePreviewBox}>
                                    <Image source={selectedImage} style={styles.previewThumbModal} />
                                    <TouchableOpacity style={styles.changeDesignBtn} onPress={() => setShowImagePicker(true)}>
                                        <Text style={styles.changeDesignBtnText}>{language.t("_changeDesign")}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.removeDesignBtn} onPress={() => setSelectedImage(null)}>
                                        <Text style={styles.removeDesignBtnText}>{language.t("_removeDesign")}</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TouchableOpacity style={styles.pickDesignBox} onPress={() => setShowImagePicker(true)}>
                                    <Text style={styles.pickDesignText}>{language.t("_chooseFavoriteDesign")}</Text>
                                </TouchableOpacity>
                            )}

                            {/* Image Picker Subview */}
                            {showImagePicker && (
                                <View style={styles.favoritesPickerBox}>
                                    <View style={styles.favPickerHeader}>
                                        <Text style={styles.favPickerTitle}>{language.t("_myFavorites")}</Text>
                                        <TouchableOpacity onPress={() => setShowImagePicker(false)}>
                                            <Text style={styles.closeFavPickerText}>{language.t("_close")}</Text>
                                        </TouchableOpacity>
                                    </View>
                                    {favorites && favorites.length > 0 ? (
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.favScrollContent}>
                                            {favorites.map((favImg, index) => (
                                                <TouchableOpacity
                                                    key={index}
                                                    style={styles.favItemThumb}
                                                    onPress={() => {
                                                        setSelectedImage(favImg);
                                                        setShowImagePicker(false);
                                                    }}
                                                >
                                                    <Image source={favImg} style={styles.favImageThumb} />
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    ) : (
                                        <Text style={styles.noFavText}>{language.t("_noFavorites")}</Text>
                                    )}
                                </View>
                            )}

                            <View style={styles.formActions}>
                                <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                                    <Text style={styles.cancelBtnText}>{language.t("_cancel")}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                                    <Text style={styles.saveBtnText}>{language.t("_scheduleAppointment")}</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Clickable Date Picker Modal */}
            <DatePickerModal
                visible={datePickerVisible}
                onClose={() => setDatePickerVisible(false)}
                initialDate={dateInput}
                onSelectDate={(newDate) => setDateInput(newDate)}
            />

            {/* Clickable Time Picker Modal */}
            <TimePickerModal
                visible={timePickerVisible}
                onClose={() => setTimePickerVisible(false)}
                initialTime={timeInput}
                onSelectTime={(newTime) => setTimeInput(newTime)}
            />

            {/* Custom Confirm Dialog Modal */}
            <CustomConfirmModal
                visible={Boolean(confirmModalConfig)}
                {...confirmModalConfig}
            />

            <BottomNav activeTab="appointments" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    bannerWrapper: {
        position: "relative",
        zIndex: 1,
        minHeight: 60,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.white,
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 30,
    },
    topHeaderCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    headerInfo: {
        flex: 1,
    },
    addMainBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: colors.accent,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 22,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    addMainBtnText: {
        fontFamily: "ancizar-bold",
        fontSize: 13,
        color: colors.white,
    },
    calendarCard: {
        backgroundColor: colors.white,
        borderRadius: 20,
        padding: 16,
        marginBottom: 20,
        elevation: 3,
        shadowColor: "#2C221E",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
    },
    calendarHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 14,
    },
    monthNavBtn: {
        padding: 6,
        borderRadius: 12,
        backgroundColor: "#FAF6F3",
    },
    monthTitle: {
        fontFamily: "ancizar-bold",
        fontSize: 16,
        color: colors.textDark,
    },
    weekRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#F4ECE6",
        paddingBottom: 8,
    },
    weekDayText: {
        fontFamily: "ancizar-bold",
        fontSize: 12,
        color: colors.textMuted,
        width: 36,
        textAlign: "center",
    },
    daysGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    dayCellEmpty: {
        width: `${100 / 7}%`,
        height: 42,
    },
    dayCell: {
        width: `${100 / 7}%`,
        height: 42,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        position: "relative",
    },
    todayCell: {
        backgroundColor: "#F7EFE9",
        borderWidth: 1,
        borderColor: colors.accent,
    },
    hasAppointmentCell: {
        backgroundColor: "#FCE4E6",
        borderWidth: 1.5,
        borderColor: colors.accent,
    },
    selectedDayCell: {
        backgroundColor: colors.accent,
    },
    dayText: {
        fontFamily: "ancizar-medium",
        fontSize: 14,
        color: colors.textDark,
    },
    todayText: {
        fontFamily: "ancizar-bold",
        color: colors.accent,
    },
    hasAppointmentText: {
        fontFamily: "ancizar-bold",
        color: colors.accent,
    },
    selectedDayText: {
        fontFamily: "ancizar-bold",
        color: colors.white,
    },
    dotIndicator: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.accent,
        position: "absolute",
        bottom: 3,
    },
    dotIndicatorSelected: {
        backgroundColor: colors.white,
    },
    clearFilterRow: {
        marginTop: 12,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: "#F4ECE6",
        alignItems: "center",
    },
    clearFilterText: {
        fontFamily: "ancizar-medium",
        fontSize: 12.5,
        color: colors.textMuted,
    },
    clearFilterTextBold: {
        fontFamily: "ancizar-bold",
        color: colors.accent,
    },
    listSection: {
        marginTop: 4,
    },
    sectionTitle: {
        fontFamily: "ancizar-bold",
        fontSize: 16,
        color: colors.textDark,
        marginBottom: 12,
    },
    appointmentCard: {
        backgroundColor: colors.white,
        borderRadius: 18,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: "#2C221E",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    salonBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        flex: 1,
    },
    salonText: {
        fontFamily: "ancizar-bold",
        fontSize: 15,
        color: colors.textDark,
    },
    actionsRow: {
        flexDirection: "row",
        gap: 8,
    },
    iconBtn: {
        padding: 6,
        borderRadius: 12,
        backgroundColor: "#FAF6F3",
    },
    timeBadgeRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 10,
    },
    badgeItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#FAF6F3",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
    },
    badgeText: {
        fontFamily: "ancizar-medium",
        fontSize: 12.5,
        color: colors.textDark,
    },
    notesText: {
        fontFamily: "ancizar-medium",
        fontSize: 13,
        color: colors.textDark,
        backgroundColor: "#FAF6F3",
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
    },
    designContainer: {
        borderTopWidth: 1,
        borderTopColor: "#F4ECE6",
        paddingTop: 10,
        marginTop: 4,
    },
    designTitle: {
        fontFamily: "ancizar-bold",
        fontSize: 12,
        color: colors.textMuted,
        marginBottom: 6,
    },
    assignedImageRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FAF6F3",
        padding: 8,
        borderRadius: 12,
    },
    assignedThumb: {
        width: 44,
        height: 44,
        borderRadius: 8,
        backgroundColor: colors.cardBg,
        marginRight: 10,
    },
    assignedDetails: {
        flex: 1,
    },
    assignedLabel: {
        fontFamily: "ancizar-bold",
        fontSize: 13,
        color: colors.textDark,
    },
    assignedSub: {
        fontFamily: "ancizar-medium",
        fontSize: 11,
        color: colors.textMuted,
    },
    noDesignRow: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
        backgroundColor: "#FAF6F3",
        alignSelf: "flex-start",
    },
    noDesignText: {
        fontFamily: "ancizar-bold",
        fontSize: 12.5,
        color: colors.accent,
    },
    emptyContainer: {
        alignItems: "center",
        paddingVertical: 30,
        paddingHorizontal: 20,
        backgroundColor: colors.white,
        borderRadius: 20,
    },
    emptyIconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.badgeBg,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    emptyTitle: {
        fontFamily: "ancizar-bold",
        fontSize: 15,
        color: colors.textDark,
        marginBottom: 6,
    },
    emptyDesc: {
        fontFamily: "ancizar-medium",
        fontSize: 13,
        color: colors.textMuted,
        textAlign: "center",
        lineHeight: 19,
        marginBottom: 16,
    },
    emptyAddBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: colors.accent,
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 22,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    modalCard: {
        backgroundColor: colors.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: "90%",
        paddingBottom: 20,
    },
    modalHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 18,
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#F0E8E1",
    },
    modalTitle: {
        fontFamily: "ancizar-bold",
        fontSize: 18,
        color: colors.textDark,
    },
    closeBtn: {
        padding: 4,
    },
    modalScroll: {
        maxHeight: 520,
    },
    modalScrollContent: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        gap: 12,
    },
    fieldLabel: {
        fontFamily: "ancizar-bold",
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
        gap: 12,
    },
    flex1: {
        flex: 1,
        gap: 4,
    },
    pickDesignBox: {
        borderWidth: 1.5,
        borderColor: colors.accent,
        borderStyle: "dashed",
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: "center",
        backgroundColor: `${colors.accent}08`,
    },
    pickDesignText: {
        fontFamily: "ancizar-bold",
        fontSize: 13,
        color: colors.accent,
    },
    selectedImagePreviewBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FAF6F3",
        padding: 10,
        borderRadius: 14,
        gap: 10,
    },
    previewThumbModal: {
        width: 50,
        height: 50,
        borderRadius: 10,
        backgroundColor: colors.cardBg,
    },
    changeDesignBtn: {
        backgroundColor: colors.accent,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 12,
    },
    changeDesignBtnText: {
        fontFamily: "ancizar-bold",
        fontSize: 12,
        color: colors.white,
    },
    removeDesignBtn: {
        backgroundColor: "#EFE8E2",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 12,
    },
    removeDesignBtnText: {
        fontFamily: "ancizar-medium",
        fontSize: 12,
        color: colors.textDark,
    },
    favoritesPickerBox: {
        backgroundColor: "#FAF6F3",
        borderRadius: 14,
        padding: 12,
        marginTop: 4,
    },
    favPickerHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    favPickerTitle: {
        fontFamily: "ancizar-bold",
        fontSize: 13,
        color: colors.textDark,
    },
    closeFavPickerText: {
        fontFamily: "ancizar-bold",
        fontSize: 12,
        color: colors.accent,
    },
    favScrollContent: {
        gap: 8,
    },
    favItemThumb: {
        width: 60,
        height: 60,
        borderRadius: 10,
        overflow: "hidden",
    },
    favImageThumb: {
        width: "100%",
        height: "100%",
    },
    noFavText: {
        fontFamily: "ancizar-medium",
        fontSize: 12,
        color: colors.textMuted,
    },
    formActions: {
        flexDirection: "row",
        gap: 12,
        marginTop: 10,
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 22,
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
        borderRadius: 22,
        backgroundColor: colors.accent,
        alignItems: "center",
    },
    saveBtnText: {
        fontFamily: "ancizar-bold",
        fontSize: 14,
        color: colors.white,
    },
});

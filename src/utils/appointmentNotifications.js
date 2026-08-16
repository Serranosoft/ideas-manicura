import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { translations } from "./localizations";

export async function scheduleAppointmentNotification(appointment) {
    if (!appointment || !appointment.date || !appointment.time) return null;
    try {
        const [day, month, year] = appointment.date.split("-").map(Number);
        const [hour, minute] = appointment.time.split(":").map(Number);

        const appointmentDate = new Date(year, month - 1, day, hour, minute);

        // Recordatorio 2 horas antes de la cita
        const triggerDate = new Date(appointmentDate.getTime() - 2 * 60 * 60 * 1000);

        // Si 2h antes ya pasó, intentamos 15 mins antes o directo a la hora si está en el futuro
        let finalTrigger = triggerDate;
        if (finalTrigger.getTime() <= Date.now()) {
            finalTrigger = new Date(appointmentDate.getTime() - 15 * 60 * 1000);
        }
        if (finalTrigger.getTime() <= Date.now()) {
            finalTrigger = appointmentDate;
        }

        if (finalTrigger.getTime() > Date.now()) {
            if (appointment.notificationId) {
                try {
                    await Notifications.cancelScheduledNotificationAsync(appointment.notificationId);
                } catch (err) {
                    // Ignore error if not found
                }
            }

            const storedLocale = await AsyncStorage.getItem("language");
            const copy = translations[storedLocale] || translations.es;
            const placeName = appointment.place || copy._placeSalon;
            const notificationBody = copy._reminderNotificationBody
                .replace("%place%", placeName)
                .replace("%time%", appointment.time);
            const notificationId = await Notifications.scheduleNotificationAsync({
                content: {
                    title: copy._reminderNotificationTitle,
                    body: notificationBody,
                    data: { appointmentId: appointment.id },
                },
                trigger: { date: finalTrigger },
            });
            return notificationId;
        }
    } catch (error) {
        console.log("Error programando notificación de cita:", error);
    }
    return null;
}

export async function cancelAppointmentNotification(notificationId) {
    if (!notificationId) return;
    try {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
        console.log("Error cancelando notificación:", error);
    }
}

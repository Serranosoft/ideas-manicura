import * as Notifications from "expo-notifications";

export async function scheduleAppointmentNotification(appointment) {
    if (!appointment || !appointment.date || !appointment.time) return null;
    try {
        const [year, month, day] = appointment.date.split("-").map(Number);
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

            const placeName = appointment.place ? appointment.place : "tu salón";
            const notificationId = await Notifications.scheduleNotificationAsync({
                content: {
                    title: "¡Recordatorio de tu cita de uñas! 💅",
                    body: `Tienes cita en ${placeName} a las ${appointment.time}. ¡No olvides llevar tu diseño!`,
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

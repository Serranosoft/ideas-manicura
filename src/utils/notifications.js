import * as Notifications from "expo-notifications";

export async function scheduleWeeklyNotification(language) {
    try {

        // Obtener la lista de notificaciones programadas
        const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

        const exists = scheduledNotifications.some((notificacion) => {
            return notificacion.identifier === 'notificacion-semanal-miercoles';
        });

        // Si ya hay una notificación programada, no hagas nada
        if (exists) {
            console.log('Ya hay una notificación programada para la próxima semana.');
            return;
        }

        const notification = {
            identifier: "notificacion-semanal-miercoles",
            content: {
                title: language.t("_notificationsTitle"),
                body: language.t("_notificationsBody"),
            },
            trigger: {
                type: "weekly",
                weekday: 4,
                hour: 12,
                minute: 0,
            },
        };

        // Programa la notificación
        await Notifications.scheduleNotificationAsync(notification);
    } catch (error) {
        console.error('Error al programar la notificación:', error);
    }
};
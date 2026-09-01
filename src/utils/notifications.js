import * as Notifications from "expo-notifications";

let permissionRequest = null;

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});

export async function ensureNotificationPermissionsAsync() {
    if (!permissionRequest) {
        permissionRequest = (async () => {
            const currentPermission = await Notifications.getPermissionsAsync();
            if (currentPermission.granted) return true;

            const requestedPermission = await Notifications.requestPermissionsAsync();
            return requestedPermission.granted;
        })().finally(() => {
            permissionRequest = null;
        });
    }

    return permissionRequest;
}

export async function scheduleWeeklyNotification(language) {
    try {
        if (!(await ensureNotificationPermissionsAsync())) return;

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
                title: language.t("_notificationTitle"),
                body: language.t("_notificationBody"),
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
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

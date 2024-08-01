import * as Notifications from "expo-notifications";

// Función para programar una notificación que se lance en los siguientes 10 segundos
export async function testNotification() {
    /* try {
        // Obtener la lista de notificaciones programadas
        const notificacionesProgramadas = await Notifications.getAllScheduledNotificationsAsync();

        const existeNotificacionProgramada = notificacionesProgramadas.some((notificacion) => {
            return notificacion.identifier === 'notificacion-10-sec';
        });

        // Si ya hay una notificación programada, no hagas nada
        if (existeNotificacionProgramada) {
            console.log('Ya hay una notificación programada para los proximos 10 segundos');
            return;
        }

        const notificacion = {
            identifier: "notificacion-10-sec",
            content: {
                title: '¿Estás pensando en hacerte las uñas?',
                body: 'Entra y mira todas las ideas y diseños de uñas que tenemos para ti',
            },
            trigger: {
                seconds: 10, // La hora a la que se lanzará la notificación
            },
        };

        // Programa la notificación
        await Notifications.scheduleNotificationAsync(notificacion);

        console.log('Notificación programada para dentro de 5 segundos.');
    } catch (error) {
        console.error('Error al programar la notificación:', error);
    } */
};

export async function scheduleWeeklyNotification() {
/*     try {

        await Notifications.setNotificationChannelAsync('new-emails', {
            name: 'notifications',
          });

        // Obtener la lista de notificaciones programadas
        const notificacionesProgramadas = await Notifications.getAllScheduledNotificationsAsync();

        const existeNotificacionProgramada = notificacionesProgramadas.some((notificacion) => {
            return notificacion.identifier === 'notificacion-semanal';
        });


        // Si ya hay una notificación programada, no hagas nada
        if (existeNotificacionProgramada) {
            console.log('Ya hay una notificación programada para la próxima semana.');
            return;
        }

        const notificacion = {
            identifier: 'notificacion-semanal',
            content: {
                title: '¡Nuevos diseños de uñas!',
                body: 'Tenemos un montón de ideas nuevas ¿Te las vas a perder?',
            },
            trigger: {
                channelId: "new-emails",
                seconds: 2,
            },
        };

        // Programa la notificación
        await Notifications.scheduleNotificationAsync(notificacion);

        console.log('Notificación programada para el próximo lunes a las 18:00');
    } catch (error) {
        console.error('Error al programar la notificación:', error);
    } */
};

export function getLeftTimeToNextMonday() {
    const today = new Date();
    const currentDay = today.getDay();

    const daysUntilMonday = 1 - currentDay;
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysUntilMonday);
    nextMonday.setHours(18, 0, 0, 0);
    
    if (today > nextMonday) {
        nextMonday.setDate(nextMonday.getDate() + 7); // Añade 7 días para el próximo lunes
    }

    // Calcula la diferencia en segundos entre la fecha actual y el próximo lunes a las 18:00
    const diff = Math.floor((nextMonday - today) / 1000);
    return diff;
}


export async function getNotificationInfo() {
    // const info = await Notifications.getAllScheduledNotificationsAsync();
}

export async function removeAllNotifications() {
    // await Notifications.cancelAllScheduledNotificationsAsync();
}
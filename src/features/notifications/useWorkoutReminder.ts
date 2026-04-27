import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LAST_WORKOUT_KEY = 'last_workout_ts';
const NOTIF_ASKED_KEY = 'notif_permission_asked';

export function recordWorkoutDone() {
  localStorage.setItem(LAST_WORKOUT_KEY, Date.now().toString());
}

export function useWorkoutReminder() {
  const { t } = useTranslation();

  useEffect(() => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'denied') return;

    const asked = localStorage.getItem(NOTIF_ASKED_KEY);
    const lastWorkout = localStorage.getItem(LAST_WORKOUT_KEY);
    const hoursSince = lastWorkout ? (Date.now() - Number(lastWorkout)) / 1000 / 3600 : Infinity;

    async function run() {
      if (Notification.permission === 'default' && !asked && hoursSince > 24) {
        localStorage.setItem(NOTIF_ASKED_KEY, '1');
        const perm = await Notification.requestPermission();
        if (perm !== 'granted') return;
      }

      if (Notification.permission === 'granted' && hoursSince > 24) {
        new Notification(t('notifications.reminder.title'), {
          body: t('notifications.reminder.body'),
          icon: '/icon-192.png',
          tag: 'workout-reminder',
        });
      }
    }

    run();
  }, [t]);
}

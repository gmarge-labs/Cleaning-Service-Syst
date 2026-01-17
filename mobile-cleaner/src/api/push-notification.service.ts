
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export const pushNotificationService = {
    registerForPushNotificationsAsync: async () => {
        let token;

        if (Platform.OS === 'android' && Constants.appOwnership === 'expo') {
            console.warn('Remote push notifications are not supported in Expo Go on Android. Use a development build to test push.');
            return;
        }

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        if (Device.isDevice || Platform.OS === 'web') {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                if (Platform.OS !== 'web') {
                    alert('Failed to get push token for push notification!');
                }
                return;
            }

            // Push notifications on web require VAPID configuration in app.json
            // We'll skip token fetch on web for now to avoid errors during development
            if (Platform.OS === 'web') {
                console.log('Push notifications are limited on web without VAPID configuration.');
                return;
            }

            const projectId =
                Constants?.expoConfig?.extra?.eas?.projectId ||
                Constants?.expoConfig?.extra?.projectId ||
                Constants?.easConfig?.projectId;

            if (!projectId) {
                console.warn(
                    'Missing Expo projectId. Set expo.extra.eas.projectId in app.json to enable push notifications.'
                );
                return;
            }

            try {
                const expoToken = await Notifications.getExpoPushTokenAsync({ projectId });
                token = expoToken.data;
                console.log("Expo Push Token:", token);
            } catch (e: any) {
                console.warn("Failed to fetch push token. If you are using Expo Go on Android with SDK 53+, this is expected as remote push notifications were removed. Error:", e.message);
            }

        } else {
            alert('Must use physical device for Push Notifications');
        }

        return token;
    },

    addNotificationReceivedListener: (callback: (notification: Notifications.Notification) => void) => {
        return Notifications.addNotificationReceivedListener(callback);
    },

    addNotificationResponseReceivedListener: (callback: (response: Notifications.NotificationResponse) => void) => {
        return Notifications.addNotificationResponseReceivedListener(callback);
    },

    removeNotificationSubscription: (subscription: Notifications.Subscription) => {
        subscription.remove();
    }
};

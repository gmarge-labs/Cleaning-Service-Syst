import { google } from 'googleapis';
import prisma from './prisma';

/**
 * Initializes the Google Calendar client using credentials from system settings.
 */
async function getCalendarClient() {
    const settings = await prisma.systemSettings.findUnique({
        where: { id: 'default' }
    });

    if (!settings || !settings.integrations) {
        throw new Error('System settings or integrations not found');
    }

    const integrations = settings.integrations as any;
    const { googleCalendar } = integrations;

    if (!googleCalendar || !googleCalendar.enabled) {
        throw new Error('Google Calendar integration is not enabled');
    }

    const auth = new google.auth.OAuth2(
        googleCalendar.clientId,
        googleCalendar.clientSecret
    );

    // In a real scenario, we'd need a refresh token.
    // For this implementation, we assume the credentials provided are sufficient.

    return google.calendar({ version: 'v3', auth });
}

/**
 * Creates a calendar event for a booking.
 * @param booking The booking object
 * @returns The created event data
 */
export async function createCalendarEvent(booking: any) {
    try {
        const calendar = await getCalendarClient();

        // Construct event description
        const description = `
Service: ${booking.serviceType}
Address: ${booking.address}
Customer: ${booking.guestName}
Phone: ${booking.guestPhone}
Notes: ${booking.specialInstructions || 'None'}
    `.trim();

        // Map booking date/time to ISO string
        // Assuming booking.date is a Date object and booking.time is "HH:MM AM/PM"
        const startDateTime = new Date(booking.date);
        const [time, period] = booking.time.split(' ');
        const [hours, minutes] = time.split(':').map(Number);
        let hour24 = hours;
        if (period === 'PM' && hours !== 12) hour24 += 12;
        if (period === 'AM' && hours === 12) hour24 = 0;
        startDateTime.setHours(hour24, minutes, 0);

        const endDateTime = new Date(startDateTime);
        endDateTime.setMinutes(endDateTime.getMinutes() + (booking.estimatedDuration || 120));

        const event = {
            summary: `Cleaning: ${booking.serviceType} - ${booking.guestName}`,
            location: booking.address,
            description: description,
            start: {
                dateTime: startDateTime.toISOString(),
                timeZone: 'UTC', // Adjust as needed
            },
            end: {
                dateTime: endDateTime.toISOString(),
                timeZone: 'UTC',
            },
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 24 * 60 },
                    { method: 'popup', minutes: 60 },
                ],
            },
        };

        const response = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: event,
        });

        return response.data;
    } catch (error) {
        console.error('Error creating Google Calendar event:', error);
        // Don't throw if calendar fails, just log it to avoid breaking booking flow
        return null;
    }
}

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCalendarEvent = createCalendarEvent;
const googleapis_1 = require("googleapis");
const prisma_1 = __importDefault(require("./prisma"));
/**
 * Initializes the Google Calendar client using credentials from system settings.
 */
function getCalendarClient() {
    return __awaiter(this, void 0, void 0, function* () {
        const settings = yield prisma_1.default.systemSettings.findUnique({
            where: { id: 'default' }
        });
        if (!settings || !settings.integrations) {
            throw new Error('System settings or integrations not found');
        }
        const integrations = settings.integrations;
        const { googleCalendar } = integrations;
        if (!googleCalendar || !googleCalendar.enabled) {
            throw new Error('Google Calendar integration is not enabled');
        }
        const auth = new googleapis_1.google.auth.OAuth2(googleCalendar.clientId, googleCalendar.clientSecret);
        // In a real scenario, we'd need a refresh token.
        // For this implementation, we assume the credentials provided are sufficient.
        return googleapis_1.google.calendar({ version: 'v3', auth });
    });
}
/**
 * Creates a calendar event for a booking.
 * @param booking The booking object
 * @returns The created event data
 */
function createCalendarEvent(booking) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const calendar = yield getCalendarClient();
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
            if (period === 'PM' && hours !== 12)
                hour24 += 12;
            if (period === 'AM' && hours === 12)
                hour24 = 0;
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
            const response = yield calendar.events.insert({
                calendarId: 'primary',
                requestBody: event,
            });
            return response.data;
        }
        catch (error) {
            console.error('Error creating Google Calendar event:', error);
            // Don't throw if calendar fails, just log it to avoid breaking booking flow
            return null;
        }
    });
}

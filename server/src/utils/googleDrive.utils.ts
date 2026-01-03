import { google } from 'googleapis';
import prisma from './prisma';
import fs from 'fs';

/**
 * Initializes the Google Drive client using credentials from system settings.
 */
async function getDriveClient() {
    const settings = await prisma.systemSettings.findUnique({
        where: { id: 'default' }
    });

    if (!settings || !settings.integrations) {
        throw new Error('System settings or integrations not found');
    }

    const integrations = settings.integrations as any;
    const { googleDrive } = integrations;

    if (!googleDrive || !googleDrive.enabled) {
        throw new Error('Google Drive integration is not enabled');
    }

    // Note: Using API Key for simple operations, but uploads usually require OAuth
    // If the user provides an OAuth token, we would use it here.
    // For now, we'll try to use the API Key or Client Secret if possible.

    const auth = new google.auth.OAuth2(
        integrations.googleCalendar.clientId,
        integrations.googleCalendar.clientSecret
    );

    // In a real scenario, we'd need a refresh token. 
    // For this implementation, we assume the credentials provided are sufficient 
    // or will be supplemented with manual auth in the dashboard.

    return google.drive({ version: 'v3', auth });
}

/**
 * Uploads a file to Google Drive.
 * @param fileName Name of the file in Drive
 * @param mimeType MIME type of the file
 * @param fileStream ReadStream of the file
 * @returns The Drive file ID and webViewLink
 */
export async function uploadToDrive(fileName: string, mimeType: string, fileStream: any) {
    try {
        const drive = await getDriveClient();

        const settings = await prisma.systemSettings.findUnique({
            where: { id: 'default' }
        });
        const folderId = (settings?.integrations as any)?.googleDrive?.folderId;

        const response = await drive.files.create({
            requestBody: {
                name: fileName,
                parents: folderId ? [folderId] : undefined,
            },
            media: {
                mimeType: mimeType,
                body: fileStream,
            },
            fields: 'id, webViewLink',
        });

        return response.data;
    } catch (error) {
        console.error('Error uploading to Google Drive:', error);
        throw error;
    }
}

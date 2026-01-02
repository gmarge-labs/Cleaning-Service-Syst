import { google } from 'googleapis';
import { Readable } from 'stream';
import dotenv from 'dotenv';

dotenv.config();

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

// Initialize Google Drive client
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: SCOPES,
});

const drive = google.drive({ version: 'v3', auth });

const ROOT_FOLDER_ID = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
const SHARED_DRIVE_ID = process.env.GOOGLE_SHARED_DRIVE_ID;

/**
 * Get or create a folder by name under a parent folder
 */
async function getOrCreateFolder(folderName: string, parentId: string = ROOT_FOLDER_ID!): Promise<string> {
  try {
    const listParams: any = {
      q: `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and '${parentId}' in parents and trashed = false`,
      fields: 'files(id, name)',
    };
    
    // Add Team Drive support if SHARED_DRIVE_ID is configured
    if (SHARED_DRIVE_ID) {
      listParams.supportsTeamDrives = true;
      listParams.corpora = 'teamDrive';
      listParams.teamDriveId = SHARED_DRIVE_ID;
      listParams.includeTeamDriveItems = true;
    }
    
    const response = await drive.files.list(listParams);

    if (response.data.files && response.data.files.length > 0) {
      return response.data.files[0].id!;
    }

    const folderMetadata: any = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId],
    };

    // Add Team Drive support if SHARED_DRIVE_ID is configured
    const createParams: any = {
      requestBody: folderMetadata,
      fields: 'id',
    };
    
    if (SHARED_DRIVE_ID) {
      createParams.supportsTeamDrives = true;
      createParams.teamDriveId = SHARED_DRIVE_ID;
    }

    const folder = await drive.files.create(createParams);

    return folder.data.id!;
  } catch (error) {
    console.error('Error in getOrCreateFolder:', error);
    throw error;
  }
}

/**
 * Upload a base64 image to Google Drive
 */
export async function uploadBase64Image(base64Data: string, fileName: string, folderPath: string[]): Promise<string> {
  try {
    let currentParentId = SHARED_DRIVE_ID || ROOT_FOLDER_ID!;

    // Create folder structure: Year > Month > Day > BookingID
    for (const folderName of folderPath) {
      currentParentId = await getOrCreateFolder(folderName, currentParentId);
    }

    // Remove base64 prefix if present
    const base64Image = base64Data.split(';base64,').pop();
    const buffer = Buffer.from(base64Image!, 'base64');
    const bufferStream = new Readable();
    bufferStream.push(buffer);
    bufferStream.push(null);

    const fileMetadata = {
      name: fileName,
      parents: [currentParentId],
    };

    const media = {
      mimeType: 'image/jpeg',
      body: bufferStream,
    };

    const createParams: any = {
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink',
    };
    
    // Add Team Drive support if SHARED_DRIVE_ID is configured
    if (SHARED_DRIVE_ID) {
      createParams.supportsTeamDrives = true;
      createParams.teamDriveId = SHARED_DRIVE_ID;
    }

    const file = await drive.files.create(createParams);

    // Make file readable by anyone with the link (optional, but useful for admin viewing)
    // Since user asked for private, we skip the permission part or set it specifically.
    // For now, we just return the link. The admin who has access to the root folder will see it.
    
    return file.data.webViewLink!;
  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    throw error;
  }
}

/**
 * Upload a base64 document (PDF/Image) to Google Drive
 */
export async function uploadBase64File(base64Data: string, fileName: string, folderPath: string[]): Promise<string> {
  try {
    let currentParentId = SHARED_DRIVE_ID || ROOT_FOLDER_ID!;

    for (const folderName of folderPath) {
      currentParentId = await getOrCreateFolder(folderName, currentParentId);
    }

    const mimeType = base64Data.match(/data:([^;]+);/)?.[1] || 'application/octet-stream';
    const base64Content = base64Data.split(';base64,').pop();
    const buffer = Buffer.from(base64Content!, 'base64');
    const bufferStream = new Readable();
    bufferStream.push(buffer);
    bufferStream.push(null);

    const fileMetadata = {
      name: fileName,
      parents: [currentParentId],
    };

    const media = {
      mimeType: mimeType,
      body: bufferStream,
    };

    const createParams: any = {
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink',
    };
    
    // Add Team Drive support if SHARED_DRIVE_ID is configured
    if (SHARED_DRIVE_ID) {
      createParams.supportsTeamDrives = true;
      createParams.teamDriveId = SHARED_DRIVE_ID;
    }

    const file = await drive.files.create(createParams);

    return file.data.webViewLink!;
  } catch (error) {
    console.error('Error uploading file to Google Drive:', error);
    throw error;
  }
}

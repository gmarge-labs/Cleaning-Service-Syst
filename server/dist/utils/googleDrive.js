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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadBase64Image = uploadBase64Image;
exports.uploadBase64File = uploadBase64File;
const googleapis_1 = require("googleapis");
const stream_1 = require("stream");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
// Initialize Google Drive client
const auth = new googleapis_1.google.auth.GoogleAuth({
    credentials: {
        client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
        private_key: (_a = process.env.GOOGLE_DRIVE_PRIVATE_KEY) === null || _a === void 0 ? void 0 : _a.replace(/\\n/g, '\n'),
    },
    scopes: SCOPES,
});
const drive = googleapis_1.google.drive({ version: 'v3', auth });
const ROOT_FOLDER_ID = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
const SHARED_DRIVE_ID = process.env.GOOGLE_SHARED_DRIVE_ID;
/**
 * Get or create a folder by name under a parent folder
 */
function getOrCreateFolder(folderName_1) {
    return __awaiter(this, arguments, void 0, function* (folderName, parentId = ROOT_FOLDER_ID) {
        try {
            const listParams = {
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
            const response = yield drive.files.list(listParams);
            if (response.data.files && response.data.files.length > 0) {
                return response.data.files[0].id;
            }
            const folderMetadata = {
                name: folderName,
                mimeType: 'application/vnd.google-apps.folder',
                parents: [parentId],
            };
            // Add Team Drive support if SHARED_DRIVE_ID is configured
            const createParams = {
                requestBody: folderMetadata,
                fields: 'id',
            };
            if (SHARED_DRIVE_ID) {
                createParams.supportsTeamDrives = true;
                createParams.teamDriveId = SHARED_DRIVE_ID;
            }
            const folder = yield drive.files.create(createParams);
            return folder.data.id;
        }
        catch (error) {
            console.error('Error in getOrCreateFolder:', error);
            throw error;
        }
    });
}
/**
 * Upload a base64 image to Google Drive
 */
function uploadBase64Image(base64Data, fileName, folderPath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let currentParentId = SHARED_DRIVE_ID || ROOT_FOLDER_ID;
            // Create folder structure: Year > Month > Day > BookingID
            for (const folderName of folderPath) {
                currentParentId = yield getOrCreateFolder(folderName, currentParentId);
            }
            // Remove base64 prefix if present
            const base64Image = base64Data.split(';base64,').pop();
            const buffer = Buffer.from(base64Image, 'base64');
            const bufferStream = new stream_1.Readable();
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
            const createParams = {
                requestBody: fileMetadata,
                media: media,
                fields: 'id, webViewLink',
            };
            // Add Team Drive support if SHARED_DRIVE_ID is configured
            if (SHARED_DRIVE_ID) {
                createParams.supportsTeamDrives = true;
                createParams.teamDriveId = SHARED_DRIVE_ID;
            }
            const file = yield drive.files.create(createParams);
            // Make file readable by anyone with the link (optional, but useful for admin viewing)
            // Since user asked for private, we skip the permission part or set it specifically.
            // For now, we just return the link. The admin who has access to the root folder will see it.
            return file.data.webViewLink;
        }
        catch (error) {
            console.error('Error uploading to Google Drive:', error);
            throw error;
        }
    });
}
/**
 * Upload a base64 document (PDF/Image) to Google Drive
 */
function uploadBase64File(base64Data, fileName, folderPath) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            let currentParentId = SHARED_DRIVE_ID || ROOT_FOLDER_ID;
            for (const folderName of folderPath) {
                currentParentId = yield getOrCreateFolder(folderName, currentParentId);
            }
            const mimeType = ((_a = base64Data.match(/data:([^;]+);/)) === null || _a === void 0 ? void 0 : _a[1]) || 'application/octet-stream';
            const base64Content = base64Data.split(';base64,').pop();
            const buffer = Buffer.from(base64Content, 'base64');
            const bufferStream = new stream_1.Readable();
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
            const createParams = {
                requestBody: fileMetadata,
                media: media,
                fields: 'id, webViewLink',
            };
            // Add Team Drive support if SHARED_DRIVE_ID is configured
            if (SHARED_DRIVE_ID) {
                createParams.supportsTeamDrives = true;
                createParams.teamDriveId = SHARED_DRIVE_ID;
            }
            const file = yield drive.files.create(createParams);
            return file.data.webViewLink;
        }
        catch (error) {
            console.error('Error uploading file to Google Drive:', error);
            throw error;
        }
    });
}

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
exports.uploadToDrive = uploadToDrive;
const googleapis_1 = require("googleapis");
const prisma_1 = __importDefault(require("./prisma"));
/**
 * Initializes the Google Drive client using credentials from system settings.
 */
function getDriveClient() {
    return __awaiter(this, void 0, void 0, function* () {
        const settings = yield prisma_1.default.systemSettings.findUnique({
            where: { id: 'default' }
        });
        if (!settings || !settings.integrations) {
            throw new Error('System settings or integrations not found');
        }
        const integrations = settings.integrations;
        const { googleDrive } = integrations;
        if (!googleDrive || !googleDrive.enabled) {
            throw new Error('Google Drive integration is not enabled');
        }
        // Note: Using API Key for simple operations, but uploads usually require OAuth
        // If the user provides an OAuth token, we would use it here.
        // For now, we'll try to use the API Key or Client Secret if possible.
        const auth = new googleapis_1.google.auth.OAuth2(integrations.googleCalendar.clientId, integrations.googleCalendar.clientSecret);
        // In a real scenario, we'd need a refresh token. 
        // For this implementation, we assume the credentials provided are sufficient 
        // or will be supplemented with manual auth in the dashboard.
        return googleapis_1.google.drive({ version: 'v3', auth });
    });
}
/**
 * Uploads a file to Google Drive.
 * @param fileName Name of the file in Drive
 * @param mimeType MIME type of the file
 * @param fileStream ReadStream of the file
 * @returns The Drive file ID and webViewLink
 */
function uploadToDrive(fileName, mimeType, fileStream) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const drive = yield getDriveClient();
            const settings = yield prisma_1.default.systemSettings.findUnique({
                where: { id: 'default' }
            });
            const folderId = (_b = (_a = settings === null || settings === void 0 ? void 0 : settings.integrations) === null || _a === void 0 ? void 0 : _a.googleDrive) === null || _b === void 0 ? void 0 : _b.folderId;
            const response = yield drive.files.create({
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
        }
        catch (error) {
            console.error('Error uploading to Google Drive:', error);
            throw error;
        }
    });
}

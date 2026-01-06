# Google Drive Upload Fix - Service Account Issue

## Problem
The mobile cleaner app was failing to upload photos to Google Drive with the following error:

```
HTTP/1.1 500 Internal Server Error
PATCH http://localhost:5000/api/bookings/BK-20260107-001
```

Backend error:
```
Service Accounts do not have storage quota. 
Leverage shared drives (https://developers.google.com/workspace/drive/api/guides/about-shareddrives), 
or use OAuth delegation (http://support.google.com/a/answer/7281227) instead.

Status: 403 Forbidden
```

## Root Cause
The application was using a Google Service Account to upload files to Google Drive. While service accounts are useful for API automation, they **do not have personal storage quota** in Google Drive. They can only upload files to:
1. **Shared Drives (Team Drives)** - which they have been explicitly granted access to
2. Folders shared with them by users using OAuth delegation

## Solution Implemented
Updated the Google Drive utility to support **Shared Drives (Team Drives)** by:

### 1. Modified `server/src/utils/googleDrive.ts`
Added support for Shared Drives by including:
- `supportsTeamDrives: true` parameter in API calls
- `corpora: 'teamDrive'` to search within team drives
- `teamDriveId` parameter to specify which Shared Drive to use
- `includeTeamDriveItems: true` to include Team Drive files in listings

The code now:
- Uses `GOOGLE_SHARED_DRIVE_ID` environment variable if available (for Shared Drive)
- Falls back to `GOOGLE_DRIVE_ROOT_FOLDER_ID` if not configured (for backward compatibility)

### 2. Updated `server/.env`
Added `GOOGLE_SHARED_DRIVE_ID` environment variable with setup instructions.

## Next Steps - Setup Required

To make this work, you need to:

1. **Create a Shared Drive in Google Workspace**
   - Go to Google Drive
   - Click "New" > "Team drive"
   - Name it (e.g., "Sparkleville Photos")

2. **Share with Service Account**
   - Get the service account email: `drive-uploader@sparkleville-assets.iam.gserviceaccount.com`
   - Add it to the Shared Drive with **Editor** role

3. **Get the Shared Drive ID**
   - Open the Shared Drive
   - Copy the ID from the URL: `https://drive.google.com/drive/folders/{SHARED_DRIVE_ID}`

4. **Update Environment Variable**
   - Set `GOOGLE_SHARED_DRIVE_ID` in `server/.env`:
   ```
   GOOGLE_SHARED_DRIVE_ID="your_shared_drive_id_here"
   ```

5. **Restart the Backend Server**
   - Restart the Node.js server for changes to take effect

## Files Modified
- `server/src/utils/googleDrive.ts` - Added Shared Drive support to all upload functions
- `server/.env` - Added GOOGLE_SHARED_DRIVE_ID configuration variable

## Testing
After setup:
1. Try uploading a photo from the mobile app
2. Check that the PATCH request to `/api/bookings/:id` returns 200 OK
3. Verify the photo appears in the Shared Drive folder structure

## Important Notes
- The code automatically creates the folder structure: `Year > Month > Day > Booking_ID > Completion`
- Photos are stored with timestamps to avoid conflicts
- The service account must have Editor access to the Shared Drive
- If `GOOGLE_SHARED_DRIVE_ID` is empty, it falls back to the personal folder (which won't work), so setup is required

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../utils/api';

interface GeneralSettings {
  companyName: string;
  email: string;
  phone: string;
  address: string;
  businessHours: string;
  serviceArea: string;
}

interface SettingsState {
  general: GeneralSettings;
  isLoading: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  general: {
    companyName: 'Sparkleville',
    email: 'admin@sparkleville.co',
    phone: '+12079007700',
    address: 'Bangor, Maine,Penobscot county',
    businessHours: '8:00 AM - 8:00 PM',
    serviceArea: '10001, 10002, 10003',
  },
  isLoading: false,
  error: null,
};

export const fetchSettings = createAsyncThunk(
  'settings/fetchSettings',
  async () => {
    const response = await api.get('/api/settings');
    if (!response.ok) throw new Error('Failed to fetch settings');
    const data = await response.json();
    return data;
  }
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateGeneralSettings: (state, action) => {
      state.general = { ...state.general, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.general) {
          state.general = action.payload.general;
        }
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch settings';
      });
  },
});

export const { updateGeneralSettings } = settingsSlice.actions;
export default settingsSlice.reducer;

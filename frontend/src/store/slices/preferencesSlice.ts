import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';

interface PreferencesState {
  language: string;
  timezone: string;
  dateFormat: string;
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
  };
  accessibility: {
    highContrast: boolean;
    fontSize: number;
    reduceMotion: boolean;
  };
}

const initialState: PreferencesState = {
  language: 'en',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  dateFormat: 'MM/DD/YYYY',
  notifications: {
    email: true,
    push: true,
    desktop: true,
  },
  accessibility: {
    highContrast: false,
    fontSize: 16,
    reduceMotion: false,
  },
};

export const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    setTimezone: (state, action: PayloadAction<string>) => {
      state.timezone = action.payload;
    },
    setDateFormat: (state, action: PayloadAction<string>) => {
      state.dateFormat = action.payload;
    },
    setNotificationPreferences: (
      state,
      action: PayloadAction<Partial<PreferencesState['notifications']>>
    ) => {
      state.notifications = { ...state.notifications, ...action.payload };
    },
    setAccessibilityPreferences: (
      state,
      action: PayloadAction<Partial<PreferencesState['accessibility']>>
    ) => {
      state.accessibility = { ...state.accessibility, ...action.payload };
    },
    resetPreferences: () => initialState,
  },
});

export const {
  setLanguage,
  setTimezone,
  setDateFormat,
  setNotificationPreferences,
  setAccessibilityPreferences,
  resetPreferences,
} = preferencesSlice.actions;

// Selectors
export const selectLanguage = (state: RootState) => state.preferences.language;
export const selectTimezone = (state: RootState) => state.preferences.timezone;
export const selectDateFormat = (state: RootState) => state.preferences.dateFormat;
export const selectNotificationPreferences = (state: RootState) =>
  state.preferences.notifications;
export const selectAccessibilityPreferences = (state: RootState) =>
  state.preferences.accessibility;

export default preferencesSlice.reducer;

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';

interface UiState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  currentView: string;
  isLoading: {
    [key: string]: boolean;
  };
}

const initialState: UiState = {
  sidebarOpen: true,
  theme: 'light',
  currentView: 'dashboard',
  isLoading: {},
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    setCurrentView: (state, action: PayloadAction<string>) => {
      state.currentView = action.payload;
    },
    setLoading: (
      state,
      action: PayloadAction<{ key: string; isLoading: boolean }>
    ) => {
      state.isLoading[action.payload.key] = action.payload.isLoading;
    },
  },
});

export const { toggleSidebar, setTheme, setCurrentView, setLoading } =
  uiSlice.actions;

// Selectors
export const selectSidebarOpen = (state: RootState) => state.ui.sidebarOpen;
export const selectTheme = (state: RootState) => state.ui.theme;
export const selectCurrentView = (state: RootState) => state.ui.currentView;
export const selectIsLoading = (key: string) => (state: RootState) =>
  state.ui.isLoading[key] || false;

export default uiSlice.reducer;

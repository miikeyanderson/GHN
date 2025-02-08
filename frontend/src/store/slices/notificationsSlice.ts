import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  title?: string;
  autoHideDuration?: number;
  createdAt: number;
}

interface NotificationsState {
  items: Notification[];
}

const initialState: NotificationsState = {
  items: [],
};

export const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'createdAt'>>) => {
      state.items.push({
        ...action.payload,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: Date.now(),
      });
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    clearAllNotifications: (state) => {
      state.items = [];
    },
  },
});

export const { addNotification, removeNotification, clearAllNotifications } =
  notificationsSlice.actions;

// Selectors
export const selectAllNotifications = (state: RootState) =>
  state.notifications.items;
export const selectLatestNotification = (state: RootState) =>
  state.notifications.items[state.notifications.items.length - 1];

export default notificationsSlice.reducer;

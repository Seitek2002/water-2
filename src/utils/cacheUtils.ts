import type { Dispatch, UnknownAction } from '@reduxjs/toolkit';
import { clearAuthData } from './authUtils';

import { authApi } from 'api/Auth.api';

export const clearAuthCache = (dispatch: Dispatch<UnknownAction>): void => {
  dispatch(authApi.util.resetApiState());
};
export const clearAllAppCaches = (dispatch: Dispatch<UnknownAction>): void => {
  clearAuthCache(dispatch);
  clearAuthData();
};
export const refreshUserData = (dispatch: Dispatch<UnknownAction>): void => {
  // Только если пользователь авторизован
  const token = localStorage.getItem('access_token');
  if (token) {
    dispatch(authApi.util.invalidateTags(['User', 'Permissions']));
  }
};

// /src/hooks/useAuth.ts

import { skipToken } from '@reduxjs/toolkit/query/react';

import { useGetUserInfoQuery, useGetUserPermissionsQuery } from 'api/Auth.api';
import { isAuthenticated } from 'utils/authUtils';

// Хук для получения информации о пользователе с правильной типизацией
export const useUserInfo = (forceRefresh = false) => {
  return useGetUserInfoQuery(isAuthenticated() ? undefined : skipToken, {
    refetchOnMountOrArgChange: forceRefresh ? true : 30, // Обновляем данные при изменениях
    refetchOnFocus: true, // Обновляем при фокусе на странице
    refetchOnReconnect: true // Обновляем при переподключении
  });
};

// Хук для получения разрешений пользователя с правильной типизацией
export const useUserPermissions = (forceRefresh = false) => {
  return useGetUserPermissionsQuery(isAuthenticated() ? undefined : skipToken, {
    refetchOnMountOrArgChange: forceRefresh ? true : 30,
    refetchOnFocus: true,
    refetchOnReconnect: true
  });
};

// Хук для проверки разрешений
export const usePermissions = () => {
  const { data: permissionsData } = useUserPermissions();
  const userPermissions = permissionsData?.permissions || [];

  const hasPermission = (codename: string): boolean => userPermissions.some((p) => p.codename === codename);

  return {
    permissions: userPermissions,
    hasPermission
  };
};

// Хук для проверки авторизации пользователя
export const useAuthStatus = () => {
  const { data: userResponse, isLoading, error } = useUserInfo(true); // Принудительное обновление

  return {
    isAuthenticated: isAuthenticated(),
    user: userResponse?.user,
    isLoading,
    error,
    hasToken: Boolean(localStorage.getItem('access_token'))
  };
};

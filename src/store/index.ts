import { configureStore } from '@reduxjs/toolkit';
import Slice from './Slice';

import {
  accountingApi,
  applicationsApi,
  authApi,
  buhgalteriaApi,
  customerApi,
  docsApi,
  filefolderApi,
  formulaApi,
  geoportalApi,
  notificationsApi,
  objectApi,
  presetsApi,
  refusalApi,
  reportsApi,
  tyApi,
  tyImportApi
} from 'api/index';

const store = configureStore({
  reducer: {
    Slice: Slice,
    [authApi.reducerPath]: authApi.reducer,
    [buhgalteriaApi.reducerPath]: buhgalteriaApi.reducer,
    [customerApi.reducerPath]: customerApi.reducer,
    [docsApi.reducerPath]: docsApi.reducer,
    [filefolderApi.reducerPath]: filefolderApi.reducer,
    [geoportalApi.reducerPath]: geoportalApi.reducer,
    [objectApi.reducerPath]: objectApi.reducer,
    [refusalApi.reducerPath]: refusalApi.reducer,
    [tyApi.reducerPath]: tyApi.reducer,
    [tyImportApi.reducerPath]: tyImportApi.reducer,
    [accountingApi.reducerPath]: accountingApi.reducer,
    [applicationsApi.reducerPath]: applicationsApi.reducer,
    [formulaApi.reducerPath]: formulaApi.reducer,
    [reportsApi.reducerPath]: reportsApi.reducer,
    [notificationsApi.reducerPath]: notificationsApi.reducer,
    [presetsApi.reducerPath]: presetsApi.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['tyApi/executeQuery/fulfilled', 'tyApi/executeQuery/rejected', 'tyApi/executeQuery/pending'],
        ignoredPaths: ['tyApi.queries']
      }
    }).concat(
      authApi.middleware,
      buhgalteriaApi.middleware,
      customerApi.middleware,
      docsApi.middleware,
      filefolderApi.middleware,
      geoportalApi.middleware,
      objectApi.middleware,
      refusalApi.middleware,
      tyApi.middleware,
      applicationsApi.middleware,
      accountingApi.middleware,
      formulaApi.middleware,
      reportsApi.middleware,
      notificationsApi.middleware,
      tyImportApi.middleware,
      presetsApi.middleware
    )
});

export type RootState = ReturnType<typeof store.getState>;
export type AppStore = typeof store;
export type AppDispatch = AppStore['dispatch'];

export default store;

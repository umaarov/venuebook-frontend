import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { api } from '../services/apiCore'; // Main API service
import authReducer from '../features/auth/authSlice';

export const store = configureStore({
    reducer: {
        [api.reducerPath]: api.reducer, // Add the generated reducer as a specific top-level slice
        auth: authReducer, // Auth slice for user info and token
    },
    // Adding the api middleware enables caching, invalidation, polling,
    // and other useful features of `rtk-query`.
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(api.middleware),
});

// Optional, but required for refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch);
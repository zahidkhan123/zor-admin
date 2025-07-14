import { configureStore } from '@reduxjs/toolkit'
import { api } from './services/api'

const initialState = {
  sidebarShow: true,
  sidebarUnfoldable: false,
  theme: 'light',
  isAuthenticated: false,
}

// Separate reducer for UI state
const uiReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'set':
      return { ...state, ...action.payload }
    case 'setAuth':
      return { ...state, isAuthenticated: action.payload.isAuthenticated }
    default:
      return state
  }
}

const store = configureStore({
  reducer: {
    ui: uiReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
})

export default store

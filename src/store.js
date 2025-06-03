import { configureStore } from '@reduxjs/toolkit'
import { api } from './services/api'

const initialState = {
  sidebarShow: true,
  theme: 'light',
  isAuthenticated: false,
}

const changeState = (state = initialState, { type, ...rest }) => {
  switch (type) {
    case 'set':
      return { ...state, ...rest }
    case 'setAuth':
      return { ...state, isAuthenticated: rest.isAuthenticated }
    default:
      return state
  }
}

const store = configureStore({
  reducer: {
    ui: changeState,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
})

export default store

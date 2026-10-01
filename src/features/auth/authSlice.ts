import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'
import { authApi } from '@/services/api'

interface AuthState {
  isAuthenticated: boolean
  token: string | null
  email: string | null
  isLoading: boolean
  error: string | null
}

const savedToken = localStorage.getItem('chat_agent_auth_token')
const savedEmail = localStorage.getItem('chat_agent_user_email')

const initialState: AuthState = {
  isAuthenticated: Boolean(savedToken),
  token: savedToken,
  email: savedEmail || (savedToken ? 'admin@example.com' : null),
  isLoading: false,
  error: null,
}

export const loginUser = createAsyncThunk<
  { access_token: string; refresh_token: string; email: string },
  { email: string; password: string },
  { rejectValue: string }
>('auth/loginUser', async ({ email, password }, { rejectWithValue }) => {
  try {
    const data = await authApi.login({ email: email.trim(), password })
    localStorage.setItem('chat_agent_auth_token', data.access_token)
    if (data.refresh_token) {
      localStorage.setItem('chat_agent_refresh_token', data.refresh_token)
    }
    localStorage.setItem('chat_agent_user_email', email.trim())
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      email: email.trim(),
    }
  } catch (err: unknown) {
    let msg = 'Failed to sign in. Please verify your credentials.'
    if (axios.isAxiosError(err)) {
      msg =
        err.response?.data?.error?.message ||
        err.response?.data?.detail ||
        err.response?.data?.message ||
        msg
    } else if (err instanceof Error) {
      msg = err.message
    }
    return rejectWithValue(msg)
  }
})

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('chat_agent_auth_token')
      localStorage.removeItem('chat_agent_refresh_token')
      localStorage.removeItem('chat_agent_user_email')
      state.isAuthenticated = false
      state.token = null
      state.email = null
      state.error = null
    },
    clearAuthError: (state) => {
      state.error = null
    },
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; email: string }>
    ) => {
      state.isAuthenticated = true
      state.token = action.payload.token
      state.email = action.payload.email
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.token = action.payload.access_token
        state.email = action.payload.email
        state.error = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.error = action.payload || 'Login failed'
      })
  },
})

export const { logout, clearAuthError, setCredentials } = authSlice.actions
export default authSlice.reducer

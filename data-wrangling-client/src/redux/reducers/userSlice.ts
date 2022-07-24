import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define a type for the slice state
interface UserState {
  _id: string,
  first_name: string,
  last_name: string,
  email: string
}

// Define the initial state using that type
const initialState: UserState = {
  _id: '',
  first_name: '',
  last_name: '',
  email: ''
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserInfo: (state, action: PayloadAction<UserState>) => {
      state.email = action.payload.email
      state.first_name = action.payload.first_name
      state.last_name = action.payload.last_name
      state._id = action.payload._id
    },
    clearUserInfo: (state) => {
      state.email = ''
      state.first_name = ''
      state.last_name = ''
      state._id = ''
    }
  }
})

export const { setUserInfo, clearUserInfo } = userSlice.actions

export default userSlice.reducer
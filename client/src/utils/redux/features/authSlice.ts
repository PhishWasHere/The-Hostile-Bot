import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import getToken from '@/utils/auth';

type initStateTyoe = {
    value: AuthStateType;
}

type AuthStateType = {
    isAuth: boolean;
    token: string | null;
    username: string | null;   
    user_id: string | null;
}

const initState = {
    value: {
        isAuth: false,
        token: getToken() || null,
        username: null,
        user_id: null,
    } as AuthStateType
} as initStateTyoe

const auth = createSlice({
    name: 'auth',
    initialState: initState,
    reducers: {
        logout: () => {
            return initState
        },

        setUser: (state, action: PayloadAction<any>) => {
            return{
                value: {
                    isAuth: true,
                    token: action.payload.token,
                    username: action.payload.username,
                    user_id: action.payload.user_id,
                }
            }
        },
    },
})

export const {logout, setUser} = auth.actions;
export default auth.reducer;

import { createSlice } from '@reduxjs/toolkit';

import { IMessage } from '@tet/core';

export type Actions = {
    addMessage: {
        type: 'messages/addMessage';
        payload: IMessage;
    };
};

type UnionOfMembers<T> = T[keyof T];
export type Action = UnionOfMembers<Actions>;
export type ActionType = Action['type'];

export type AddMessage = Actions['addMessage'];

type MessagesState = {
    messages: IMessage[];
};

const initialState: MessagesState = {
    messages: [],
};

const messagesSlice = createSlice({
    name: 'messages',
    initialState,
    reducers: {
        addMessage: (state, action) => {
            return {
                ...state,
                messages: [...state.messages, action.payload],
            };
        },
    },
});

export default messagesSlice;

import {create} from 'zustand';

export interface UserInfo {
    room_id: string;
    is_creator: boolean;
    user_id: string;
    user_name: string;
}

export interface UserRaceData extends UserInfo {
    race_data: any,
    race_ranking?: number | string;
}

export interface RoomInfo {
    room_id: string;
    room_creator: string;
    race_started: boolean;
}

export interface JoinedUser {
    id: string;
    is_creator: boolean;
    joined_race: boolean;
    user_name: string;
}

interface MessageContent {
    user_name: string;
    id: string;
    message: string;
}

interface ChatRoomMessage {
    role: string;
    content: string;
}


interface TypeRaceState {
    userInfo: UserInfo | null;
    roomInfo: RoomInfo | null;
    raceConfig: TestConfig | null;
    raceData: UserRaceData[] | null;
    chatRoomMessages: Array<ChatRoomMessage>;
    roomJoinedUsers: Array<JoinedUser>;
    updateChatRoomMessages: (x: any) => void;
    updateJoinedUsers: (joinedUsers: JoinedUser[]) => void;
    updateUserInfo: (userInfo: UserInfo) => void;
    updateRaceConfig: (x: any) => void;
    updateRoomInfo: (x: any) => void;
    updateRaceData: (x: any) => void;
}

export const useTypeRaceState = create<TypeRaceState>((set, getState) => ({
    userInfo: null,
    roomInfo: null,
    raceConfig: null,
    raceData: null,
    chatRoomMessages: [
        {
            role: "automated-bot",
            content: "Welcome to the Group Chat!",
        },
    ],
    roomJoinedUsers: [],
    updateChatRoomMessages: (message: MessageContent) => {
        set(state => ({
            chatRoomMessages: [...state.chatRoomMessages, {
                role: message?.user_name,
                content: message?.message
            }]
        }))
    },

    updateJoinedUsers: (users) => {
        set(({roomJoinedUsers: users}))
    },
    updateUserInfo: (user: UserInfo) => {
        set({userInfo: user})
    },
    updateRoomInfo: (info) => {
        set({roomInfo: info})
    },
    updateRaceConfig: (config: any) => {
        set({raceConfig: config})
    },
    updateRaceData: (data: any) => {
        set({raceData: data});
    }
    //updateChatRoom
}))
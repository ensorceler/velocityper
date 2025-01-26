export interface JoinedUser {
    id: string;
    is_creator: boolean;
    joined_race: boolean;
    user_name: string;
    is_you: boolean;
}

export interface ClientInfo {
    room_id:string;
    is_creator: boolean;
    user_id: string;
    user_name: string;
}

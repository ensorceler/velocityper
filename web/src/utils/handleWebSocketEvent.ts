import {UserInfo, JoinedUser, useTypeRaceState} from "@/global-state/typeRaceState";
import {toast} from "sonner";

export const handleWebSocketEvent = (eventData: string) => {

    try {
        const event = JSON.parse(eventData);
        //const
        // handles all the broadcast events
        switch (event?.broadcast_event) {

            case "client.info":
                //const eventMessage = event?.message;
                const userInfo = JSON.parse(event?.message);
                useTypeRaceState.getState().updateUserInfo(userInfo as UserInfo);

                break;

            case "chat.room":
                const eventMessage = event?.message;
                //const messageContent = JSON.parse(parsedEventData?.message);
                const parsedMessage = JSON.parse(eventMessage);
                useTypeRaceState.getState().updateChatRoomMessages(parsedMessage);

                break;

            case "joined.clients.room":
                const users: JoinedUser[] = JSON.parse(event?.message);
                useTypeRaceState.getState().updateJoinedUsers(users);


                break;

            case "race.config":
                const raceConfig = JSON.parse(event?.message);
                //console.info("handleWebSocketEvent: raceConfig",raceConfig);
                useTypeRaceState.getState().updateRaceConfig(raceConfig);

                break;
            //case start.type-race


            //case "joined.room":
            case "room.info":
                const roomInfo = JSON.parse(event?.message);
                //console.info("handleWebSocketEvent: raceConfig",raceConfig);
                useTypeRaceState.getState().updateRoomInfo(roomInfo);
                break;

            case "race.data":
                const usersRaceData = JSON.parse(event?.message);
                //console.info("handleWebSocketEvent: raceConfig",raceConfig);
                console.log('users Race Data =>', usersRaceData);

                const raceData = usersRaceData.map((user: any) => ({
                    ...user,
                    race_data: (user?.race_data).length >= 1 ? JSON.parse(user?.race_data) : {}
                }))
                console.log("race data =>", raceData)
                useTypeRaceState.getState().updateRaceData(raceData);
                break;

            default:
                console.info("default case for websocket event broadcast message")

        }

    } catch (err) {
        console.error('error reading websocket event data', err);
        toast.error("Error Reading WebSocket Event");
    }
}
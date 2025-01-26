/*
     there can be a type of broadcastEvent which will give use idea of events from
     servers;
 */

export function formatBroadcastMessage(socketMessage: string, broadCastEvent: string) {
    try {
        const parsedEventData = JSON.parse(socketMessage);
        //const parsedEventData = JSON.parse(receivedEventMessageData);
        if (parsedEventData?.broadcast_event === broadCastEvent) {
            // parse the message
            return JSON.parse(parsedEventData?.message);
            //return message;
            //setJoinedRaceUsers(users?.filter((x: any) => x.joined_race === true));
        } else {
            return null;
        }
    } catch (err) {
        console.error('broadcast message error =>', err)
        return null;
    }
}
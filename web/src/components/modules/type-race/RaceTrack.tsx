//'use client'
import RaceCourse from "./RaceCourse";
import RaceGrandStand from "./RaceGrandStand";
import useWebSocket from "@/hooks/useWebSocket";
import {useEffect} from "react";

interface Props {
    roomID: string;
    clientName: string;
}

const RaceTrack = ({roomID, clientName}: Props) => {
    const {isConnected, sendMessage: sendWSMessage, incomingMessage, initiateWebSocketConnection} = useWebSocket();

    useEffect(() => {
        const fn = async () => {
            await initiateWebSocketConnection(roomID, clientName);
        }
        fn();
    }, [])
    return (
        <div className="flex flex-col gap-10">
            <RaceCourse roomID={roomID}/>
            <RaceGrandStand/>
        </div>
    );
};

export default RaceTrack;
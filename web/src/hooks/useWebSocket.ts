import {useEffect, useRef, useState} from "react";
import {useSocketState} from "@/global-state/socketState";
import {toast} from "sonner";
import {handleWebSocketEvent} from "@/utils/handleWebSocketEvent";

interface WebSocketMessage {
    event_type: string;
    // Add other message properties as needed
}

export default function useWebSocket() {
    const [isConnected, setIsConnected] = useState(false);
    const [roomID, setRoomID] = useState("");
    const [clientName, setClientName] = useState("");

    const wsRef = useRef<WebSocket | null>(null);
    const mountedRef = useRef<boolean | null>(null);
    const [connInitiated, setConnInitiated] = useState(false);
    const {sentMessage, updateReceivedMessageData, updateConnectionStatus} = useSocketState();


    const initiateWebSocketConnection = async (roomID: string, clientName: string) => {
        setRoomID(roomID);
        setClientName(clientName);
    }


    const connectWebSocket = () => {
        //console.log('connect websocket running ')
        // connect websocket mounted;
        mountedRef.current = true;
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            console.log('WebSocket is already connected');
            return;
        }

        const socket = new WebSocket(
            `${process.env.NEXT_PUBLIC_WEBSOCKET_URL}?room=${roomID}&client=${clientName}`,
            "binary"
        );

        socket.onopen = (event) => {
            console.info('WebSocket connected:', event);
            updateConnectionStatus(WebSocket.OPEN);
            setIsConnected(true);
            // Send joined clients event
            socket.send(JSON.stringify({
                event_type: "join.room"
            } as WebSocketMessage));
        };

        socket.onmessage = (event) => {
            console.info('WebSocket message received:', event);
            updateReceivedMessageData(event.data);
            handleWebSocketEvent(event.data);
        };

        socket.onerror = (event) => {
            updateConnectionStatus(WebSocket.CLOSING);
            setIsConnected(false);
            console.error('WebSocket error:', event);
            toast.error(
                "Error Occurred in Websocket Connection!!!",
                {
                    duration: 10000,
                }
            );
        };

        socket.onclose = (event) => {
            updateConnectionStatus(WebSocket.CLOSED);
            setIsConnected(false);
            console.error('WebSocket closed:', event);
            toast.error(
                "Websocket Connection Closed!!!",
                {
                    duration: 10000,
                }
            );

        };
        //console.log('socket state')
        wsRef.current = socket;
        console.log('wsRef changed =>', wsRef)
    }

    const sendMessage = (message: string) => {
        // console.log('send message =>',message);
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            console.log('Sending message:', message);
            wsRef.current.send(message);
        } else {
            console.log('ws ref ', wsRef.current)
            console.warn('WebSocket is not connected. Message not sent:', message);
        }
    }

    useEffect(() => {
        // initiate the websocket
        if (connInitiated) {
            console.debug('useEffect connect websocket')
            if (mountedRef.current === null) {
                connectWebSocket();
            }
            //connectWebSocket();

            return () => {
                if (wsRef.current?.readyState === WebSocket.OPEN) {
                    console.error('WebSocket is connected, Closing the Connection');
                    updateConnectionStatus(WebSocket.CLOSED);
                    wsRef.current.close();
                    wsRef.current = null;
                }
            };

        }
    }, [connInitiated]);

    useEffect(() => {
        if (sentMessage != null && wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(sentMessage);
        }
    }, [sentMessage])

    useEffect(() => {
        if (roomID != "" && clientName != "") {
            setConnInitiated(true);
        }
    }, [roomID, clientName]);

    return {
        ws: wsRef.current,
        isConnected,
        sendMessage,
        initiateWebSocketConnection,
        wsMountedRef: mountedRef
    };
}

import {create} from 'zustand'

/*
interface Store {
    bears: number;
    increasePopulation: () => void;
    removeAllBears: () => void;
    updateBears: (x: number) => void
}

const useStore = create<Store>((set) => ({
    bears: 0,
    increasePopulation: () => set((state) => ({bears: state.bears + 1})),
    removeAllBears: () => set({bears: 0}),
    updateBears: (newBears) => set({bears: newBears}),
}))
*/

/*
connectionStatus:3

WebSocket.CONNECTING (0)
Socket has been created. The connection is not yet open.

WebSocket.OPEN (1)
The connection is open and ready to communicate.

WebSocket.CLOSING (2)
The connection is in the process of closing.

WebSocket.CLOSED (3)
The connection is closed or couldn't be opened.
*/

interface SocketState {
    connectionStatus: number,
    //userState: any,
    receivedEventMessageData: string | null;
    sentMessage: string | null;
    sendSocketMessage: (x: string) => void;
    updateReceivedMessageData: (x: string) => void;
    updateConnectionStatus: (x: number) => void;
}

export const useSocketState = create<SocketState>((set) => ({
    // see above comment
    //userState: null,
    connectionStatus: 3,
    receivedEventMessageData: null,
    sentMessage: null,
    sendSocketMessage: (x: string) => {
        set({sentMessage: x})
    },
    updateReceivedMessageData: (x: string) => {
        set({receivedEventMessageData: x})
    },
    updateConnectionStatus: (x: number) => {
        set({connectionStatus: x})
    },
}))







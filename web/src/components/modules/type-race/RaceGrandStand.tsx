"use client";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card";

import * as React from "react";
import {useEffect, useState} from "react";
import {Send} from "lucide-react";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/cn";
import {Input} from "@/components/ui/input";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {useSocketState} from "@/global-state/socketState";

interface Props {
    // sendWSMessage: (x: string) => void;
}

const RaceGrandStand = ({}: Props) => {

    const [joinedUsers, setJoinedUsers] = useState([]);
    //const {sendMessage, incomingMessage, isConnected: isSocketConnected} = useWebSocket();
    // const [joinedUsers,setJoinedUsers]=useState("");
    // const [user,setUsers]=useState([]);

    const {receivedEventMessageData, connectionStatus} = useSocketState();


    useEffect(() => {
        console.log('incoming message changed ', receivedEventMessageData);
        //const parsedIncomingMessage=JSON.parse(incomingMessage);
        if (connectionStatus === WebSocket.OPEN && (receivedEventMessageData !== null || true)) {
            try {
                const parsedIncomingMessage = JSON.parse(receivedEventMessageData!);
                //console.log('users =>',parsedIncomingMessage?.message);
                console.log('parsed incoming message', parsedIncomingMessage)
                if (parsedIncomingMessage?.socket_event === "joined.clients") {
                    const tempUsers = JSON.parse(parsedIncomingMessage?.message);
                    //console.log('joined users =>',joinedUsers)
                    setJoinedUsers(tempUsers)
                }
            } catch (err) {
                console.error("failed to parse message data");
            }
        }

    }, [receivedEventMessageData, connectionStatus])

    return (
        <Card className="dark:bg-transparent ">
            <CardHeader>
                <CardTitle>
                    <p className="text-xl">Chat Room</p>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-row items-start gap-6 h-max py-4">
                <CardsChat/>
                <JoinedParticipants users={joinedUsers}/>
            </CardContent>
        </Card>
    );
};

interface JoinedParticipantsProps {
    users: Array<{ id: string, name: string }>
}

function JoinedParticipants({users}: JoinedParticipantsProps) {
    // massive refactoring of code is taking place right now

    return (
        <Card className="flex-1 dark:bg-neutral-900 overflow-y-scroll h-max">
            <CardHeader>
                <CardTitle>Joined Participants</CardTitle>
                <CardDescription>
                    Anyone with the invite link can join the race.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <p className="text-sm font-medium">People who already joined</p>
                    <div className="flex flex-col gap-3">
                        {users.map((user: any, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between space-x-4"
                            >
                                <div className="flex items-center space-x-4">
                                    <Avatar>
                                        <AvatarImage src="/avatars/03.png"/>
                                        <AvatarFallback>US</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium leading-none">
                                            {user?.user_name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {user?.is_creator && "CREATOR"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}


export function CardsChat() {
    const [open, setOpen] = React.useState(false);
    //const {sendMessage: sendWSMessage, incomingMessage} = useWebSocket()
    const {receivedEventMessageData, sendSocketMessage, connectionStatus} = useSocketState()
    //const [selectedUsers, setSelectedUsers] = React.useState<User[]>([]);
    const [messages, setMessages] = React.useState([
        {
            role: "automated-bot",
            content: "Welcome to the Group Chat!",
        },
    ]);
    const [input, setInput] = React.useState("");
    const inputLength = input.trim().length;

    const sendChatMessage = (event: any) => {
        event.preventDefault();
        //setInput("");
        sendSocketMessage(JSON.stringify({"event_type": "chat.room", "message": input}));
        setInput("");
    }

    useEffect(() => {
        //if(send)
        if (connectionStatus === WebSocket.OPEN && receivedEventMessageData) {
            try {
                // parse the event data
                const parsedEventData = JSON.parse(receivedEventMessageData);
                if (parsedEventData?.socket_event === "chat.room") {
                    // parse the message
                    const messageContent=JSON.parse(parsedEventData?.message);
                    setMessages(messages => ([...messages, {
                        role: messageContent?.user_name,
                        content: messageContent?.message
                    }]))
                }
            } catch (err) {
                console.error("failed to parse", err);
            }
        }
    }, [receivedEventMessageData]);

    return (
        <Card className="flex-1 max-w-xl dark:bg-neutral-900 ">
            <CardHeader className="flex flex-row items-center">
                Group Chat
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-scroll">
                <div className="space-y-4 ">
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={cn(
                                "flex w-max max-w-[75%] flex-col gap-1 rounded-lg px-3 py-2 text-sm",
                                message.role === "user"
                                    ? "ml-auto bg-white text-black"
                                    : "bg-neutral-800"
                            )}
                        >
                            <p className="font-semibold">{message.role}</p>
                            <p className="text-sm">
                                {message.content}
                            </p>
                        </div>
                    ))}
                </div>
            </CardContent>
            <CardFooter>
                <form
                    onSubmit={sendChatMessage}
                    className="flex w-full items-center space-x-2"
                >
                    <Input
                        id="message"
                        placeholder="Type your message..."
                        className="flex-1"
                        autoComplete="off"
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                    />
                    <Button type="submit" size="icon">
                        <Send/>
                        <span className="sr-only">Send</span>
                    </Button>
                </form>
            </CardFooter>
        </Card>
    );
}

export default RaceGrandStand;

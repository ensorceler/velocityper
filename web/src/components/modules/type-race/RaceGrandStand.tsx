"use client";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card";

import * as React from "react";
import {Send} from "lucide-react";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/cn";
import {Input} from "@/components/ui/input";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {useSocketState} from "@/global-state/socketState";
import {useTypeRaceState} from "@/global-state/typeRaceState";

interface Props {
    // sendWSMessage: (x: string) => void;
}

interface JoinedUser {
    id: string;
    is_creator: boolean;
    joined_race: boolean;
    user_name: string;
    is_you: boolean;
}

interface ClientInfo {
    is_creator: boolean;
    user_id: string;
    user_name: string;
}


const RaceGrandStand = ({}: Props) => {

    const {roomJoinedUsers} = useTypeRaceState();

    //const {receivedEventMessageData, connectionStatus} = useSocketState();
    //const [clientInfoState, setClientInfoState] = useState<ClientInfo | null>(null);
    //const
    //const clientInfoRef = useRef<boolean | null>(null);


    return (
        <Card className="dark:bg-transparent ">
            <CardHeader>
                <CardTitle>
                    <p className="text-xl">Chat Room</p>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-row items-start gap-6 h-max py-4">
                <CardsChat/>
                <JoinedParticipants users={roomJoinedUsers}/>
            </CardContent>
        </Card>
    );
};

interface JoinedParticipantsProps {
    users: JoinedUser[];
}

function JoinedParticipants({users}: JoinedParticipantsProps) {
    //const  {user}
    return (
        <Card className="flex-1 dark:bg-neutral-900 overflow-y-scroll h-max">
            <CardHeader>
                <CardTitle>Joined Watchers</CardTitle>
                <CardDescription>
                    Anyone with the invite link can join the race.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <p className="text-sm font-medium">People who already joined</p>
                    <div className="flex flex-col gap-3">
                        {users.map((user, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between space-x-4"
                            >
                                <div className="flex items-center space-x-4">
                                    <Avatar>
                                        <AvatarFallback>US</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-row gap-3">
                                        <div>
                                            <p className="text-sm font-medium leading-none flex flex-row">
                                                <span>{user?.user_name}</span>
                                                {user?.is_you &&
                                                    <span className="text-xs">
                                                (You)
                                                </span>
                                                }
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {user?.is_creator && "CREATOR"}
                                            </p>
                                        </div>
                                        {
                                            user?.joined_race &&
                                            <p className="text-xs bg-neutral-700 rounded-md p-2">
                                                JOINED RACE
                                            </p>
                                        }
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
    const {sendSocketMessage, connectionStatus} = useSocketState()
    const {chatRoomMessages, userInfo} = useTypeRaceState()
    const [input, setInput] = React.useState("");

    const sendChatMessage = (event: any) => {
        event.preventDefault();
        //setInput("");
        sendSocketMessage(JSON.stringify({"event_type": "chat.room", "message": input}));
        setInput("");
    }


    return (
        <Card className="flex-1 max-w-xl dark:bg-neutral-900 ">
            <CardHeader className="flex flex-row items-center">
                Group Chat
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-scroll">
                <div className="space-y-4 ">
                    {chatRoomMessages.map((message, index) => (
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

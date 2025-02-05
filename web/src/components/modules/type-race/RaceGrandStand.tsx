"use client";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card";

import * as React from "react";
import {CrownIcon, Send} from "lucide-react";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/cn";
import {Input} from "@/components/ui/input";
import {useSocketState} from "@/global-state/socketState";
import {JoinedUser, UserInfo, useTypeRaceState} from "@/global-state/typeRaceState";
import PixelAvatar from "@/components/PixelAvatar";


const RaceGrandStand = () => {

    const {roomJoinedUsers, userInfo} = useTypeRaceState();

    return (
        <Card className="dark:bg-transparent ">
            <CardHeader>
                <CardTitle>
                    <p className="text-xl">Chat Room</p>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-row items-start gap-6 h-max py-4">
                <CardsChat/>
                <JoinedParticipants users={roomJoinedUsers} userInfo={userInfo}/>
            </CardContent>
        </Card>
    );
};

interface JoinedParticipantsProps {
    users: JoinedUser[];
    userInfo: UserInfo | null;
}

function JoinedParticipants({users, userInfo}: JoinedParticipantsProps) {

    return (
        <Card className="flex-1 dark:bg-neutral-900 overflow-y-scroll h-max">
            <CardHeader>
                <CardTitle>Spectators</CardTitle>
                <CardDescription>
                    Anyone with the invite link can watch and join the race.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex flex-col gap-3">
                        {users.map((user, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between space-x-4"
                            >
                                <div className="flex items-center space-x-4">
                                    <PixelAvatar username={user?.user_name} saturation="90" width="48" height="48"/>
                                    <div className="flex flex-row gap-6 justify-between">
                                        <div>
                                            <p className="text-base font-medium leading-none flex flex-row">
                                                {user?.user_name}
                                                <span className="ml-2">
                                                {user?.id === userInfo?.user_id &&
                                                    <span className="text-sm text-neutral-400">
                                                        ( You )
                                                    </span>
                                                }
                                                </span>
                                            </p>
                                            <>
                                                {
                                                    user?.is_creator &&
                                                    <div
                                                        className="text-muted-foreground flex flex-row gap-2 items-center">
                                                        <CrownIcon className="h-4 w-4 text-emerald-500"/>
                                                        <p className="text-[12px] text-emerald-500">
                                                            CREATOR
                                                        </p>
                                                    </div>
                                                }
                                            </>
                                        </div>
                                        <>
                                            {
                                                user?.joined_race &&
                                                <div className="flex items-center gap-1.5">
                                                    <div
                                                        className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                                    <span className="text-emerald-500 text-sm font-medium">
                                                    JOINED
                                                </span>
                                                </div>
                                            }
                                        </>
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
        if(input.length){
            sendSocketMessage(JSON.stringify({"event_type": "chat.room", "message": input}));
            setInput("");
        }
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

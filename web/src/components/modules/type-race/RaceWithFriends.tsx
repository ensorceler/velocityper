"use client";

import {useRouter, useSearchParams} from "next/navigation";
import {Suspense, useEffect, useState} from "react";
import RaceTrack from "@/components/modules/type-race/RaceTrack";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {generateRoomId} from "@/utils/idGenerate";
import {cn} from "@/lib/cn";
import {toast} from "sonner";
import {QueryClient, QueryClientProvider, useMutation} from "@tanstack/react-query";
import {CheckCircledIcon, CrossCircledIcon, UpdateIcon} from "@radix-ui/react-icons";
import {debounce} from "lodash";

interface RaceTrackData {
    showRaceTrack: boolean,
    roomID: string,
    clientName: string,
    isRoomValid: "yes" | "no" | "na" | "loading",
}

// Define Zod schema for validation
const guestSchema = z.object({
    guestName: z.string().min(1, "Guest Name is Required!"),
    roomId: z.string().min(8, "RoomID Must be Valid!"),
});
const creatorSchema = z.object({
    creatorName: z.string().min(1, "Creator Name is Required!"),
});

const newQueryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: true,
            refetchOnMount: true,
            refetchOnReconnect: true,
            retry: 3,
            staleTime: 0,
        },
    },
});

export default function RaceWithFriends() {
    const router = useRouter();
    useEffect(() => {
        router.refresh()
    }, []);
    return (
        <Suspense>
            <QueryClientProvider client={newQueryClient}>
                <RaceWithFriendsComponent/>
            </QueryClientProvider>
        </Suspense>
    )
}

function RaceWithFriendsComponent() {
    const params = useSearchParams();

    // if invite link available then make roomID input readonly
    const [inviteLinkAvail, setInviteLinkAvail] = useState(false);

    const [raceTrackData, setRaceTrackData] = useState<RaceTrackData>({
        showRaceTrack: false,
        roomID: "",
        clientName: "",
        isRoomValid: "na",
    });


    const checkInviteRoomAPI = useMutation({
        mutationFn: async (roomInfo: any) => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/checkroom`, {
                method: "POST",
                body: JSON.stringify({
                    room_id: roomInfo.roomID
                }),
            })
            return response.json()
        },
        mutationKey: ["checkroom"]
    })

    const {
        register: registerGuest,
        handleSubmit: handleGuestSubmit,
        formState: {errors: guestErrors},
        setValue: setGuestValue,
        watch: watchGuest
    } = useForm({
        resolver: zodResolver(guestSchema),
        defaultValues: {
            guestName: "",
            roomId: ""
        }
    });

    // Setup react-hook-form for creator
    const {
        register: registerCreator,
        handleSubmit: handleCreatorSubmit,
        formState: {errors: creatorErrors},
        watch: watchCreator
    } = useForm({
        resolver: zodResolver(creatorSchema),
        defaultValues: {
            creatorName: ""
        }
    });

    const goToRaceTrack = (data: z.infer<typeof guestSchema>) => {
        //console.log("go to racetrack data =>", data);
        if (raceTrackData.isRoomValid === "yes") {
            setRaceTrackData(p => ({
                ...p,
                showRaceTrack: true,
                clientName: data.guestName,
                roomID: data.roomId,
            }));
        } else {
            toast.warning("RaceTrack Must Be Valid!!!")
        }
    };

    const createRaceTrack = (data: z.infer<typeof creatorSchema>) => {
        console.log("create racetrack data =>", data);
        const newRoomID = generateRoomId(8);
        setRaceTrackData(p => ({
            ...p,
            showRaceTrack: true,
            clientName: data.creatorName,
            roomID: newRoomID,
        }));

    };

    // watch guest
    useEffect(() => {

        const debouncedCheckInvite = debounce(async ({roomId}) => {
            console.log("roomID changed =>", roomId)
            await checkInviteRoomAPI.mutateAsync({roomID: roomId})
        }, 1000);

        const {unsubscribe} = watchGuest(debouncedCheckInvite);

        return () => {
            debouncedCheckInvite.cancel()
            unsubscribe()
        }
    }, [watchGuest])

    useEffect(() => {
        //console.log("mutation data =>", checkInviteRoomAPI);
        if (checkInviteRoomAPI.status === "pending") {
            setRaceTrackData((p => ({...p, isRoomValid: "loading"})))
        }
        if (checkInviteRoomAPI.data?.status == 200) {
            console.log("mutation yes=>")
            setRaceTrackData((p) => ({...p, isRoomValid: "yes"}))
        } else if (checkInviteRoomAPI.data?.status == 500) {
            console.log("mutation no=>")
            setRaceTrackData((p) => ({...p, isRoomValid: "no"}))
        }
    }, [checkInviteRoomAPI.data, checkInviteRoomAPI.status]);

    // on page load check the params for the invite link if exists
    useEffect(() => {
        const inviteLink = params.get("invite");
        if (inviteLink !== null) {
            setGuestValue('roomId', inviteLink);
            setInviteLinkAvail(true);
            checkInviteRoomAPI.mutate({roomID: inviteLink});

            toast.info("ROOMID set from Invite Link, Enter Name to continue!", {
                duration: 10000
            })

        }
    }, [params]);


    return (
        <div className="max-w-6xl ml-auto mr-auto">
            {raceTrackData.showRaceTrack ? (
                <RaceTrack roomID={raceTrackData.roomID} clientName={raceTrackData.clientName}/>
            ) : (
                <div className="max-w-3xl ml-auto mr-auto mt-20 flex flex-row gap-8 justify-between">
                    <Card className="max-w-sm dark:bg-neutral-950/50">
                        <CardHeader>
                            <CardTitle className="text-lg">Join RaceTrack</CardTitle>
                            <CardDescription>
                                Join a RaceTrack with a RoomID or Invite Link
                            </CardDescription>
                        </CardHeader>
                        <form onSubmit={handleGuestSubmit(goToRaceTrack)}>
                            <CardContent>
                                <div className="mb-4 flex flex-col gap-2 relative">
                                    <Label>Enter RoomID</Label>
                                    <Input
                                        placeholder="Room ID"
                                        {...registerGuest("roomId")}
                                        readOnly={inviteLinkAvail}
                                        className={cn(inviteLinkAvail && `border-neutral-100 bg-neutral-800/70 `)}
                                    />
                                    {guestErrors.roomId &&
                                        <span
                                            className="text-red-500 text-sm">{guestErrors.roomId.message}</span>}
                                    <div className="absolute right-4 top-8">
                                        {
                                            raceTrackData.isRoomValid === "yes" &&
                                            <CheckCircledIcon className="text-green-500 h-5 w-5"/>
                                        }
                                        {
                                            raceTrackData.isRoomValid === "no" &&
                                            <CrossCircledIcon className="text-red-500 h-5 w-5"/>
                                        }
                                        {
                                            raceTrackData.isRoomValid === "loading" &&
                                            <UpdateIcon className="text-zinc-500 h-5 w-5 animate-spin"/>
                                        }
                                    </div>
                                </div>
                                <div className="mb-4 flex flex-col gap-2">
                                    <Label>Enter Name</Label>
                                    <Input placeholder="Enter Name to Enter"
                                           {...registerGuest("guestName")}
                                    />
                                    {guestErrors.guestName && <span
                                        className="text-red-500 text-sm">{guestErrors.guestName.message}</span>}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    variant="default"
                                    className="active:scale-95"
                                    // onClick={goToRaceTrack}
                                    type="submit"
                                >
                                    Go To RaceTrack
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                    <Card className="max-w-sm py-0 dark:bg-neutral-950/50 flex flex-col">
                        <form className="flex flex-col gap-2 h-full"
                              onSubmit={handleCreatorSubmit(createRaceTrack)}>
                            <CardHeader>
                                <CardTitle className="text-lg">Race with Friends</CardTitle>
                                <CardDescription>
                                    Create a racetrack for friends to join and challenge you in
                                    exciting typing races!
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-4 flex flex-col gap-2 ">
                                    <Label>Enter Name</Label>
                                    <Input
                                        placeholder="Enter Name to Enter"
                                        {...registerCreator("creatorName")}
                                    />
                                    {creatorErrors.creatorName && <span
                                        className="text-red-500 text-sm">{creatorErrors.creatorName.message}</span>}
                                </div>
                            </CardContent>
                            <CardFooter className="mt-auto">
                                <Button
                                    variant="primary"
                                    className="active:scale-95 mt-auto"
                                    type="submit"
                                >
                                    Create RaceTrack
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    )
}




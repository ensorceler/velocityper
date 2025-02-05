import useTestConfiguration from "@/hooks/useTestConfiguration";
import TypingTestBox from "../type-test/TypingTestBox";
import {useEffect, useState} from "react";
import RaceParticipants from "./RaceParticipants";
import {Button} from "@/components/ui/button";
import {UserPen, UserPlus} from "lucide-react";
import {Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {toast} from "sonner";
import {useSocketState} from "@/global-state/socketState";
import {useTypeRaceState} from "@/global-state/typeRaceState";

interface Props {
    roomID: string;
}

const RaceCourse = ({roomID}: Props) => {

    const [showTypingTest, setShowTypingTest] = useState(false);
    const [typeRaceTestConfig, setTypeRaceTestConfig] = useTestConfiguration(false);
    const [inviteLink, setInviteLink] = useState(
        `${process.env.NEXT_PUBLIC_URL}/race-with-friends?invite=` + roomID
    );
    const [userJoinedAlready, setUserJoinedAlready] = useState(false);
    const [raceStarted, setRaceStarted] = useState(false);
    const {connectionStatus, sendSocketMessage} = useSocketState();

    const [result, setResult] = useState<TestResult>({
        chartResult: [],
        wpm: 0,
        rawWPM: 0,
        correctChars: 0,
        incorrectChars: 0,
        accuracy: 0,
    });

    const [testStatus, setTestStatus] = useState<TestStatus>("upcoming");
    const {userInfo, raceConfig, roomInfo, roomJoinedUsers} = useTypeRaceState()

    const copyInviteLink = async () => {
        try {
            await navigator.clipboard.writeText(inviteLink);
            toast("Copied to clipboard!");
        } catch (err) {
            console.error("Failed to copy: ", err);
        }
    };


    const startRace = () => {
        // only a creator can start the race actually
        // atleast two joined users need to be present to start the race actually
        if (userInfo?.is_creator && roomJoinedUsers.filter(user => user.joined_race).length >= 2) {
            //sendSocketMessage()
            sendSocketMessage(JSON.stringify({
                event_type: "start.type-race"
            }))
        } else if (roomJoinedUsers.filter(user => user.joined_race).length <= 1) {
            console.error("start type-race need enough participants")
            toast.error("Typing Race Needs at least 2 participants");
        }else{
            toast.error("Oops! Error Occurred when starting race, please refresh or try again!!");
        }
    }

    const joinRace = () => {
        // join-race condition another conditions needs to be done.
        // at most 5 participants in the race.

        if (connectionStatus === WebSocket.OPEN) {
            sendSocketMessage(JSON.stringify({
                event_type: "join.type-race"
            }))
            setUserJoinedAlready(true);
        }
    }

    const leaveRace = () => {
        window.location.reload();
    }

    const updateRoomTestConfigAsCreator = (config: any) => {
        if (connectionStatus === WebSocket.OPEN) {
            sendSocketMessage(JSON.stringify({
                event_type: "update.raceconfig.room",
                message: JSON.stringify({
                    ...config
                })
            }))
        }
    }

    useEffect(() => {
        console.log("user info loaded =>", userInfo);
        if (userInfo?.is_creator) {
            //const randomQouteID=
            // this needs to be checked and verified, not taking the entire list
            const randomQuoteID = Math.round(Math.random() * 50 + 1);
            //const randomQuoteID = 10;

            const randomTestConfig: TestConfig = {
                ...typeRaceTestConfig,
                testType: 'quotes', quoteLength: 'medium', quoteID: randomQuoteID,
                strictTyping: true,
                isTypingRace: true,
            }
            setTypeRaceTestConfig({...randomTestConfig});
            setShowTypingTest(true);
            updateRoomTestConfigAsCreator(randomTestConfig);
        }
        // when user is not creator
    }, [userInfo]);

    useEffect(() => {
        // all the race-joinee will be updated
        if (raceConfig && !userInfo?.is_creator && userJoinedAlready) {
            //console.log("race config coming from server =>", raceConfig);
            setTypeRaceTestConfig({...raceConfig})
            setShowTypingTest(true);
        }
    }, [raceConfig]);

    //useRef()
    useEffect(() => {
        if (roomInfo) {
            console.log("roominfo coming from server =>", roomInfo)
            if (roomInfo?.race_started) {
                //toast.success("Type-race has started!!!")
                toast.success("Type-Race has started!!!")
                //set
                setRaceStarted(true);
            }
        }
    }, [roomInfo]);

    return (
        <>
            <Dialog>
                <div className="w-full flex justify-end gap-4">
                    <DialogTrigger asChild>
                        <Button variant="secondary" className="flex gap-2 items-center">
                            <UserPlus/>
                            <p>Invite</p>
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="dark:bg-[#111] max-w-2xl">
                        <DialogTitle>
                            Invite Friends
                        </DialogTitle>
                        <DialogDescription>
                            You can invite the any user to the race If you send them the link.
                        </DialogDescription>
                        <div className="flex space-x-2">
                            <Input value={inviteLink} readOnly/>
                            <Button
                                variant="secondary"
                                className="shrink-0"
                                onClick={copyInviteLink}
                            >
                                Copy Link
                            </Button>
                        </div>
                    </DialogContent>
                    {
                        userInfo?.is_creator &&
                        <Button className="flex gap-2 items-center" variant="ghost">
                            <UserPen/>
                            <p>Edit Racetrack</p>
                        </Button>
                    }
                </div>
            </Dialog>

            <div className="pt-16 pb-10 px-8 bg-transparent border border-neutral-800 rounded-md flex flex-col gap-5">
                <RaceParticipants/>
                {showTypingTest && (
                    <TypingTestBox
                        config={typeRaceTestConfig}
                        testStatus={testStatus}
                        setTestStatus={setTestStatus}
                        setConfig={setTypeRaceTestConfig}
                        setResult={setResult}
                        showReloadBtn={false}
                        typingAllowed={raceStarted ? true : false}
                    />
                )}
                <div className="flex flex-row gap-2">
                    {
                        // as creator only can start the race
                        userInfo?.is_creator &&
                        <Button variant="destructive" onClick={startRace} disabled={raceStarted}>Start Race</Button>
                    }
                    { // not creator but a spectator or race-joinee
                        !userInfo?.is_creator
                        &&
                        <Button variant="primary" onClick={joinRace}
                                disabled={userJoinedAlready || userInfo?.is_creator}>
                            Join Race
                        </Button>
                    }
                    <Button variant="secondary" onClick={leaveRace}>Leave Race</Button>
                </div>
            </div>
        </>
    );
};

export default RaceCourse;

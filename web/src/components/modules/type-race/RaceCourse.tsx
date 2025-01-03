import useTestConfiguration from "@/hooks/useTestConfiguration";
import TypingTestBox from "../type-test/TypingTestBox";
import {useEffect, useState} from "react";
import QueryProvider from "@/components/query-provider";
import RaceParticipants from "./RaceParticipants";
import {Button} from "@/components/ui/button";
import {UserPen, UserPlus} from "lucide-react";
import {Dialog, DialogContent, DialogTrigger} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {toast} from "sonner";

interface Props {
    roomID: string;
}

// race course gives you participants and allows you to start/join the race
const RaceCourse = ({roomID}: Props) => {

    const [showTypingTest, setShowTypingTest] = useState(false);
    const [config, setConfig] = useTestConfiguration();
    const [inviteLink, setInviteLink] = useState(
        "http://localhost:3000/race-with-friends?invite="+roomID
    );

    // result -> interesting stuff

    const [result, setResult] = useState<TestResult>({
        chartResult: [],
        wpm: 0,
        rawWPM: 0,
        correctChars: 0,
        incorrectChars: 0,
        accuracy: 0,
    });

    const [testStatus, setTestStatus] = useState<TestStatus>("upcoming");

    const copyInviteLink = async () => {
        try {
            await navigator.clipboard.writeText(inviteLink);
            toast("Copied to clipboard!");
        } catch (err) {
            console.error("Failed to copy: ", err);
        }
    };


    useEffect(() => {
        setInviteLink("http://localhost:3000/race-with-friends?invite=" + roomID)
    }, [roomID])


    return (
        <QueryProvider>
            <Dialog>

                <div className="w-full flex justify-end gap-4">

                    <DialogTrigger asChild>
                        <Button variant="secondary" className="flex gap-2 items-center">
                            <UserPlus/>
                            <p>Invite</p>
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="dark:bg-[#111] max-w-2xl">
                        You can invite the any user to the race If you send them the link.
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

                    <Button className="flex gap-2 items-center" variant="ghost">
                        <UserPen/>
                        <p>Edit Racetrack</p>
                    </Button>
                </div>
            </Dialog>

            <div className="pt-16 pb-10 px-8 bg-transparent border border-neutral-800 rounded-md flex flex-col gap-5">
                <RaceParticipants/>
                {showTypingTest && (
                    <TypingTestBox
                        config={config}
                        testStatus={testStatus}
                        setTestStatus={setTestStatus}
                        setConfig={setConfig}
                        setResult={setResult}
                    />
                )}
                <div className="flex flex-row gap-2">
                    <Button variant="destructive">Start Race</Button>
                    <Button variant="primary">Join Race</Button>
                    <Button variant="secondary">Leave Race</Button>
                </div>
            </div>
        </QueryProvider>
    );
};

export default RaceCourse;

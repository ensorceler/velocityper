"use client";

import RaceTrack from "@/components/modules/type-race/RaceTrack";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateRoomId } from "@/utils/idGenerate";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function RaceWithFriendsPage() {
  const params = useSearchParams();

  const [roomId, setRoomID] = useState("");
  const [guestNameState, setGuestNameState] = useState("");

  //const [guestNameState]
  const [showRaceTrack, setShowRaceTrack] = useState(false);
  const goToRaceTrack = () => {};

  const createRaceTrack = () => {
    //const create
    if (guestNameState != "") {
      setRoomID(generateRoomId(8));
      setShowRaceTrack(true);
    }
  };

  useEffect(() => {
    const inviteLink = params.get("invite");
    if (inviteLink !== null) {
      setRoomID(inviteLink);
    }
  });

  // test create race track by default
  useEffect(() => {
    //setRoomID(generateRoomId(8));
    //setShowRaceTrack(true);
  }, []);

  return (
    <div className="max-w-6xl ml-auto mr-auto">
      {showRaceTrack ? (
        <RaceTrack roomID={roomId} />
      ) : (
        <div className="max-w-3xl ml-auto mr-auto mt-20 flex flex-row gap-8 justify-between">
          <Card className="max-w-sm dark:bg-neutral-950/50">
            <CardHeader>
              <CardTitle>Join RaceTrack</CardTitle>
              <CardDescription>
                Join a RaceTrack with a RoomID or Invite Link
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-col gap-2">
                <Label>Enter RoomID</Label>
                <Input
                  placeholder="Room ID"
                  defaultValue={roomId}
                  readOnly={roomId != "" ? true : false}
                />
              </div>
              <div className="mb-4 flex flex-col gap-2">
                <Label>Enter Name</Label>
                <Input placeholder="Enter Name to Enter" />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="default"
                className="active:scale-95"
                onClick={goToRaceTrack}
              >
                Go To RaceTrack
              </Button>
            </CardFooter>
          </Card>
          <Card className="max-w-sm py-0 dark:bg-neutral-950/50">
            <CardHeader>
              <CardTitle>Race with Friends</CardTitle>
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
                  defaultValue={guestNameState}
                  onChange={(e) => setGuestNameState(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="primary"
                className="active:scale-95 self-end"
                onClick={createRaceTrack}
              >
                Create RaceTrack
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}

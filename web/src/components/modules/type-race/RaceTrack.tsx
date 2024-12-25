//'use client'
import { useEffect, useState } from "react";
import RaceCourse from "./RaceCourse";
import RaceGrandStand from "./RaceGrandStand";

interface Props {
  roomID: string;
}

const RaceTrack = ({ roomID }: Props) => {
  //const [room]

  const [ws, setWS] = useState(
    new WebSocket(
      `${process.env.NEXT_PUBLIC_WEBSOCKET_URL}?room=${roomID}`,
      "binary"
    )
  );
  useEffect(() => {
    // get some skills
    ws.onopen = (event) => {
      console.log("on ws open", event);
    };
    ws.onclose = (event) => {
      console.log("close ws=>", event);
    };
    ws.onerror = (event) => {
      console.log("error ws =>", event);
    };

    ws.onmessage = function (event) {
      //setServerMessage(JSON.parse(event.data));
      console.log("on message  =>", event);
    };

    return () => {
      if (ws.readyState === 1) {
        ws.close();
      }
    };
  }, [ws]);

  return (
    <div className="flex flex-col gap-10">
      <RaceCourse />
      <RaceGrandStand />
    </div>
  );
};

export default RaceTrack;
